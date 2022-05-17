import { AfterViewInit, AfterContentInit, Component, forwardRef, Input, OnInit, TemplateRef, ContentChildren, QueryList, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Guid } from '../common/guid';
import { PrimeTemplate } from 'primeng/components/common/shared';
declare var $: any;

export const NGSELECTOR_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  // tslint:disable-next-line: no-use-before-declare
  useExisting: forwardRef(() => NgSelectorComponent),
  multi: true
};

@Component({
  selector: 'ng-selector',
  templateUrl: './ng-selector.component.html',
  providers: [NGSELECTOR_VALUE_ACCESSOR]
})
export class NgSelectorComponent implements OnInit, AfterViewInit, AfterContentInit, ControlValueAccessor, OnDestroy {

  inputId: string;
  Guid: Guid = new Guid();
  itemTemplate: TemplateRef<any>;
  headerTemplate: TemplateRef<any>;

  @Input() options: any[];
  @Input() name: string;
  @Input() nextOnSelect: boolean;
  @Input() valueField: string;
  @Input() labelField: string;
  @Input() disabled: boolean;
  @Input() placeholder: string;
  @Input() template: TemplateRef<any>;

  @ContentChildren(PrimeTemplate) templates: QueryList<any>;

  onModelChange: Function = () => { };
  onModelTouched: Function = () => { };

  writeValue(val: any): void {
    $('#' + this.inputId).dropdown('refresh');
    $('#' + this.inputId + ' input.search').val('');
    setTimeout(() => {
      if (val == null || val == '') {
        $('#' + this.inputId).dropdown('clear');
      } else {
        $('#' + this.inputId).dropdown('set selected', val);
      }
    }, 1);
  }

  clear() {
    $('#' + this.inputId).dropdown('refresh');
    $('#' + this.inputId + ' input.search').val('');
    setTimeout(() => {
      $('#' + this.inputId).dropdown('clear');
    }, 1);
  }

  registerOnChange(fn: any): void {
    this.onModelChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onModelTouched = fn;
  }

  setDisabledState(value: boolean): void {
    this.disabled = value;
  }

  constructor(private _changeDetectorRef: ChangeDetectorRef) {
    this.inputId = this.Guid.newGuid();
  }

  ngOnInit() {
    this.valueField = this.valueField || 'value';
    this.labelField = this.labelField || 'label';
    this.options = this.options || [];
  }

  focus() {
    $('#' + this.inputId + ' input.search').focus();
  }

  ngAfterViewInit() {
    let self = this;
    $(document).on('keydown', '#' + this.inputId + ' input.search', function (event: any) {
      if ($(this).val() === '' && event.keyCode === 8 && $('#' + self.inputId).dropdown('get value') != null) {
        $('#' + self.inputId).dropdown('clear');
      }
      if (event.keyCode === 13 && self.nextOnSelect) {
        setTimeout(() => {
          let $canfocus = $('[tabindex!="-1"]:focusable');
          let index = $canfocus.index($('#' + self.inputId + ' input.search')) + 1;
          if (index >= $canfocus.length) {
            index = 0;
          }
          $canfocus.eq(index).focus();
        });
      }
    });
    $('#' + this.inputId).dropdown({
      clearable: true,
      ignoreCase: true,
      fullTextSearch: 'exact',
      match: 'text',
      selectOnKeydown: false,
      forceSelection: false,
      onChange: function (value: any, text: any, $selectedItem: any) {
        self.onModelChange(value);
      }
    });
  }

  ngAfterContentInit() {
    this.templates.forEach((item) => {
      switch (item.getType()) {
        case 'header':
          this.headerTemplate = item.tempate;
          break;
        default:
          this.itemTemplate = item.template;
          break;
      }
    });
  }

  ngOnDestroy() {
    $('#' + this.inputId).dropdown('destroy');
  }

}
