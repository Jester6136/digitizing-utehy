import { Component, Injector, OnInit, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ENotificationType, Grid, SystemConstants, CustomizeFileUpload, CustomEmailValidator } from 'core';
import { combineLatest, Observable } from 'rxjs';
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/operator/takeUntil';
import { WebsiteInfoRef } from '../../../../main/entities/website-info-ref';
declare var $: any;

@Component({
  selector: 'app-website-info-ref',
  templateUrl: './website-info-ref.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WebsiteInfoRefComponent extends Grid implements OnInit {
  public host_image: any;
  public isCreate = false;
  public website_info_ref: WebsiteInfoRef;
  @ViewChild(CustomizeFileUpload, { static: false }) fu_web_info_logo_l: CustomizeFileUpload;
  @ViewChild(CustomizeFileUpload, { static: false }) fu_web_info_logo_e: CustomizeFileUpload;

  public constructor(injector: Injector) {
    super(injector);
    this.LZCompress = true; // using LZString compress data
    this.loadBalancing = true;
    this.host_image = SystemConstants.IMAGE_API + '/';
    this.APIModuleName = 'CMS';
    this.getListByIdApiUrl = '/api/website-info-ref/get-list-by-id/';
    this.searchApiUrl = '/api/website-info-ref/search';
    this.exportUrl = '/api/website-info-ref/export-to-excel';
    this.exportFilename = 'list_website_info_ref.xlsx';
    this.setNullIfEmpty = [];
    this.filterFields = ['web_info_rcd', 'web_info_faculty', 'web_info_address', 'web_info_email', 'web_info_phone', 'sort_order'];
    this.dataKey = 'web_info_rcd';
    this.searchValue.page = this.page;
    this.searchValue.pageSize = this.pageSize;
    this.searchFormGroup = new FormGroup({
      'web_info_rcd': new FormControl(''),
      'web_info_faculty': new FormControl(''),
    });
    this.hasViewPermission = this._authenService.hasPermission(this.pageId, 'view_website_info_ref');
    this.hasCreatePermission = this._authenService.hasPermission(this.pageId, 'create_website_info_ref');
    this.hasUpdatePermission = this._authenService.hasPermission(this.pageId, 'update_website_info_ref');
    this.hasDeletePermission = this._authenService.hasPermission(this.pageId, 'delete_website_info_ref');
    this.tableActions = [];
    if (this.hasDeletePermission) {
      this._translateService.get('COMMON.delete').subscribe((message) => {
        this.tableActions.push({ label: message, icon: 'fa-close', command: () => { this.onRemove(this.selectedDataTableItems); } });
      });
    }
    this.predicateAfterSearch = () => {
      this._changeDetectorRef.detectChanges();
    };
  }

  public loadDropdowns() {
    this.search();
  }

  public ngOnInit() {
    this.website_info_ref = new WebsiteInfoRef();
    this.loadDropdowns();
  }

  public openCreateModal(row: any = null) {
    this.doneSetupForm = false;
    this.showUpdateModal = true;
    setTimeout(() => {
      $('#updateWebsiteInfoRefModal').appendTo('body').modal('toggle');
    });
    setTimeout(() => {
      this.website_info_ref = new WebsiteInfoRef();
      this.isCreate = true;
      this.updateForm = new FormGroup({
        'web_info_rcd': new FormControl('', [Validators.required, Validators.maxLength(50)]),
        'web_info_logo_l': new FormControl('', []),
        'web_info_logo_e': new FormControl('', []),
        'web_info_slogan_l': new FormControl('', [Validators.maxLength(100)]),
        'web_info_slogan_e': new FormControl('', [Validators.maxLength(100)]),
        'web_info_faculty_e': new FormControl('', [Validators.maxLength(100)]),
        'web_info_faculty_l': new FormControl('', [Validators.maxLength(100)]),
        'web_info_address': new FormControl('', [Validators.maxLength(200)]),
        'web_info_email': new FormControl('', [Validators.maxLength(100), CustomEmailValidator]),
        'web_info_phone': new FormControl('', [Validators.maxLength(20), Validators.pattern("^[0-9 _-]{10,12}")]),
        'web_info_website': new FormControl('', [Validators.maxLength(200)]),
        'web_info_facebook': new FormControl('', [Validators.maxLength(200)]),
        'web_info_zalo': new FormControl('', [Validators.maxLength(200)]),
        'web_info_youtube': new FormControl('', [Validators.maxLength(200)]),
        'sort_order': new FormControl('', [Validators.pattern(/^-?(0|[1-9]\d*)?$/)]),
      });
      this.updateFormOriginalData = this.updateForm.getRawValue();
      this.doneSetupForm = true;
      setTimeout(() => {
        this._changeDetectorRef.detectChanges();
        this.setAutoFocus();
        this.updateValidator();
      });
    }, 300);
  }

  public updateValidator() {
    this.updateForm.valueChanges.subscribe(res => {
      this.enabledSubmitFlag = this.modified();
    });
  }

  public onSubmit() {
    if (this.submitting == false) {
      this.submitting = true;
      if (!this.website_info_ref.web_info_logo_l && this.website_info_ref.web_info_logo_e) {
        this.website_info_ref.web_info_logo_l = this.website_info_ref.web_info_logo_e;
      }
      if (!this.website_info_ref.web_info_logo_e && this.website_info_ref.web_info_logo_l) {
        this.website_info_ref.web_info_logo_e = this.website_info_ref.web_info_logo_l;
      }
      if (!this.website_info_ref.web_info_slogan_l && this.website_info_ref.web_info_slogan_e) {
        this.website_info_ref.web_info_slogan_l = this.website_info_ref.web_info_slogan_e;
      }
      if (!this.website_info_ref.web_info_slogan_e && this.website_info_ref.web_info_slogan_l) {
        this.website_info_ref.web_info_slogan_e = this.website_info_ref.web_info_slogan_l;
      }
      if (!this.website_info_ref.web_info_faculty_e && this.website_info_ref.web_info_faculty_l) {
        this.website_info_ref.web_info_faculty_e = this.website_info_ref.web_info_faculty_l;
      }
      if (!this.website_info_ref.web_info_faculty_l && this.website_info_ref.web_info_faculty_e) {
        this.website_info_ref.web_info_faculty_l = this.website_info_ref.web_info_faculty_e;
      }
      this.website_info_ref.sort_order = +this.website_info_ref.sort_order;
      if (this.isCreate) {
        combineLatest([
          this.getEncodeFromImage(this.fu_web_info_logo_l),
          this.getEncodeFromImage(this.fu_web_info_logo_e)
        ]).subscribe((data: any[]): void => {
          this.website_info_ref.web_info_logo_l = data[0] == '' ? null : data[0];
          this.website_info_ref.web_info_logo_e = data[0] == '' ? null : data[0];
          this._apiService.post('/api/adapter/execute', { Method: { Method: 'POST' }, Url: '/api/website-info-ref/create-website-info-ref', Module: 'CMS', Data: JSON.stringify(this.website_info_ref) }).subscribe(res => {
            let item = this.copyProperty(res.data);
            let idx;
            if (this._storageService.getItem(SystemConstants.get('PREFIX_DATA_LANGUAGE')) == 'en') {
              item.web_info_slogan = item.web_info_slogan_e;
              item.web_info_faculty = item.web_info_faculty_e;
            } else {
              item.web_info_slogan = item.web_info_slogan_l;
              item.web_info_faculty = item.web_info_faculty_l;
            }
            if (this.data.length >= this.pageSize) {
              this.data.splice(this.data.length - 1, 1);
            }
            this.data.unshift(item);
            this.data = this.data.slice();
            this.totalRecords += 1;
            this.website_info_ref = new WebsiteInfoRef();
            this.fu_web_info_logo_l.fu.files = [];
            this.fu_web_info_logo_e.fu.files = [];
            this.resetUpdateForm();
            this._functionConstants.ShowNotification(ENotificationType.GREEN, res.messageCode);
            this.submitting = false;
          }, (error) => { this.submitting = false; });
        }, (error) => { this.submitting = false; });
      } else {
        combineLatest([
          this.getEncodeFromImage(this.fu_web_info_logo_l),
          this.getEncodeFromImage(this.fu_web_info_logo_e)
        ]).subscribe((data: any[]): void => {
          this.website_info_ref.web_info_logo_l = data[0] == '' ? this.website_info_ref.web_info_logo_l : data[0];
          this.website_info_ref.web_info_logo_e = data[0] == '' ? this.website_info_ref.web_info_logo_e : data[0];
          this._apiService.post('/api/adapter/execute', { Method: { Method: 'POST' }, Url: '/api/website-info-ref/update-website-info-ref', Module: 'CMS', Data: JSON.stringify(this.website_info_ref) }).subscribe(res => {
            let index = this.data.findIndex(ds => ds[this.dataKey] == this.website_info_ref[this.dataKey]);
            let item = this.copyProperty(res.data);
            let idx;
            if (this._storageService.getItem(SystemConstants.get('PREFIX_DATA_LANGUAGE')) == 'en') {
              item.web_info_slogan = item.web_info_slogan_e;
              item.web_info_faculty = item.web_info_faculty_e;
            } else {
              item.web_info_slogan = item.web_info_slogan_l;
              item.web_info_faculty = item.web_info_faculty_l;
            }
            this.data[index] = item;
            this.data = this.data.slice();
            this.closeUpdateForm(null);
            this._functionConstants.ShowNotification(ENotificationType.GREEN, res.messageCode);
            this.submitting = false;
          }, (error) => { this.submitting = false; });
        }, (error) => { this.submitting = false; });
      }
    }
  }

  public onRemove(items: any[]) {
    if (items.length > 0) {
      this._translateService.get('MESSAGE.confirm_delete').subscribe((message) => {
        this._confirmationService.confirm({
          message: message,
          accept: () => {
            let removeIds = [];
            items.forEach(ds => {
              if (!ds.must_not_change_flag) {
                removeIds.push(ds.web_info_rcd);
              }
            });
            if (removeIds.length > 0) {
              this._apiService.post('/api/adapter/execute', { Method: { Method: 'POST' }, Url: '/api/website-info-ref/delete-website-info-ref', Module: 'CMS', Data: JSON.stringify(removeIds) }).subscribe(res => {
                this.search();
                this.selectedDataTableItems = [];
                this._functionConstants.ShowNotification(ENotificationType.GREEN, res.messageCode);
              });
            }
          }
        });
      });
    }
  }

  public openUpdateModal(row) {
    this.doneSetupForm = false;
    this.showUpdateModal = true;
    setTimeout(() => {
      $('#updateWebsiteInfoRefModal').appendTo('body').modal('toggle');
    });
    setTimeout(() => {
      let arrRequest = this.getArrayRequest();
      arrRequest.push(this._apiService.post('/api/adapter/execute', { Method: { Method: 'GET' }, Url: '/api/website-info-ref/get-by-id/' + row.web_info_rcd, Module: 'CMS' }));
      Observable.combineLatest(arrRequest).subscribe((res: any) => {
        this.isCreate = false;
        this.website_info_ref = res[0].data;
        this.updateForm = new FormGroup({
          'web_info_rcd': new FormControl({ value: this.website_info_ref.web_info_rcd, disabled: true }, [Validators.required, Validators.maxLength(50)]),
          'web_info_logo_l': new FormControl(this.website_info_ref.web_info_logo_l, []),
          'web_info_logo_e': new FormControl(this.website_info_ref.web_info_logo_e, []),
          'web_info_slogan_l': new FormControl(this.website_info_ref.web_info_slogan_l, [Validators.maxLength(100)]),
          'web_info_slogan_e': new FormControl(this.website_info_ref.web_info_slogan_e, [Validators.maxLength(100)]),
          'web_info_faculty_e': new FormControl(this.website_info_ref.web_info_faculty_e, [Validators.maxLength(100)]),
          'web_info_faculty_l': new FormControl(this.website_info_ref.web_info_faculty_l, [Validators.maxLength(100)]),
          'web_info_address': new FormControl(this.website_info_ref.web_info_address, [Validators.maxLength(200)]),
          'web_info_email': new FormControl(this.website_info_ref.web_info_email, [Validators.maxLength(100), CustomEmailValidator]),
          'web_info_phone': new FormControl(this.website_info_ref.web_info_phone, [Validators.maxLength(20), Validators.pattern("^[0-9 _-]{10,12}")]),
          'web_info_website': new FormControl(this.website_info_ref.web_info_website, [Validators.maxLength(200)]),
          'web_info_facebook': new FormControl(this.website_info_ref.web_info_facebook, [Validators.maxLength(200)]),
          'web_info_zalo': new FormControl(this.website_info_ref.web_info_zalo, [Validators.maxLength(200)]),
          'web_info_youtube': new FormControl(this.website_info_ref.web_info_youtube, [Validators.maxLength(200)]),
          'sort_order': new FormControl(this.website_info_ref.sort_order, [Validators.pattern(/^-?(0|[1-9]\d*)?$/)]),
        });
        this.updateFormOriginalData = this.updateForm.getRawValue();
        this.doneSetupForm = true;
        setTimeout(() => {
          this._changeDetectorRef.detectChanges();
          this.setAutoFocus();
          this.updateValidator();
        });
      });
    }, 300);
  }

  public getArrayRequest() {
    let arrRequest = [];
    return arrRequest;
  }
}
