
import { Injectable } from '@angular/core';
import { Headers, Http, RequestOptions, Response } from '@angular/http';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { catchError, finalize, map, share } from 'rxjs/operators';
import { Md5 } from 'ts-md5/dist/md5';
import { FunctionConstants } from '../common/function.constants';
import { SystemConstants } from '../common/system.constants';
import { Permission } from '../entities/permission';
import { User } from '../entities/user';
import { LoaderService } from './loader.service';
import { StorageService } from './storage.service';

@Injectable()
export class AuthenService {

  constructor(private _http: Http, public router: Router, private _functionConstants: FunctionConstants,
    private _loaderService: LoaderService, private _storageService: StorageService) { }

  login(username: string, password: string) {
    try {
      this._loaderService.show();
      let body = 'facility_id=' + encodeURIComponent(SystemConstants.get('FACILITY_ID')) + '&userName=' + encodeURIComponent(username) + '&password=' + encodeURIComponent(Md5.hashStr(password).toString()) + '&grant_type=password';
      let headers = new Headers();
      headers.append(SystemConstants.get('CONTENT_TYPE'), SystemConstants.get('CONTENT_TYPE_URLENCODED'));
      let options = new RequestOptions({ headers: headers });
      return this._http.post(SystemConstants.BASE_API + '/api/token', body, options).pipe(
        map((response: Response) => {
          let rsp = response.json();
          let user = new User(rsp['access_token'], rsp['user_id'], rsp['username'], rsp['full_name'],
            rsp['avatar'], rsp['expires_in'], rsp['refresh_token'], rsp['.issued'], rsp['expires'], rsp['job_type_rcd'], rsp['department_id'],
            rsp['print_name_e'], rsp['print_name_l']
          );
          this._storageService.setItem(SystemConstants.get('PREFIX_DATA_LANGUAGE'), rsp['lang'] == 'l' ? 'local' : 'en');
          let facility = JSON.parse(rsp['facility']);
          if (user && user.access_token && facility) {
            this._storageService.setItem(SystemConstants.get('CURRENT_USER'), JSON.stringify(user));
            this._storageService.setItem(SystemConstants.get('PREFIX_FACILITIES'), rsp['facility']);
            if (facility) {
              this._storageService.setItem(SystemConstants.get('PREFIX_CURRENT_FACILITY'), JSON.stringify(facility));
              this._storageService.setItem(SystemConstants.get('PREFIX_PERMISSIONS'), rsp['permissions']);
              this._storageService.setItem(SystemConstants.get('PREFIX_SCOPES'), rsp['scopes']);
            }
            this._storageService.setItem('logon', 1);
          }
        }),
        finalize(() => {
          this._loaderService.hide();
        }));
    } catch (error) {
      this._loaderService.hide();
    }
  }

  getUserById(url: string) {
    let headers = new Headers();
    headers.delete(SystemConstants.get('HEADER_AUTH'));
    headers.delete(SystemConstants.get('ACCEPT'));
    let options = new RequestOptions({ headers: headers });
    return this._http
      .get(SystemConstants.BASE_API + url, options).pipe(
        catchError((err: Response) => {
          return this._functionConstants.handleError(err);
        }),
        finalize(() => {
          this._loaderService.hide();
        }));
  }

  refresh() {
    let userData: User = JSON.parse(this._storageService.getItem(SystemConstants.get('CURRENT_USER')));
    let body = 'refresh_token=' + encodeURIComponent(userData.refresh_token) + '&userId=' + encodeURIComponent(userData.user_id) + '&grant_type=refresh_token';
    let headers = new Headers();
    headers.append(SystemConstants.get('CONTENT_TYPE'), SystemConstants.get('CONTENT_TYPE_URLENCODED'));
    let options = new RequestOptions({ headers: headers });

    return this._http.post(SystemConstants.BASE_API + '/api/token', body, options).pipe(map((response: Response) => {
      let rsp = response.json();
      let user = new User(rsp['access_token'], rsp['user_id'], rsp['username'], rsp['full_name'],
        rsp['avatar'], rsp['expires_in'], rsp['refresh_token'], rsp['.issued'], rsp['.expires']
      );
      if (user && user.access_token) {
        this._storageService.setItem(SystemConstants.get('CURRENT_USER'), JSON.stringify(user));
      }
    }));
  }

  clearUserStorage(not_current_user: boolean = false) {
    let arr_clean: any[] = SystemConstants.get('ARR_CLEAN_LOCAL_STOGARES');
    (arr_clean || []).map(t => {
      this._storageService.removeItem(SystemConstants.get(t));
    });
    if (!not_current_user) {
      this._storageService.removeItem(SystemConstants.get('CURRENT_USER'));
      this._storageService.setItem('logon', 0);
    }
  }

  logout() {
    if (this.getLoggedInUser()) {
      let headers = new Headers();
      headers.append(
        SystemConstants.get('HEADER_AUTH'),
        SystemConstants.get('TOKEN_PREFIX') + this.getLoggedInUser().access_token
      );
      let options = new RequestOptions({ headers: headers });
      this.router.navigate([SystemConstants.get('LOGIN_URL')]);
      this.clearUserStorage();
      this._http.post(SystemConstants.BASE_API + '/api/system/logout', JSON.stringify({}), options).subscribe(res => {
      });
    } else {
      this.clearUserStorage();
    }
  }

  isAuthenticated(): boolean {
    if (this._storageService.getItem(SystemConstants.get('CURRENT_USER')) != null) {
      return true;
    } else {
      return false;
    }
  }

  public getLoggedInUser(): User {
    let user: User;
    if (this.isAuthenticated()) {
      let userData: User = JSON.parse(this._storageService.getItem(SystemConstants.get('CURRENT_USER')));
      user = new User(userData.access_token, userData.user_id, userData.username,
        userData.objectjson_person.full_name, userData.objectjson_employee.avatar, userData.expires_in,
        userData.refresh_token, userData.issued, userData.expires, userData.job_type,
        userData.department_id, userData.print_name_e, userData.print_name_l
      );
    } else {
      user = null;
    }
    return user;
  }

  getPrintName(): string {
    let print_name = '';
    let userData: User;
    if (this.isAuthenticated()) {
      userData = JSON.parse(this._storageService.getItem(SystemConstants.get('CURRENT_USER')));
      print_name = userData.objectjson_person.full_name;
    } else {
      userData = null;
    }
    if (userData) {
      if (this._storageService.getItem(SystemConstants.get('PREFIX_DATA_LANGUAGE')) == 'local') {
        print_name = userData.print_name_l;
      } else {
        print_name = userData.print_name_e;
      }
    }
    return print_name;
  }

  hasPermission(pageId: string, actionCode: string = null) {
    if (this._storageService.getItem(SystemConstants.get('PREFIX_PERMISSIONS'))) {
      let permissions: Permission[] = JSON.parse(this._storageService.getItem(SystemConstants.get('PREFIX_PERMISSIONS')));
      if (actionCode) {
        return permissions.find(ds => ds.action_code == actionCode) != null;
      } else {
        return permissions.find(ds => ds.page_id == pageId) != null;
      }
    }
    return false;
  }

  scopeFilter(scope_type: string) {
    if (this._storageService.getItem(SystemConstants.get('PREFIX_SCOPES'))) {
      let scopes = JSON.parse(this._storageService.getItem(SystemConstants.get('PREFIX_SCOPES')));
      if (scopes) {
        return scopes.filter(t => t.scope_type == scope_type);
      }
      return [];
    }
  }

  canActivate(url) {
    if (SystemConstants.get('NO_AUTH_URL').find(ds => ds.startsWith(url)) == null) {
      let currentPage = this._functionConstants.GetPageFromUrl(url);
      let pageId = '';
      if (currentPage) {
        pageId = currentPage.page_id;
        if (!this.hasPermission(pageId)) {
          return false;
        } else {
          return true;
        }
      } else {
        return false;
      }
    } else {
      return true;
    }
  }

}

export class CheckLogin {
  private onSubject = new Subject<{ key: string, value: any }>();
  public changes = this.onSubject.asObservable().pipe(share());

  getLogin() {
    let s = new StorageService();
    let user = s.getItem(SystemConstants.get('CURRENT_USER'));
    let currentFacility = s.getItem(SystemConstants.get('PREFIX_CURRENT_FACILITY'));
    if (user) {
      if (currentFacility) {
        return this.onSubject.next({ key: 'isLogin', value: true });
      } else {
        return this.onSubject.next({ key: 'isLogin', value: false });
      }
    } else {
      return this.onSubject.next({ key: 'isLogin', value: false });
    }
  }
}
