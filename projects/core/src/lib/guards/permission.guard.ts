import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { FunctionConstants } from '../common/function.constants';
import { SystemConstants } from '../common/system.constants';
import { AuthenService } from '../services/auth.service';
import { StorageService } from '../services/storage.service';
declare var $: any;

@Injectable()
export class PermissionGuard implements CanActivate {

  constructor(private router: Router, private _functionConstants: FunctionConstants, private _authService: AuthenService, private _storageService: StorageService) { }

  public canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    if (!SystemConstants.get('NO_AUTH_URL').find(ds => ds.startsWith(state.url))) {
      let currentPage = this._functionConstants.GetPageFromUrl(state.url);
      let pageId = '';
      if (currentPage) {
        pageId = currentPage.page_id;
        if (!this._authService.hasPermission(pageId)) {
          $('.modal').remove();
          $('.modal-backgrop').remove();
          $('body').removeClass('modal-open');
          this.router.navigate([SystemConstants.get('UNAUTHORIZED_URL')]);
          return false;
        } else {
          return true;
        }
      } else {
        $('.modal').remove();
        $('.modal-backgrop').remove();
        $('body').removeClass('modal-open');
        this.router.navigate([SystemConstants.get('UNAUTHORIZED_URL')]);
        return false;
      }
    } else {
      return true;
    }
  }
}
