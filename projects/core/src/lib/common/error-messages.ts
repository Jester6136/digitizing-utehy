import { AfterViewInit, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import 'rxjs/add/operator/takeUntil';
declare var $: any;

@Component({
    selector: 'error-messages',
    template: `<i [class.show-error]="!control.valid && control.dirty && !control.disabled" class="ace-icon fa fa-exclamation-triangle tooltip-error red" data-rel="tooltip"
    data-placement="top" data-tooltip-custom-class="red-tooltip" data-container="body" title=""></i>`
})
export class ErrorMessages implements OnInit, OnChanges, AfterViewInit {

    @Input() control: AbstractControl;
    @Input() valid: any;
    @Input() errors: any;

    public errorMessage: string;
    private config = {};

    constructor(private _translateService: TranslateService) {
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
            'MESSAGE.date_less_than',
            'MESSAGE.no_phone',
            'MESSAGE.no_number'
        ]).subscribe((res) => {
            this.config = {
                'no_number': res['MESSAGE.no_number'],
                'no_phone': res['MESSAGE.no_phone'],
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

    ngOnInit() { }

    ngAfterViewInit() {
        setTimeout(() => {
            $('[data-rel=tooltip]').tooltip();
        }, 1000);
    }

    ngOnChanges(changes: SimpleChanges) {
        let controlName = '';
        Object.keys(this.control.parent.controls).forEach((name: string) => {
            if (this.control === this.control.parent.controls[name]) {
                controlName = name;
            }
        });
        if (this.errors) {
            if(this.errors && this.errors.pattern && this.errors.pattern.requiredPattern=='^[0-9 _-]{10,12}$') {
                this.errorMessage = this.config['no_phone'] || '';
                setTimeout(() => {
                    let self = this;
                    $('.ng-dirty.ng-invalid[formcontrolname=' + controlName + ']').parent().find('[data-rel=tooltip]').each(function () {
                        let tt = $(this);
                        tt.attr('data-original-title', self.errorMessage);
                        if (tt.attr('aria-describedby')) {
                            tt.tooltip('fixTitle');
                            $('#' + tt.attr('aria-describedby')).find('.tooltip-inner').html(self.errorMessage);
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
            }                   
            else if(this.errors && this.errors.pattern && this.errors.pattern.requiredPattern == '/^-?(0|[1-9]\\d*)?$/') {
                this.errorMessage = this.config['no_number'] || '';
                setTimeout(() => {
                    let self = this;
                    $('.ng-dirty.ng-invalid[formcontrolname=' + controlName + ']').parent().find('[data-rel=tooltip]').each(function () {
                        let tt = $(this);
                        tt.attr('data-original-title', self.errorMessage);
                        if (tt.attr('aria-describedby')) {
                            tt.tooltip('fixTitle');
                            $('#' + tt.attr('aria-describedby')).find('.tooltip-inner').html(self.errorMessage);
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
            }                   
            else for (let propertyName in this.errors) {
                if (this.control.errors.hasOwnProperty(propertyName)) {
                    this.errorMessage = this.config[propertyName] || '';
                    if (propertyName == 'maxlength') {
                        this.errorMessage = this.errorMessage.replace('{requiredLength}', this.errors[propertyName].requiredLength);
                    } else if (propertyName == 'max') {
                        this.errorMessage = this.errorMessage.replace('{max}', this.errors[propertyName].max);
                    } else if (propertyName == 'min') {
                        this.errorMessage = this.errorMessage.replace('{min}', this.errors[propertyName].min);
                    } else if (propertyName == 'date_less_than') {
                        this._translateService.get('COMMON.' + this.errors[propertyName].type).subscribe(msg => {
                            this.control.markAsDirty();
                            this.errorMessage = this.errorMessage.replace('{0}', this.errors[propertyName].range).replace('{1}', msg);
                        });
                    }
                    setTimeout(() => {
                        let self = this;
                        $('.ng-dirty.ng-invalid[formcontrolname=' + controlName + ']').parent().find('[data-rel=tooltip]').each(function () {
                            let tt = $(this);
                            tt.attr('data-original-title', self.errorMessage);
                            if (tt.attr('aria-describedby')) {
                                tt.tooltip('fixTitle');
                                $('#' + tt.attr('aria-describedby')).find('.tooltip-inner').html(self.errorMessage);
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
            }
        } else {
            $('[formcontrolname=' + controlName + ']').parent().find('[data-rel=tooltip]').each(function () {
                let tt = $(this);
                tt.tooltip('hide');
            });
        }
    }

}
