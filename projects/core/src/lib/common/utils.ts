
import { ChangeDetectorRef, Injector, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Http } from '@angular/http';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { TinymceOptions } from 'angular2-tinymce/lib/angular2-tinymce-lib.config.interface';
import { ConfirmationService, DialogService, DomHandler, DynamicDialogConfig, DynamicDialogRef, TreeNode } from 'primeng/api';
import { AutoComplete } from 'primeng/autocomplete';
import { LocaleSettings } from 'primeng/calendar';
import { KeyFilter } from 'primeng/components/keyfilter/keyfilter';
import { fromEvent, Observable, of as observableOf, Subject } from 'rxjs';
import { finalize, map, takeUntil } from 'rxjs/operators';
import { ApiService } from '../services/api.service';
import { AuthenService } from '../services/auth.service';
import { CustomDialogService } from '../services/custom-dialog.service';
import { ImageService } from '../services/image.service';
import { LoaderService } from '../services/loader.service';
import { StorageService } from '../services/storage.service';
import { CustomizeFileUpload } from './file-upload';
import { FunctionConstants } from './function.constants';
import { Guid } from './guid';
import { KeyboardShortcuts, Unlisten } from './keyboard-shortcuts';
import { SystemConstants } from './system.constants';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { PrintService } from '../services/print.service';
declare let $: any;
declare let moment: any;

export class Utils implements OnDestroy {

    protected _router: Router;
    public Guid: Guid;
    protected _changeDetectorRef: ChangeDetectorRef;
    protected _http: Http;
    protected _translateService: TranslateService;
    protected _storageService: StorageService;
    public _functionConstants: FunctionConstants;
    protected _confirmationService: ConfirmationService;
    public _authenService: AuthenService;
    protected _loaderService: LoaderService;
    protected _printService: PrintService;
    protected _apiService: ApiService;
    protected _imageService: ImageService;
    protected _fb: FormBuilder;
    protected _title: Title;
    public _dialogService: DialogService;
    public _customDialogService: CustomDialogService;
    public _dialogRef: DynamicDialogRef;
    public _dialogConfig: DynamicDialogConfig;
    public pageId: string;
    public today = new Date();
    protected currentLang: string;
    public spinning = false;
    public showSearchPanel = true;
    public showSearchPanelVendor = true;
    public showUpdateModal = false;
    public showAdvanceSearch = false;
    public isCreate = true;
    protected ApiModule = '';

    public updateForm: FormGroup;
    protected updateFormChangedByFileUpload = false;
    public updateFormOriginalData: any;
    public selectizes: any[];
    public genders: any[] = [];
    public statusnews: any[] = [];
    public typecolors: any[] = [];
    public insurance_flags: any[] = [];
    public radiology_image_rq_status: any[] = [];
    protected selecteTypeColor: any;
    protected selectedGender: any;
    protected selectedStatusNews: any;
    protected selectedInsuranceFlag: any;
    public blockSpecial: RegExp = /^[^<>*!]+$/;
    public blockSpace: RegExp = /[^\s]/;
    public blockSpecialAndSpace: RegExp = /^[^<>*!\s]+$/;
    public rgxInt = new RegExp(SystemConstants.get('REGEX_INTEGER'));
    public rgxPInt = new RegExp(SystemConstants.get('REGEX_POSITIVE_INTEGER'));
    public rgxDecimal = new RegExp(SystemConstants.get('REGEX_DECIMAL'));
    public rgxNDecimal = new RegExp(SystemConstants.get('REGEX_NEGATIVE_DECIMAL'));
    public dateFormat: any;
    public birthdayFormat: any;
    public fDate: any;
    public fDateTime: any;
    public fDateTimeNotSecond: any;
    public fTime: any;
    public locale_calendar: LocaleSettings;
    public currency_mask: any;
    public integer_mask: any;
    public integer_negative_mask: any;
    public decimal_mask: any;
    public negative_decimal_mask = SystemConstants.get('CustomNegativeDecimalMaskConfig');
    public negative_integer_mask = SystemConstants.get('CustomNegativeIntegerMaskConfig');
    public percent_mask: any;
    public showTreeDetail = false;
    public i = 0;
    public hasViewPermission = false;
    public hasCreatePermission = false;
    public hasUpdatePermission = false;
    public hasDeletePermission = false;
    public setNullIfEmpty = [];
    public doneSetupForm = false;
    public submitting = false;
    private backspacePressed = false;
    public timer: any;
    public totalCount;
    public filter_job_type: any;
    public filter_job_type_Search: any;
    public filterDepartmentId: string;
    public filterDepartmentId_Search: string;
    public setDefaultOnResetUpdateForm: any[];
    public setDefaultSource: any[];
    public dateNow = new Date();
    public dateOfBirthYearRang: string;
    public filter_item_type_Search: string;
    public filter_store_Search: string;
    public filter_item_type: string;
    public filter_store: string;
    public getDropdownNoAccountFlag = false;
    public local_flag: boolean;
    public defaultSelectizeConfig: any;
    public defaultSelectizeConfigS: any;
    public defaultSelectizeConfigMulti: any;
    public defaultSelectizeConfigMultiS: any;
    public defaultSelectizeConfigLocation: any;
    public defaultSelectizeConfigEmployee: any;
    public defaultSelectizeConfigEmployeeDestroy: any;
    public defaultSelectizeConfigEmployeeMulti: any;
    public defaultSelectizeConfigEmployeeS: any;
    public defaultSelectizeConfigTreeS: any;
    public defaultSelectizeConfigTree: any;
    public defaultSelectizeConfigTreeMulti: any;
    public defaultSelectizeMedicalConfig: any;
    public defaultSelectizeIcdConfig: any;
    public defaultSelectizeClinicRoomConfig: any;
    public defaultSelectizeDoctorConfig: any;
    public defaultSelectizePharmacyItemConfig: any;
    public defaultSelectizeDiagnoseTemplateConfig: any;
    public defaultSelectizeWorkQueueConfigS: any;
    public defaultSelectizePatientVisitConfigS: any;
    public defaultSelectizeConfigItem: any;
    public invalidDates = [];
    public enabledSubmitFlag: boolean;
    public hasChangesData: any;
    public setting: any;
    public only_cash: boolean = SystemConstants.get('PAYMENT_ONLY_CASH');

    public ckeConfig: any;
    public customSettingMce: TinymceOptions | any;
    public unsubscribe = new Subject();
    protected _keyboardShortcuts: KeyboardShortcuts;
    protected unlisten: Unlisten;
    public shortcuts = []; // Not allow: W, T, N, O, P, B
    public dropdownHeader: any;
    public dropdownHeaderEmployees: any;
    public filteredSymtom: any[];
    public filteredICDFreeText: any[];
    public filteredQuanlifier: any[];
    public filteredDescription: any[];
    public currentUser: any;
    public currentArea: any;
    public currentServiceArea: any;
    public report_extensions: any = JSON.parse(SystemConstants.get('REPORT_EXTENSIONS'));
    public defaultReportExtension: any = SystemConstants.get('DEFAULT_REPORT_EXTENSIONS');
    constructor(injector: Injector) {
        this._router = injector.get(Router);
        this._changeDetectorRef = injector.get(ChangeDetectorRef);
        this._http = injector.get(Http);
        this._translateService = injector.get(TranslateService);
        this._storageService = injector.get(StorageService);
        this._functionConstants = injector.get(FunctionConstants);
        this._confirmationService = injector.get(ConfirmationService);
        this._authenService = injector.get(AuthenService);
        this._loaderService = injector.get(LoaderService);
        this._printService = injector.get(PrintService);
        this._apiService = injector.get(ApiService);
        this._imageService = injector.get(ImageService);
        this._fb = injector.get(FormBuilder);
        this._keyboardShortcuts = injector.get(KeyboardShortcuts);
        this._title = injector.get(Title);
        this._dialogService = injector.get(DialogService);
        this._customDialogService = injector.get(CustomDialogService);
        this._dialogRef = injector.get(DynamicDialogRef);
        this._dialogConfig = injector.get(DynamicDialogConfig);
        this.Guid = injector.get(Guid);
        this.unlisten = null;
        this.dateFormat = SystemConstants.get('P_DATE_FORMAT');
        this.birthdayFormat = SystemConstants.get('P_BIRTHDAY_FORMAT');
        this.fDate = SystemConstants.get('DATE_FORMAT');
        this.fDateTime = SystemConstants.get('DATETIME_FORMAT');
        this.fDateTimeNotSecond = SystemConstants.get('DATETIME_FORMAT_NOT_SECOND');
        this.fTime = SystemConstants.get('TIME_FORMAT');
        this.dateOfBirthYearRang = (this.today.getFullYear() - 120) + ':' + this.today.getFullYear();
        this.today.setHours(0, 0, 0, 0);
        let currentPage = this._functionConstants.GetPageFromUrl(window.location.pathname.slice(1));
        if (currentPage) {
            this.pageId = currentPage.page_id;
        }
        this.currentUser = JSON.parse(this._storageService.getItem(SystemConstants.get('CURRENT_USER')));
        this.currentArea = JSON.parse(this._storageService.getItem(SystemConstants.get('PREFIX_WORKING_LOCATION')));
        this.currentServiceArea = JSON.parse(this._storageService.getItem(SystemConstants.get('PREFIX_SERVICE_LOCATION_CONFIG')));
        this.currentLang = this._functionConstants.GetCurrentCaptionLanguage();
        this.local_flag = this._functionConstants.GetCurrentDataLanguage() == SystemConstants.get('LOCAL');
        this._translateService.addLangs(['en', 'local']);
        this._translateService.setDefaultLang(this.currentLang);
        this._storageService.changes.pipe(takeUntil(this.unsubscribe)).subscribe((data: any) => {
            if (data.key == SystemConstants.get('PREFIX_CAPTION_LANGUAGE')) {
                this._functionConstants.getDropdownGender().subscribe(res => {
                    this.genders = null;
                    setTimeout(() => {
                        this.genders = res;
                        setTimeout(() => {
                            this.selectedGender = 1;
                        });
                    });
                });
                this.getLocaleCalendar();
            }
            if (data.key == SystemConstants.get('PREFIX_DATA_LANGUAGE')) {
                this.local_flag = this._functionConstants.GetCurrentDataLanguage() == SystemConstants.get('LOCAL');
                if (this._storageService.getItem(SystemConstants.get('CURRENT_USER')) != null && data.value != null) {
                    this.loadDropdowns();
                }
            }
        });
        this._functionConstants.getDropdownGender().subscribe(res => {
            this.genders = res;
        });
        this._functionConstants.getDropdownStatusNews().subscribe(res => {
            this.statusnews = res;
        });
        this._functionConstants.getDropdownTypeColor().subscribe(res => {
            this.typecolors = res;
        });
        this.selectedGender = 1;
        this.selectedStatusNews = 2;
        this.selectedGender = 0;

        this._storageService.changes.pipe(takeUntil(this.unsubscribe)).subscribe((data: any) => {
            if (data.key == SystemConstants.get('PREFIX_CAPTION_LANGUAGE')) {
                this._functionConstants.getDropdownInsuranceFlag().subscribe(res => {
                    this.insurance_flags = null;
                    setTimeout(() => {
                        this.insurance_flags = res;
                        setTimeout(() => {
                            this.selectedInsuranceFlag = null;
                        });
                    });
                });
                this.getLocaleCalendar();
            }
            if (data.key == SystemConstants.get('PREFIX_DATA_LANGUAGE')) {
                this.local_flag = this._functionConstants.GetCurrentDataLanguage() == SystemConstants.get('LOCAL');
                if (this._storageService.getItem(SystemConstants.get('CURRENT_USER')) != null && data.value != null) {
                    this.loadDropdowns();
                }
            }
        });
        this._functionConstants.getDropdownInsuranceFlag().subscribe(res => {
            this.insurance_flags = res;
        });

        this.currency_mask = SystemConstants.get('CustomCurrencyMaskConfig');
        this.integer_mask = SystemConstants.get('CustomIntegerMaskConfig');
        this.integer_negative_mask = SystemConstants.get('CustomIntegerNegativeMaskConfig');
        this.decimal_mask = SystemConstants.get('CustomDecimalMaskConfig');
        this.percent_mask = SystemConstants.get('PercentMaskConfig');
        this.getLocaleCalendar();
        Date.prototype.toJSON = function () {
            return moment(this).format();
        };
        AutoComplete.prototype.alignOverlay = function () {
            if (this.overlay) {
                if (this.appendTo) {
                    DomHandler.absolutePosition(this.overlay, (this.multiple ? this.multiContainerEL.nativeElement : this.inputEL.nativeElement));
                } else {
                    DomHandler.relativePosition(this.overlay, (this.multiple ? this.multiContainerEL.nativeElement : this.inputEL.nativeElement));
                }
            }
        };
        KeyFilter.prototype.onKeyPress = function (e: any) {

            if (this.pValidateOnly) {
                return;
            }
            let browser = DomHandler.getBrowser();
            if (e.ctrlKey || e.altKey) {
                return;
            }
            let k = this.getKey(e);
            if (k == KeyFilter.KEYS.RETURN) {
                return;
            }
            if (browser.mozilla && (this.isNavKeyPress(e) || k == KeyFilter.KEYS.BACKSPACE || (k == KeyFilter.KEYS.DELETE && e.charCode == 0))) {
                return;
            }
            let c = this.getCharCode(e);
            let cc = String.fromCharCode(c);
            let ok = true;
            if (browser.mozilla && (this.isSpecialKey(e) || !cc)) {
                return;
            }
            ok = this.regex.test(e.target.value + cc);
            if (!ok) {
                e.preventDefault();
            }
        };

        this.defaultSelectizeConfig = this.selectizeConfig(1, 'label', 'value', true);
        this.defaultSelectizeConfigItem = this.selectizeConfig(1, 'item_name', 'item_id', true);
        this.defaultSelectizeConfigS = this.selectizeConfig(1, 'label', 'value', false);
        this.defaultSelectizeConfigMulti = this.selectizeConfig(null, 'label', 'value', true);
        this.defaultSelectizeConfigMultiS = this.selectizeConfig(null, 'label', 'value', false);
        this.defaultSelectizeConfigEmployee = this.selectizeEmployeeConfig(1, 'full_name', 'id', true, 2);
        this.defaultSelectizeConfigEmployeeDestroy = this.selectizeEmployeeConfigDestroy(1, 'full_name', 'id', true, 2);
        this.defaultSelectizeConfigEmployeeMulti = this.selectizeEmployeeConfig(null, 'full_name', 'id', true, 2);
        this.defaultSelectizeConfigEmployeeS = this.selectizeEmployeeConfig(1, 'full_name', 'id', false, 2, true);
        this.defaultSelectizeConfigLocation = this.selectizeLocationConfig(1, 'label', 'value', true);
        this.defaultSelectizeMedicalConfig = this.selectizeMedicalConfig(1, 'label', 'value', true);
        this.defaultSelectizeConfigTreeS = this.selectizeConfig(1, 'label', 'value', false, 1);
        this.defaultSelectizeConfigTree = this.selectizeConfig(1, 'label', 'value', true, 1);
        this.defaultSelectizeConfigTreeMulti = this.selectizeConfig(null, 'label', 'value', true, 1);
        this.defaultSelectizeIcdConfig = this.selectizeICDConfig(1, 'label', 'value', true);
        this.defaultSelectizeClinicRoomConfig = this.selectizeConfig(1, 'clinic_room_name', 'clinic_room_id', false);
        this.defaultSelectizeDoctorConfig = this.selectizeDoctorConfig(1, 'full_name', 'id', true);
        this.defaultSelectizePharmacyItemConfig = this.selectizePharmacyItemConfig(1, 'label', 'value', true);
        this.defaultSelectizeDiagnoseTemplateConfig = this.selectizeDiagnoseTemplateConfig(1, 'label', 'value', true);
        this.defaultSelectizeWorkQueueConfigS = this.selectizeConfig(1, 'work_queue_name', 'work_queue_id', false);
        this.defaultSelectizePatientVisitConfigS = this.selectizeConfig(1, 'visit_value_text', 'patient_visit_id', false);
        $(document).on('shown.bs.modal', '.modal', function (e) {
            let self = this;
            $(self).on('hide.bs.modal', function (x) {
                if ($(self).hasClass('in')) {
                    $(self).find('.btn-close').click();
                }
            });
        });

        this.setting = JSON.parse((this._storageService.getItem('setting_' + this.pageId) || '{}'));
        if (!this.setting) {
            this.setting = {};
            this._storageService.setItem('setting_' + this.pageId, JSON.parse('{}'));
        }
        this.showSearchPanel = this.setting['show_search_panel'] == undefined ? true : this.setting['show_search_panel'];
        this.showSearchPanelVendor = this.setting['show_search_panel_vendor'] == undefined ? true : this.setting['show_search_panel_vendor'];
        this.showAdvanceSearch = this.setting['show_advance_search'] == undefined ? false : this.setting['show_advance_search'];
        ConfirmDialog.prototype.accept = function () {
            if (this.confirmation && this.confirmation.acceptEvent) {
                this.confirmation.acceptEvent.emit();
            }
            this.hide();
            this.confirmation = null;
        };
        ConfirmDialog.prototype.reject = function () {
            if (this.confirmation && this.confirmation.rejectEvent) {
                this.confirmation.rejectEvent.emit();
            }
            this.hide();
            this.confirmation = null;
        };
        DomHandler.getOuterWidth = function (el, margin) {
            let width = el ? el.offsetWidth : 0;
            if (margin) {
                let style = getComputedStyle(el);
                width += parseFloat(style.marginLeft) + parseFloat(style.marginRight);
            }
            return width;
        };
        DomHandler.getOuterHeight = function (el, margin) {
            let height = el ? el.offsetHeight : 0;
            if (margin) {
                let style = getComputedStyle(el);
                height += parseFloat(style.marginTop) + parseFloat(style.marginBottom);
            }
            return height;
        };
    }

    loadDropdowns() { }

    setupShortcutKeys() {
        let fnKeys = ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12'];
        let tmp = {
            'control.H': (event: KeyboardEvent): boolean | void => {
                if ($('[data-sk="control.H"]').length) {
                    $('[data-sk="control.H"]')[0].click();
                }
                event.preventDefault();
                return false;
            }
        };
        this.shortcuts.forEach(key => {
            if (key.command) {
                if (fnKeys.indexOf(key.key) > -1) {
                    tmp[key.key] = (event: KeyboardEvent): boolean | void => {
                        key.command();
                        event.preventDefault();
                        return false;
                    };
                } else {
                    tmp['control.' + key.key] = (event: KeyboardEvent): boolean | void => {
                        key.command();
                        event.preventDefault();
                        return false;
                    };
                }
            } else {
                if (fnKeys.indexOf(key.key) > -1) {
                    tmp[key.key] = (event: KeyboardEvent): boolean | void => {
                        let inside_tab = $('[data-sk="' + key.key + '"]').closest('.tab-pane');
                        if (inside_tab.length) {
                            $('.tab-pane.active [data-sk="' + key.key + '"]').click();
                        } else {
                            $('[data-sk="' + key.key + '"]').click();
                        }
                        event.preventDefault();
                        return false;
                    };
                } else {
                    tmp['control.' + key.key] = (event: KeyboardEvent): boolean | void => {
                        let inside_tab = $('[data-sk="control.' + key.key + '"]').closest('.tab-pane');
                        if (inside_tab.length) {
                            $('.tab-pane.active [data-sk="control.' + key.key + '"]').click();
                        } else {
                            $('[data-sk="control.' + key.key + '"]').click();
                        }
                        event.preventDefault();
                        return false;
                    };
                }
            }
        });
        this.unlisten = this._keyboardShortcuts.listen(tmp, { priority: 0, inputs: true });
    }

    savePageSetting(suffix: string, value: any) {
        let tmpSetting = JSON.parse((this._storageService.getItem('setting_' + this.pageId) || '{}'));
        if (tmpSetting) {
            tmpSetting[suffix] = value;
        }
        this._storageService.setItem('setting_' + this.pageId, JSON.stringify(tmpSetting));
    }

    getPageSetting(suffix: string) {
        let tmpSetting = JSON.parse((this._storageService.getItem('setting_' + this.pageId) || '{}'));
        if (tmpSetting) {
            return tmpSetting[suffix];
        } else {
            return null;
        }
    }

    tinyMceConfig() {
        this.customSettingMce = {
            toolbar: 'bold italic underline | alignleft aligncenter alignright alignjustify | fontselect fontsizeselect | table | charmap | fullscreen link| ltr rtl',
            plugins: 'lists table template charmap anchor fullscreen link',
            menubar: false,
            statusbar: false,
            content_style: '.mce-content-readonly {background-color: #eee !important; color: #848484 !important;} .mce-content-body {font-size:12pt;font-family:times new roman;} .mce-content-body p {padding: 0;margin: 6px 0;} .mce-content-body table tbody tr td{font-size:12pt;font-family:times new roman;}',
        };
    }

    ckeditorConfigResisting() {
        this.ckeConfig = {
            height: 200,
            language: 'vi',
            allowedContent: true,
            toolbar: [
              { name: 'clipboard', items: ['Source', 'Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord', '-', 'Undo', 'Redo' ] },
              { name: 'editing', items: [ 'Find', 'Replace', '-', 'SelectAll'] },
              { name: 'links', items: [ 'Link', 'Unlink', 'Anchor' ] },
              { name: 'insert', items: ['Table', 'HorizontalRule'] },
              { name: 'colors', items: [ 'TextColor', 'BGColor', 'Maximize' ] },
              '/',
              { name: 'styles', items: [ 'Font', 'FontSize' ] },
              { name: 'basicstyles', items: [ 'Bold', 'Italic', 'Underline', 'Strike', 'Subscript', 'Superscript', '-', 'CopyFormatting', 'RemoveFormat' ] },
              { name: 'paragraph', items: ['JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock'] },
              ],
          };
    }

    tinyMceConfigNews() {
        this.customSettingMce = {
            extended_valid_elements: 'style,link[href|rel]',
            custom_elements: 'style,link,~link',
            height : '520',
            toolbar: 'bold italic underline | alignleft aligncenter alignright alignjustify | fontselect fontsizeselect | table | charmap | fullscreen link| ltr rtl',
            plugins: 'lists table template charmap anchor fullscreen link',
            menubar: false,
            statusbar: false,
            content_style: '.mce-content-readonly {background-color: #eee !important; color: #848484 !important;} .mce-content-body {font-size:12pt;font-family:times new roman;} .mce-content-body p {padding: 0;margin: 6px 0;} .mce-content-body table tbody tr td{font-size:12pt;font-family:times new roman;}',
        };
    }

    replaceAll(str, find, replace) {
        return str.replace(new RegExp(find, 'g'), replace);
      }

    ckeditorConfig() {
        this.ckeConfig = {
            height: 500,
            language: 'vi',
            allowedContent: true,
            toolbar: [
              { name: 'clipboard', items: ['Source', 'Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord', '-', 'Undo', 'Redo' ] },
              { name: 'editing', items: [ 'Find', 'Replace', '-', 'SelectAll'] },
              { name: 'links', items: [ 'Link', 'Unlink', 'Anchor' ] },
              { name: 'insert', items: ['Table', 'HorizontalRule', 'Smiley', 'SpecialChar', 'PageBreak', 'Iframe' ] },
              { name: 'colors', items: [ 'TextColor', 'BGColor' ] },
              { name: 'tools', items: [ 'ShowBlocks', 'Maximize'] },
              '/',
              { name: 'styles', items: [ 'Font', 'FontSize' ] },
              { name: 'basicstyles', items: [ 'Bold', 'Italic', 'Underline', 'Strike', 'Subscript', 'Superscript', '-', 'CopyFormatting', 'RemoveFormat' ] },
              { name: 'paragraph', items: ['JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock', 'NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'Blockquote', 'CreateDiv'] },
              ],
          };
    }

    tinyMceReadOnlyConfig() {
        this.customSettingMce = {
            toolbar: false,
            plugins: '',
            menubar: false,
            statusbar: false,
            readonly: 1,
            content_style: '.mce-content-body {font-size:12pt;font-family:times new roman;} .mce-content-body p {padding: 0;margin: 6px 0;} .mce-content-body table tbody tr td{font-size:12pt;font-family:times new roman;}',
        };
    }

    tinyMceRadiologyConfig(height = '600px') {
        this.customSettingMce = {
            toolbar: 'bold italic underline | alignleft aligncenter alignright alignjustify | forecolor | fontselect fontsizeselect | bullist numlist outdent indent table | fullscreen',
            plugins: 'lists table textcolor fullscreen',
            menubar: false,
            content_style: '.mce-content-body {font-size:12pt;font-family:times new roman;} .mce-content-body p {padding: 0;margin: 6px 0;} .mce-content-body table tbody tr td{font-size:12pt;font-family:times new roman;}',
            statusbar: true,
            extraPlugins: 'autogrow',
            height: height
        };
    }

    tinyMceRadiologyConfigAutoResize() {
        this.customSettingMce = {
            toolbar: 'bold italic underline | alignleft aligncenter alignright alignjustify | forecolor | fontselect fontsizeselect | bullist numlist outdent indent table | fullscreen',
            plugins: 'lists table textcolor fullscreen autoresize',
            menubar: false,
            content_style: '.mce-content-body {font-size:12pt;font-family:times new roman;} .mce-content-body p {padding: 0;margin: 6px 0;} .mce-content-body table tbody tr td{font-size:12pt;font-family:times new roman;}',
            statusbar: false,
            fontsize_formats: '8pt 9pt 10pt 11pt 12pt 13pt 14pt 15pt 16pt 17pt 18pt 20pt 36pt',
            autoresize_bottom_margin: 0
        };
    }

    tinyMceRadiologyViewReportConfig() {
        this.customSettingMce = {
            toolbar: false,
            plugins: 'autoresize',
            menubar: false,
            content_style: '.mce-content-body {font-size:12pt;font-family:times new roman;} .mce-content-body p {padding: 0;margin: 6px 0;} .mce-content-body table tbody tr td{font-size:12pt;font-family:times new roman;}',
            readonly: 1,
            statusbar: false,
            autoresize_bottom_margin: 0
        };
    }


    getEmployee(query, label, perPage, sender): Observable<any> {
        setTimeout(() => {
            if (sender) {
                sender.$wrapper.addClass('loading');
            }
        });
        let url = this.getDropdownNoAccountFlag ? '/api/employee/no-account' : '/api/employee-profile/get-dropdown-with-department';
        if (this.getDropdownNoAccountFlag) {
            return this._apiService.post('/api/employee/no-account', { page: query.page, pageSize: perPage, full_name: query.search.trim() }, true, false, null, true, false).pipe(finalize(() => {
                setTimeout(() => {
                    sender.$wrapper.removeClass('loading');
                });
            }));
        } else {
            return this._apiService.post('/api/adapter/execute', { Method: { Method: 'POST' }, Url: url, Module: 'HR', Data: JSON.stringify({ page: query.page, pageSize: perPage, full_name: query.search.trim(), department_id: query.department_id, job_type_refs: query.job_type_ref, clinical_staff_type_role: query.clinical_staff_type_role }) }, true, false, null, true, false).pipe(finalize(() => {
                setTimeout(() => {
                    if (sender) {
                        sender.$wrapper.removeClass('loading');
                    }
                });
            }));
        }
    }

    getItem(query, label, perPage, sender): Observable<any> {
        setTimeout(() => {
            if (sender) {
                sender.$wrapper.addClass('loading');
            }
        });
        let url = '/api/item/get-dropdown-with-type_and_store';
        return this._apiService.post('/api/adapter/execute', { Method: { Method: 'POST' }, Url: url, Module: 'IVT', Data: JSON.stringify({ page: query.page, pageSize: perPage, name: query.search.trim(), item_type: query.item_type, store: query.store }) }, true, false, null, true, false).pipe(finalize(() => {
            setTimeout(() => {
                if (sender) {
                    sender.$wrapper.removeClass('loading');
                }
            });
        }));
    }

    selectizeItemConfig(maxItems: any, label: string = 'name', value: string = 'id', refresh: boolean, type: number = 0, in_search: boolean = false): any {
        let self = this;
        let page, perPage = 20;
        this._translateService.get([
            'MODULE.INVENTORY.item_code',
            'MODULE.INVENTORY.item_name',
        ]).subscribe(res => {
            this.dropdownHeader = res;
        });
        return {
            onInitialize: function () {
                if (refresh) {
                    if (!self.selectizes) {
                        self.selectizes = [];
                    }
                    self.selectizes.push(this);
                }
            },
            onBlur: function () {
                if (this.items.length == 0) {
                    this.clearOptions();
                }
            },
            score: function () {
                return function () { return 1; };
            },
            load: function (query, callback) {
                query = JSON.parse(query);
                query.item_type = in_search ? self.filter_item_type_Search : self.filter_item_type;
                query.store = in_search ? self.filter_store_Search : self.filter_store;
                page = query.page || 1;
                self.getItem(query, label, perPage, this).subscribe(res => {
                    res.data.forEach(ds => {
                        ds.class = 'item';
                    });
                    callback(res.data);
                });
            },
            optgroups: [
                { value: 'item', label: 'header' }
            ],
            optgroupField: 'class',
            render: {
                option: function (item, escape) {
                    if (type == 1) {
                        if (item.root_flag) {
                            return '<div class="dropdown-tree" style="padding-left: 4px">' + escape(item[label]) + '</div>';
                        } else {
                            let tmp = '';
                            tmp += '<div class="dropdown-tree" style="padding-left: calc(30px * ' + item.level + ' + 4px)">';
                            for (let i = 0; i < item.level - 1; i++) {
                                if (item.hide_levels == null || item.hide_levels.indexOf(i + 1) == -1) {
                                    tmp += '<div class="line" style="left: calc(30px * ' + i + ' + 8px);"></div>';
                                }
                            }
                            if (item.last_flag) {
                                tmp += '<div class="line last" style="left: calc(30px * ' + (item.level - 1) + ' + 8px);"></div>';
                            } else {
                                tmp += '<div class="line" style="left: calc(30px * ' + (item.level - 1) + ' + 8px);"></div>';
                            }
                            tmp += '<div class="h-line" style="left: calc(30px * ' + (item.level - 1) + ' + 10px);"></div>';
                            tmp += escape(item[label]);
                            tmp += '</div>';
                            return tmp;
                        }
                    }
                    if (type == 2) {
                        if (label == 'name') {
                            let tmp = '<div class="dropdown-row">';
                            tmp += '<div class="dropdown-cell" style="width:30%">' + escape(item.item_code) + '</div>';
                            tmp += '<div class="dropdown-cell" style="width:70%">' + escape(item.name) + '</div>';
                            tmp += '</div>';
                            return tmp;
                        }
                    }
                    return '<div>' + escape(item[label]) + '</div>';
                },
                optgroup_header: function (data, escape) {
                    let tmp = '<div class="dropdown-row">';
                    tmp += '<div style="width:30%;" class="dropdown-cell"><strong>' + escape(self.dropdownHeader['MODULE.INVENTORY.item_code']) + '</strong></div>';
                    tmp += '<div style="width:70%;" class="dropdown-cell"><strong>' + escape(self.dropdownHeader['MODULE.INVENTORY.item_name']) + '</strong></div>';
                    tmp += '</div>';
                    return tmp;
                }
            },
            highlight: false,
            searchField: [label],
            create: false,
            dropdownDirection: 'down',
            dropdownParent: 'body',
            labelField: label,
            valueField: value,
            plugins: ['infinite_scroll'],
            maxItems: maxItems
        };
    }

    selectizeEmployeeConfig(maxItems: any, label: string = 'label', value: string = 'value', refresh: boolean, type: number = 0, in_search: boolean = false, clinical_staff_type_role: string = ''): any {
        let self = this;
        let page, perPage = 20;
        this._translateService.get([
            'PERSON.full_name',
            'PERSON.date_of_birth',
            'MODULE.HR.clinical_specialty_name',
        ]).subscribe(res => {
            this.dropdownHeaderEmployees = res;
        });
        return {
            onInitialize: function () {
                if (refresh) {
                    if (!self.selectizes) {
                        self.selectizes = [];
                    }
                    self.selectizes.push(this);
                }
            },
            onBlur: function () {
                if (this.items.length == 0) {
                    this.clearOptions();
                }
            },
            score: function () {
                return function () { return 1; };
            },
            load: function (query, callback) {
                query = JSON.parse(query);
                query.department_id = in_search ? self.filterDepartmentId_Search : self.filterDepartmentId;
                query.job_type_ref = in_search ? self.filter_job_type_Search : self.filter_job_type;
                query.clinical_staff_type_role = clinical_staff_type_role;
                page = query.page || 1;
                self.getEmployee(query, label, perPage, this).subscribe(res => {
                    res.data.forEach(ds => {
                        ds.class = 'item';
                    });
                    callback(res.data);
                });
            },
            optgroups: [
                { value: 'item', label: 'header' }
            ],
            optgroupField: 'class',
            render: {
                option: function (item, escape) {
                    if (type == 1) {
                        if (item.root_flag) {
                            return '<div class="dropdown-tree" style="padding-left: 4px">' + escape(item[label]) + '</div>';
                        } else {
                            let tmp = '';
                            tmp += '<div class="dropdown-tree" style="padding-left: calc(30px * ' + item.level + ' + 4px)">';
                            for (let i = 0; i < item.level - 1; i++) {
                                if (item.hide_levels == null || item.hide_levels.indexOf(i + 1) == -1) {
                                    tmp += '<div class="line" style="left: calc(30px * ' + i + ' + 8px);"></div>';
                                }
                            }
                            if (item.last_flag) {
                                tmp += '<div class="line last" style="left: calc(30px * ' + (item.level - 1) + ' + 8px);"></div>';
                            } else {
                                tmp += '<div class="line" style="left: calc(30px * ' + (item.level - 1) + ' + 8px);"></div>';
                            }
                            tmp += '<div class="h-line" style="left: calc(30px * ' + (item.level - 1) + ' + 10px);"></div>';
                            tmp += escape(item[label]);
                            tmp += '</div>';
                            return tmp;
                        }
                    }
                    if (type == 2) {
                        if (label == 'full_name') {
                            let tmp = '<div class="dropdown-row">';
                            tmp += '<div style="width:40%;" class="dropdown-cell">' + escape(item.full_name) + '</div>';
                            tmp += '<div style="width:15%;" class="dropdown-cell">' + escape(self._functionConstants.formatDate(item.date_of_birth, SystemConstants.get('P_DATE_FORMAT'))) + '</div>';
                       //     tmp += '<div style="width:45%;" class="dropdown-cell">' + (item.clinical_specialty_name ? escape(item.clinical_specialty_name) : '') + '</div>';
                            tmp += '</div>';
                            return tmp;
                        }
                    }
                    return '<div>' + escape(item[label]) + '</div>';
                },
                optgroup_header: function (data, escape) {
                    let tmp = '<div class="dropdown-row">';
                    tmp += '<div style="width:40%;" class="dropdown-cell"><strong>' + escape(self.dropdownHeaderEmployees['PERSON.full_name']) + '</strong></div>';
                    tmp += '<div style="width:15%;" class="dropdown-cell"><strong>' + escape(self.dropdownHeaderEmployees['PERSON.date_of_birth']) + '</strong></div>';
                  //  tmp += '<div style="width:45%;" class="dropdown-cell"><strong>' + escape(self.dropdownHeaderEmployees['MODULE.HR.clinical_specialty_name']) + '</strong></div>';
                    tmp += '</div>';
                    return tmp;
                }
            },
            highlight: false,
            searchField: [label],
            create: false,
            // persist: true,
            dropdownDirection: 'down',
            dropdownParent: 'body',
            labelField: label,
            valueField: value,
            plugins: ['infinite_scroll'],
            maxItems: maxItems
        };
    }
    selectizeEmployeeConfigDestroy(maxItems: any, label: string = 'label', value: string = 'value', refresh: boolean, type: number = 0, in_search: boolean = false, clinical_staff_type_role: string = ''): any {
        let self = this;
        let page, perPage = 20;
        this._translateService.get([
            'PERSON.full_name',
            'PERSON.date_of_birth',
            'MODULE.HR.clinical_specialty_name',
        ]).subscribe(res => {
            this.dropdownHeaderEmployees = res;
        });
        return {
            onInitialize: function () {
                if (refresh) {
                    if (!self.selectizes) {
                        self.selectizes = [];
                    }
                    if (refresh) {
                        this.destroy_on_close = true;
                    }
                    self.selectizes.push(this);
                }
            },
            onBlur: function () {
                if (this.items.length == 0) {
                    this.clearOptions();
                }
            },
            score: function () {
                return function () { return 1; };
            },
            load: function (query, callback) {
                query = JSON.parse(query);
                query.department_id = in_search ? self.filterDepartmentId_Search : self.filterDepartmentId;
                query.job_type_ref = in_search ? self.filter_job_type_Search : self.filter_job_type;
                query.clinical_staff_type_role = clinical_staff_type_role;
                page = query.page || 1;
                self.getEmployee(query, label, perPage, this).subscribe(res => {
                    res.data.forEach(ds => {
                        ds.class = 'item';
                    });
                    callback(res.data);
                });
            },
            optgroups: [
                { value: 'item', label: 'header' }
            ],
            optgroupField: 'class',
            render: {
                option: function (item, escape) {
                    if (type == 1) {
                        if (item.root_flag) {
                            return '<div class="dropdown-tree" style="padding-left: 4px">' + escape(item[label]) + '</div>';
                        } else {
                            let tmp = '';
                            tmp += '<div class="dropdown-tree" style="padding-left: calc(30px * ' + item.level + ' + 4px)">';
                            for (let i = 0; i < item.level - 1; i++) {
                                if (item.hide_levels == null || item.hide_levels.indexOf(i + 1) == -1) {
                                    tmp += '<div class="line" style="left: calc(30px * ' + i + ' + 8px);"></div>';
                                }
                            }
                            if (item.last_flag) {
                                tmp += '<div class="line last" style="left: calc(30px * ' + (item.level - 1) + ' + 8px);"></div>';
                            } else {
                                tmp += '<div class="line" style="left: calc(30px * ' + (item.level - 1) + ' + 8px);"></div>';
                            }
                            tmp += '<div class="h-line" style="left: calc(30px * ' + (item.level - 1) + ' + 10px);"></div>';
                            tmp += escape(item[label]);
                            tmp += '</div>';
                            return tmp;
                        }
                    }
                    if (type == 2) {
                        if (label == 'full_name') {
                            let tmp = '<div class="dropdown-row">';
                            tmp += '<div style="width:40%;" class="dropdown-cell">' + escape(item.full_name) + '</div>';
                            tmp += '<div style="width:15%;" class="dropdown-cell">' + escape(self._functionConstants.formatDate(item.date_of_birth, SystemConstants.get('P_DATE_FORMAT'))) + '</div>';
                            tmp += '<div style="width:45%;" class="dropdown-cell">' + (item.clinical_specialty_name ? escape(item.clinical_specialty_name) : '') + '</div>';
                            tmp += '</div>';
                            return tmp;
                        }
                    }
                    return '<div>' + escape(item[label]) + '</div>';
                },
                optgroup_header: function (data, escape) {
                    let tmp = '<div class="dropdown-row">';
                    tmp += '<div style="width:40%;" class="dropdown-cell"><strong>' + escape(self.dropdownHeaderEmployees['PERSON.full_name']) + '</strong></div>';
                    tmp += '<div style="width:15%;" class="dropdown-cell"><strong>' + escape(self.dropdownHeaderEmployees['PERSON.date_of_birth']) + '</strong></div>';
                    tmp += '<div style="width:45%;" class="dropdown-cell"><strong>' + escape(self.dropdownHeaderEmployees['MODULE.HR.clinical_specialty_name']) + '</strong></div>';
                    tmp += '</div>';
                    return tmp;
                }
            },
            highlight: false,
            searchField: [label],
            create: false,
            // persist: true,
            dropdownDirection: 'down',
            dropdownParent: 'body',
            labelField: label,
            valueField: value,
            plugins: ['infinite_scroll'],
            maxItems: maxItems
        };
    }

    getLocation(query, label, perPage, sender): Observable<any> {
        setTimeout(() => {
            if (sender) {
                sender.$wrapper.addClass('loading');
            }
        });
        // if (query.trim() != '') {
        return this._apiService.post('/api/adapter/execute', {
            Method: { Method: 'POST' },
            Url: '/api/commune-ref/get-dropdown',
            Module: 'HR',
            Data: JSON.stringify({ page: sender ? query.page : 1, pageSize: perPage, full_name: sender ? query.search.trim() : query.trim() })
        }, true, false, null, true, false).pipe(
            finalize(() => {
                setTimeout(() => {
                    if (sender) {
                        sender.$wrapper.removeClass('loading');
                    }
                });
            }));
        // } else {
        //     return Observable.of([]);
        // }
    }

    // get service of clinic
    getServiceClinic(query, label, perPage, sender): Observable<any> {
        setTimeout(() => {
            sender.$wrapper.addClass('loading');
        });
        return this._apiService.post('/api/adapter/execute', {
            Method: { Method: 'POST' },
            Url: '/api/shared-his/pass-clinic-service-dropdown',
            Module: 'HC',
            Data: JSON.stringify({ page: query.page, pageSize: perPage, full_name: query.search.trim() })
        }, true, false, null, true, false).pipe(
            finalize(() => {
                setTimeout(() => {
                    sender.$wrapper.removeClass('loading');
                });
            }));
    }

    getIcd(query, label, perPage, sender): Observable<any> {
        setTimeout(() => {
            if (sender) {
                sender.$wrapper.addClass('loading');
            }
        });
        return this._apiService.post('/api/adapter/execute', {
            Method: { Method: 'POST' },
            Url: '/api/icd-ref/get-dropdown',
            Module: 'HC',
            Data: JSON.stringify({ page: sender ? query.page : 1, pageSize: perPage, full_name: sender ? query.search.trim() : query.trim() })
        }, true, false, null, true, false).pipe(
            finalize(() => {
                setTimeout(() => {
                    if (sender) {
                        sender.$wrapper.removeClass('loading');
                    }
                });
            }));
    }

    getMedicalRef(query, label, perPage, sender): Observable<any> {
        setTimeout(() => {
            if (sender) {
                sender.$wrapper.addClass('loading');
            }
        });
        return this._apiService.post('/api/adapter/execute', {
            Method: { Method: 'POST' },
            Url: '/api/medical-ref/get-dropdown',
            Module: 'HC',
            Data: JSON.stringify({ page: sender ? query.page : 1, pageSize: perPage, full_name: sender ? query.search.trim() : query.trim() })
        }, true, false, null, true, false).pipe(
            finalize(() => {
                setTimeout(() => {
                    if (sender) {
                        sender.$wrapper.removeClass('loading');
                    }
                });
            }));
    }

    getDiagnoseTemplate(query, label, perPage, sender): Observable<any> {
        setTimeout(() => {
            sender.$wrapper.addClass('loading');
        });
        return this._apiService.post('/api/adapter/execute', {
            Method: { Method: 'POST' },
            Url: '/api/diagnose-template/get-dropdown',
            Module: 'HC',
            Data: JSON.stringify({ page: query.page, pageSize: perPage, full_name: query.search.trim(), caregiver_id: this._authenService.getLoggedInUser().user_id })
        }, true, false, null, true, false).pipe(
            finalize(() => {
                setTimeout(() => {
                    sender.$wrapper.removeClass('loading');
                });
            }));
    }

    getPharmacyItem(query, label, perPage, sender): Observable<any> {
        setTimeout(() => {
            sender.$wrapper.addClass('loading');
        });
        return this._apiService.post('/api/adapter/execute', {
            Method: { Method: 'POST' },
            Url: '/api/medical-examination/get-pharmacy-dropdown',
            Module: 'HC',
            Data: JSON.stringify({ page: query.page, pageSize: perPage, pharmacy_name: query.search.trim() })
        }, true, false, null, true, false).pipe(
            finalize(() => {
                setTimeout(() => {
                    sender.$wrapper.removeClass('loading');
                });
            }));
    }

    selectizeLocationConfig(maxItems: any, label: string = 'label', value: string = 'value', refresh: boolean): any {
        let self = this;
        let page, perPage = 20;
        return {
            onInitialize: function () {
                if (refresh) {
                    if (!self.selectizes) {
                        self.selectizes = [];
                    }
                    self.selectizes.push(this);
                }
            },
            onBlur: function () {
                if (this.items.length == 0) {
                    this.clearOptions();
                }
            },
            load: function (query, callback) {
                query = JSON.parse(query);
                page = query.page || 1;
                self.getLocation(query, label, perPage, this).subscribe(res => {
                    if (res.data) {
                        res.data.sort((a, b) => {
                            return b.value.split(',')[2].indexOf(SystemConstants.get('PRIORITY_PROVINCE')) - a.value.split(',')[2].indexOf(SystemConstants.get('PRIORITY_PROVINCE'));
                        });
                    }
                    callback(res.data);
                });
            },
            score: function () {
                return function () { return 1; };
            },
            render: {
                option: function (item, escape) {
                    return `<div title='${escape((item[label] || '').split(',').join(', '))}'>${escape((item[label] || '').split(',').join(', '))}</div>`;
                },
                item: function (item, escape) {
                    return `<div title='${escape((item[label] || '').split(',').join(', '))}'>${escape((item[label] || '').split(',').join(', '))}</div>`;
                }
            },
            highlight: false,
            searchField: [label],
            create: false,
            persist: true,
            dropdownDirection: 'down',
            dropdownParent: 'body',
            labelField: label,
            valueField: value,
            plugins: ['infinite_scroll'],
            maxItems: maxItems
        };
    }

    // dropdown service clinic
    selectizeServiceClinicConfig(maxItems: any, label: string = 'label', value: string = 'value', refresh: boolean): any {
        let self = this;
        let page, perPage = 20;
        return {
            onInitialize: function () {
                if (refresh) {
                    if (!self.selectizes) {
                        self.selectizes = [];
                    }
                    self.selectizes.push(this);
                }
            },
            onBlur: function () {
                if (this.items.length == 0) {
                    this.clearOptions();
                }
            },
            load: function (query, callback) {
                query = JSON.parse(query);
                page = query.page || 1;
                self.getServiceClinic(query, label, perPage, this).subscribe(res => {
                    callback(res.data);
                });
            },
            score: function () { return function () { return 1; }; },
            render: {
                option: function (item, escape) {
                    return `<div title='${escape(item[label])}'> ${escape(item[label])} </div>`;
                },
                item: function (item, escape) {
                    return `<div title='${escape(item[label])}'> ${escape(item[label])} </div>`;
                }
            },
            highlight: false,
            searchField: [label],
            create: false,
            persist: true,
            dropdownDirection: 'down',
            dropdownParent: 'body',
            labelField: label,
            valueField: value,
            plugins: ['infinite_scroll'],
            maxItems: maxItems
        };
    }

    selectizeItemConfigWithHeader(maxItems: any, label: string = 'item_name', value: string = 'item_id', refresh: boolean): any {
        let self = this;
        return {
            onInitialize: function () {
                if (refresh) {
                    if (!self.selectizes) {
                        self.selectizes = [];
                    }
                    self.selectizes.push(this);
                }
            },
            optgroupField: 'class',
            optgroups: [
                { value: 'item', label: 'header' }
            ],
            render: {
                option: function (item, escape) {
                    let tmp = '<div class="dropdown-row">';
                    tmp += '<div class="dropdown-cell">' + escape(item[label]) + (item.generic_name ? ' (' + item.generic_name + ')' : '') + (item.drug_content ? ' ' + item.drug_content : '') + ' - ' + item.uom_name + '</div>';
                    tmp += '<div class="dropdown-cell ' + (item.qty_on_hand > 0 ? 'blue' : 'violet') + '">' + escape(item.qty_on_hand) + '</div>';
                    tmp += '</div>';
                    return tmp;
                },
                optgroup_header: function (data, escape) {
                    let tmp = '<div class="dropdown-row">';
                    if (self.dropdownHeader) {
                        tmp += '<div class="dropdown-cell"><strong>' + escape(self.dropdownHeader[Object.keys(self.dropdownHeader)[0]]) + '</strong></div>';
                        tmp += '<div class="dropdown-cell"><strong>' + escape(self.dropdownHeader[Object.keys(self.dropdownHeader)[1]]) + '</strong></div>';
                    }
                    tmp += '</div>';
                    return tmp;
                },
                item: function (item, escape) {
                    return `<div data-rel="tooltip" data-original-title="${escape(item[label])}" title=''>${(escape(item[label]) + (item.generic_name ? ' (' + item.generic_name + ')' + (item.drug_content ? ' ' + item.drug_content : '') : ''))}</div>`;
                },
                option_create: function (item, escape) {
                    let tmp = '<div class="dropdown-row create">';
                    tmp += '<div class="dropdown-cell">' + (self.currentLang == SystemConstants.get('LOCAL') ? 'Thêm' : 'Add') + ' <strong>' + escape(item.input) + '</strong>&hellip;</div>';
                    tmp += '<div class="dropdown-cell"></div>';
                    tmp += '</div>';
                    return tmp;
                }
            },
            highlight: false,
            searchField: [label, 'generic_name'],
            create: false,
            createOnBlur: false,
            persist: true,
            dropdownDirection: 'down',
            dropdownParent: 'body',
            labelField: label,
            valueField: value,
            plugins: {
                'remove_button': {
                    label: '&times;',
                    title: 'Remove',
                    className: 'remove',
                    append: true
                }
            },
            maxItems: maxItems
        };
    }

    selectizeItemConfigGroceryWithHeader(maxItems: any, label: string = 'item_name', value: string = 'item_id', refresh: boolean): any {
        let self = this;
        return {
            onInitialize: function () {
                if (refresh) {
                    if (!self.selectizes) {
                        self.selectizes = [];
                    }
                    self.selectizes.push(this);
                }
            },
            optgroupField: 'class',
            optgroups: [
                { value: 'item', label: 'header' }
            ],
            render: {
                option: function (item, escape) {
                    let tmp = '<div class="dropdown-row">';
                    tmp += '<div class="dropdown-cell">' + escape(item[label]) + ' - ' + item.uom_name + '</div>';
                    tmp += '<div class="dropdown-cell ' + (item.qty_on_hand > 0 ? 'green' : 'red') + '">' + escape(item.qty_on_hand) + '</div>';
                    tmp += '</div>';
                    return tmp;
                },
                optgroup_header: function (data, escape) {
                    let tmp = '<div class="dropdown-row">';
                    if (self.dropdownHeader) {
                        tmp += '<div class="dropdown-cell"><strong>' + escape(self.dropdownHeader[Object.keys(self.dropdownHeader)[0]]) + '</strong></div>';
                        tmp += '<div class="dropdown-cell"><strong>' + escape(self.dropdownHeader[Object.keys(self.dropdownHeader)[1]]) + '</strong></div>';
                    }
                    tmp += '</div>';
                    return tmp;
                },
                item: function (item, escape) {
                    return `<div data-rel="tooltip" data-original-title="${escape(item[label])}" title=''>${(escape(item[label]) + (item.generic_name ? ' (' + item.generic_name + ')' : ''))}</div>`;
                },
                option_create: function (item, escape) {
                    let tmp = '<div class="dropdown-row create">';
                    tmp += '<div class="dropdown-cell">' + (self.currentLang == SystemConstants.get('LOCAL') ? 'Thêm' : 'Add') + ' <strong>' + escape(item.input) + '</strong>&hellip;</div>';
                    tmp += '<div class="dropdown-cell"></div>';
                    tmp += '</div>';
                    return tmp;
                }
            },
            highlight: false,
            searchField: [label, 'generic_name'],
            create: false,
            createOnBlur: false,
            persist: true,
            dropdownDirection: 'down',
            dropdownParent: 'body',
            labelField: label,
            valueField: value,
            plugins: {
                'remove_button': {
                    label: '&times;',
                    title: 'Remove',
                    className: 'remove',
                    append: true
                }
            },
            maxItems: maxItems
        };
    }

    // pharmacy
    selectizePharmacyItemConfig(maxItems: any, label: string = 'label', value: string = 'value', refresh: boolean, create: boolean = false): any {
        let self = this;
        let page, perPage = 20;
        return {
            onInitialize: function () {
                if (refresh) {
                    if (!self.selectizes) {
                        self.selectizes = [];
                    }
                    self.selectizes.push(this);
                }
            },
            onType: function () {
                if (!maxItems) {
                    Object.keys(this.options).forEach(key => {
                        if (this.items.findIndex(x => x == key) == -1) {
                            this.removeOption(key);
                        }
                    });
                }
            },
            onBlur: function () {
                if (this.items.length == 0) {
                    this.clearOptions();
                }
            },
            load: function (query, callback) {
                query = JSON.parse(query);
                page = query.page || 1;
                self.getPharmacyItem(query, label, perPage, this).subscribe(res => {
                    callback(res.data);
                });
            },
            score: function () { return function () { return 1; }; },
            render: {
                option: function (item, escape) {
                    return `<div data-auq='${item['administration_unit_quantity']}'
                            data-dsuq='${item['dose_strength_unit_quantity']}'
                            data-dose='${item['dose_strength_uom_name']}'
                            data-administration='${item['administration_uom_name']}'
                            title='${escape(item[label])}'> ${escape(item[label])} </div>`;
                },
                item: function (item, escape) {
                    return `<div data-auq='${item['administration_unit_quantity']}'
                            data-dsuq='${item['dose_strength_unit_quantity']}'
                            data-dose='${item['dose_strength_uom_name']}'
                            data-dosercd='${item['dose_strength_uom_rcd']}'
                            data-administration='${item['administration_uom_name']}'
                            data-administrationrcd='${item['administration_uom_rcd']}'
                            title='${escape(item[label])}'> ${escape(item[label])} </div>`;
                }
            },
            highlight: false,
            searchField: [label],
            create: create,
            createOnBlur: true,
            persist: true,
            dropdownDirection: 'down',
            dropdownParent: 'body',
            labelField: label,
            valueField: value,
            plugins: ['infinite_scroll'],
            maxItems: maxItems
        };
    }

    selectizeICDConfig(maxItems: any, label: string = 'label', value: string = 'value', refresh: boolean, type = 2, fnFocus: any = null, fnBlur: any = null): any {
        let self = this;
        let page, perPage = 20;
        return {
            onInitialize: function () {
                if (refresh) {
                    if (!self.selectizes) {
                        self.selectizes = [];
                    }
                    self.selectizes.push(this);
                }
            },
            onBlur: function () {
                if (this.items.length == 0) {
                    this.clearOptions();
                }
                fnBlur(this);
            },
            onFocus: fnFocus,
            load: function (query, callback) {
                query = JSON.parse(query);
                page = query.page || 1;
                self.getIcd(query, label, perPage, this).subscribe(res => {
                    if (res.data) {
                        res.data.forEach(ds => {
                            ds.name = ds.label;
                            ds.label = ds.value + ' - ' + ds.label;
                        });
                    }
                    callback(res.data);
                });
            },
            score: function () { return function () { return 1; }; },
            render: {
                option: function (item, escape) {
                    return `<div  title='${escape(item[label])}'> ${escape(item[label])}</div>`;
                },
                item: function (item, escape) {
                    if (type == 2) {
                        return `<div  title='${escape(item[label])}'> ${escape(item[value])}</div>`;
                    }
                    return `<div  title='${escape(item[label])}'> ${escape(item[label])}</div>`;
                }
            },
            highlight: false,
            searchField: [value],
            create: false,
            persist: true,
            dropdownDirection: 'down',
            dropdownParent: 'body',
            labelField: label,
            valueField: value,
            plugins: ['infinite_scroll'],
            maxItems: maxItems
        };
    }

    selectizeDoctorConfig(maxItems: any, label: string = 'label', value: string = 'value', refresh: boolean): any {
        let self = this;
        let page, perPage = 20;
        return {
            onInitialize: function () {
                if (refresh) {
                    if (!self.selectizes) {
                        self.selectizes = [];
                    }
                    self.selectizes.push(this);
                }
            },
            onBlur: function () {
                if (this.items.length == 0) {
                    this.clearOptions();
                }
            },
            score: function () { return function () { return 1; }; },
            render: {
                option: function (item, escape) {
                    return `<div  title='${escape(item[label])}'> ${escape(item[label])}</div>`;
                },
                item: function (item, escape) {
                    return `<div  title='${escape(item[label])}'> ${escape(item[label])}</div>`;
                }
            },
            highlight: false,
            searchField: [label],
            create: false,
            persist: true,
            dropdownDirection: 'down',
            dropdownParent: 'body',
            labelField: label,
            valueField: value,
            plugins: ['infinite_scroll'],
            maxItems: maxItems
        };
    }

    selectizeMedicalConfig(maxItems: any, label: string = 'label', value: string = 'value', refresh: boolean): any {
        let self = this;
        let page, perPage = 20;
        return {
            onInitialize: function () {
                if (refresh) {
                    if (!self.selectizes) {
                        self.selectizes = [];
                    }
                    self.selectizes.push(this);
                }
            },
            onBlur: function () {
                if (this.items.length == 0) {
                    this.clearOptions();
                }
            },
            load: function (query, callback) {
                query = JSON.parse(query);
                page = query.page || 1;
                self.getMedicalRef(query, label, perPage, this).subscribe(res => {
                    callback(res.data);
                });
            },
            score: function () { return function () { return 1; }; },
            render: {
                option: function (item, escape) {
                    return `<div title='${escape(item[label])}'> ${escape(item[label])}</div>`;
                },
                item: function (item, escape) {
                    return `<div title='${escape(item[label])}'> ${escape(item[label])}</div>`;
                },
                option_create: function (data, escape) {
                    return `<div class="create">${(self.currentLang == SystemConstants.get('LOCAL') ? 'Thêm' : 'Add')} <strong>${escape(data.input)}</strong>&hellip;</div>`;
                }
            },
            highlight: false,
            searchField: [label],
            persist: true,
            dropdownDirection: 'down',
            dropdownParent: 'body',
            labelField: label,
            valueField: value,
            plugins: ['infinite_scroll'],
            maxItems: maxItems
        };
    }

    selectizeDiagnoseTemplateConfig(maxItems: any, label: string = 'label', value: string = 'value', refresh: boolean): any {
        let self = this;
        let page, perPage = 20;
        return {
            onInitialize: function () {
                if (refresh) {
                    if (!self.selectizes) {
                        self.selectizes = [];
                    }
                    self.selectizes.push(this);
                }
            },
            onBlur: function () {
                if (this.items.length == 0) {
                    this.clearOptions();
                }
            },
            load: function (query, callback) {
                query = JSON.parse(query);
                page = query.page || 1;
                self.getDiagnoseTemplate(query, label, perPage, this).subscribe(res => {
                    callback(res.data);
                });
            },
            score: function () { return function () { return 1; }; },
            render: {
                option: function (item, escape) {
                    return `<div  title='${escape(item[label])}'> ${escape(item[label])}</div>`;
                },
                item: function (item, escape) {
                    return `<div  title='${escape(item[label])}'> ${escape(item[label])}</div>`;
                }
            },
            highlight: false,
            searchField: [value],
            create: false,
            persist: true,
            dropdownDirection: 'down',
            dropdownParent: 'body',
            labelField: label,
            valueField: value,
            plugins: ['infinite_scroll'],
            maxItems: maxItems
        };
    }

    getLocaleCalendar() {
        this.locale_calendar = SystemConstants.get(this.currentLang == SystemConstants.get('LOCAL') ? 'LOCALE_CALENDAR_LOCAL' : 'LOCALE_CALENDAR_EN');
    }

    toggleSearchPanel() {
        this.showSearchPanel = !this.showSearchPanel;
        this.savePageSetting('show_search_panel', this.showSearchPanel);
    }

    toggleSearchPanelVendor() {
        this.showSearchPanelVendor = !this.showSearchPanelVendor;
        this.savePageSetting('show_search_panel_vendor', this.showSearchPanelVendor);
    }

    toggleAdvanceSearchPanel() {
        this.showAdvanceSearch = !this.showAdvanceSearch;
        this.savePageSetting('show_advance_search', this.showAdvanceSearch);
    }

    logout() {
        this._authenService.logout();
    }

    getTreeItemInnerHTML(item, label) {
        if (item.root_flag) {
            return '<div class="dropdown-tree" style="padding-left: 4px">' + item[label] + '</div>';
        } else {
            let tmp = '';
            tmp += '<div class="dropdown-tree" style="padding-left: calc(30px * ' + item.level + ' + 4px)">';
            for (let i = 0; i < item.level - 1; i++) {
                if (item.hide_levels == null || item.hide_levels.indexOf(i + 1) == -1) {
                    tmp += '<div class="line" style="left: calc(30px * ' + i + ' + 8px);"></div>';
                }
            }
            if (item.last_flag) {
                tmp += '<div class="line last" style="left: calc(30px * ' + (item.level - 1) + ' + 8px);"></div>';
            } else {
                tmp += '<div class="line" style="left: calc(30px * ' + (item.level - 1) + ' + 8px);"></div>';
            }
            tmp += '<div class="h-line" style="left: calc(30px * ' + (item.level - 1) + ' + 10px);"></div>';
            tmp += item[label];
            tmp += '</div>';
            return tmp;
        }
    }

    selectizeConfig(maxItems: any, label: string = 'label', value: string = 'value', refresh: boolean, type: number = 0, originSource: any = null, source: any = null, enableOptions: any[] = []): any {
        let self = this;
        return {
            onInitialize: function () {
                if (!self.selectizes) {
                    self.selectizes = [];
                }
                if (refresh) {
                    this.destroy_on_close = true;
                }
                self.selectizes.push(this);
            },
            render: {
                option: function (item, escape) {
                    if (type == 1) {
                        if (item.root_flag) {
                            return '<div class="dropdown-tree" style="padding-left: 4px">' + escape(item[label]) + '</div>';
                        } else {
                            let tmp = '';
                            tmp += '<div class="dropdown-tree" style="padding-left: calc(30px * ' + item.level + ' + 4px)">';
                            for (let i = 0; i < item.level - 1; i++) {
                                if (item.hide_levels == null || item.hide_levels.indexOf(i + 1) == -1) {
                                    tmp += '<div class="line" style="left: calc(30px * ' + i + ' + 8px);"></div>';
                                }
                            }
                            if (item.last_flag) {
                                tmp += '<div class="line last" style="left: calc(30px * ' + (item.level - 1) + ' + 8px);"></div>';
                            } else {
                                tmp += '<div class="line" style="left: calc(30px * ' + (item.level - 1) + ' + 8px);"></div>';
                            }
                            tmp += '<div class="h-line" style="left: calc(30px * ' + (item.level - 1) + ' + 10px);"></div>';
                            tmp += escape(item[label]);
                            tmp += '</div>';
                            return tmp;
                        }
                    }
                    if (type == 2) {
                        if (label == 'full_name') {
                            let tmp = '<div class="dropdown-row">';
                            tmp += '<div style="width:40%;" class="dropdown-cell">' + escape(item.full_name) + '</div>';
                            tmp += '<div style="width:15%;" class="dropdown-cell">' + escape(self._functionConstants.formatDate(item.date_of_birth, SystemConstants.get('P_DATE_FORMAT'))) + '</div>';
                            tmp += '<div style="width:45%;" class="dropdown-cell">' + item.residence_address ? escape(item.residence_address) : '' + '</div>';
                            tmp += '</div>';
                            return tmp;
                        }
                    }
                    if (type == 3) {
                        return '<div>' + escape(item[value]) + ': ' + escape(item[label]) + '</div>';
                    }
                    return `<div title='${escape(item[label])}'>${escape(item[label])}</div>`;
                },
                item: function (item, escape) {
                    return `<div data-rel="tooltip" data-original-title="${escape(item[label])}" title=''>${escape(item[label])}</div>`;
                }
            },
            highlight: false,
            searchField: [label],
            create: false,
            persist: true,
            preload: true,
            dropdownDirection: 'down',
            dropdownParent: 'body',
            labelField: label,
            valueField: value,
            searchConjunction: 'or',
            plugins: {
                'remove_button': {
                    label: '&times;',
                    title: 'Remove',
                    className: 'remove',
                    append: true
                },
                'enable_options': {
                    enableOptions: enableOptions
                }
            },
            maxItems: maxItems,
            diacritics: false
        };
    }

    showLoader() {
        this._loaderService.show();
    }

    hideLoader() {
        this._loaderService.hide();
    }

    expandRecursive(node: TreeNode, isExpand: boolean) {
        if (!node.leaf) {
            node.expanded = isExpand;
        }
        if (node.children) {
            node.children.forEach(childNode => {
                this.expandRecursive(childNode, isExpand);
            });
        }
    }

    stringify(obj, fields) {
        let tmp = JSON.parse(JSON.stringify(obj, fields));
        let replacer = (key, value) => {
            if (typeof value === 'number') {
                return String(value);
            }
            return value;
        };
        return JSON.stringify(tmp, replacer);
    }

    modified() {
        if (this.updateForm == null) {
            return;
        }
        let uf = this.updateForm.getRawValue();
        if (this.setNullIfEmpty.length > 0) {
            this.setNullIfEmpty.forEach(field_name => {
                if (uf[field_name] == '') {
                    uf[field_name] = null;
                }
            });
        }
        
        Object.keys(this.updateFormOriginalData).forEach(key => {
            if (uf.hasOwnProperty(key)) {
                if (uf[key] == '' && this.updateFormOriginalData[key] == null) {
                    uf[key] = null;
                } else if (typeof this.updateFormOriginalData[key] == 'number' && uf[key] != '' && typeof uf[key] != 'number') {
                    uf[key] = Number(uf[key]);
                }
            }
        });

        return this.updateFormChangedByFileUpload ||
            (JSON.stringify(this.updateFormOriginalData, Object.keys(this.updateFormOriginalData).sort()) != JSON.stringify(uf, Object.keys(this.updateFormOriginalData).sort()));
    }

    resetUpdateForm(comparingWithOriginFlag: boolean = false) {
        if (this.updateForm) {
            if (this.updateFormOriginalData) {
                this.updateForm.reset(this.updateFormOriginalData);
            } else {
                this.updateForm.reset();
            }
            this.updateForm.markAsPristine();
            this.updateForm.markAsUntouched();
        }
        if (!comparingWithOriginFlag) {
            if (this.updateForm) {
                Object.keys(this.updateForm.controls).forEach(key => {
                    if ($('p-radiobutton[formcontrolname=' + key + ']').length > 0) {
                        $($('p-radiobutton[formcontrolname=' + key + ']')[0]).find('label').click();
                    }
                });
            }
            if (this.isCreate) {
                if (this.selectizes) {
                    this.selectizes.forEach(ds => {
                        if (ds.currentResults && ds.currentResults.items.length > 0) {
                            ds.setValue(null);
                        }
                    });
                }
                if (this.setDefaultOnResetUpdateForm && this.setDefaultOnResetUpdateForm.length > 0) {
                    this.setDefaultOnResetUpdateForm.forEach(ds => {
                        setTimeout(() => {
                            this[ds.key] = ds.value;
                        });
                    });
                }
            } else {
                if (this.selectizes && this.setDefaultSource && this.setDefaultSource.length > 0) {
                    this.selectizes.forEach(ds => {
                        let tmp = ds['$wrapper'].parent();
                        this.setDefaultSource.forEach(x => {
                            if (tmp.hasClass(x.className)) {
                                ds.clearOptions();
                                ds.addOption(x.item);
                                ds.addItem(x.value);
                            }
                        });
                    });
                }
            }
            this.setAutoFocus();
        }
    }

    reloadDropdowns() { }

    closeUpdateForm(event, modal_id: string = '#updateForm') {
        if (event) {
            if ($(event.target).closest('.modal').hasClass('in')) {
                $(event.target).closest('.modal').modal('hide');
            }
        } else {
            if ($(modal_id).closest('.modal').hasClass('in')) {
                $(modal_id).closest('.modal').modal('hide');
            }
        }
        setTimeout(() => {
            if (!$('.modal.in').length) {
                $('body').removeClass('modal-open');
                $('body').css('padding-right', '0');
            }
            if (this.updateForm) {
                this.resetUpdateForm();
            }
            this.doneSetupForm = false;
            this.showUpdateModal = false;
            this.showTreeDetail = false;
            let clone_selectizes = [];
            (this.selectizes || []).forEach(ds => {
                if (ds.destroy_on_close) {
                    ds.destroy();
                } else {
                    clone_selectizes.push(ds);
                }
            });
            this.selectizes = clone_selectizes;
            if (!this._changeDetectorRef['destroyed']) {
                this._changeDetectorRef.detectChanges();
            }
        });
    }

    addSlash(event, showTime: boolean = false, cal: any = null) {
        if (!this.backspacePressed && showTime && cal && cal.timeOnly) {
            if (event.target.value.length == 2) {
                event.target.value += ':';
            } else if (event.target.value.length == 3) {
                event.target.value = event.target.value.slice(0, 2) + ':' + event.target.value.slice(2);
            }
        } else if (!this.backspacePressed && (!cal || (cal && cal.dateFormat != 'yy'))) {
            if (event.target.value.length == 2 || event.target.value.length == 5) {
                event.target.value += '/';
            } else if (event.target.value.length == 10 && showTime) {
                event.target.value += ' ';
            } else if (event.target.value.length == 13) {
                event.target.value += ':';
            } else if (event.target.value.length == 3) {
                event.target.value = event.target.value.slice(0, 2) + '/' + event.target.value.slice(2);
            } else if (event.target.value.length == 6) {
                event.target.value = event.target.value.slice(0, 5) + '/' + event.target.value.slice(5);
            } else if (event.target.value.length == 11) {
                event.target.value = event.target.value.slice(0, 10) + ' ' + event.target.value.slice(10);
            } else if (event.target.value.length == 14) {
                event.target.value = event.target.value.slice(0, 13) + ':' + event.target.value.slice(13);
            }
        }
    }

    addcolonfortime(event) {
        if (!this.backspacePressed) {
            if (event.target.value.length == 2) {
                event.target.value += ':';
            } else if (event.target.value.length == 6) {
                event.target.value = event.target.value.slice(0, 5);
            }
        }
    }

    isTextSelected(input: any) {
        if (typeof input.selectionStart == 'number') {
            return input.selectionStart == 0 && input.selectionEnd == input.value.length;
        } else if (typeof document['selection'] != 'undefined') {
            input.focus();
            return document['selection'].createRange().text == input.value;
        }
    }

    onlyNumbers(event, showTime: boolean = false, cal: any = null) {
        let vKey = 86,
            aKey = 65,
            forwardSlashKey = 191,
            cKey = 67,
            upKey = 38,
            downKey = 40;
        let max = (cal && cal.dateFormat == 'yy') ? 4 : (showTime ? 16 : 10);
        if (event.keyCode == upKey && cal && cal.value) {
            cal.value = new Date(cal.value);
            cal.value.setDate(cal.value.getDate() + 1);
            cal.updateInputfield();
            cal.updateModel(cal.value);
            cal.updateUI();
            return true;
        }
        if (event.keyCode == downKey && cal && cal.value) {
            cal.value = new Date(cal.value);
            cal.value.setDate(cal.value.getDate() - 1);
            cal.updateInputfield();
            cal.updateModel(cal.value);
            cal.updateUI();
            return true;
        }
        if (event.code == 'Enter' || event.code == 'NumpadEnter') {
            $('body').click();
            return true;
        }
        if (((event.ctrlKey === true || event.metaKey === true) && (event.keyCode == vKey || event.keyCode == cKey || event.keyCode == aKey))
            || (event.keyCode >= 35 && event.keyCode <= 40)) {
            return true;
        }
        if (event.code == 'Backspace') {
            this.backspacePressed = true;
        } else {
            this.backspacePressed = false;
        }
        if (event.code == 'Backspace' || event.code == 'ArrowLeft' || event.code == 'ArrowRight' || event.code == 'Tab') {
            return true;
        }
        if (event.target.value.length < max) {
            if ((event.keyCode >= 48 && event.keyCode <= 57) || (event.keyCode >= 96 && event.keyCode <= 105) || event.keyCode == forwardSlashKey) {
                return true;
            } else {
                return false;
            }
        } else {
            if ($(event.target)[0].selectionStart != $(event.target)[0].selectionEnd) {
                return true;
            } else {
                return false;
            }
        }
    }

    checkMaxDate(event, cd) {
        if (cd.maxDate && cd.value > cd.maxDate) {
            return cd.maxDate;
        }
        if (cd.minDate && cd.value < cd.minDate) {
            return cd.minDate;
        }
        return cd.value;
    }

    setAutoFocus() {
        let last: any;
        if ($('body > .modal.in').length) {
            let ele = $('body > .modal.in');
            last = $(ele[ele.length - 1]).find('.tab-pane.active [autofocus]');
        } else if ($('.modal.in .main-tab-pane.active [autofocus]').length) {
            last = $('.modal.in .main-tab-pane.active [autofocus]');
        } else if ($('.modal.in .tab-pane.active [autofocus]').length) {
            last = $('.modal.in .tab-pane.active [autofocus]');
        } else if ($('.main-tab-pane.active [autofocus]').length) {
            last = $('.main-tab-pane.active [autofocus]');
        } else if ($('.tab-pane.active [autofocus]').length) {
            last = $('.tab-pane.active [autofocus]');
        } else if ($('[autofocus]').length) {
            last = $('[autofocus]');
        }
        if (last && last.length) {
            switch (last[0].tagName.toLowerCase()) {
                case 'ng-selectize':
                    setTimeout(() => {
                        $(last[0]).find('input').focus();
                    }, 200);
                    break;
                default:
                    last[0].focus();
                    break;
            }
        }
    }

    getEncodeFromImage(fileUpload: CustomizeFileUpload) {
        if (fileUpload) {
            if (fileUpload.fu.files == null || fileUpload.fu.files.length == 0) {
                return observableOf('');
            }
            let file: File = fileUpload.fu.files[0];
            let reader: FileReader = new FileReader();
            reader.readAsDataURL(file);
            return fromEvent(reader, 'load').pipe(map((e) => {
                let result = '';
                let tmp: any = reader.result;
                let baseCode = tmp.substring(tmp.indexOf('base64,', 0) + 7);
                result = file.name + ';' + file.size + ';' + baseCode;
                return result;
            }));
        } else {
            return observableOf(null);
        }
    }

    getUploadFileFormat(file: File, e) {
        let baseCode = e.result.substring(e.result.indexOf('base64,', 0) + 7);
        return file.name + ';' + file.size + ';' + baseCode;
    }

    getImageFromService(fieldFromServer: any, onLoadCallback: any) {
        return this._imageService.getImage(fieldFromServer).subscribe(data => {
            let reader = new FileReader();
            reader.onload = onLoadCallback;
            if (data) {
                reader.readAsDataURL(data);
            }
        });
    }

    /**
     * Get file name
     * @param filePath Full file path in database
     */
    gfn(filePath: string) {
        filePath = filePath.replace(/\\/g, '/');
        let path = filePath.substring(0, filePath.lastIndexOf(';'));
        return path.substring(path.lastIndexOf('/') + 1);
    }

    /**
     * Get file name no guid
     * @param filePath Full file path in database
     */
    gfnng(filePath: string) {
        filePath = filePath.replace(/\\/g, '/');
        let path = filePath.substring(0, filePath.lastIndexOf(';'));
        let fileNameWithGuid = path.substring(path.lastIndexOf('/') + 1);
        return fileNameWithGuid.substring(fileNameWithGuid.indexOf('_') + 1);
    }

    /**
     * Get file path
     * @param filePath Full file path in database
     */
    gfp(filePath: string) {
        filePath = filePath.replace(/\\/g, '/');
        return filePath.substring(0, filePath.lastIndexOf(';'));
    }

    /**
     * Get file size
     * @param filePath Full file path in database
     */
    gfs(filePath: string) {
        filePath = filePath.replace(/\\/g, '/');
        return parseFloat(filePath.substring(filePath.lastIndexOf(';') + 1)) / 1000;
    }

    /**
     * Check file is image or not
     * @param filePath Full file path in database
     */
    isImage(filePath: string) {
        filePath = filePath.replace(/\\/g, '/');
        let path = filePath.substring(0, filePath.lastIndexOf(';'));
        if (!path.match(/.(jpg|jpeg|png|gif|ico|bmp)$/i)) {
            return false;
        }
        return true;
    }

    isImage2(filePath: string) {
        filePath = filePath.replace(/\\/g, '/');
        if (!filePath.match(/.(jpg|jpeg|png|gif|ico|bmp)$/i)) {
            return false;
        }
        return true;
    }

    isImages(file: File): boolean {
        return /^image\//.test(file.type);
    }

    showExistingFile(fieldData: string) {
        return fieldData.split(';').length == 2;
    }

    emtFileUploadChange(event) {
        let cfu = event.cfu;
        let file = event.file;
        if (file != null) {
            cfu.fu.files = [file];
        } else {
            cfu.fu.files = [];
        }
        this.updateFormChangedByFileUpload = true;
    }

    selectCalendar(event, sender) {
        let $this = $(sender.inputfieldViewChild.nativeElement);
        let inputs = $this.closest('form').find(':input:not(:button)');
        inputs.eq(inputs.index(sender.inputfieldViewChild.nativeElement)).focus();
    }

    blurCalendar(event, sender, model: any = null, field: string = null) {
        if (sender.value) {
            if (sender.maxDate && sender.value > sender.maxDate) {
                sender.value = sender.maxDate;
                if (model && field) {
                    model[field] = sender.value;
                }
            } else if (sender.minDate && sender.value < sender.minDate) {
                sender.value = sender.minDate;
                if (model && field) {
                    model[field] = sender.value;
                }
            } else if (this.invalidDates && this.invalidDates.length > 0) {
                let d: Date = this.invalidDates.find(ds => ds.getTime() == sender.value.getTime());
                let tmp: Date;
                if (d) {
                    do {
                        tmp = new Date(d);
                        tmp.setDate(tmp.getDate() + 1);
                        d = this.invalidDates.find(ds => ds.getTime() == tmp.getTime());
                    } while (d);
                    sender.value = tmp;
                    if (model && field) {
                        model[field] = sender.value;
                    }
                }
            }
        }
    }

    diffDate(date1: Date, date2: Date, type: string) {
        let diff = Math.abs(date1.getTime() - date2.getTime());
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

    getTime(strDate) {
        let myDate = new Date(strDate);
        return myDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    copyProperty(obj) {
        Object.keys(obj).forEach(key => {
            if (key.toLowerCase().startsWith('objectjson')) {
                if (obj[key]) {
                    Object.keys(obj[key]).forEach(k => {
                        if (obj[key][k] != null && !k.endsWith('_id') && !k.endsWith('_rid') && !k.endsWith('_rcd')) {
                            obj[k] = obj[key][k];
                        }
                    });
                }
            }
        });
        return obj;
    }

    goInFullScreen() {
        let element = $('html').get(0);
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        } else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        }
    }

    autoCalculateLotNumber(source: any[], quantity, quantity_field: string = 'issued_qty') {
        if (source) {
            let total = quantity;
            source.forEach(ds => {
                ds[quantity_field] = 0;
                if (total >= ds.qty_on_hand) {
                    ds[quantity_field] = ds.qty_on_hand;
                    total -= ds.qty_on_hand;
                } else if (total > 0) {
                    ds[quantity_field] = total;
                    total = 0;
                }
            });
        }
    }

    onDialogShow(event) {
        $('body').css('padding-right', '17px');
        $('body').addClass('modal-open');
    }

    onDialogHide(event) {
        if (!$('.modal.in').length) {
            $('body').removeClass('modal-open');
            $('body').css('padding-right', '0');
        }
    }

    openScreenSaver(work_queue_flag: boolean = true) {
        let popup = window.open(work_queue_flag ? 'his/list-screen-saver' : 'his/screen-saver', '_blank', 'fullscreen=yes,width=' + screen.availWidth + ',height=' + screen.availHeight);
        popup.moveTo(0, 0);
    }

    lastIndexOf(value: any, field: string, source: any[]) {
        for (let i = source.length - 1; i >= 0; i--) {
            if (source[i][field] == value) {
                return i;
            }
        }
        return -1;
    }

    padLeft(num: number, size: number): string {
        let s = num + '';
        while (s.length < size) {
            s = '0' + s;
        }
        return s;
    }

    combineICD(list_json_icd: any[]) {
        if (!list_json_icd || list_json_icd.length == 0 || (list_json_icd.length == 1 && list_json_icd[0].icd_code == null)) {
            return 'MODULE.HIS.following';
        }
        return list_json_icd.filter(ds => ds.icd_code).map(ds => {
            return ds.icd_code + ' - ' + ds.icd_name;
        }).join('; ');
    }

    slugify(str, separator = '') {
        str = str
            .toLowerCase()
            .replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a')
            .replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e')
            .replace(/ì|í|ị|ỉ|ĩ/g, 'i')
            .replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o')
            .replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u')
            .replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y')
            .replace(/đ/g, 'd')
            .replace(/\s+/g, '-')
            .replace(/[^A-Za-z0-9_-]/g, '')
            .replace(/-+/g, '-');
        if (separator) {
            return str.replace(/-/g, separator);
        }
        return str;
    }

    bytesToSize(bytes: any): any {
        let sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        if (bytes == 0) {
            return '0 Byte';
        }
        let i = parseInt('' + (Math.floor(Math.log(bytes) / Math.log(1024))));
        return Math.round(bytes / Math.pow(1024, i)) + ' ' + sizes[i];
    }

    saveSuggest(value, key) {
        if (value && value != '') {
            let tmp = JSON.parse(this._storageService.getItem(key)) || [];
            let tmp_index = tmp.indexOf(value);
            if (tmp_index == -1) {
                tmp.push(value);
            }
            this._storageService.setItem(key, JSON.stringify(tmp));
        }
    }

    filterAutoComplete(event, key, variable) {
        this[variable] = (JSON.parse(this._storageService.getItem(key)) || [])
            .filter(ds => this.slugify(ds).indexOf(this.slugify(event.query)) > -1);
    }

    getSelectingOptionFromValue(className) {
        let result = null;
        this.selectizes.forEach(ds => {
            if (ds['$wrapper'].parent().hasClass(className)) {
                if (ds.items.length > 0) {
                    result = ds.options[ds.items[0]];
                }
            }
        });
        return result;
    }

    detectChange() {
        if (!this._changeDetectorRef['destroyed']) {
            this._changeDetectorRef.detectChanges();
        }
    }

    ngOnDestroy() {
        let SUBSCRIBLEPREFIX = [
            '_sub'
        ];
        let TIMERPREFIX = [
            '_timer'
        ];
        let IGNORES = [
            '_router',
            '_changeDetectorRef',
            '_http',
            '_translateService',
            '_storageService',
            '_functionConstants',
            '_confirmationService',
            '_authenService',
            '_loaderService',
            '_apiService',
            '_imageService',
            '_fb'
        ];
        if (this.unlisten) {
            this.unlisten();
        }
        this.unsubscribe.next();
        this.unsubscribe.complete();
        (this.selectizes || []).forEach(ds => {
            ds.destroy();
        });
        Object.keys(this).map(k => {
            if (SUBSCRIBLEPREFIX.findIndex(x => k.startsWith(x)) > -1) {
                this[k].unsubscribe();
            }
            if (TIMERPREFIX.findIndex(x => k.startsWith(x)) > -1) {
                clearInterval(this[k]);
            }
            if (IGNORES.indexOf(k.toString()) == -1) {
                this[k] = null;
            }
        });
        this._changeDetectorRef.detach();
    }

}
