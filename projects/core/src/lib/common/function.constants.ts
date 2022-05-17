import { Inject, Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { combineLatest as observableCombineLatest, Observable, of as observableOf, throwError as observableThrowError } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';
import { Page } from '../entities/page';
import { PageGroup } from '../entities/page-group';
import { Permission } from '../entities/permission';
import { LoaderService } from '../services/loader.service';
import { StorageService } from '../services/storage.service';
import { Guid } from './guid';
import { ENotificationType } from './notification-type.enum';
import { SystemConstants } from './system.constants';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { PrintService } from '../services/print.service';
import * as mjs from 'mathjs';
import * as jsPdf from 'jspdf';
declare var $: any;
declare var printJS: any;
declare var LZString: any;
declare function escape(s: string): string;

@Injectable()
export class FunctionConstants {

    protected Guid: Guid;

    public print_documents: any[];

    constructor(private _translateService: TranslateService, private router: Router,
        private _http: Http, private _httpClient: HttpClient, private _loaderService: LoaderService,
        private _storageService: StorageService, private _printService: PrintService, @Inject('env') private env) { }

    public DecodeHex(h) {
        let s = '';
        for (let i = 0; i < h.length; i += 2) {
            s += String.fromCharCode(parseInt(h.substr(i, 2), 16));
        }
        return decodeURIComponent(escape(s));
    }

    public printPdf(data: any) {
        let pdf = new jsPdf();
        pdf.addHTML(document.body, function() {
            pdf.save('web.pdf');
        });
    }

    public printHtml(data: any) {
        let popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');
        popupWin.document.write(`
          <html>
            <head>
              <title>Print tab</title>
            </head>
          <body onload="window.print();window.close()">${data}</body>
          </html>`
        );
        popupWin.document.close();
    }

    public printHtmlWithUrl(url: any) {
        let newWindow = window.open(SystemConstants.IMAGE_API + '/' + url, '_blank', 'top=0,left=0,height=100%,width=auto');
        newWindow.focus();
        newWindow.print();
        newWindow.close();
    }

    public GetCurrentCaptionLanguage() {
        if (localStorage.getItem(SystemConstants.get('PREFIX_CAPTION_LANGUAGE')) == null) {
            localStorage.setItem(SystemConstants.get('PREFIX_CAPTION_LANGUAGE'), SystemConstants.get('DEFAULT_STORAGE_LANGUAGE'));
            return SystemConstants.get('DEFAULT_STORAGE_LANGUAGE');
        }
        return localStorage.getItem(SystemConstants.get('PREFIX_CAPTION_LANGUAGE'));
    }

    public GetCurrentDataLanguage() {
        return localStorage.getItem(SystemConstants.get('PREFIX_DATA_LANGUAGE')) == null ? 'en' : localStorage.getItem(SystemConstants.get('PREFIX_DATA_LANGUAGE'));
    }

    public GetPageFromUrl(url: string) {
        if (url != '') {
            url = !url.startsWith('/') ? ('/' + url) : url;
        }
        let permissions: Permission[] = localStorage.getItem(SystemConstants.get('PREFIX_PERMISSIONS')) && localStorage.getItem(SystemConstants.get('PREFIX_PERMISSIONS')) != '' ? JSON.parse(localStorage.getItem(SystemConstants.get('PREFIX_PERMISSIONS'))) : [];
        return permissions ? permissions.find(ds => (!ds.page_url.startsWith('/') ? ('/' + ds.page_url) : ds.page_url) == url) : null;
    }

    public GetRecentlyPages(): Page[] {
        return JSON.parse(this._storageService.getItem(SystemConstants.get('PREFIX_RECENTLY_PAGES')));
    }

    public formatOrderNumber(seq_num: number) {
        if (seq_num > 0) {
            return seq_num < 10 ? '0' + seq_num : seq_num;
        }
        return '0';
    }

    public UpdateRecentlyPages(page: Page) {
        let items: Page[] = JSON.parse(this._storageService.getItem(SystemConstants.get('PREFIX_RECENTLY_PAGES')));
        if (items && items.length > 0) {
            let existIndex = items.findIndex(ds => ds.page_id == page.page_id);
            if (existIndex > -1) {
                if (items.length == 1) {
                    return;
                } else {
                    items.unshift(items.splice(existIndex, 1)[0]);
                }
            } else {
                if (items.length >= SystemConstants.get('MAX_RECENTLY_PAGES')) {
                    items.splice(items.length - 1, 1);
                }
                items.unshift(page);
            }
        } else {
            items = [page];
        }
        this._storageService.setItem(SystemConstants.get('PREFIX_RECENTLY_PAGES'), JSON.stringify(items));
    }

    public GetPageGroupAndPageFromPermissions() {
        let pageGroups: PageGroup[] = [];
        let permissions: Permission[] = JSON.parse(localStorage.getItem(SystemConstants.get('PREFIX_PERMISSIONS')));
        (permissions || []).forEach(pms => {
            let pg = pageGroups.find(x => x.page_group_id == pms.page_group_id);
            if (pg != null) {
                let p = pg.pages.find(x => x.page_id == pms.page_id);
                if (p == null) {
                    p = new Page();
                    p.page_id = pms.page_id;
                    p.page_name_e = pms.page_name_e;
                    p.page_name_l = pms.page_name_l;
                    p.url = pms.page_url;
                    p.sort_order = pms.sort_order;
                    p.public_flag = pms.public_flag;
                    p.actions = [];
                    p.actions.push(pms);
                    pg.pages.push(p);
                } else {
                    p.actions.push(pms);
                }
            } else {
                pg = new PageGroup();
                pg.page_group_id = pms.page_group_id;
                pg.page_group_name_e = pms.page_group_name_e;
                pg.page_group_name_l = pms.page_group_name_l;
                pg.css_class = pms.css_class;
                pg.ord = pms.ord;
                pg.sort_order = pms.sort_order;
                pg.is_public = pms.is_public;
                pg.pages = [];
                let p = new Page();
                p.page_id = pms.page_id;
                p.page_name_e = pms.page_name_e;
                p.page_name_l = pms.page_name_l;
                p.url = pms.page_url;
                p.sort_order = pms.sort_order;
                p.public_flag = pms.public_flag;
                p.actions = [];
                p.actions.push(pms);
                pg.pages.push(p);
                pageGroups.push(pg);
            }
        });
        return pageGroups;
    }

    public ShowNotification(type: ENotificationType, message, replacer: any = null, title: string = 'MESSAGE.alert', sticky: boolean = false, image: string = null) {
        let className = '';
        if (message == null) {
            message = '';
        }
        switch (type) {
            case ENotificationType.WHITE: className = 'other'; title = 'WTF'; break;
            case ENotificationType.RED: className = 'error'; title = 'LỖI LỖI LỖI'; break;
            case ENotificationType.BLUE: className = 'info'; title = 'BIẾT CHƯA???'; break;
            case ENotificationType.ORANGE: className = 'warning'; title = 'COI CHỪNG!!!'; break;
            case ENotificationType.GREEN: className = 'success'; title = 'XONG =))'; break;
        }
        this._translateService.get([message, title, SystemConstants.get('DEFAULT_MESSAGE')]).subscribe(res => {
            let msg: string = res[message];
            let delay = 2000;
            if (replacer) {
                msg = replacer(msg);
            }
            if (this.env.production) {
                msg = msg == message ? res[SystemConstants.get('DEFAULT_MESSAGE')] : msg;
                delay = 50 * (msg == message ? res[SystemConstants.get('DEFAULT_MESSAGE')] : msg).length * 1.5;
            } else {
                msg = '\u{1F436} \u{1F431} ' + title + ': \u{1F437} \u{1F414} <br/> <br/>' + msg;
                if (className == 'error' || className == 'warning') {
                    delay = 5000;
                }
            }
            $.notification.init({
                time: 200,
                delay: delay,
                closable: false,
                clickToClose: true,
                position: 'top-right'
            }).show(className, msg);
            this._loaderService.hide();
        });
    }

    public ShowNotificationNotTranslate(type: ENotificationType, message, title: string = 'MESSAGE.alert', sticky: boolean = false, image: string = null) {
        let className = '';
        if (message == null) {
            message = '';
        }
        switch (type) {
            case ENotificationType.WHITE: className = 'other'; title = 'WTF'; break;
            case ENotificationType.RED: className = 'error'; title = 'LỖI LỖI LỖI'; break;
            case ENotificationType.BLUE: className = 'info'; title = 'BIẾT CHƯA???'; break;
            case ENotificationType.ORANGE: className = 'warning'; title = 'COI CHỪNG!!!'; break;
            case ENotificationType.GREEN: className = 'success'; title = 'XONG =))'; break;
        }
        let delay = 2000;
        if (this.env.production) {
            delay = 50 * message.length * 1.5;
        } else {
            message = '\u{1F436} \u{1F431} ' + title + ': \u{1F437} \u{1F414} <br/> <br/>' + message;
            if (className == 'error' || className == 'warning') {
                delay = 5000;
            }
        }
        $.notification.init({
            time: 200,
            delay: delay,
            closable: false,
            clickToClose: true,
            position: 'top-right'
        }).show(className, message);
    }

    public handleError(error: any) {
        if (error.status == 401) {
            $('.modal').remove();
            $('.modal-backgrop').remove();
            $('body').removeClass('modal-open');
            $('body').css('padding', '0');
            this.router.navigate([SystemConstants.get('UNAUTHORIZED_URL')]);
        } else if (error.status == 404) {
            $('.modal').remove();
            $('.modal-backgrop').remove();
            $('body').removeClass('modal-open');
            $('body').css('padding', '0');
            this.router.navigate([SystemConstants.get('NOT_FOUND_URL')]);
        } else if (error.status == 400) {
            // BAD REQUEST: TODO
            console.log(error);
        }
        return observableThrowError(error);
    }

    sortByProperty(property, is_number: boolean = false) {
        return (x, y) => {
            if (is_number) {
                return ((parseFloat(x[property]) === parseFloat(y[property])) ? 0 : ((parseFloat(x[property]) > parseFloat(y[property])) ? 1 : -1));
            } else {
                return ((x[property] === y[property]) ? 0 : ((x[property] > y[property]) ? 1 : -1));
            }
        };
    }

    sortByPropertyDesc(property, is_number: boolean = false) {
        return (x, y) => {
            if (x != null && y != null) {
                if (is_number) {
                    return ((parseFloat(x[property]) === parseFloat(y[property])) ? 0 : ((parseFloat(x[property]) < parseFloat(y[property])) ? 1 : -1));
                } else {
                    return ((x[property] === y[property]) ? 0 : ((x[property] < y[property]) ? 1 : -1));
                }
            }
        };
    }

    sortArray(obj) {
        for (let i in obj) {
            if (Array.isArray(obj[i])) {
                obj[i] = obj[i].sort(this.sortByProperty(Object.keys(obj[i][0])[0]));
                obj[i].map(t => {
                    this.sortArray(t);
                });
            }
        }
    }

    // diff when 2 object
    diffObject(obj1, obj2, key) {
        let diff = null;
        if (obj1 && obj2 && typeof obj1 === 'object' && typeof obj2 === 'object') {
            if (obj1['status'] !== undefined) { delete obj1['status']; }
            if (obj2['status'] !== undefined) { delete obj2['status']; }
            if (JSON.stringify(obj1) === JSON.stringify(obj2)) { return; }
            if (Object.keys(obj1).length != Object.keys(obj2).length) { console.warn('\u{1F631}  \u{1F631}  \u{1F631}  \u{1F631} : DiffObject : 2 object not equal properties, please checking your input .... '); }
            for (let i in obj1) {
                for (let j in obj2) {
                    // && (i !== key && j !== key)
                    // diff all properties
                    if (i == j && obj1[i] + ''.toString() != obj2[j] + ''.toString()) {
                        obj2['status'] = 2;
                        diff = obj2;
                    }
                    // diff of array
                    if (Array.isArray(obj1[i]) && Array.isArray(obj2[j])) {
                        let diffArr = this.diffArrayObject(obj1[i], obj2[j]);
                        if (diffArr !== undefined && diffArr.length > 0) { obj2[j] = diffArr; if (diff === null) { diff = obj2; diff[j] = obj2[j]; } else { diff[j] = obj2[j]; } }
                    }
                    // diff recursion object
                    if (!(obj1[i] instanceof Date) && !(obj2[j] instanceof Date) && typeof obj1[i] == 'object' && typeof obj2[j] == 'object') {
                        this.diffObject(obj1[i], obj2[j], '');
                    }
                }
            }
        }
        return diff;
    }
    // diff when 2 array object
    diffArrayObject(arr1, arr2) {
        let diff = [];
        if (Array.isArray(arr1) && Array.isArray(arr2)) {
            if (JSON.stringify(arr1) === JSON.stringify(arr2)) { return; }
            let length = arr1.length < arr2.length ? arr2.length : arr1.length;
            for (let i = 0; i < length; ++i) {
                if (typeof arr1[i] === 'object' && typeof arr2[i] === 'object') {
                    let diffObj = this.diffObject(arr1[i], arr2[i], '');
                    if (diffObj && diffObj !== undefined) { diff.push(diffObj); }
                } else if (arr1[i] !== undefined && arr2[i] === undefined) {
                    arr1[i]['status'] = 3;
                    diff.push(arr1[i]);
                } else if (arr1[i] === undefined && arr2[i] !== undefined) {
                    arr2[i]['status'] = 1;
                    diff.push(arr2[i]);
                }
            }
        }
        return diff;
    }

    // obj 1 origin source, obj2 source change
    getDifference(obj1, obj2) {
        this.sortArray(obj1);
        this.sortArray(obj2);
        this.formatDateTimeBeforeCompare(obj1);
        this.formatDateTimeBeforeCompare(obj2);
        if (Array.isArray(obj1) && Array.isArray(obj2)) {
            return this.diffArrayObject(obj1, obj2);
        }
        return this.diffObject(obj1, obj2, '');
    }

    formatTypeofToStringObject(obj) {
        if (obj && typeof obj === 'object') {
            for (let i in obj) {
                if (Array.isArray(obj[i])) {
                    for (let j in obj[i]) {
                        this.formatTypeofToStringObject(obj[i][j]);
                    }
                }
                if (typeof obj[i] === 'number') { obj[i] = obj[i].toString(); }
                if (obj[i] instanceof Date) { obj[i] = obj[i].toString(); }
            }
        }
    }

    formatDateTimeBeforeCompare(obj) {
        if (obj) {
            for (let f in obj) {
                if (obj[f] instanceof Date) {
                    obj[f] = new Date(obj[f].getFullYear(), obj[f].getMonth(), obj[f].getDate(), obj[f].getHours(), obj[f].getMinutes(), obj[f].getSeconds());
                }
            }
        }
    }

    /* Chatbox */
    KeyStruct(k1: string, k2: string) {
        return k1.localeCompare(k2) >= 0 ? k1 + ',' + k2 : k2 + ',' + k1;
    }

    addNewChatbox(arr: any) {
        let s = [];
        arr.forEach(element => {
            try {
                let item = {
                    username: element,
                    showbox: false
                };
                s.push(item);
            } catch (e) {
                console.log(e);
            }
            localStorage.setItem('chatbox', JSON.stringify(s));
        });
    }

    modifyChatboxStatus(user_name: string, status: boolean) {
        let list_user_online = JSON.parse(localStorage.getItem('chatbox'));
        list_user_online.map(t => {
            if (t.username == user_name) {
                t.showbox = status;
            }
        });
        localStorage.setItem('chatbox', JSON.stringify(list_user_online));
    }

    isChatBoxShow(user_name: string) {
        let list_user_online = JSON.parse(localStorage.getItem('chatbox'));
        return list_user_online.filter(t => t.username == user_name)[0].showbox;
    }
    
    getJsonFile(lang: string, type: string, model: string, api_observable: Observable<any>, facility_id: boolean = false, dataLabel: string[] = []) {
        let ext = SystemConstants.get('DEFAULT_ACCEPT_TYPE') == SystemConstants.get('CONTENT_TYPE_LZSTRING') ? '.LZ' : '.json';
        let folder = type == 't' ? 'trees' : 'dropdowns';
        let path = `upload/${folder}/${model}_${type}`;
        if (facility_id) {
            path += '_' + JSON.parse(this._storageService.getItem(SystemConstants.get('PREFIX_CURRENT_FACILITY'))).facility_id;
        }
        if (dataLabel == null || dataLabel.length == 0) {
            path += `_${lang}${ext}`;
        } else {
            path += `_all${ext}`;
        }

        let d = new Date();
        path = path + '?ver=' + d.getTime();
       
        return this._http.get(path).pipe(
            map((res) => {
                let result = SystemConstants.get('DEFAULT_ACCEPT_TYPE') == SystemConstants.get('CONTENT_TYPE_LZSTRING') ? JSON.parse(LZString.decompressFromEncodedURIComponent(res.text())) : res.json();
               if(result==null) { 
                    api_observable.subscribe(v => {
                        return v.data;
                    });
               } else {
                    if (dataLabel != null && dataLabel.length > 0) {
                        this.executeRecursive(result, (item) => {
                            dataLabel.forEach(label => {
                                item[label] = item[label + (lang == 'local' ? '_l' : '_e')];
                            });
                        });
                    }
                    return result;
                }
            }),
            catchError((err: Response): any => {
                observableOf(err.status || 404);
                if (err.status == 404) {
                    return observableCombineLatest(api_observable).pipe(map(res => {
                        return res[0].data;
                    }));
                }
            }),
            finalize(() => {
            }));
    }

    setDate(inputDate, format: string, utc, locale) {
        if (typeof inputDate !== 'string') {
            inputDate = this.formatDate(inputDate, format, utc, locale);
        }
        let splitChar = '';
        for (let i = 0; i < format.length; i++) {
            if (!format[i].match(/[a-z]/i)) {
                splitChar = format[i];
            }
        }
        let arrFormat = format.split(splitChar);
        let arrValue = inputDate.split(splitChar);
        let day, month, year;
        for (let i = 0; i < arrFormat.length; i++) {
            if (arrFormat[i].toLowerCase().indexOf('d') > -1) {
                day = arrValue[i];
            } else if (arrFormat[i].toLowerCase().indexOf('m') > -1) {
                month = arrValue[i];
            } else {
                year = arrValue[i];
            }
        }
        return new Date(year, month - 1, day);
    }

    executeRecursive(data, predicate) {
        return !!!data ? null : data.reduce((list, entry) => {
            predicate(entry);
            if (entry.data && entry.data.children != null) {
                this.executeRecursive(entry.data.children, predicate);
            } else if (entry.children != null) {
                this.executeRecursive(entry.children, predicate);
            }
            return list;
        }, []);
    }

    compare(pObject_1, pObject_2, keyField = 'id') {
        let result = [];
        let originSources = [];
        let originIDs = [];
        let handleSources = [];
        let handleIDs = [];
        if (pObject_1 == null && pObject_2 != null) {
            if (!$.isArray(pObject_2)) {
                return [Object.assign({}, pObject_2, { status: 1 })];
            } else {
                pObject_2.forEach(ds => {
                    result.push(Object.assign({}, ds, { status: 1 }));
                });
                return result;
            }
        }

        if (pObject_1 != null && pObject_2 == null) {
            if (!$.isArray(pObject_1)) {
                return [Object.assign({}, pObject_1, { status: 3 })];
            } else {
                pObject_1.forEach(ds => {
                    result.push(Object.assign({}, ds, { status: 3 }));
                });
                return result;
            }
        }

        if (!$.isArray(pObject_1)) {
            pObject_1 = [{ data: pObject_1 }];
        }

        if (!$.isArray(pObject_2)) {
            pObject_2 = [{ data: pObject_2 }];
        }
        this.executeRecursive(pObject_1, (item) => {
            let tmp = Object.assign({}, item);
            if (tmp.parent) {
                tmp.parent = null;
            }
            originSources.push(tmp.data || tmp);
        });
        for (let i = 0; i < originSources.length; i++) {
            originIDs.push(originSources[i][keyField]);
            if (originSources[i].children) {
                originSources[i].children = null;
            }
        }
        this.executeRecursive(pObject_2, (item) => {
            let tmp = Object.assign({}, item);
            if (tmp.parent) {
                tmp.parent = null;
            }
            handleSources.push(tmp.data || tmp);
        });
        for (let i = 0; i < handleSources.length; i++) {
            handleIDs.push(handleSources[i][keyField]);
            if (handleSources[i].children) {
                handleSources[i].children = null;
            }
        }
        for (let i = 0; i < originIDs.length; i++) {
            // Record keep on new item
            let idx = handleIDs.indexOf(originIDs[i]);
            if (idx > -1) {
                let origin = Object.assign({}, originSources[i]);
                let handle = Object.assign({}, handleSources[idx]);
                this.formatTypeofToStringObject(origin);
                this.formatTypeofToStringObject(handle);
                // Compare to set status
                if (JSON.stringify(origin, Object.keys(origin).sort()) != JSON.stringify(handle, Object.keys(origin).sort())) {
                    result.push(Object.assign({}, handleSources[idx], { status: 2 }));
                }
            } else {
                result.push(Object.assign({}, originSources[i], { status: 3 }));
            }
        }
        for (let i = 0; i < handleIDs.length; i++) {
            // New item -> set status to 1
            if (originIDs.indexOf(handleIDs[i]) < 0) {
                result.push(Object.assign({}, handleSources[i], { status: 1 }));
            }
        }
        return result;
    }

    formatDate(inputDate, format, utc: boolean = false, locale: any = null) {
        if (!inputDate) {
            return '';
        }

        let date: Date;
        if (typeof inputDate === 'string') {
            date = new Date(inputDate);
        } else {
            date = inputDate;
        }

        let iFormat;
        const lookAhead = (match) => {
            const matches = (iFormat + 1 < format.length && format.charAt(iFormat + 1) === match);
            if (matches) {
                iFormat++;
            }
            return matches;
        },
            formatNumber = (match, value, len) => {
                let num = '' + value;
                if (lookAhead(match)) {
                    while (num.length < len) {
                        num = '0' + num;
                    }
                }
                return num;
            },
            formatName = (match, value, shortNames, longNames) => {
                return (lookAhead(match) ? longNames[value] : shortNames[value]);
            };
        let output = '';
        let literal = false;

        if (date) {
            for (iFormat = 0; iFormat < format.length; iFormat++) {
                if (literal) {
                    if (format.charAt(iFormat) === '\'' && !lookAhead('\'')) {
                        literal = false;
                    } else {
                        output += format.charAt(iFormat);
                    }
                } else {
                    switch (format.charAt(iFormat)) {
                        case 'd':
                            output += formatNumber('d', utc ? date.getUTCDate() : date.getDate(), 2);
                            break;
                        case 'D':
                            output += formatName('D', utc ? date.getUTCDay() : date.getDay(), locale.dayNamesShort, locale.dayNames);
                            break;
                        case 'o':
                            if (utc) {
                                output += formatNumber('o',
                                    Math.round((
                                        new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()).getTime() -
                                        new Date(date.getUTCFullYear(), 0, 0).getTime()) / 86400000), 3);
                            } else {
                                output += formatNumber('o',
                                    Math.round((
                                        new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() -
                                        new Date(date.getFullYear(), 0, 0).getTime()) / 86400000), 3);
                            }
                            break;
                        case 'm':
                            output += formatNumber('m', (utc ? date.getUTCMonth() : date.getMonth()) + 1, 2);
                            break;
                        case 'M':
                            output += formatName('M', utc ? date.getUTCMonth() : date.getMonth(), locale.monthNamesShort, locale.monthNames);
                            break;
                        case 'y':
                            output += (lookAhead('y') ? (utc ? date.getUTCFullYear() : date.getFullYear()) :
                                ((utc ? date.getUTCFullYear() : date.getFullYear()) % 100 < 10 ? '0' : '') +
                                (utc ? date.getUTCFullYear() : date.getFullYear()) % 100);
                            break;
                        case '@':
                            output += date.getTime();
                            break;
                        case '!':
                            let ticksTo1970 = (((1970 - 1) * 365 + Math.floor(1970 / 4) - Math.floor(1970 / 100) +
                                Math.floor(1970 / 400)) * 24 * 60 * 60 * 10000000);
                            output += date.getTime() * 10000 + ticksTo1970;
                            break;
                        case '\'':
                            if (lookAhead('\'')) {
                                output += '\'';
                            } else {
                                literal = true;
                            }
                            break;
                        default:
                            output += format.charAt(iFormat);
                    }
                }
            }
        }
        return output;
    }

    getDropdownGender() {
        let sources = [];
        let labels = SystemConstants.get('GENDERS').map(ds => {
            return ds.label;
        });
        return this._translateService.get(labels).pipe(map(res => {
            SystemConstants.get('GENDERS').forEach(ds => {
                sources.push({ label: res[ds.label], value: ds.value });
            });
            return sources;
        }));
    }
    getDropdownStatusNews() {
        let sources = [];
        let labels = SystemConstants.get('STATUSNEWS').map(ds => {
            return ds.label;
        });
        return this._translateService.get(labels).pipe(map(res => {
            SystemConstants.get('STATUSNEWS').forEach(ds => {
                sources.push({ label: res[ds.label], value: ds.value });
            });
            return sources;
        }));
    }

    getDropdownTypeColor() {
        let sources = [];
        let labels = SystemConstants.get('TYPECOLOR').map(ds => {
            return ds.label;
        });
        return this._translateService.get(labels).pipe(map(res => {
            SystemConstants.get('TYPECOLOR').forEach(ds => {
                sources.push({ label: res[ds.label], value: ds.value });
            });
            return sources;
        }));
    }

    getDropdownInsuranceFlag() {
        let sources = [];
        let labels = SystemConstants.get('INSURANCE_FLAGS').map(ds => {
            return ds.label;
        });
        return this._translateService.get(labels).pipe(map(res => {
            SystemConstants.get('INSURANCE_FLAGS').forEach(ds => {
                sources.push({ label: res[ds.label], value: ds.value });
            });
            return sources;
        }));
    }

    public RandomColor() {
        let arrColors = [
            '#2167f2', '#0ebaa3', '#079110', '#916506', '#b21908'
        ];
        let randInx = Math.floor(Math.random() * arrColors.length);
        return arrColors[randInx];
    }

    public ReadFileLocal(name: string, action: string, lang: string) {
        lang == 'local' ? lang = 'l' : lang = 'e';
        let path = `assets/data/${name}${action ? '_' + action : ''}_${lang}.LZ`;
        return this._http.get(path).pipe(map(res => JSON.parse(LZString.decompressFromEncodedURIComponent(res.text()))));
    }

    public getAge(birth: Date) {
        birth = new Date(birth);
        let today = new Date();

        let nowyear = today.getFullYear();
        let nowmonth = today.getMonth();
        let nowday = today.getDate();

        let birthyear = birth.getFullYear();
        let birthmonth = birth.getMonth();
        let birthday = birth.getDate();

        let age = nowyear - birthyear;
        let age_month = nowmonth - birthmonth;
        let age_day = nowday - birthday;
        if (SystemConstants.get('AGE_ENOUGH_MONTH')) {
            if (age_month < 0 || (age_month == 0 && age_day < 0)) {
                age -= 1;
            }
        }
        if (SystemConstants.get('AGE_BONUS')) {
            age += 1;
        }
        return age;
    }

    public getAgeMonth(birth: Date) {
        birth = new Date(birth);
        let today = new Date();

        let nowyear = today.getFullYear();
        let nowmonth = today.getMonth();
        let nowday = today.getDate();

        let birthyear = birth.getFullYear();
        let birthmonth = birth.getMonth();
        let birthday = birth.getDate();

        let age_month = (nowyear - birthyear) * 12;
        age_month += (nowmonth - birthmonth);
        let age_day = nowday - birthday;
        if (age_day < 0) {
            age_month -= 1;
        }

        return age_month;
    }

    public calculateAge(date_of_birth: string) {
        // inp : 1999-12-12T00:00:00
        let user_date = Date.parse(date_of_birth);
        let today_date = new Date();
        let diff_date = today_date.getTime() - user_date;
        let num_years = diff_date / 31536000000;
        let num_months = (diff_date % 31536000000) / 2628000000;
        let num_days = ((diff_date % 31536000000) % 2628000000) / 86400000;
        return this._translateService.get(['COMMON.years', 'COMMON.months', 'COMMON.days']).pipe(map(mes => {
            if (Math.floor(num_years) < 7 && Math.floor(num_years) > 0) {
                return `${Math.floor(num_years)} ${mes['COMMON.years']} ${Math.floor(num_months)} ${mes['COMMON.months']}`;
            } else if (Math.floor(num_years) == 0) {
                return `${Math.floor(num_months)} ${mes['COMMON.months']} ${Math.floor(num_days)} ${mes['COMMON.days']}`;
            }
            return `${Math.floor(num_years)} ${mes['COMMON.years']}`;
        }));
    }

    public calculateAgeNumber(date_of_birth: string): any {
        // inp : 1999-12-12T00:00:00
        let user_date = Date.parse(date_of_birth);
        let today_date = new Date();
        let diff_date = today_date.getTime() - user_date;
        let num_years = diff_date / 31536000000;
        return Math.floor(num_years);
    }

    public toDate(strDate: string, pgFormat = false, getTime = false) {
        if (typeof strDate === 'string') {
            let arr = [];
            if (!pgFormat) {
                arr = strDate.split('/');
                return new Date(parseInt(arr[2]), parseInt(arr[1]) - 1, parseInt(arr[0]));
            } else {
                arr = strDate.split('T')[0].split('-');
                let times = strDate.split('T')[1].split(':');
                if (getTime) {
                    return new Date(parseInt(arr[0]), parseInt(arr[1]) - 1, parseInt(arr[2]), parseInt(times[0]), parseInt(times[1]), parseInt(times[2]));
                }
                return new Date(parseInt(arr[0]), parseInt(arr[1]) - 1, parseInt(arr[2]));
            }
        }
    }

    mergeListObjectToObject(obj1, listObj) {
        let objResult = {};
        let obj2 = {};
        if (typeof obj1 == 'object' && typeof listObj == 'object') {
            for (let key in listObj) {
                for (let i in listObj[key]) {
                    if (listObj[key].hasOwnProperty(i)) {
                        obj2[i] = listObj[key][i];
                    }
                }
            }
            objResult = Object.assign({}, obj1, obj2);
            return objResult;
        }
    }

    scrollToBottom() {
        $('html, body').animate({ scrollTop: $(document).height() }, 1000);
    }
    scrollToTop() {
        $('html, body').animate({ scrollTop: 0 }, 1000);
    }

    jqueryValidation(selector, rules, message) {
        $(selector).validate({
            rules: rules,
            messages: message
        });
    }

    clearAllDOMSelectizeWhenNgDestroy() {
        let that = $('.selectize-dropdown');
        $('.selectize-dropdown').each(e => {
            that.remove();
        });
    }


    /*
    * ConvertToObjectDataChart functions
    * @param datas This is object get from API
    * @param labels This is field set a label in chart
    * @param excludeFields This is excludes field of datas not show in chart
    * @param tranPrefix This is get translate service param in en.json, local.json
    * @param labelIsDate This is format date
    * @return object set to chart
    */
    ConvertToObjectDataChart(datas: any[], labels: any, excludeFields = ' ', tranPrefix = 'COMMON', labelIsDate = false, chartType = 'line', multiAxis = false) {
        if (datas) {
            let obj: any;
            let a = [];
            let ds = [];
            let arrColor = ['#ff4444', '#ffbb33', '#00C851', '#33b5e5', '#2BBBAD', '#4285F4', '#aa66cc', '#00695c', '#0d47a1', '#9933CC', '#2E2E2E', '#4B515D', '#3F729B', '#37474F', '#212121'];
            datas.map(i => {
                labelIsDate ? a.push(this.formatDateToStringPg(i[labels], true)) : a.push(i[labels]);
                if (typeof i == 'object') {
                    for (let j in i) {
                        if (i[j] && typeof i[j] !== 'object' && !multiAxis) {
                            if (j && j != labels && (excludeFields.trim().indexOf(j.trim()) == -1) && (i[j] != null && i[j] != SystemConstants.get('EMPTY_GUID'))) {
                                this._translateService.get(`${tranPrefix}.${j}`).subscribe(mes => {
                                    switch (true) {
                                        case chartType == 'line':
                                            ds.push({
                                                label: mes ? mes : j,
                                                data: [i[j]],
                                                fill: false,
                                                borderColor: arrColor[Math.floor(Math.random() * arrColor.length) + 1]
                                            });
                                            break;
                                        case chartType == 'bar':
                                            ds.push({
                                                label: mes ? mes : j,
                                                data: [i[j]],
                                                backgroundColor: arrColor[Math.floor(Math.random() * arrColor.length) + 1],
                                                borderColor: arrColor[Math.floor(Math.random() * arrColor.length) + 1]
                                            });
                                            break;
                                        case chartType == 'line-point':
                                            ds.push({
                                                label: mes ? mes : j,
                                                backgroundColor: arrColor[Math.floor(Math.random() * arrColor.length) + 1],
                                                borderColor: arrColor[Math.floor(Math.random() * arrColor.length) + 1],
                                                data: [i[j]],
                                                fill: false,
                                                pointRadius: 10,
                                                pointHoverRadius: 15,
                                                showLine: false // no line shown
                                            });
                                            break;
                                    }
                                });
                            }
                        } else if (i[j]) {
                            for (let k = 0; k < i[j].length; ++k) {
                                if (typeof i[j][k] === 'object') {
                                    if (ds.length == 0) {
                                        this._translateService.get(`${tranPrefix}.${i[j][k]['label']}`).subscribe(mes => {
                                            ds.push({
                                                id: k,
                                                label: mes && mes != `${tranPrefix}.${i[j][k]['label']}` ? mes : i[j][k]['label'],
                                                data: [i[j][k]['value']],
                                                backgroundColor: arrColor[Math.floor(Math.random() * arrColor.length) + 1],
                                                borderColor: arrColor[Math.floor(Math.random() * arrColor.length) + 1]
                                            });
                                        });

                                    } else {
                                        let d = ds.find(o => o['id'] === k);
                                        if (d) {
                                            d['data'].push(i[j][k]['value']);
                                        } else {
                                            this._translateService.get(`${tranPrefix}.${i[j][k]['label']}`).subscribe(mes => {
                                                ds.push({
                                                    id: k,
                                                    label: mes && mes != `${tranPrefix}.${i[j][k]['label']}` ? mes : i[j][k]['label'],
                                                    data: [i[j][k]['value']],
                                                    backgroundColor: arrColor[Math.floor(Math.random() * arrColor.length) + 1],
                                                    borderColor: arrColor[Math.floor(Math.random() * arrColor.length) + 1]
                                                });
                                            });
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });
            obj = Object.assign({ labels: a, datasets: ds }, obj);
            if (!multiAxis) {
                this.mergeObjectDatasetInChart(obj);
            }
            return obj;
        }
    }

    mergeObjectDatasetInChart(obj) {
        if (obj) {
            if (obj.labels.length == 1) { return; }
            let numField = Math.round(obj.datasets.length / obj.labels.length);
            let dsNews = [];
            obj.datasets.forEach((v, i) => {
                if (i < numField) {
                    for (let k = 1; k < obj.labels.length; ++k) {
                        let indx = i + k * numField;
                        if (indx > obj.datasets.length - 1) {
                            break;
                        } else {
                            obj.datasets[i].data = obj.datasets[i].data.concat(obj.datasets[indx].data);
                        }
                    }
                    dsNews.push(obj.datasets[i]);
                }
            });
            obj.datasets = dsNews;
        }
    }

    formatDateToStringPg(date: string, showTime: boolean = false): any {
        if (date) {
            let fDate = date.split('T');
            let d = fDate[0].split('-');
            if (showTime) {
                let fTime = fDate[1].split('+')[0];
                let sTime = fTime.split(':');
                return `${d[2]}/${d[1]}/${d[0]} ${sTime[0]}:${sTime[1]}`;
            }
            return `${d[2]}/${d[1]}/${d[0]}`;
        }
    }

    countDown(time, el) {
        let countDownDate = new Date(time).getTime();
        let l = this.GetCurrentDataLanguage();
        let x = setInterval(() => {
            let now = new Date().getTime();
            let distance = countDownDate - now;
            let days = Math.floor(distance / (1000 * 60 * 60 * 24));
            let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            let seconds = Math.floor((distance % (1000 * 60)) / 1000);
            let text = '';
            switch (true) {
                case days > 0:
                    text = `${days < 10 ? '0' + days : days}:${hours < 10 ? '0' + hours : hours}:${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
                    break;
                case days == 0 && hours > 0:
                    text = `${hours < 10 ? '0' + hours : hours}:${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
                    break;
                case days == 0 && hours == 0 && minutes > 0:
                    text = `${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
                    break;
                case days == 0 && hours == 0 && minutes == 0:
                    text = `${seconds < 10 ? '0' + seconds : seconds}`;
                    break;
            }
            $(el).html(text);
            if (distance < 0) {
                clearInterval(x);
                this._translateService.get('MESSAGE.cpoe_allow_edit_date').subscribe(mes => {
                    $(el).parent().addClass('expried');
                    $(el).parent().removeClass('allow');
                    $(el).html(mes);
                });
            }
        }, 1000);
    }

    removeAllMessage() {
        $('#gritter-notice-wrapper').remove();
    }

    sortArrayByProperty(property, array) {
        property = property.split('.');
        let l = property.length;
        return array.sort(function (a, b) {
            let i = 0;
            while (i < l) {
                a = a[property[i]];
                b = b[property[i]];
                i++;
            }
            return a < b ? -1 : 1;
        });
    }


    distinct(array, date: boolean = false) {
        let result = [];
        array.forEach(ds => {
            if (date) {
                if (result.indexOf(+ds) == -1) {
                    result.push(ds);
                }
            } else {
                if (result.indexOf(ds) == -1) {
                    result.push(ds);
                }
            }
        });
        return result;
    }

    distinctArrayObj(array: any[] = [], key: string, key2: string = null, key3: string = null) {
        let result = [];
        let first = array[0];
        array.map(t => {
            if (result.length == 0) {
                result.push(first);
            } else {
                if (!key2) {
                    first = result.find(a => a[key] == t[key]);
                } else if (!key3) {
                    first = result.find(a => a[key] == t[key] && a[key2] == t[key2]);
                } else {
                    first = result.find(a => a[key] == t[key] && a[key2] == t[key2] && a[key3] == t[key3]);
                }
                if (!first) {
                    result.push(t);
                }
            }
        });
        return result;
    }

    slugify(text: any, char = '-') {
        text = text.toLowerCase();
        text = text.replace(/á|à|ả|ạ|ã|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ|á|à|ả|ạ|ã|ă|ắ|ằ|ẳ|ẵ|ặ|ấ|ầ|ẩ|ẫ|ậ/gi, 'a');
        text = text.replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ|ế|é|è|ẻ|ẽ|ẹ|ê|ề|ế|ễ|ể|ệ/gi, 'e');
        text = text.replace(/i|í|ì|ỉ|ĩ|ị|i|í|ì|ỉ|ĩ|ị/gi, 'i');
        text = text.replace(/ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ|ó|ó|ò|ỏ|ọ|ô|ố|ồ|ỗ|ộ|ớ|ờ|ở|ỡ|ợ/gi, 'o');
        text = text.replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự|ú|ù|ủ|ũ|ụ|ừ|ữ|ứ|ự|ử/gi, 'u');
        text = text.replace(/ý|ỳ|ỷ|ỹ|ỵ|ý|ỳ|ỷ|ỹ|ỵ/gi, 'y');
        text = text.replace(/đ|đ/gi, 'd');
        text = text.replace(/\`|\~|\!|\@|\#|\||\$|\%|\^|\&|\*|\(|\)|\+|\=|\,|\.|\/|\?|\>|\<|\'|\"|\:|\;|_/gi, '');
        text = text.replace(/ /gi, char);
        text = text.replace(/\-\-\-\-\-/gi, char);
        text = text.replace(/\-\-\-\-/gi, char);
        text = text.replace(/\-\-\-/gi, char);
        text = text.replace(/\-\-/gi, char);
        text = '@' + text + '@';
        text = text.replace(/\@\-|\-\@|\@/gi, '');
        return text;
    }

    formatTime(date, showSeconds: boolean = false, hourFormat: string = '24') {
        if (!date) {
            return '';
        }

        let output = '';
        let hours = date.getHours();
        let minutes = date.getMinutes();
        let seconds = date.getSeconds();

        if (hourFormat == '12' && hours > 11 && hours != 12) {
            hours -= 12;
        }

        if (hourFormat == '12') {
            output += hours === 0 ? 12 : (hours < 10) ? '0' + hours : hours;
        } else {
            output += (hours < 10) ? '0' + hours : hours;
        }
        output += ':';
        output += (minutes < 10) ? '0' + minutes : minutes;

        if (showSeconds) {
            output += ':';
            output += (seconds < 10) ? '0' + seconds : seconds;
        }

        if (hourFormat == '12') {
            output += date.getHours() > 11 ? ' PM' : ' AM';
        }

        return output;
    }

    diffDate(date1: Date, date2: Date, type: string, abs: boolean = true, not_time: boolean = false) {
        let d1 = new Date(date1);
        let d2 = new Date(date2);
        if (not_time) {
            d1.setHours(0, 0, 0, 0);
            d2.setHours(0, 0, 0, 0);
        }
        let diff = abs ? Math.abs(d1.getTime() - d2.getTime()) : (d1.getTime() - d2.getTime());
        switch (type) {
            case 'year':
                return Math.ceil(diff / (1000 * 3600 * 24 * 31 * 12));
            case 'mon':
                return Math.ceil(diff / (1000 * 3600 * 24 * 31));
            case 'day':
                return Math.ceil(diff / (1000 * 3600 * 24));
            case 'hour':
                return Math.ceil(diff / (1000 * 3600));
            case 'min':
                return Math.ceil(diff / (1000 * 60));
            case 'sec':
                return Math.ceil(diff / 1000);
            default:
                return Math.ceil(diff);
        }
    }

    post(printer_name: string, paper_size: string, copies: number, pages: string, file_url: string, dup_type: string) {
        let cloneHeader: any = {};
        cloneHeader[SystemConstants.get('CONTENT_TYPE')] = SystemConstants.get('DEFAULT_CONTENT_TYPE');
        let options: any = {
            headers: new HttpHeaders(cloneHeader),
            observe: 'response',
            responseType: this.env.production ? 'text' : 'json'
        };
        return this._httpClient
            .post<any>(SystemConstants.IMAGE_API + '/print', JSON.stringify({
                printer_name: printer_name,
                paper_size: paper_size,
                copies: copies,
                pages: pages,
                file_url: file_url,
                dup_type: dup_type
            }), options)
            .pipe(map((res: any) => {
                return res.body;
            }));
    }

    pingPrint() {
        let cloneHeader: any = {};
        cloneHeader[SystemConstants.get('CONTENT_TYPE')] = SystemConstants.get('DEFAULT_CONTENT_TYPE');
        let options: any = {
            headers: new HttpHeaders(cloneHeader),
            observe: 'response',
            responseType: this.env.production ? 'text' : 'json'
        };
        return this._httpClient.get(SystemConstants.IMAGE_API, options).pipe(map((res: any) => {
            return res.body;
        }));
    }

    printDetail(url: string, callback: any) {
        if (this.print_documents && this.print_documents.length > 0) {
            this.print_documents.splice(0, 1);
            this.print_documents = this.print_documents.filter((item, pos) => {
                return this.print_documents.indexOf(item) == pos;
            });
        }
        printJS({
            printable: url + '?ver=' + Math.random(),
            type: 'pdf',
            onPrintDialogClose: () => {
                if (this.print_documents && this.print_documents.length > 0) {
                    this.printPreview(this.print_documents[0]);
                }
                if (callback) {
                    try {
                        callback();
                    } catch { }
                }
            }
        });
    }

    printPreview(url: string, callback: any = null, printer_name: string = '', paper_size: string = '', copies: number = 1, pages: string = 'all', dup_type: string = '') {
        if (!this.print_documents) {
            this.print_documents = [];
        }
        this.print_documents.push(url);
        if (this.env && this.env.production) {
            let storage = this._storageService.getItem(SystemConstants.get('SETTING_PREFIX'));
            let currentSetting = (storage && storage != '') ? JSON.parse(storage) : { use_print_default: true };
            if (currentSetting.use_print_default == null) {
                currentSetting.use_print_default = true;
            }
            if (!currentSetting.use_print_default) {
                this.pingPrint().subscribe(res => {
                    if (this.print_documents && this.print_documents.length > 0) {
                        this.print_documents.splice(0, 1);
                        this.print_documents = this.print_documents.filter((item, pos) => {
                            return this.print_documents.indexOf(item) == pos;
                        });
                    }
                    this._printService.show(SystemConstants.get('FRONT_END_ADDRESS')  + url, callback, {
                        printer_name: printer_name,
                        paper_size: paper_size,
                        copies: copies,
                        pages: pages,
                        dup_type: dup_type
                    });
                }, error => {
                    this.printDetail(url, callback);
                });
            } else {
                this.printDetail(url, callback);
            }
        } else {
            if (SystemConstants.get('PRINT_LOCAL')) {
                this._printService.show(`${SystemConstants.IMAGE_API}/` + url, callback);
            } else {
                window.open(`${SystemConstants.IMAGE_API}/` + url, '_blank');
            }
        }
    }

    compareScopeList(arrComp: any[], arrScope: any[], key: string) {
        let result = [];
        if (Array.isArray(arrComp) && Array.isArray(arrScope)) {
            arrComp.map(t => {
                if (t) {
                    let indx = arrScope.findIndex(a => a.scope_id == t[key]);
                    if (indx > -1) {
                        result.push(t);
                    }
                }
            });
            return result;
        }
        return [];
    }

    convertNumberToAudioText(number: string) {
        if (number) {
            let data = number.split('');
            let result = '';
            data.map(t => {
                result += `num${t},`;
            });
            result = result.slice(0, -1);
            return result;
        }
    }

    serialDates(startDate: Date, endDate: Date) {
        let dates = [],
            currentDate = new Date(startDate),
            addDays = function (days: number) {
                let date = new Date(this.valueOf());
                date.setDate(date.getDate() + days);
                return date;
            };
        while (currentDate <= endDate) {
            dates.push(currentDate);
            currentDate = addDays.call(currentDate, 1);
        }
        return dates;
    }

    capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    isFraction(number: any) {
        return this.mathValue(number).toString().indexOf('.') > -1;
    }

    mathValue(number: any) {
        return mjs.number(mjs.fraction(number));
    }

    toFraction(number: any) {
        return mjs.format(mjs.fraction(number), { fraction: 'ratio' });
    }

    formatMathNumber(number: any) {
        if (this.mathValue(number).toString().indexOf('.') > -1) {
            return mjs.format(mjs.fraction(number), { fraction: 'ratio' });
        }
        return this.mathValue(number);
    }

    mathFractionableValue(number: any) {
        if (this.mathValue(number).toString().indexOf('.') > -1) {
            return mjs.fraction(number);
        }
        return this.mathValue(number);
    }

    mathCompare(number_1: any, number_2: any) {
        return mjs.equal(this.mathFractionableValue((number_1 || 0)), this.mathFractionableValue((number_2 || 0)));
    }

    mathLargeEq(number_1: any, number_2: any) {
        return mjs.largerEq(this.mathFractionableValue((number_1 || 0)), this.mathFractionableValue((number_2 || 0)));
    }

    replaceRegExp(searchValue: string, toValue: any): any {
        if (!searchValue || searchValue == '') {
            return '';
        }
        const regex = new RegExp(`[${searchValue}]`, 'g');
        return searchValue.replace(regex, toValue);
    }

    ngTableSearch(globalFilterText: any, dataKey: any, filterFields: any[] = [], data: any[] = []) {
        let container = $('.ui-table');
        if (globalFilterText.trim() != '') {
            data.forEach(ds => {
                if (Object.keys(ds).some(k => filterFields.indexOf(k) > -1
                    && ds[k] != null
                    && (this.slugify(ds[k], '-').includes(this.slugify(globalFilterText, '-')) || this.slugify(ds[k], '-') == this.slugify(globalFilterText, '-')))) {
                    let ele = container.find('.index_' + ds[dataKey]).closest('tr');
                    if (ele.closest('.ui-table-frozen-view')) {
                        ele.closest('.ui-table-scrollable-wrapper').find('.ui-table-unfrozen-view tbody tr').eq(ele.index()).show();
                    }
                    ds.hide = false;
                    ele.show();
                } else {
                    let ele = container.find('.index_' + ds[dataKey]).closest('tr');
                    if (ele.closest('.ui-table-frozen-view')) {
                        ele.closest('.ui-table-scrollable-wrapper').find('.ui-table-unfrozen-view tbody tr').eq(ele.index()).hide();
                    }
                    ds.hide = true;
                    ele.hide();
                }
            });
        } else {
            data.forEach(ds => {
                let ele = container.find('.index_' + ds[dataKey]).closest('tr');
                if (ele.closest('.ui-table-frozen-view')) {
                    ele.closest('.ui-table-scrollable-wrapper').find('.ui-table-unfrozen-view tbody tr').eq(ele.index()).show();
                }
                ds.hide = false;
                ele.show();
            });
        }
    }

    arrayConcatTop(arrSources: any, arrMerge: any): any {
        arrMerge.forEach((t: any) => {
            arrSources.unshift(t);
        });
        return arrSources;
    }

    arrayOrderDown(sources: any): any {
        let results = [];
        sources.forEach((t: any) => {
            results.unshift(t);
        });
        return results;
    }

    arrayToString(sources: any[] = [], field: any = null, delimiter: any = ',') {
        if (sources && sources.length > 0) {
            let result = '';
            if (!field) {
                sources.forEach(t => {
                    result += `${t}${delimiter}`;
                });
            } else {
                sources.forEach(t => {
                    result += `${t[field]}${delimiter}`;
                });
            }
            return result.length > 0 ? result.slice(0, -1) : result;
        }
        return '';
    }

    makeID(length: number) {
        let result = '';
        let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

}
