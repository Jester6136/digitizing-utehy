import { Directive, ElementRef, EventEmitter, HostBinding, HostListener, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { DomHandler } from 'primeng/api';
import { FunctionConstants } from '../common/function.constants';
import { ENotificationType } from '../common/notification-type.enum';
import { SystemConstants } from '../common/system.constants';
declare let $: any;
@Directive({
    // tslint:disable-next-line:directive-selector
    selector: '[plInvalidMessage]',
    providers: [DomHandler]
})
export class PLInvalidMessage implements OnInit {

    @HostBinding('disabled') disabled = SystemConstants.get('DISABLE_OR_THROW_MESSAGE_FLAG');
    private el: HTMLButtonElement;
    private disable_flag = SystemConstants.get('DISABLE_OR_THROW_MESSAGE_FLAG');
    private config = {};
    @Input() public plInvalidMessage: any;
    @Output() Click = new EventEmitter();

    constructor(private elementRef: ElementRef, private _translateService: TranslateService, private _functionConstants: FunctionConstants) {
        this.el = this.elementRef.nativeElement;
        this._translateService.get([
            'MESSAGE.required',
            'MESSAGE.match_other',
            'MESSAGE.maxlength',
            'MESSAGE.email_incorrect_format',
            'MESSAGE.no_whitespace',
            'MESSAGE.no_contain_whitespace',
            'MESSAGE.max',
            'MESSAGE.min',
            'MESSAGE.date_less_than_or_equal',
            'MESSAGE.date_less_than'
        ]).subscribe((res) => {
            this.config = {
                'required': res['MESSAGE.required'],
                'match_other': res['MESSAGE.match_other'],
                'maxlength': res['MESSAGE.maxlength'],
                'email': res['MESSAGE.email_incorrect_format'],
                'whitespace': res['MESSAGE.no_whitespace'],
                'contain_whitespace': res['MESSAGE.no_contain_whitespace'],
                'max': res['MESSAGE.max'],
                'min': res['MESSAGE.min'],
                'date_less_than_or_equal': res['MESSAGE.date_less_than_or_equal'],
                'date_less_than': res['MESSAGE.date_less_than']
            };
        });
    }

    ngOnInit() {
    }

    scrollTo(el: Element) {
        if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
        }
    }

    validate() {
        let error_message = '';
        let ok = true;
        for (let k = 0; k < this.plInvalidMessage.length; k++) {
            let sender = this.plInvalidMessage[k].sender;
            if (sender instanceof FormGroup) {
                for (let i = 0; i < Object.keys(sender.controls).length; i++) {
                    let form_control_name = Object.keys(sender.controls)[i];
                    let errors = sender.controls[form_control_name].errors;
                    if (errors) {
                        ok = false;
                        for (let j = 0; j < Object.keys(errors).length; j++) {
                            let propertyName = Object.keys(errors)[j];
                            error_message = this.config[propertyName] || '';
                            if (propertyName == 'maxlength') {
                                error_message = error_message.replace('{requiredLength}', errors[propertyName].requiredLength);
                            } else if (propertyName == 'max') {
                                error_message = error_message.replace('{max}', errors[propertyName].max);
                            } else if (propertyName == 'min') {
                                error_message = error_message.replace('{min}', errors[propertyName].min);
                            } else if (propertyName == 'date_less_than') {
                                this._translateService.get('COMMON.' + errors[propertyName].type).subscribe(msg => {
                                    error_message = error_message.replace('{0}', errors[propertyName].range).replace('{1}', msg);
                                });
                            }
                            sender.controls[form_control_name].markAsDirty();
                            this._functionConstants.ShowNotificationNotTranslate(ENotificationType.ORANGE, error_message);
                            setTimeout(() => {
                                if ($('.ng-dirty.ng-invalid:not(form)').length) {
                                    switch ($('.ng-dirty.ng-invalid:not(form)')[0].tagName.toUpperCase()) {
                                        case 'NG-SELECTIZE':
                                            $($('.ng-dirty.ng-invalid:not(form)')[0]).find('input').focus();
                                            break;
                                        default:
                                            $('.ng-dirty.ng-invalid:not(form)')[0].focus();
                                            break;
                                    }
                                }
                                let parent = $('.ng-dirty.ng-invalid[formcontrolname=' + form_control_name + ']').parent();
                                if (parent.hasClass('ui-inputgroup')) {
                                    parent = parent.parent();
                                }
                                parent.find('[data-rel=tooltip]').each(function () {
                                    let tt = $(this);
                                    tt.attr('data-original-title', error_message);
                                    if (tt.attr('aria-describedby')) {
                                        tt.tooltip('fixTitle');
                                        $('#' + tt.attr('aria-describedby')).find('.tooltip-inner').html(error_message);
                                    } else {
                                        if ($('body > .tooltip').length == 0) {
                                            tt.tooltip('fixTitle').tooltip('show');
                                            setTimeout(() => {
                                                tt.tooltip('hide');
                                            }, 3000);
                                        }
                                    }
                                });
                            });
                            break;
                        }
                        break;
                    }
                }
            }
        }
        return ok;
    }

    @HostListener('click', ['$event'])
    onClick(event: any) {
        if (!this.validate()) {
            event.preventDefault();
            event.stopPropagation();
        } else {
            this.Click.emit(event);
        }
    }

}
