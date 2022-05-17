import { AfterContentInit, AfterViewInit, Component, ContentChildren, EventEmitter, forwardRef, Input, OnChanges, OnInit, Output, QueryList, SimpleChanges, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { PrimeTemplate } from 'primeng/components/common/shared';
import { Dropdown } from 'primeng/dropdown';
import 'rxjs/add/operator/takeUntil';
declare var $: any;

export const LAPOLO_DROPDOWN_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => LapoloDropdown),
    multi: true
};

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'l-dropdown',
    template: `<p-dropdown class="lapolo-dd" [disabled]="disabled"
    [style]="styles" #dd  [options]="options" [tabindex]="-1" (onChange)="modelChange($event)" editable="true" [placeholder]="placeholder" (onFocus)="onInputFocus($event)">
    </p-dropdown>`,
    providers: [LAPOLO_DROPDOWN_VALUE_ACCESSOR]
})
export class LapoloDropdown implements OnInit, OnChanges, AfterViewInit, AfterContentInit, ControlValueAccessor {

    @ContentChildren(PrimeTemplate) templates: QueryList<any>;

    value: any;
    currentValue: any;

    @Input() disabled: boolean;

    @Input() placeholder: string;

    @Input() options: any[];

    @Input() optionLabel: string;

    @Input() optionValue: string;

    @Input() styles: any;

    @Output() onChange: EventEmitter<any> = new EventEmitter();

    @ViewChild('dd', {static: false}) dd: Dropdown;

    onModelChange: Function = () => { };

    onModelTouched: Function = () => { };

    constructor() { }

    ngAfterContentInit() {
        this.templates.forEach((item) => {
            switch (item.getType()) {
                case 'item':
                    this.dd.itemTemplate = item.template;
                    break;

                case 'selectedItem':
                    this.dd.selectedItemTemplate = item.template;
                    break;

                case 'group':
                    this.dd.groupTemplate = item.template;
                    break;

                default:
                    this.dd.itemTemplate = item.template;
                    break;
            }
        });
    }

    ngOnInit() {
        this.dd.value = null;
        this.value = null;
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.options) {
            if (((this.optionLabel && this.optionLabel != 'label') || (this.optionValue && this.optionValue != 'value')) && this.options) {
                this.options.forEach(ds => {
                    if (this.optionLabel != 'label') {
                        ds.label = ds[this.optionLabel];
                    }
                    if (this.optionValue != 'value') {
                        ds.value = ds[this.optionValue];
                    }
                });
                this.options = this.options.slice();
            }
            if (this.dd.selectedOption) {
                let existing = (changes.options.previousValue || []).find(ds => ds.value == this.dd.selectedOption.value);
                if (!existing) {
                    this.currentValue = null;
                    this.dd.clear(null);
                }
            }
        }
    }

    writeValue(val: any): void {
        if (!val && !this.value && !this.dd.value) {
            return;
        } else if (val != this.value || val != this.dd.value) {
            this.value = val;
            if (this.dd.filter) {
                this.dd.resetFilter();
            }
            this.dd.value = val;
            this.dd.updateSelectedOption(val);
            this.dd.updateEditableLabel();
            this.dd.updateFilledState();
        }
    }

    registerOnChange(fn: any): void {
        this.onModelChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onModelTouched = fn;
    }

    setDisabledState(val: boolean): void {
        this.disabled = val;
        this.dd.disabled = val;
    }

    ngAfterViewInit() {
        let value = this.value;
        this.writeValue(null);
        setTimeout(() => {
            this.writeValue(value);
        });
        this.dd.renderer.listen(this.dd.editableInputViewChild.nativeElement, 'keydown', (event) => {
            this.dd.onKeydown(event, true);
        });
        this.dd.renderer.listen(this.dd.editableInputViewChild.nativeElement, 'focusout', (event) => {
            if (!this.dd.selectedOption) {
                this.dd.value = null;
                this.dd.filterValue = null;
                event.target.value = null;
                this.dd.resetFilter();
            }
        });

        this.dd.updateEditableLabel = () => {
            if (this.dd.editableInputViewChild && this.dd.editableInputViewChild.nativeElement) {
                setTimeout(() => {
                    this.dd.editableInputViewChild.nativeElement.value = (this.dd.selectedOption ? this.dd.selectedOption.label : '');
                });
            }
        };

        this.dd.selectItem = (event, option) => {
            if (this.dd.selectedOption != option) {
                this.dd.selectedOption = option;
                this.dd.value = option.value;
                if (event) {
                    this.currentValue = this.dd.selectedOption;
                    this.dd.onModelChange(this.dd.value);
                    this.dd.updateEditableLabel();
                    this.dd.onChange.emit({
                        originalEvent: event,
                        value: this.dd.value
                    });
                }
            }
        };

        this.dd.onEditableInputChange = (event) => {
            this.dd.onFilter(event);
            if (!this.dd.overlayVisible) {
                this.dd.show();
                event.preventDefault();
            }
        };

        this.dd.onKeydown = (event) => {
            if (this.currentValue) {
                if (event.which == 8) {
                    this.currentValue = null;
                    this.dd.clear(event);
                    if (!this.dd.overlayVisible) {
                        this.dd.show();
                    }
                    event.preventDefault();
                    return;
                } else if (event.which == 32) {
                    if (!this.dd.overlayVisible) {
                        this.dd.show();
                    }
                    event.preventDefault();
                } else if (event.which != 9 && event.which != 40 && event.which != 38 && event.which != 13 && event.which != 27) {
                    event.preventDefault();
                    return;
                }
            }
            if (this.dd.readonly || !this.dd.optionsToDisplay || this.dd.optionsToDisplay.length === null) {
                return;
            }

            switch (event.which) {
                // down
                case 40:
                    if (!this.dd.overlayVisible && event.altKey) {
                        this.dd.show();
                    } else {
                        if (this.dd.group) {
                            let selectedItemIndex = this.dd.selectedOption ? this.dd.findOptionGroupIndex(this.dd.selectedOption.value, this.dd.optionsToDisplay) : -1;

                            if (selectedItemIndex !== -1) {
                                let nextItemIndex = selectedItemIndex.itemIndex + 1;
                                if (nextItemIndex < (this.dd.optionsToDisplay[selectedItemIndex.groupIndex].items.length)) {
                                    this.dd.selectItem(null, this.dd.optionsToDisplay[selectedItemIndex.groupIndex].items[nextItemIndex]);
                                    this.dd.selectedOptionUpdated = true;
                                } else if (this.dd.optionsToDisplay[selectedItemIndex.groupIndex + 1]) {
                                    this.dd.selectItem(null, this.dd.optionsToDisplay[selectedItemIndex.groupIndex + 1].items[0]);
                                    this.dd.selectedOptionUpdated = true;
                                }
                            } else {
                                this.dd.selectItem(null, this.dd.optionsToDisplay[0].items[0]);
                            }
                        } else {
                            let selectedItemIndex = this.dd.selectedOption ? this.dd.findOptionIndex(this.dd.selectedOption.value, this.dd.optionsToDisplay) : -1;
                            let nextItemIndex = selectedItemIndex + 1;
                            if (nextItemIndex != (this.dd.optionsToDisplay.length)) {
                                this.dd.selectItem(null, this.dd.optionsToDisplay[nextItemIndex]);
                                this.dd.selectedOptionUpdated = true;
                            } else {
                                this.dd.selectItem(null, this.dd.optionsToDisplay[0]);
                            }
                        }
                    }
                    event.preventDefault();
                    break;

                // up
                case 38:
                    if (this.dd.group) {
                        let selectedItemIndex = this.dd.selectedOption ? this.dd.findOptionGroupIndex(this.dd.selectedOption.value, this.dd.optionsToDisplay) : -1;
                        if (selectedItemIndex !== -1) {
                            let prevItemIndex = selectedItemIndex.itemIndex - 1;
                            if (prevItemIndex >= 0) {
                                this.dd.selectItem(null, this.dd.optionsToDisplay[selectedItemIndex.groupIndex].items[prevItemIndex]);
                                this.dd.selectedOptionUpdated = true;
                            } else if (prevItemIndex < 0) {
                                let prevGroup = this.dd.optionsToDisplay[selectedItemIndex.groupIndex - 1];
                                if (prevGroup) {
                                    this.dd.selectItem(null, prevGroup.items[prevGroup.items.length - 1]);
                                    this.dd.selectedOptionUpdated = true;
                                }
                            }
                        }
                    } else {
                        let selectedItemIndex = this.dd.selectedOption ? this.dd.findOptionIndex(this.dd.selectedOption.value, this.dd.optionsToDisplay) : -1;
                        if (selectedItemIndex > 0) {
                            let prevItemIndex = selectedItemIndex - 1;
                            this.dd.selectItem(null, this.dd.optionsToDisplay[prevItemIndex]);
                            this.dd.selectedOptionUpdated = true;
                        }
                    }

                    event.preventDefault();
                    break;

                // space
                case 32:
                    if (!this.dd.overlayVisible) {
                        this.dd.show();
                        event.preventDefault();
                    }
                    break;

                // enter
                case 13:
                    if (!this.dd.filter || (this.dd.optionsToDisplay && this.dd.optionsToDisplay.length > 0)) {
                        let selectedItemIndex = this.dd.selectedOption ? this.dd.findOptionIndex(this.dd.selectedOption.value, this.dd.optionsToDisplay) : -1;
                        // console.log(this.currentValue, this.dd.value);
                        if (selectedItemIndex > -1 && (this.currentValue ? this.currentValue.value : null) != this.dd.value) {
                            this.dd.onModelChange(this.dd.value);
                            this.dd.updateEditableLabel();
                            this.dd.onChange.emit({
                                originalEvent: event,
                                value: this.dd.value
                            });
                            this.currentValue = this.dd.selectedOption;
                            this.dd.selectedOptionUpdated = true;
                        }
                        this.dd.hide(null);
                        this.dd.resetFilter();
                    }

                    event.preventDefault();
                    break;

                // escape and tab
                case 9:
                case 27:
                    this.dd.hide(null);
                    break;
            }
        };
    }

    onInputFocus(event) {
        this.currentValue = this.dd.selectedOption;
        let tmp = this.dd.overlayVisible;
        setTimeout(() => {
            // console.log(tmp);
            if (!tmp) {
                this.dd.show();
                event.preventDefault();
            }
        }, 100);
    }

    modelChange(event) {
        this.onModelChange(event.value);
        this.onChange.emit(event);
    }

}
