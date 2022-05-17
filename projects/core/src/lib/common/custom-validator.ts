import { AbstractControl, ValidationErrors, Validators } from '@angular/forms';

export function MatchOtherValidator(otherControlName: string) {

    let thisControl: AbstractControl;
    let otherControl: AbstractControl;

    return function MatchOtherValidate(control: AbstractControl): ValidationErrors {
        if (!control.parent) {
            return null;
        }
        if (!thisControl) {
            thisControl = control;
            otherControl = control.parent.get(otherControlName) as AbstractControl;
            if (!otherControl) {
                throw new Error('matchOtherValidator(): other control is not found in parent group');
            }
            otherControl.valueChanges.subscribe(() => {
                thisControl.updateValueAndValidity();
            });
        }
        if (!otherControl) {
            return null;
        }
        if (otherControl.value !== thisControl.value) {
            return {
                match_other: true
            };
        }
        return null;
    };

}

export function CustomEmailValidator(control: AbstractControl): ValidationErrors | null {
    if ((control.value || '').toString() == '') {
        return null;
    }
    return Validators.email(control);
}

export function NoFullWhitespaceValidator(control: AbstractControl): ValidationErrors | null {
    if ((control.value || '').toString() == '') {
        return null;
    }
    let isWhitespace = (control.value || '').toString().trim().length === 0;
    let isValid = !isWhitespace;
    return isValid ? null : { 'whitespace': true };
}

export function NoContainWhitespaceValidator(control: AbstractControl): ValidationErrors | null {
    if ((control.value || '').toString() == '') {
        return null;
    }
    return /^(.*\s+.*)+$/.test((control.value || '').toString()) ? { 'contain_whitespace': true } : null;
}

export function DateLessThanOrEqualsValidator(dateCompareControlName: string) {

    let thisDateControl: AbstractControl;
    let otherDateControl: AbstractControl;

    return function DateLessThanOrEqualsValidate(control: AbstractControl): ValidationErrors {
        if (!control.parent) {
            return null;
        }
        if (!thisDateControl) {
            thisDateControl = control;
            otherDateControl = control.parent.get(dateCompareControlName) as AbstractControl;
            if (!otherDateControl) {
                throw new Error('dateLessThanOrEqualsValidator(): other control is not found in parent group');
            }
            otherDateControl.valueChanges.subscribe(() => {
                thisDateControl.updateValueAndValidity();
            });
        }
        if (!otherDateControl || !otherDateControl.value) {
            return null;
        }
        const date1 = thisDateControl.value;
        const date2 = otherDateControl.value;
        if (date1 !== null && date2 !== null && date1 > date2) {
            return {
                'date_less_than_or_equal': true
            };
        }
        return null;
    };
}

export function DateLessThanValidator(dateCompareControlName: string, min: number, type: string, abs: boolean = false) {

    let thisDateControl: AbstractControl;
    let otherDateControl: AbstractControl;

    return function DateLessThanOrEqualsValidate(control: AbstractControl): ValidationErrors {
        if (!control.parent) {
            return null;
        }
        if (!thisDateControl) {
            thisDateControl = control;
            otherDateControl = control.parent.get(dateCompareControlName) as AbstractControl;
            if (!otherDateControl) {
                throw new Error('dateLessThanValidator(): other control is not found in parent group');
            }
            otherDateControl.valueChanges.subscribe(() => {
                thisDateControl.updateValueAndValidity();
            });
        }
        if (!otherDateControl || !otherDateControl.value) {
            return null;
        }
        const date1 = thisDateControl.value;
        const date2 = otherDateControl.value;
        if (date1 !== null && date2 !== null) {
            let diff = abs ? Math.abs(date2.getTime() - date1.getTime()) : date2.getTime() - date1.getTime();
            let range = 0;
            switch (type) {
                case 'vd_year':
                    range = Math.ceil(diff / (1000 * 3600 * 24 * 31 * 12)); break;
                case 'vd_mon':
                    range = Math.ceil(diff / (1000 * 3600 * 24 * 31)); break;
                case 'vd_day':
                    range = Math.ceil(diff / (1000 * 3600 * 24)); break;
                case 'vd_hour':
                    range = Math.ceil(diff / (1000 * 3600)); break;
                case 'vd_min':
                    range = Math.ceil(diff / (1000 * 60)); break;
                case 'vd_sec':
                    range = Math.ceil(diff / 1000); break;
                default:
                    range = Math.ceil(diff); break;
            }
            if (range < min) {
                return {
                    'date_less_than': {
                        range: min,
                        type: type
                    }
                };
            } else {
                return null;
            }
        }
        return null;
    };
}
