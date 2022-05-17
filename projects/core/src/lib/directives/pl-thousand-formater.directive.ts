import { Directive, ElementRef, forwardRef, HostListener, OnInit } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { DomHandler } from 'primeng/api';
import { SystemConstants } from '../common/system.constants';
import { PLThousandPipe } from '../pipe/thousand.pipe';

export const PLTHOUSANDFORMATERDIRECTIVE_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => PLThousandFormaterDirective),
    multi: true
};

@Directive({
    // tslint:disable-next-line:directive-selector
    selector: '[plThousandFormater]',
    providers: [DomHandler, PLThousandPipe, PLTHOUSANDFORMATERDIRECTIVE_VALUE_ACCESSOR],
    host: {
        '[class.text-right]': 'true',
        '[class.ui-inputtext]': 'true',
        '[class.ui-corner-all]': 'true',
        '[class.ui-state-default]': 'true',
        '[class.ui-widget]': 'true'
    }
})
export class PLThousandFormaterDirective implements OnInit {

    private el: HTMLInputElement;
    filled: boolean;
    private regex = new RegExp(SystemConstants.get('PL_REGEX_DECIMAL'), '');
    private THOUSANDS_SEPARATOR: string;
    onModelChange: Function = () => { };
    onModelTouched: Function = () => { };

    constructor(private elementRef: ElementRef, private thousandPipe: PLThousandPipe) {
        this.el = this.elementRef.nativeElement;
        this.THOUSANDS_SEPARATOR = SystemConstants.get('THOUSANDS_SEPARATOR');
    }

    ngOnInit() {
        if (this.el.value == '') {
            this.el.value = '0';
        } else {
            this.el.value = this.thousandPipe.transform(this.el.value);
        }
    }

    writeValue(val): void {
        if (val == '') {
            this.el.value = '0';
        } else {
            this.el.value = this.thousandPipe.transform(val);
        }
    }

    registerOnChange(fn: any): void {
        this.onModelChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onModelTouched = fn;
    }

    setDisabledState(value: boolean): void {
        this.elementRef.nativeElement.disabled = value;
    }

    getSelectedText() {
        const doc = document as any;
        let text = '';
        if (typeof window.getSelection != 'undefined') {
            text = window.getSelection().toString();
        } else if (typeof doc.selection != 'undefined' && doc.selection.type == 'Text') {
            text = doc.selection.createRange().text;
        }
        return text;
    }

    @HostListener('keypress', ['$event'])
    onKeypress(event: any) {
        let x = event.target.value.replace(new RegExp(this.THOUSANDS_SEPARATOR, 'gi'), '');
        let c = String.fromCharCode(event.keyCode);
        if (this.getSelectedText() != x) {
            if (x == '0' && c == '0') {
                event.preventDefault();
            } else if (x == '0' && c != '.') {
                event.target.value = '';
            } else if (!this.regex.test(x + c)) {
                event.preventDefault();
            }
        } else if (!this.regex.test(this.getSelectedText())) {
            event.preventDefault();
        }
    }

    @HostListener('input', ['$event.target.value'])
    onInput(value) {
        this.el.value = this.thousandPipe.transform(value);
        this.onModelChange(this.thousandPipe.parse(value));
    }

    @HostListener('blur', ['$event.target.value'])
    onBlur(value) {
        if (value == '') {
            this.el.value = '0';
        } else {
            if (Number.isNaN(Number(value.replace(new RegExp(this.THOUSANDS_SEPARATOR, 'gi'), '')))) {
                this.el.value = '0';
            } else {
                this.el.value = this.thousandPipe.transform(parseFloat(value.replace(new RegExp(this.THOUSANDS_SEPARATOR, 'gi'), '')).toString());
            }
        }
    }

}
