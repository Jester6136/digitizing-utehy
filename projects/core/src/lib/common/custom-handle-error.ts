import { ErrorHandler, Inject, Injectable, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenService } from './../services/auth.service';
import { StorageService } from './../services/storage.service';
import { FunctionConstants } from './function.constants';
import { ENotificationType } from './notification-type.enum';
import { SystemConstants } from './system.constants';
import { ApiService } from '../services/api.service';
declare var StackTrace: any;
declare var $: any;

@Injectable()
export class MyErrorHandler extends ErrorHandler {

    constructor(private injector: Injector, @Inject('env') private env) {
        super();
    }

    public get router(): Router {
        return this.injector.get(Router);
    }

    public get _apiService(): ApiService {
        return this.injector.get(ApiService);
    }

    public get _storageService(): StorageService {
        return this.injector.get(StorageService);
    }

    public get _authService(): AuthenService {
        return this.injector.get(AuthenService);
    }

    public get _functionConstants(): FunctionConstants {
        return this.injector.get(FunctionConstants);
    }

    handleError(error) {
        if (error.status == 440) {
            this._functionConstants.ShowNotification(ENotificationType.RED, 'MESSAGE.refresh_token_fail_10s');
            setTimeout(() => {
                localStorage.removeItem(SystemConstants.get('CURRENT_USER'));
                $('.modal').remove();
                $('.modal-backgrop').remove();
                $('body').removeClass('modal-open');
                $('body').css('padding', '0');
                this.router.navigate([SystemConstants.get('LOGIN_URL')]);
            }, 10000);
        } else if (error.message && error.message.toString().indexOf('Cannot read property \'objectjson_person\'') > -1) {
            this._functionConstants.ShowNotification(ENotificationType.RED, 'MESSAGE.session_expired');
            return;
        }
        let log = true;
        Object.keys(SystemConstants.get('NO_HANDLE_EXCEPTION_MESSAGE')).forEach((name: string) => {
            if (error.message == SystemConstants.get('NO_HANDLE_EXCEPTION_MESSAGE')[name]) {
                log = false;
                return;
            }
        });
        if (log) {
            if (error.status && error.status != 440) {
                this._functionConstants.ShowNotification(ENotificationType.RED, 'MESSAGE.error_occurred');
            }
            if (error.status != 440 && error.toString().indexOf('ExpressionChangedAfterItHasBeenCheckedError') == -1) {
                let user = this._authService.getLoggedInUser();
                let exclude_errors = [
                    'Http failure response for',
                    'Loading chunk',
                    'You can provide an Observable, Promise, Array, or Iterable',
                    'already exists'
                ];
                if (this.env.production && error.message && error.message != '' && exclude_errors.find(ds => error.message.indexOf(ds) > -1) == null) {
                    this._apiService.callbackNoAsyncToMain('/api/system/send-error-mail', {
                        username: user.username,
                        full_name: user.objectjson_person.full_name,
                        department_id: user.department_id,
                        error_data: error.message,
                        stack: error.stack,
                        host: SystemConstants.BASE_API,
                        url: SystemConstants.BASE_API + window.location.pathname,
                        to_email: SystemConstants.get('MAIL_USER')
                    });
                }
                this._functionConstants.ShowNotification(ENotificationType.RED, 'MESSAGE.error_occurred');
                if (SystemConstants.get('SHOW_ERROR')) {
                    console.log('Custome error: ', error);
                }
            }
        }
    }
}
