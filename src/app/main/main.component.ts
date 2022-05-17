
import { Component, ComponentFactoryResolver, Injector } from '@angular/core';
import { ENotificationType, SystemConstants, User, Utils } from 'core';
import { takeUntil } from 'rxjs/operators';
declare let $: any;

@Component({
    selector: 'app-main',
    templateUrl: './main.component.html'
})
export class MainComponent extends Utils {
    private _timing = 1000;
    private _interval;
    public user: User;
    public last_url: string;
    constructor(injector: Injector, private resolver: ComponentFactoryResolver) {
        super(injector);
        this.user = this._authenService.getLoggedInUser();
        this._storageService.changes.pipe(takeUntil(this.unsubscribe)).subscribe((data: any) => {
            if (data.key == SystemConstants.get('CURRENT_USER')) {
                this.user = this._authenService.getLoggedInUser();
                if (!this.user) {
                    this.last_url = window.location.pathname;
                    this._stopTimer();
                    this._authenService.router.navigate([SystemConstants.get('LOGIN_URL')]);
                    this._authenService.clearUserStorage(true);
                } else {
                    this._authenService.router.navigate([this.last_url || '']);
                    this.last_url = null;
                    this._startTimer();
                }
            }
        });
        if (window.location.pathname != SystemConstants.get('LOGIN_URL')) {
            if (this.user == null) {
                $('.modal').remove();
                $('.modal-backgrop').remove();
                $('body').removeClass('modal-open');
                $('body').css('padding', '0');
                this._router.navigate([SystemConstants.get('LOGIN_URL')]);
                return;
            } else {
                this._startTimer();
            }
        }
    }

    public get delta() {
        if (this.user) {
            let d = new Date(this.user.expires);
            let now = new Date();
            return Math.round(d.getTime() / 1000) - Math.round(now.getTime() / 1000);
        } else {
            return 0;
        }

    }

    private _startTimer() {
        if (this.user) {
            if (this.delta <= 0) {
                $('.modal').remove();
                $('.modal-backgrop').remove();
                $('body').removeClass('modal-open');
                $('body').css('padding', '0');
                this._authenService.logout();
                return;
            }
            this._stopTimer();
            this._interval = setInterval(() => {
                if (this.delta == 60) {
                    this._authenService.refresh().pipe(takeUntil(this.unsubscribe)).subscribe(data => {
                        this.user = this._authenService.getLoggedInUser();
                    }, error => {
                        this._functionConstants.ShowNotification(ENotificationType.RED, 'MESSAGE.refresh_token_fail');
                    });
                } else if (this.delta <= 0) {
                    this._stopTimer();
                    localStorage.removeItem(SystemConstants.get('CURRENT_USER'));
                    $('.modal').remove();
                    $('.modal-backgrop').remove();
                    $('body').removeClass('modal-open');
                    $('body').css('padding', '0');
                    this._router.navigate([SystemConstants.get('LOGIN_URL')]);
                }
            }, this._timing);
        }
    }

    private _stopTimer() {
        clearInterval(this._interval);
        this._interval = undefined;
    }

    onActivated(component: any) {
        setTimeout(() => {
            $('#breadcrumbs').css('left', $('#sidebar').width() + 1);
        });
        setTimeout(() => {
            if ($('.breadcrumb li.active').length) {
                setTimeout(() => {
                    document.title = $('.breadcrumb li.active').html() == '' ? 'Website powered by vnpt' : $('.breadcrumb li.active').html();
                }, 1000);
            } else {
                document.title = 'Website powered by vnpt';
            }
        }, 100);
        // TODO: check permission view page here
    }

}
