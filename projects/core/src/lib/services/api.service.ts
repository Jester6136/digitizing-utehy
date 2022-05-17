
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { catchError, map } from 'rxjs/operators';
import { isBoolean, isNumber } from 'util';
import { DateTimeFormat } from '../common/DateTime-Format';
import { FunctionConstants } from '../common/function.constants';
import { ENotificationType } from '../common/notification-type.enum';
import { SystemConstants } from '../common/system.constants';
import { User } from '../entities/user';
import { AuthenService } from './auth.service';
import { StorageService } from './storage.service';
declare var LZString: any;

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  public currentLang: string;
  public user: User;
  public host = SystemConstants.BASE_API;
  public _DateTimeFormat = new DateTimeFormat();
  public TimeDiffServer = 0;

  constructor(private _http: HttpClient, private _translateService: TranslateService, public router: Router, private _authenService: AuthenService, private _functionConstants: FunctionConstants, private _storageService: StorageService, @Inject('env') private env) {
    this.currentLang = this._functionConstants.GetCurrentCaptionLanguage();
    this._translateService.addLangs(['en', 'local']);
    this._translateService.setDefaultLang(this.currentLang);
    this.user = this._authenService.getLoggedInUser();
  }
  
  public importFile(file: Blob, url: string) {
    const formData = new FormData();
    formData.append('file', file);
    let cloneHeader: any = {};
    cloneHeader[SystemConstants.get('HEADER_AUTH')] = SystemConstants.get('TOKEN_PREFIX') + this._authenService.getLoggedInUser().access_token;
    return this._http.post(url, formData, { headers: new HttpHeaders(cloneHeader), reportProgress: true, observe: 'events' })
  }

  

  GetserverTime() {
    let d = new Date();
    d.setTime(d.getTime() - this.TimeDiffServer);
    return d;
  }

  getFile(url) {
    return this._http
        .get(url, {responseType: 'text'})
        .pipe(map((res: any) => {
          return res;
        })).pipe(
          catchError((err: Response) => {
            return this._functionConstants.handleError(err);
          }));
  }

  sendError(error: any, url: string, json_object: any = null) {
    if (this.env.production) {
      let exclude_errors = [
        'MESSAGE.not_enough_qty_on_hand_need_refresh',
        'MESSAGE.treatment_reset_visit_completed_payment',
        'MESSAGE.prescription_issued',
        'MESSAGE.double_booking_by_employee',
        'MESSAGE.service_not_allow_cancel',
        'MESSAGE.treatment_reset_visit_received',
        'MESSAGE.exists_opening_visit',
        'MESSAGE.missing_print_hospital_transfer_info',
        'MESSAGE.exists_sur_in_room',
        'MESSAGE.expense_empty',
        'MESSAGE.exists_work_calendar',
        'MESSAGE.service_not_allow_modify'
      ];
      if (error.messageCode && exclude_errors.find(ds => error.messageCode.indexOf(ds) > -1) == null) {
        this.callbackNoAsyncToMain('/api/system/send-error-mail', {
          username: this.user.username,
          full_name: this.user.objectjson_person.full_name,
          department_id: this.user.department_id,
          error_data: error.data || 'NULL',
          stack: error.messageCode,
          host: SystemConstants.BASE_API,
          url: url,
          location: JSON.parse(this._storageService.getItem(SystemConstants.get('PREFIX_WORKING_LOCATION'))).area_name,
          request_obj: json_object,
          to_email: SystemConstants.get('MAIL_USER')
        });
      }
    }
  }

  post(url: string, obj: any, withToken: boolean = true, blobFlag: boolean = false, predicateMessage: any = null, showMessage: boolean = true, showLoading: boolean = true, print_mode: string = 'PDF', message_not_translate: boolean = false) {
    // Clear all request header
    let cloneHeader: any = {};
    cloneHeader['print_mode'] = print_mode;
    cloneHeader[SystemConstants.get('CONTENT_TYPE')] = SystemConstants.get('DEFAULT_CONTENT_TYPE');
    if (this.env.production) {
      cloneHeader[SystemConstants.get('ACCEPT')] = SystemConstants.get('DEFAULT_ACCEPT_TYPE');
    } else {
      cloneHeader[SystemConstants.get('ACCEPT')] = SystemConstants.get('DEFAULT_CONTENT_TYPE');
    }
    // If token required, add authorization to header
    if (withToken) {
     cloneHeader[SystemConstants.get('HEADER_AUTH')] = SystemConstants.get('TOKEN_PREFIX') + this._authenService.getLoggedInUser().access_token;
    }
    if (blobFlag) {
      cloneHeader[SystemConstants.get('ACCEPT')] = SystemConstants.get('CONTENT_TYPE_OCTET_STREAM');
    }
    // Add current data language to header
    cloneHeader[SystemConstants.get('ACCEPT_LANGUAGE')] = this._storageService.getItem(SystemConstants.get('PREFIX_DATA_LANGUAGE'));
    let options: any = {
      headers: new HttpHeaders(cloneHeader),
    };
    if (blobFlag) {
      options.responseType = 'blob';
    }
    if (obj.Method && obj.Module && obj.Url) {
      obj.ContentType = SystemConstants.get('DEFAULT_CONTENT_TYPE');
      if (this.env.production) {
        if (!obj.AcceptType) {
          obj.AcceptType = SystemConstants.get('DEFAULT_ACCEPT_TYPE');
        }
      } else {
        obj.AcceptType = SystemConstants.get('DEFAULT_CONTENT_TYPE');
      }
    }
    return this._http
      .post<any>(this.host + url, JSON.stringify(obj), options)
      .pipe(map((res: any) => {
        if (blobFlag) {
         return <Blob>res;
        }
        let json = (url == '/api/adapter/execute') ? JSON.parse(res) : res;
        if (json) {
          // If not has response data, show error notification
          if (!json.data && json.data != '' && json.messageCode) {
            this.sendError(json, this.host + url, JSON.stringify(obj));
            if (showMessage) {
              if (predicateMessage != null) {
                let msg = predicateMessage(json.messageCode);
                if (msg != '') {
                  if (message_not_translate) {
                    this._functionConstants.ShowNotificationNotTranslate(ENotificationType.ORANGE, msg);
                  } else {
                    this._functionConstants.ShowNotification(ENotificationType.ORANGE, msg);
                  }
                } else {
                  if (message_not_translate) {
                    this._functionConstants.ShowNotificationNotTranslate(ENotificationType.ORANGE, json.messageCode);
                  } else {
                    this._functionConstants.ShowNotification(ENotificationType.ORANGE, json.messageCode);
                  }
                }
              } else {
                if (json.messageCode && json.messageCode.startsWith('MESSAGE.') && json.messageCode.split('|').length > 1) {
                  this._functionConstants.ShowNotification(ENotificationType.ORANGE, json.messageCode.split('|')[0], (msg: string) => {
                    return msg + ': ' + json.messageCode.split('|')[1];
                  });
                } else {
                  if (message_not_translate) {
                    this._functionConstants.ShowNotificationNotTranslate(ENotificationType.ORANGE, json.messageCode);
                  } else {
                    this._functionConstants.ShowNotification(ENotificationType.ORANGE, json.messageCode);
                  }
                }
              }
            }
            throw new Error(SystemConstants.get('NO_HANDLE_EXCEPTION_MESSAGE').catched_error);
          } else if (typeof json.data != 'object') {
            if (showMessage) {
              if (predicateMessage != null) {
                if (message_not_translate) {
                  this._functionConstants.ShowNotificationNotTranslate(ENotificationType.GREEN, predicateMessage(json.messageCode));
                } else {
                  this._functionConstants.ShowNotification(ENotificationType.GREEN, predicateMessage(json.messageCode));
                }
              }
            }
            return json;
          }
          // If has broken rules (invalid model validation), join broken rules and show in error notification
          if (json.brokenRules && json.brokenRules.length > 0) {
            if (showMessage) {
              let msg: string[] = [];
              json.brokenRules.forEach(br => {
                msg.push(br.Rule);
              });
              this._translateService.get(msg).subscribe((x: any[]) => {
                this._functionConstants.ShowNotification(ENotificationType.RED, x.join('\n'));
              });
            }
            throw new Error(SystemConstants.get('NO_HANDLE_EXCEPTION_MESSAGE').catched_error);
          }
        }
        return json;
      })).pipe(
        catchError((err: Response) => {
          return this._functionConstants.handleError(err);
        }));
  }

  get(url: string, withToken: boolean = true) {
    try {
      let cloneHeader: any = {};
      cloneHeader[SystemConstants.get('CONTENT_TYPE')] = SystemConstants.get('DEFAULT_CONTENT_TYPE');
      if (this.env.production) {
        cloneHeader[SystemConstants.get('ACCEPT')] = SystemConstants.get('DEFAULT_ACCEPT_TYPE');
      } else {
        cloneHeader[SystemConstants.get('ACCEPT')] = SystemConstants.get('DEFAULT_CONTENT_TYPE');
      }
      // If token required, add authorization to header
      if (withToken) {
        cloneHeader[SystemConstants.get('HEADER_AUTH')] = SystemConstants.get('TOKEN_PREFIX') + this._authenService.getLoggedInUser().access_token;
      }
      cloneHeader[SystemConstants.get('ACCEPT_LANGUAGE')] = this._storageService.getItem(SystemConstants.get('PREFIX_DATA_LANGUAGE'));
      let options: any = {
        headers: new HttpHeaders(cloneHeader),
      };
      return this._http
        .get(this.host + url, options)
        .pipe(map((res: any) => {
         let json = (url == '/api/adapter/execute') ? JSON.parse(res):res;
         debugger;
          if (json) {
            if (isNumber(json.data) || isBoolean(json.data)) {
              return json;
            }
            if (!json.data) {
              this.sendError(json, url);
              this._functionConstants.ShowNotification(ENotificationType.RED, json.messageCode);
              throw new Error(SystemConstants.get('NO_HANDLE_EXCEPTION_MESSAGE').catched_error);
            }
          }
          return json;
        })).pipe(
          catchError((err: Response) => {
            return this._functionConstants.handleError(err);
          }));
    } catch (error) {
      this._functionConstants.ShowNotification(ENotificationType.RED, 'MESSAGE.cannot_load_data');
    }
  }

  downloadFile(url: string, fileName: string) {
    let cloneHeader: any = {};
    cloneHeader[SystemConstants.get('CONTENT_TYPE')] = SystemConstants.get('DEFAULT_CONTENT_TYPE');
    cloneHeader[SystemConstants.get('DEPARTMENT')] = this.user ? this.user.department_id : '';
    cloneHeader[SystemConstants.get('FACILITY')] = this.user ? this.user.facility_id : '';
    cloneHeader[SystemConstants.get('ACCEPT')] = SystemConstants.get('CONTENT_TYPE_OCTET_STREAM');
    cloneHeader[SystemConstants.get('HEADER_AUTH')] = SystemConstants.get('TOKEN_PREFIX') + this._authenService.getLoggedInUser().access_token;
    cloneHeader[SystemConstants.get('ACCEPT_LANGUAGE')] = this._storageService.getItem(SystemConstants.get('PREFIX_DATA_LANGUAGE'));
    let options: any = {
      headers: new HttpHeaders(cloneHeader),
      responseType: 'blob',
      observe: 'response'
    };
    return this._http.get(SystemConstants.BASE_API + url, options)
      .pipe(map((response: any) => <Blob>response.body)).pipe(
        catchError((err: Response) => {
          return this._functionConstants.handleError(err);
        }));
  }

  execute(method: string, url: string, acceptType: string, apimodule: string, data: any, showMessage: boolean = true) {
    if (acceptType == null) {
      acceptType = SystemConstants.get('CONTENT_TYPE_JSON');
    }
    let params = {};
    if (method.toLowerCase() === 'post') {
      params = { Method: { Method: method }, AcceptType: acceptType, Url: url, Module: apimodule, Data: JSON.stringify(data) };
    } else if (data == null && method.toLocaleLowerCase() === 'get') {
      params = { Method: { Method: method }, AcceptType: acceptType, Url: url, Module: apimodule };
    }
    return this.post('/api/adapter/execute', params, true, false, null, showMessage, true);
  }

  callbackNoAsync(url: string, apiModule: string, data: any) {
    let xmlhttp = new XMLHttpRequest();
    xmlhttp.open('POST', SystemConstants.BASE_API + '/api/adapter/execute', false); // the false is for making the call synchronous
    xmlhttp.setRequestHeader('Content-type', 'application/json');
    xmlhttp.setRequestHeader(SystemConstants.get('ACCEPT'), SystemConstants.get('DEFAULT_ACCEPT_TYPE'));
    xmlhttp.setRequestHeader(SystemConstants.get('ACCEPT_LANGUAGE'), this._storageService.getItem(SystemConstants.get('PREFIX_DATA_LANGUAGE')));
    xmlhttp.setRequestHeader(SystemConstants.get('HEADER_AUTH'), SystemConstants.get('TOKEN_PREFIX') + this._authenService.getLoggedInUser().access_token);
    xmlhttp.send(JSON.stringify({
      Method: { Method: 'POST' },
      AcceptType: SystemConstants.get('CONTENT_TYPE_LZSTRING'),
      ContentType: SystemConstants.get('DEFAULT_CONTENT_TYPE'),
      Url: url,
      Module: apiModule,
      Data: JSON.stringify(data)
    }));
  }

  callbackNoAsyncToMain(url: string, data: any) {
    let xmlhttp = new XMLHttpRequest();
    xmlhttp.open('POST', SystemConstants.BASE_API + url, false); // the false is for making the call synchronous
    xmlhttp.setRequestHeader('Content-type', 'application/json');
    xmlhttp.setRequestHeader(SystemConstants.get('ACCEPT'), SystemConstants.get('DEFAULT_ACCEPT_TYPE'));
    xmlhttp.setRequestHeader(SystemConstants.get('ACCEPT_LANGUAGE'), this._storageService.getItem(SystemConstants.get('PREFIX_DATA_LANGUAGE')));
    xmlhttp.setRequestHeader(SystemConstants.get('HEADER_AUTH'), SystemConstants.get('TOKEN_PREFIX') + this._authenService.getLoggedInUser().access_token);
    xmlhttp.send(JSON.stringify(data));
  }

  postWithFile(url: string, obj: any, files: File[], blobFlag: boolean = false, predicateMessage: any = null, showMessage: boolean = true, showLoading: boolean = true) {
    let cloneHeader: any = {};
    if (this.env.production) {
      cloneHeader[SystemConstants.get('ACCEPT')] = SystemConstants.get('DEFAULT_ACCEPT_TYPE');
    } else {
      cloneHeader[SystemConstants.get('ACCEPT')] = SystemConstants.get('DEFAULT_CONTENT_TYPE');
    }
    if (blobFlag) {
      cloneHeader[SystemConstants.get('ACCEPT')] = SystemConstants.get('CONTENT_TYPE_OCTET_STREAM');
    }
    cloneHeader[SystemConstants.get('HEADER_AUTH')] = SystemConstants.get('TOKEN_PREFIX') + this._authenService.getLoggedInUser().access_token;
    cloneHeader[SystemConstants.get('ACCEPT_LANGUAGE')] = this._storageService.getItem(SystemConstants.get('PREFIX_DATA_LANGUAGE'));
    let options: any = {
      headers: new HttpHeaders(cloneHeader),
      observe: 'response',
      responseType: this.env.production ? 'text' : 'json'
    };
    if (blobFlag) {
      options.responseType = 'blob';
    }
    let formData: FormData = new FormData();
    if (typeof obj == 'object') {
      formData.append('data', JSON.stringify(obj));
    } else {
      formData.append('data', obj);
    }
    if (files && files.length > 0) {
      if (files.length == 1) {
        formData.append('file', files[0], files[0].name);
      } else {
        files.forEach((ds, index) => {
          formData.append('file_' + index, ds, ds.name);
        });
      }
    }
    return this._http
      .post(this.host + url, formData, options)
      .pipe(map((res: any) => {
        let lpltime = res.headers.get('vnpt_Time');
        let d = lpltime.split(';');
        let date = this._DateTimeFormat.formatDatetime(d[0], d[1]);
        let now = new Date();
        this.TimeDiffServer = this._DateTimeFormat.DateDiff(now, date);
        if (blobFlag) {
          return <Blob>res.body;
        }
        // Get data and decompress using AcceptType
        let json = cloneHeader[SystemConstants.get('ACCEPT')] == SystemConstants.get('CONTENT_TYPE_LZSTRING') ?
          JSON.parse(LZString.decompressFromEncodedURIComponent(res.body)) : res.body;
        // If not has response data, show error notification
        if (!json.data && json.data != '' && json.messageCode) {
          this.sendError(json, url, formData);
          if (showMessage) {
            if (predicateMessage != null) {
              let msg = predicateMessage(json.messageCode);
              if (msg != '') {
                this._functionConstants.ShowNotification(ENotificationType.RED, msg);
              } else {
                this._functionConstants.ShowNotification(ENotificationType.RED, json.messageCode);
              }
            } else {
              this._functionConstants.ShowNotification(ENotificationType.RED, json.messageCode);
            }
          }
          throw new Error(SystemConstants.get('NO_HANDLE_EXCEPTION_MESSAGE').catched_error);
        } else if (typeof json.data != 'object') {
          if (showMessage) {
            if (predicateMessage != null) {
              this._functionConstants.ShowNotification(ENotificationType.GREEN, predicateMessage(json.messageCode));
            }
          }
          return json;
        }
        // If has broken rules (invalid model validation), join broken rules and show in error notification
        if (json.brokenRules && json.brokenRules.length > 0) {
          if (showMessage) {
            let msg: string[] = [];
            json.brokenRules.forEach(br => {
              msg.push(br.Rule);
            });
            this._translateService.get(msg).subscribe((x: any[]) => {
              this._functionConstants.ShowNotification(ENotificationType.RED, x.join('\n'));
            });
          }
          throw new Error(SystemConstants.get('NO_HANDLE_EXCEPTION_MESSAGE').catched_error);
        }
        return json;
      })).pipe(
        catchError((err: Response) => {
          return this._functionConstants.handleError(err);
        }));
  }

}
