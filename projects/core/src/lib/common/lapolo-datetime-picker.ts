import { Component, EventEmitter, forwardRef, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Calendar } from 'primeng/calendar';
import { Checkbox } from 'primeng/checkbox';
import 'rxjs/add/operator/takeUntil';
import { FunctionConstants } from './function.constants';
import { SystemConstants } from './system.constants';
declare var $: any;

export const LAPOLO_DATETIME_PICKER_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => LapoloDatetimePicker),
    multi: true
};

@Component({
    selector: 'lapolo-datetime-picker',
    template: `
        <p-calendar #cal [showIcon]="true" [maxDate]="maxDate" [(ngModel)]="value" appendTo="body" (onSelect)="selectCalendar($event, cal)" (onBlur)="blurCalendar($event, cal)" (ngModelChange)="onValueChange($event)" [locale]="locale_calendar"
                (keydown)="onlyNumbers($event, false, cal)" (keydown.space)="value = null; $event.target.value = null; ckb.checked = !ckb.checked; ckb.onChange.emit(ckb.checked);"
                (input)="addSlash($event, false, cal)" [dateFormat]="dateFormat">
            <p-footer>
                <div style="padding-left: 5px;">
                    <p-checkbox #ckb binary="true" label="{{ 'COMMON.year_only' | translate }}" (onChange)="cal.dateFormat = ($event ? 'yy' : dateFormat); cal.dataType = ($event ? 'string' : 'date'); cal.keepInvalid = $event; cal.showOnFocus = !($event)"></p-checkbox>
                </div>
            </p-footer>
        </p-calendar>
    `,
    providers: [LAPOLO_DATETIME_PICKER_VALUE_ACCESSOR]
})
export class LapoloDatetimePicker implements OnInit, ControlValueAccessor {

    public backspacePressed = false;
    public dateFormat = SystemConstants.get('P_DATE_FORMAT');
    public locale_calendar = SystemConstants.get(this._functionConstants.GetCurrentCaptionLanguage() == SystemConstants.get('LOCAL') ? 'LOCALE_CALENDAR_LOCAL' : 'LOCALE_CALENDAR_EN');

    @Input() maxDate: Date;

    @ViewChild('cal', {static: false}) cal: Calendar;
    @ViewChild('ckb', {static: false}) ckb: Checkbox;

    public value: any = null;

    onModelChange: Function = () => { };

    onModelTouched: Function = () => { };

    constructor(private _functionConstants: FunctionConstants) { }

    ngOnInit() { }

    onValueChange(value) {
        this.onModelChange(value);
    }

    writeValue(val: any): void {
        if (val && val != '') {
            if (val instanceof Date) {
                this.ckb.onChange.emit(false);
                this.value = new Date(val);
            } else {
                this.ckb.onChange.emit(true);
                this.value = val;
                if (this.cal.inputfieldViewChild) {
                    this.cal.inputfieldViewChild.nativeElement.value = val;
                }
            }
        }
    }

    registerOnChange(fn: any): void {
        this.onModelChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onModelTouched = fn;
    }

    setDisabledState(val: boolean): void {
        this.cal.disabled = val;
    }

    addSlash(event, showTime: boolean = false, cal: any = null) {
        if (!this.backspacePressed && !cal || (cal && cal.dateFormat != 'yy')) {
            if (event.target.value.length == 2 || event.target.value.length == 5) {
                event.target.value += '/';
            } else if (event.target.value.length == 10 && showTime) {
                event.target.value += ' ';
            } else if (event.target.value.length == 13) {
                event.target.value += ':';
            } else if (event.target.value.length == 3) {
                event.target.value = event.target.value.slice(0, 2) + '/' + event.target.value.slice(2);
            } else if (event.target.value.length == 6) {
                event.target.value = event.target.value.slice(0, 5) + '/' + event.target.value.slice(5);
            } else if (event.target.value.length == 11) {
                event.target.value = event.target.value.slice(0, 10) + ' ' + event.target.value.slice(10);
            } else if (event.target.value.length == 14) {
                event.target.value = event.target.value.slice(0, 13) + ':' + event.target.value.slice(13);
            }
        } else if (cal && cal.dateFormat == 'yy') {
            if (event.target.value.length == 4) {
                this.onModelChange(event.target.value);
            }
        }
    }

    addcolonfortime(event) {
        if (!this.backspacePressed) {
            if (event.target.value.length == 2) {
                event.target.value += ':';
            } else if (event.target.value.length == 6) {
                event.target.value = event.target.value.slice(0, 5);
            }
        }
    }

    onlyNumbers(event, showTime: boolean = false, cal: any = null) {
        let vKey = 86,
            aKey = 65,
            forwardSlashKey = 191,
            cKey = 67;
        let max = (cal && cal.dateFormat == 'yy') ? 4 : (showTime ? 16 : 10);
        if (((event.ctrlKey === true || event.metaKey === true) && (event.keyCode == vKey || event.keyCode == cKey || event.keyCode == aKey))
            || (event.keyCode >= 35 && event.keyCode <= 40)) {
            return true;
        }
        if (event.code == 'Enter' || event.code == 'NumpadEnter') {
            $('body').click();
            return true;
        }
        if (event.code == 'Backspace') {
            this.backspacePressed = true;
        } else {
            this.backspacePressed = false;
        }
        if (event.code == 'Backspace' || event.code == 'ArrowLeft' || event.code == 'ArrowRight' || event.code == 'Tab') {
            return true;
        }
        if (event.target.value.length < max) {
            if ((event.keyCode >= 48 && event.keyCode <= 57) || (event.keyCode >= 96 && event.keyCode <= 105) || event.keyCode == forwardSlashKey) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    blurCalendar(event, sender, model: any = null, field: string = null) {
        if (sender.value) {
            if (sender.maxDate && sender.value > sender.maxDate) {
                sender.value = sender.maxDate;
                if (model && field) {
                    model[field] = sender.value;
                }
            } else if (sender.minDate && sender.value < sender.minDate) {
                sender.value = sender.minDate;
                if (model && field) {
                    model[field] = sender.value;
                }
            }
        }
    }

    selectCalendar(event, sender) {
        let $this = $(sender.inputfieldViewChild.nativeElement);
        let inputs = $this.closest('form').find(':input:not(:button)');
        inputs.eq(inputs.index(sender.inputfieldViewChild.nativeElement)).focus();
    }

}
