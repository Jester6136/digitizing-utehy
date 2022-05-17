import { Directive, forwardRef, Host, OnInit, Optional, Self, HostListener, HostBinding } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { DomHandler } from 'primeng/api';
import { Calendar } from 'primeng/calendar';
import { SystemConstants } from '../common/system.constants';
import { PLThousandPipe } from '../pipe/thousand.pipe';
import { FunctionConstants } from '../common/function.constants';

export const PLCALENDARDIRECTIVE_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => PLCalendarDirective),
    multi: true
};

@Directive({
    // tslint:disable-next-line:directive-selector
    selector: '[plCalendar]',
    providers: [DomHandler, PLThousandPipe, PLCALENDARDIRECTIVE_VALUE_ACCESSOR],
    host: {
        '[class.text-right]': 'true',
        '[class.ui-inputtext]': 'true',
        '[class.ui-corner-all]': 'true',
        '[class.ui-state-default]': 'true',
        '[class.ui-widget]': 'true'
    }
})
export class PLCalendarDirective implements OnInit {

    @HostBinding('showIcon') showIcon = true;
    @HostBinding('locale') locale = SystemConstants.get(this._functionConstants.GetCurrentCaptionLanguage() == SystemConstants.get('LOCAL') ? 'LOCALE_CALENDAR_LOCAL' : 'LOCALE_CALENDAR_EN');
    @HostBinding('dateFormat') dateFormat = SystemConstants.get('P_DATE_FORMAT');

    onModelChange: Function = () => { };
    onModelTouched: Function = () => { };

    constructor(@Host() @Self() @Optional() public host: Calendar, private _functionConstants: FunctionConstants) {
    }

    ngOnInit() { }

    writeValue(val): void {
    }

    registerOnChange(fn: any): void {
        this.onModelChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onModelTouched = fn;
    }

    setDisabledState(value: boolean): void {
        this.host.disabled = value;
    }

}
