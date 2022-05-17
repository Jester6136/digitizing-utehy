import { Component, Injector, OnInit, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ENotificationType, Grid, SystemConstants, CustomizeFileUpload } from 'core';
import { Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as FileSaver from 'file-saver';
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/operator/takeUntil';
import { WebsiteImage } from '../../../../main/entities/website-image';
declare var $: any;

@Component({
  selector: 'app-website-image',
  templateUrl: './website-image.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WebsiteImageComponent extends Grid implements OnInit {

  public isCreate = false;
  public host_image: any;
  public website_image: WebsiteImage;
  @ViewChild(CustomizeFileUpload, { static: false }) fu_image_src: CustomizeFileUpload;

  public constructor(injector: Injector) {
    super(injector);
    this.host_image = SystemConstants.IMAGE_API + '/';
    this.LZCompress = true; // using LZString compress data
    this.loadBalancing = true;
    this.APIModuleName = 'CMS';
    this.getListByIdApiUrl = '/api/website-image/get-list-by-id/';
    this.searchApiUrl = '/api/website-image/search';
    this.exportUrl = '/api/website-image/export-to-excel';
    this.exportFilename = 'list_website_image.xlsx';
    this.setNullIfEmpty = [];
    this.filterFields = ['image_name', 'image_src', 'sort_order', 'type'];
    this.dataKey = 'image_id';
    this.searchValue.page = this.page;
    this.searchValue.pageSize = this.pageSize;
    this.searchFormGroup = new FormGroup({
      'image_name': new FormControl(''),
    });
    this.hasViewPermission = this._authenService.hasPermission(this.pageId, 'view_website_image');
    this.hasCreatePermission = this._authenService.hasPermission(this.pageId, 'create_website_image');
    this.hasUpdatePermission = this._authenService.hasPermission(this.pageId, 'update_website_image');
    this.hasDeletePermission = this._authenService.hasPermission(this.pageId, 'delete_website_image');
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
    this.website_image = new WebsiteImage();
    this.loadDropdowns();
  }

  public openCreateModal(row: any = null) {
    this.doneSetupForm = false;
    this.showUpdateModal = true;
    setTimeout(() => {
      $('#updateWebsiteImageModal').appendTo('body').modal('toggle');
    });
    setTimeout(() => {
      this.website_image = new WebsiteImage();
      this.isCreate = true;
      this.updateForm = new FormGroup({
        'is_show': new FormControl(false, [Validators.required]),
        'image_name': new FormControl('', [Validators.maxLength(150)]),
        'image_src': new FormControl('', [Validators.required, Validators.maxLength(200)]),
        'sort_order': new FormControl('', [Validators.pattern(/^-?(0|[1-9]\d*)?$/)]),
        'type': new FormControl('', [Validators.required, Validators.pattern(/^-?(0|[1-9]\d*)?$/)]),
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
      this.website_image.sort_order = +this.website_image.sort_order;
      this.website_image.type = +this.website_image.type;
      if (this.isCreate) {
        Observable.combineLatest(
          this.getEncodeFromImage(this.fu_image_src)
        ).subscribe((data: any[]): void => {
          this.website_image.image_src = data[0] == '' ? null : data[0];
          this._apiService.post('/api/adapter/execute', { Method: { Method: 'POST' }, Url: '/api/website-image/create-website-image', Module: 'CMS', Data: JSON.stringify(this.website_image) }).subscribe(res => {
            let item = this.copyProperty(res.data);
            let idx;
            if (this._storageService.getItem(SystemConstants.get('PREFIX_DATA_LANGUAGE')) == 'en') {
            } else {
            }
            if (this.data.length >= this.pageSize) {
              this.data.splice(this.data.length - 1, 1);
            }
            this.data.unshift(item);
            this.data = this.data.slice();
            this.totalRecords += 1;
            this.website_image = new WebsiteImage();
            this.fu_image_src.fu.files = [];
            this.resetUpdateForm();
            this._functionConstants.ShowNotification(ENotificationType.GREEN, res.messageCode);
            this.submitting = false;
          }, (error) => { this.submitting = false; });
        }, (error) => { this.submitting = false; });
      } else {
        Observable.combineLatest(
          this.getEncodeFromImage(this.fu_image_src)
        ).subscribe((data: any[]): void => {
          this.website_image.image_src = data[0] == '' ? this.website_image.image_src : data[0];
          this._apiService.post('/api/adapter/execute', { Method: { Method: 'POST' }, Url: '/api/website-image/update-website-image', Module: 'CMS', Data: JSON.stringify(this.website_image) }).subscribe(res => {
            let index = this.data.findIndex(ds => ds[this.dataKey] == this.website_image[this.dataKey]);
            let item = this.copyProperty(res.data);
            let idx;
            if (this._storageService.getItem(SystemConstants.get('PREFIX_DATA_LANGUAGE')) == 'en') {
            } else {
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
                removeIds.push(ds.image_id);
              }
            });
            if (removeIds.length > 0) {
              this._apiService.post('/api/adapter/execute', { Method: { Method: 'POST' }, Url: '/api/website-image/delete-website-image', Module: 'CMS', Data: JSON.stringify(removeIds) }).subscribe(res => {
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
      $('#updateWebsiteImageModal').appendTo('body').modal('toggle');
    });
    setTimeout(() => {
      let arrRequest = this.getArrayRequest();
      arrRequest.push(this._apiService.post('/api/adapter/execute', { Method: { Method: 'GET' }, Url: '/api/website-image/get-by-id/' + row.image_id, Module: 'CMS' }));
      Observable.combineLatest(arrRequest).subscribe((res: any) => {
        this.isCreate = false;
        this.website_image = res[0].data;
        this.updateForm = new FormGroup({
          'is_show': new FormControl(this.website_image.is_show, [Validators.required]),
          'image_name': new FormControl(this.website_image.image_name, [Validators.maxLength(150)]),
          'image_src': new FormControl(this.website_image.image_src, [Validators.required, Validators.maxLength(200)]),
          'sort_order': new FormControl(this.website_image.sort_order, [Validators.pattern(/^-?(0|[1-9]\d*)?$/)]),
          'type': new FormControl(this.website_image.type, [Validators.required, Validators.pattern(/^-?(0|[1-9]\d*)?$/)]),
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
