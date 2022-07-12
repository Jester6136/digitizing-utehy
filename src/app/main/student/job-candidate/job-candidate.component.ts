import { Component, Injector, OnInit, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ENotificationType, Grid, SystemConstants, CustomizeFileUpload } from 'core';
import { Observable } from 'rxjs';
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/operator/takeUntil';
import { WebsiteItemTypeRef } from '../../../main/entities/website-item-type-ref';
declare var $: any;

@Component({
  selector: 'app-job-candidate',
  templateUrl: './job-candidate.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class JobCandidateComponent extends Grid implements OnInit {

  public isCreate = false;
  public website_item_type_ref: WebsiteItemTypeRef;
  public constructor(injector: Injector) {
    super(injector);
    this.LZCompress = true; // using LZString compress data
    this.loadBalancing = true;
    this.APIModuleName = 'STUDENT';
    this.getListByIdApiUrl = '/api/website-item-type-ref/get-list-by-id/';
    this.searchApiUrl = '/api/job-candidate/search';
    this.exportUrl = '/api/website-item-type-ref/export-to-excel';
    this.exportFilename = 'list_website_item_type_ref.xlsx';
    this.setNullIfEmpty = [];
    this.filterFields = ['item_type_rcd', 'item_type_name', 'item_type_size', 'sort_order', 'item_type_description'];
    this.dataKey = 'item_type_rcd';
    this.searchValue.page = this.page;
    this.searchValue.pageSize = this.pageSize;
    this.searchFormGroup = new FormGroup({
      'recruitment_job': new FormControl(''),
    });
    this.hasViewPermission = this._authenService.hasPermission(this.pageId, 'view_website_item_type_ref');
    this.hasCreatePermission = this._authenService.hasPermission(this.pageId, 'create_website_item_type_ref');
    this.hasUpdatePermission = this._authenService.hasPermission(this.pageId, 'update_website_item_type_ref');
    this.hasDeletePermission = this._authenService.hasPermission(this.pageId, 'delete_website_item_type_ref');
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
    this.website_item_type_ref = new WebsiteItemTypeRef();
    this.loadDropdowns();
  }

  public openCreateModal(row: any = null) {
    this.doneSetupForm = false;
    this.showUpdateModal = true;
    setTimeout(() => {
      $('#updateWebsiteItemTypeRefModal').appendTo('body').modal('toggle');
    });
    setTimeout(() => {
      this.website_item_type_ref = new WebsiteItemTypeRef();
      this.isCreate = true;
      this.updateForm = new FormGroup({
        'item_type_rcd': new FormControl('', [Validators.required, Validators.maxLength(50)]),
        'item_type_icon': new FormControl('', [Validators.maxLength(100)]),
        'item_type_name_l': new FormControl('', [Validators.required, Validators.maxLength(100)]),
        'item_type_name_e': new FormControl('', [Validators.required, Validators.maxLength(100)]),
        'item_type_size': new FormControl('', [Validators.pattern(/^-?(0|[1-9]\d*)?$/)]),
        'sort_order': new FormControl('', [Validators.pattern(/^-?(0|[1-9]\d*)?$/)]),
        'item_type_description_l': new FormControl('', [Validators.maxLength(1000)]),
        'item_type_description_e': new FormControl('', [Validators.maxLength(1000)]),
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
    this.updateForm.get('item_type_name_l').valueChanges.subscribe((value: string) => {
      if (!value || value.trim() == '') {
        this.updateForm.get('item_type_name_e').setValidators([Validators.required, Validators.maxLength(100)]);
      } else {
        this.updateForm.get('item_type_name_e').setValidators([Validators.maxLength(100)]);
      }
      this.updateForm.get('item_type_name_e').updateValueAndValidity({ onlySelf: true, emitEvent: false });
    });
    this.updateForm.get('item_type_name_e').valueChanges.subscribe((value: string) => {
      if (!value || value.trim() == '') {
        this.updateForm.get('item_type_name_l').setValidators([Validators.required, Validators.maxLength(100)]);
      } else {
        this.updateForm.get('item_type_name_l').setValidators([Validators.maxLength(100)]);
      }
      this.updateForm.get('item_type_name_l').updateValueAndValidity({ onlySelf: true, emitEvent: false });
    });
  }

  public onSubmit() {
    if (this.submitting == false) {
      this.submitting = true;
      if (!this.website_item_type_ref.item_type_name_l && this.website_item_type_ref.item_type_name_e) {
        this.website_item_type_ref.item_type_name_l = this.website_item_type_ref.item_type_name_e;
      }
      if (!this.website_item_type_ref.item_type_name_e && this.website_item_type_ref.item_type_name_l) {
        this.website_item_type_ref.item_type_name_e = this.website_item_type_ref.item_type_name_l;
      }
      this.website_item_type_ref.item_type_size = +this.website_item_type_ref.item_type_size;
      this.website_item_type_ref.sort_order = +this.website_item_type_ref.sort_order;
      if (!this.website_item_type_ref.item_type_description_l && this.website_item_type_ref.item_type_description_e) {
        this.website_item_type_ref.item_type_description_l = this.website_item_type_ref.item_type_description_e;
      }
      if (!this.website_item_type_ref.item_type_description_e && this.website_item_type_ref.item_type_description_l) {
        this.website_item_type_ref.item_type_description_e = this.website_item_type_ref.item_type_description_l;
      }
      if (this.isCreate) {
        this._apiService.post('/api/adapter/execute', { Method: { Method: 'POST' }, Url: '/api/website-item-type-ref/create-website-item-type-ref', Module: 'CMS', Data: JSON.stringify(this.website_item_type_ref) }).subscribe(res => {
          let item = this.copyProperty(res.data);
          let idx;
          if (this._storageService.getItem(SystemConstants.get('PREFIX_DATA_LANGUAGE')) == 'en') {
            item.item_type_name = item.item_type_name_e;
            item.item_type_description = item.item_type_description_e;
          } else {
            item.item_type_name = item.item_type_name_l;
            item.item_type_description = item.item_type_description_l;
          }
          if (this.data.length >= this.pageSize) {
            this.data.splice(this.data.length - 1, 1);
          }
          this.data.unshift(item);
          this.data = this.data.slice();
          this.totalRecords += 1;
          this.website_item_type_ref = new WebsiteItemTypeRef();
          this.resetUpdateForm();
          this._functionConstants.ShowNotification(ENotificationType.GREEN, res.messageCode);
          this.submitting = false;
        }, (error) => { this.submitting = false; });
      } else {
        this._apiService.post('/api/adapter/execute', { Method: { Method: 'POST' }, Url: '/api/website-item-type-ref/update-website-item-type-ref', Module: 'CMS', Data: JSON.stringify(this.website_item_type_ref) }).subscribe(res => {
          let index = this.data.findIndex(ds => ds[this.dataKey] == this.website_item_type_ref[this.dataKey]);
          let item = this.copyProperty(res.data);
          let idx;
          if (this._storageService.getItem(SystemConstants.get('PREFIX_DATA_LANGUAGE')) == 'en') {
            item.item_type_name = item.item_type_name_e;
            item.item_type_description = item.item_type_description_e;
          } else {
            item.item_type_name = item.item_type_name_l;
            item.item_type_description = item.item_type_description_l;
          }
          this.data[index] = item;
          this.data = this.data.slice();
          this.closeUpdateForm(null);
          this._functionConstants.ShowNotification(ENotificationType.GREEN, res.messageCode);
          this.submitting = false;
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
                removeIds.push(ds.item_type_rcd);
              }
            });
            if (removeIds.length > 0) {
              this._apiService.post('/api/adapter/execute', { Method: { Method: 'POST' }, Url: '/api/website-item-type-ref/delete-website-item-type-ref', Module: 'CMS', Data: JSON.stringify(removeIds) }).subscribe(res => {
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
      $('#updateWebsiteItemTypeRefModal').appendTo('body').modal('toggle');
    });
    setTimeout(() => {
      let arrRequest = this.getArrayRequest();
      arrRequest.push(this._apiService.post('/api/adapter/execute', { Method: { Method: 'GET' }, Url: '/api/website-item-type-ref/get-by-id/' + row.item_type_rcd, Module: 'CMS' }));
      Observable.combineLatest(arrRequest).subscribe((res: any) => {
        this.isCreate = false;
        this.website_item_type_ref = res[0].data;
        this.updateForm = new FormGroup({
          'item_type_rcd': new FormControl({ value: this.website_item_type_ref.item_type_rcd, disabled: true }, [Validators.required, Validators.maxLength(50)]),
          'item_type_icon': new FormControl(this.website_item_type_ref.item_type_icon, [Validators.maxLength(100)]),
          'item_type_name_l': new FormControl(this.website_item_type_ref.item_type_name_l, [Validators.required, Validators.maxLength(100)]),
          'item_type_name_e': new FormControl(this.website_item_type_ref.item_type_name_e, [Validators.required, Validators.maxLength(100)]),
          'item_type_size': new FormControl(this.website_item_type_ref.item_type_size, [Validators.pattern(/^-?(0|[1-9]\d*)?$/)]),
          'sort_order': new FormControl(this.website_item_type_ref.sort_order, [Validators.pattern(/^-?(0|[1-9]\d*)?$/)]),
          'item_type_description_l': new FormControl(this.website_item_type_ref.item_type_description_l, [Validators.maxLength(1000)]),
          'item_type_description_e': new FormControl(this.website_item_type_ref.item_type_description_e, [Validators.maxLength(1000)]),
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
