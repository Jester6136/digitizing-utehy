
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanLoad, Route, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SystemConstants } from '../common/system.constants';
import { AuthenService } from '../services/auth.service';
import { StorageService } from '../services/storage.service';

export class PermissionCanLoad {
  canLoadChildren(): boolean {
    let s = new StorageService();
    let user = s.getItem(SystemConstants.get('CURRENT_USER'));
    let currentFacility = s.getItem(SystemConstants.get('PREFIX_CURRENT_FACILITY'));
    if (user) {
      if (currentFacility) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
}

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private router: Router, private _storageService: StorageService) { }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    let user = this._storageService.getItem(SystemConstants.get('CURRENT_USER'));
    let currentFacility = this._storageService.getItem(SystemConstants.get('PREFIX_CURRENT_FACILITY'));
    if (user) {
      if (currentFacility) {
        return true;
      } else {
        this.router.navigate([SystemConstants.get('CHOOSE_FACILITY_URL')]);
        return false;
      }
    } else {
      this.router.navigate([SystemConstants.get('LOGIN_URL')]);
      return false;
    }
  }
}

@Injectable()
export class LoginGuard implements CanActivate {

  constructor(private router: Router, private _storageService: StorageService) { }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    let user = this._storageService.getItem(SystemConstants.get('CURRENT_USER'));
    let currentFacility = this._storageService.getItem(SystemConstants.get('PREFIX_CURRENT_FACILITY'));
    if (user) {
      if (currentFacility) {
        this.router.navigate(['']);
        return false;
      } else {
        return true;
      }
    } else {
      this.router.navigate([SystemConstants.get('LOGIN_URL')]);
      return false;
    }
  }
}

@Injectable()
export class LoggedInGuard implements CanActivate {

  constructor(private router: Router, private _storageService: StorageService) { }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    let user = this._storageService.getItem(SystemConstants.get('CURRENT_USER'));
    let currentFacility = this._storageService.getItem(SystemConstants.get('PREFIX_CURRENT_FACILITY'));
    if (user) {
      if (currentFacility) {
        this.router.navigate(['']);
        return false;
      } else {
        this.router.navigate([SystemConstants.get('CHOOSE_FACILITY_URL')]);
        return false;
      }
    } else {
      return true;
    }
  }
}

@Injectable()
export class ConfirmedGuard implements CanActivate {

  constructor(private _router: Router, private _authService: AuthenService, private _storageService: StorageService) { }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    let token = next.queryParams['t'];
    let user_id = next.queryParams['i'];
    if (token && user_id) {
      return this._authService.getUserById('/api/user/confirm/' + user_id + '/' + token).pipe(
        map((res) => {
          let json = res.json();
          if (json.Data == false) {
            this._router.navigate([SystemConstants.get('LOGIN_URL')]);
            return false;
          }
          return true;
        }));
    }
  }
}

@Injectable()
export class CustomCanLoad implements CanLoad {

  constructor(private permission: PermissionCanLoad) { }

  canLoad(route: Route): Observable<boolean> | Promise<boolean> | boolean {
    return this.permission.canLoadChildren();
  }
}

