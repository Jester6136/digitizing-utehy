import { Utils } from './../common/utils';
import { CanDeactivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/takeUntil';
import { Observable } from 'rxjs';

@Injectable()
export class ConfirmDeactivateGuard implements CanDeactivate<Utils> {
    constructor(private trans: TranslateService) { }

    canDeactivate(component: Utils, currentRoute: ActivatedRouteSnapshot, currentState: RouterStateSnapshot, nextState: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        if (component.hasChangesData()) {
            this.trans.get('COMMON.comfirm_before_deactive_route').subscribe(mess => {
                let t = window.confirm(mess);
                return t;
            });
        } else {
            return true;
        }

    }
}
