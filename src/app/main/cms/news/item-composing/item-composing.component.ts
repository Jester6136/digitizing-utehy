import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ENotificationType, Grid, SystemConstants, CustomizeFileUpload } from 'core';
import { Observable } from 'rxjs';
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/operator/takeUntil';
import { Item } from '../../../entities/item';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { UploadDownloadService } from '../../../services/upload-download.service';
declare var $: any;

@Component({
  selector: 'app-item-composing',
  templateUrl: './item-composing.component.html'
})
export class ItemComposingComponent extends Grid implements OnInit {
  public auto_fill = false;
  public isCreate = false;
  public item: Item;
  public selectedItemGroup: any;
  public selectedItemGroupSearch: any;
  public item_groups: any;
  public selectedItemStatusRef: any;
  public selectedItemTypeRef: any;
  public item_status_refs: any;
  public item_type_refs: any;
  public selectedType: any;
  public progress: number;
  public is_upload_success: boolean;
  public hasSearchAllPermission: boolean;
  public urls = [];
  public is_upload: boolean;
  public host_image: any;
  public published_date_time: any;

  @ViewChild('ckeditor_e', { static: false}) ckeditor_e: any;
  @ViewChild('ckeditor_l', { static: false}) ckeditor_l: any;
  @ViewChild(CustomizeFileUpload, {static: false}) file_title_image: CustomizeFileUpload;
  public constructor(injector: Injector, private http: HttpClient, private service: UploadDownloadService) {
    super(injector);
    this.ckeditorConfig();
    this.host_image = SystemConstants.IMAGE_API + '/';
    this.LZCompress = true; // using LZString compress data
    this.loadBalancing = true;
    this.APIModuleName = 'CMS';
    this.searchApiUrl = '/api/item/search';
    this.filterFields = ['title', 'item_group_name'];
    this.dataKey = 'item_id';
    this.searchValue.page = this.page;
    this.searchValue.pageSize = this.pageSize;
    this.searchFormGroup = new FormGroup({
      'item_group_id': new FormControl(''),
      'content_search': new FormControl(''),
      'fr_created_date_time': new FormControl(''),
      'to_created_date_time': new FormControl(''),
      'item_status_rcd': new FormControl(''),
      'search_all': new FormControl(''),
    });
    this.selectedType = 2;
    this.hasSearchAllPermission = this._authenService.hasPermission(this.pageId, 'search_item_temp_all');
    this.hasViewPermission = this._authenService.hasPermission(this.pageId, 'view_item_temp');
    this.hasCreatePermission = this._authenService.hasPermission(this.pageId, 'create_item');
    this.hasUpdatePermission = this._authenService.hasPermission(this.pageId, 'update_item');
    this.hasDeletePermission = this._authenService.hasPermission(this.pageId, 'delete_item');
    if (this.hasSearchAllPermission) {
      this.searchFormGroup.get('search_all').setValue('1');
    } else {
      this.searchFormGroup.get('search_all').setValue('0');
    }
    this.tableActions = [];
    if (this.hasDeletePermission) {
      this._translateService.get('COMMON.delete').subscribe((message) => {
        this.tableActions.push({ label: message, icon: 'fa-close', command: () => { this.onRemove(this.selectedDataTableItems); } });
      });
    }
    this.predicateBeforeSearch = () => {
      let first = new Date();
      first.setDate(1);
      if (!this.searchFormGroup.get('fr_created_date_time').value || this.searchFormGroup.get('fr_created_date_time').value == '') {
        this.searchFormGroup.controls['fr_created_date_time'].setValue(first);
      }
      if (!this.searchFormGroup.get('to_created_date_time').value || this.searchFormGroup.get('to_created_date_time').value == '') {
        this.searchFormGroup.controls['to_created_date_time'].setValue(this.today);
      }
      this.searchFormGroup.get('item_status_rcd').setValue('TEM');
      this.searchFormGroup.get('item_group_id').setValue(this.selectedItemGroupSearch);
    };
  }

  public uploadFileWord = (files) => {
    if (files.length === 0) {
      return;
    }
    let fileToUpload = <File>files[0];
    const formData = new FormData();
    let host = SystemConstants.BASE_API;
    formData.append('file', fileToUpload, fileToUpload.name);
    this._loaderService.show();
    this.is_upload_success = false;
    this.progress = 0;
    this.http.post(host + '/api/system/upload-word', formData, {reportProgress: true, observe: 'events'})
      .subscribe((event: any) => {
        if (event && event.type === HttpEventType.UploadProgress) {
          this.progress = Math.round(100 * event.loaded / event.total);
        } else if (event && event.type === HttpEventType.Response) {
          this.is_upload_success = true;
          this.is_upload = true;
          this.item.item_detail_l =  this.item.item_detail_e  =  event.body.html;
          this._loaderService.hide();
        }
      });
  }

  public insertImage(url) {
    if (this.local_flag) {
      let link = this.ckeditor_l.instance.document.createElement('img');
      link.setAttribute('width', '100%');
      link.setAttribute('height', '100%');
      link.setAttribute('alt', 'Image');
      link.setAttribute('src', SystemConstants.IMAGE_API + '/' + url);
      this.ckeditor_l.instance.insertElement(link);
    } else {
      let link = this.ckeditor_e.instance.document.createElement('img');
      link.setAttribute('width', '100%');
      link.setAttribute('height', '100%');
      link.setAttribute('alt', 'Image');
      link.setAttribute('src', SystemConstants.IMAGE_API + '/' + url);
      this.ckeditor_e.instance.insertElement(link);
    }
  }

  public uploadFilePdf = (files) => {
    if (files.length === 0) {
      return;
    }
    let fileToUpload = <File>files[0];
    const formData = new FormData();
    let host = SystemConstants.BASE_API;
    formData.append('file', fileToUpload);
    formData.append('id', this.item.item_id);
    formData.append('category', 'news');
    this._loaderService.show();
    this.is_upload_success = false;
    this.progress = 0;
    this.http.post(host + '/api/system/upload-pdf', formData, {reportProgress: true, observe: 'events'})
      .subscribe((event: any) => {
        if (event && event.type === HttpEventType.UploadProgress) {
          this.progress = Math.round(100 * event.loaded / event.total);
        } else if (event && event.type === HttpEventType.Response) {
          this.is_upload_success = true;
          this.is_upload = true;
          this.item.item_detail_l =  this.item.item_detail_e  = `<object id="objPDF" data="${ SystemConstants.IMAGE_API + '/' + event.body.filePath }" type="application/pdf" style="width:100%; height:520px; margin:0px 0px 0px 0px; padding:0px 0px 0px 0px;"></object>`;
          this._loaderService.hide();
        }
      });
  }

  public loadDropdowns() {
    Observable.combineLatest(
      this._apiService.post('/api/adapter/execute', { Method: { Method: 'GET' }, Url: '/api/item-group/get-dropdown/', Module: 'CMS' }),
      this._apiService.post('/api/adapter/execute', { Method: { Method: 'GET' }, Url: '/api/website-item-status-ref/get-dropdown/', Module: 'CMS' }),
      this._apiService.post('/api/adapter/execute', { Method: { Method: 'GET' }, Url: '/api/website-item-type-ref/get-dropdown/', Module: 'CMS' }),
    ).takeUntil(this.unsubscribe).subscribe(res => {
      this.item_groups = null;
      this.item_status_refs = null;
      this.item_type_refs = null;
      setTimeout(() => {
        this.item_groups = this.item_groups || res[0].data;
        this.item_status_refs = this.item_status_refs || res[1].data;
        this.item_type_refs = this.item_type_refs || res[2].data;
        this.search();
      });
    });
  }

  public ngOnInit() {
    this.item = new Item();
    this.loadDropdowns();
  }

  public openCreateModal() {
    this.doneSetupForm = false;
    this.showUpdateModal = true;
    this.is_upload = false;
    this.is_upload_success = false;
    this.progress = 0;
    this.published_date_time = this.today;

    setTimeout(() => {
      $('#updateItemModal').appendTo('body').modal('toggle');
    });
    setTimeout(() => {
      this.item = new Item();
      this.item.item_id = this.Guid.newGuid();
      this.isCreate = true;
      this.selectedItemStatusRef = this.item_status_refs[0].value;
      this.updateForm = new FormGroup({
        'item_group_id': new FormControl('', [Validators.required]),
        'title_e': new FormControl('', [Validators.maxLength(500)]),
        'title_l': new FormControl('', [Validators.required, Validators.maxLength(500)]),
        'sub_title_e': new FormControl('', [Validators.maxLength(1500)]),
        'sub_title_l': new FormControl('', [Validators.required, Validators.maxLength(1500)]),
        'detail_l': new FormControl(''),
        'detail_e': new FormControl(''),
        'type': new FormControl(''),
        'auto_fill': new FormControl(''),
        'file_title_image': new FormControl(''),
        'item_status_rcd': new FormControl('', [Validators.required]),
        'item_type_rcd': new FormControl('', [Validators.required]),
        'published_date_time': new FormControl(''),
      });
      this.updateFormOriginalData = this.updateForm.getRawValue();
      this.doneSetupForm = true;
      this.selectedItemTypeRef = 'TTT';
      setTimeout(() => {
        this.setAutoFocus();
        this.updateValidator();
      });
    }, 700);
  }

  public updateValidator() {
    this.updateForm.get('sub_title_e').valueChanges.takeUntil(this.unsubscribe).subscribe((value: string) => {
      if (!value || value.trim() == '') {
        this.updateForm.get('sub_title_l').setValidators([Validators.required, Validators.maxLength(1500)]);
      } else {
        this.updateForm.get('sub_title_l').setValidators([Validators.maxLength(1500)]);
      }
      this.updateForm.get('sub_title_l').updateValueAndValidity({ onlySelf: true, emitEvent: false });
    });
    this.updateForm.get('sub_title_l').valueChanges.takeUntil(this.unsubscribe).subscribe((value: string) => {
      if (!value || value.trim() == '') {
        this.updateForm.get('sub_title_e').setValidators([Validators.required, Validators.maxLength(1500)]);
      } else {
        this.updateForm.get('sub_title_e').setValidators([Validators.maxLength(1500)]);
      }
      this.updateForm.get('sub_title_e').updateValueAndValidity({ onlySelf: true, emitEvent: false });
    });
    this.updateForm.get('title_e').valueChanges.takeUntil(this.unsubscribe).subscribe((value: string) => {
      if (!value || value.trim() == '') {
        this.updateForm.get('title_l').setValidators([Validators.required, Validators.maxLength(500)]);
      } else {
        this.updateForm.get('title_l').setValidators([Validators.maxLength(500)]);
      }
      this.updateForm.get('title_l').updateValueAndValidity({ onlySelf: true, emitEvent: false });
    });
    this.updateForm.get('title_l').valueChanges.takeUntil(this.unsubscribe).subscribe((value: string) => {
      if (!value || value.trim() == '') {
        this.updateForm.get('title_e').setValidators([Validators.required, Validators.maxLength(500)]);
      } else {
        this.updateForm.get('title_e').setValidators([Validators.maxLength(500)]);
      }
      this.updateForm.get('title_e').updateValueAndValidity({ onlySelf: true, emitEvent: false });
    });
  }

  public onSubmit() {
    if (this.submitting == false) {
      this.submitting = true;
      if (!this.item.item_detail_e && this.item.item_detail_l && this.auto_fill) {
        this.item.item_detail_e = this.item.item_detail_l;
      }
      if (this.item.item_detail_e && !this.item.item_detail_l && this.auto_fill) {
        this.item.item_detail_l = this.item.item_detail_e;
      }
      if (!this.item.item_title_e && this.item.item_title_l && this.auto_fill) {
        this.item.item_title_e = this.item.item_title_l;
      }
      if (this.item.item_title_e && !this.item.item_title_l && this.auto_fill) {
        this.item.item_title_l = this.item.item_title_e;
      }
      if (!this.item.item_sub_title_l && this.item.item_sub_title_e && this.auto_fill) {
        this.item.item_sub_title_l = this.item.item_sub_title_e;
      }
      if (this.item.item_sub_title_l && !this.item.item_sub_title_e && this.auto_fill) {
        this.item.item_sub_title_e = this.item.item_sub_title_l;
      }
      this.item.item_group_id = this.selectedItemGroup;
      this.item.item_status_rcd = this.selectedItemStatusRef;
      this.item.item_type_rcd = this.selectedItemTypeRef;
      this.item.published_date_time = this.published_date_time;

      this.item.item_detail_e = this.replaceAll(this.item.item_detail_e, SystemConstants.IMAGE_API + '/upload/news/image_detail', 'upload/news/image_detail');
      this.item.item_detail_l = this.replaceAll(this.item.item_detail_l, SystemConstants.IMAGE_API + '/upload/news/image_detail', 'upload/news/image_detail');
      this.item.item_detail_e = this.replaceAll(this.item.item_detail_e, SystemConstants.IMAGE_API + '/upload/news/pdf', 'upload/news/pdf');
      this.item.item_detail_l = this.replaceAll(this.item.item_detail_l, SystemConstants.IMAGE_API + '/upload/news/pdf', 'upload/news/pdf');
      if (this.isCreate) {
        Observable.combineLatest(
          this.getEncodeFromImage(this.file_title_image)
        ).takeUntil(this.unsubscribe).subscribe((data: any[]): void => {
          this.item.image_url = data[0] == '' ? null : data[0];
          this._apiService.post('/api/adapter/execute', { Method: { Method: 'POST' }, Url: '/api/item/create-item', Module: 'CMS', Data: JSON.stringify(this.item) }).takeUntil(this.unsubscribe).subscribe(res => {
            let item = this.copyProperty(res.data);
            let idx;
            idx = this.item_groups.findIndex(ds => ds.value == item.item_group_id);
            if (idx > -1) {
              item.item_group_name = this.item_groups[idx].label;
            }
            if (this._storageService.getItem(SystemConstants.get('PREFIX_DATA_LANGUAGE')) == 'en') {
              item.item_title = item.item_title_e;
            } else {
              item.item_title = item.item_title_l;
            }
            if (this.data.length >= this.pageSize) {
              this.data.splice(this.data.length - 1, 1);
            }
            this.data.unshift(item);
            this.data = this.data.slice();
            this.totalRecords += 1;
            this.item = new Item();
            this.resetUpdateForm();
            this._functionConstants.ShowNotification(ENotificationType.GREEN, res.messageCode);
            this.submitting = false;
          }, () => { this.submitting = false; });
        }, (error) => { this.submitting = false; });
      } else {
        Observable.combineLatest(
          this.getEncodeFromImage(this.file_title_image)
        ).takeUntil(this.unsubscribe).subscribe((data: any[]): void => {
          this.item.image_url = data[0] == '' ? this.item.image_url : data[0];
            this._apiService.post('/api/adapter/execute', { Method: { Method: 'POST' }, Url: '/api/item/update-item', Module: 'CMS', Data: JSON.stringify(this.item) }).takeUntil(this.unsubscribe).subscribe(res => {
            let index = this.data.findIndex(ds => ds[this.dataKey] == this.item[this.dataKey]);
            let item = this.copyProperty(res.data);
            if (item.item_status_rcd != 'TEM') {
              this.searchFormGroup.get('item_group_id').setValue(this.selectedItemGroupSearch);
              this.search();
            } else {
              let idx;
              idx = this.item_groups.findIndex(ds => ds.value == item.item_group_id);
              if (idx > -1) {
                item.item_group_name = this.item_groups[idx].label;
              }
              if (this._storageService.getItem(SystemConstants.get('PREFIX_DATA_LANGUAGE')) == 'en') {
                item.item_title = item.item_title_e;
              } else {
                item.item_title = item.item_title_l;
              }
              this.data[index] = item;
              this.data = this.data.slice();
            }
            this.closeUpdateForm(null);
            this._functionConstants.ShowNotification(ENotificationType.GREEN, res.messageCode);
            this.submitting = false;
          }, () => { this.submitting = false; });
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
              removeIds.push(ds.item_id);
            });
            if (removeIds.length > 0) {
              this._apiService.post('/api/adapter/execute', { Method: { Method: 'POST' }, Url: '/api/item/delete-item', Module: 'CMS', Data: JSON.stringify(removeIds) }).takeUntil(this.unsubscribe).subscribe(res => {
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
    this.is_upload_success = false;
    this.published_date_time = this.today;
    this.progress = 0;
    setTimeout(() => {
      $('#updateItemModal').appendTo('body').modal('toggle');
    });
    setTimeout(() => {
      let arrRequest = this.getArrayRequest();
      arrRequest.push(this._apiService.post('/api/adapter/execute', { Method: { Method: 'GET' }, Url: '/api/item/get-by-id/' + row.item_id, Module: 'CMS' }));
      Observable.combineLatest(arrRequest).takeUntil(this.unsubscribe).subscribe((res: any)  => {
        this.isCreate = false;
        this.item = res[0].data;
        this.item.item_detail_e = this.replaceAll(this.item.item_detail_e, 'upload/news/image_detail', SystemConstants.IMAGE_API + '/upload/news/image_detail');
        this.item.item_detail_l = this.replaceAll(this.item.item_detail_l, 'upload/news/image_detail', SystemConstants.IMAGE_API + '/upload/news/image_detail');
        this.item.item_detail_e = this.replaceAll(this.item.item_detail_e, 'upload/news/pdf', SystemConstants.IMAGE_API + '/upload/news/pdf');
        this.item.item_detail_l = this.replaceAll(this.item.item_detail_l, 'upload/news/pdf', SystemConstants.IMAGE_API + '/upload/news/pdf');
        this.updateForm = new FormGroup({
          'item_group_id': new FormControl('', [Validators.required]),
          'title_e': new FormControl('', [Validators.maxLength(500)]),
          'title_l': new FormControl('', [Validators.required, Validators.maxLength(500)]),
          'sub_title_e': new FormControl('', [Validators.maxLength(1500)]),
          'sub_title_l': new FormControl('', [Validators.required, Validators.maxLength(1500)]),
          'detail_l': new FormControl(''),
          'detail_e': new FormControl(''),
          'type': new FormControl(''),
          'auto_fill': new FormControl(''),
          'file_title_image': new FormControl(''),
          'item_status_rcd': new FormControl('', [Validators.required]),
          'item_type_rcd': new FormControl('', [Validators.required]),
          'published_date_time': new FormControl(''),
        });
        this.updateFormOriginalData = this.updateForm.getRawValue();
        this.doneSetupForm = true;
        if (this.item) {
          this.selectedItemGroup = this.item.item_group_id;
          this.selectedItemStatusRef = this.item.item_status_rcd;
          this.selectedItemTypeRef = this.item.item_type_rcd;
        }
        setTimeout(() => {
          this.setAutoFocus();
          this.updateValidator();
        });
      });
    }, 700);
  }

  public openViewUpdateModal(row) {
    this.doneSetupForm = false;
    setTimeout(() => {
      $('#updateViewItemModal').appendTo('body').modal('toggle');
    });
    setTimeout(() => {
      let arrRequest = this.getArrayRequest();
      arrRequest.push(this._apiService.post('/api/adapter/execute', { Method: { Method: 'GET' }, Url: '/api/item/get-by-id/' + row.item_id, Module: 'CMS' }));
      Observable.combineLatest(arrRequest).takeUntil(this.unsubscribe).subscribe((res: any)  => {
        this.isCreate = false;
        this.item = res[0].data;
        if (this._storageService.getItem(SystemConstants.get('PREFIX_DATA_LANGUAGE')) == 'en') {
          this.item.item_title = this.item.item_title_e;
        } else {
          this.item.item_title = this.item.item_title_l;
        }
        if (this._storageService.getItem(SystemConstants.get('PREFIX_DATA_LANGUAGE')) == 'en') {
          this.item.item_sub_title = this.item.item_sub_title_e;
        } else {
          this.item.item_sub_title = this.item.item_sub_title_l;
        }
        if (this._storageService.getItem(SystemConstants.get('PREFIX_DATA_LANGUAGE')) == 'en') {
          this.item.item_detail = this.item.item_detail_e;
          this.item.item_detail = this.replaceAll(this.item.item_detail, 'upload/news/image_detail', SystemConstants.IMAGE_API + '/upload/news/image_detail');
          this.item.item_detail = this.replaceAll(this.item.item_detail, 'upload/news/pdf', SystemConstants.IMAGE_API + '/upload/news/pdf');
        } else {
          this.item.item_detail = this.item.item_detail_l;
          this.item.item_detail = this.replaceAll(this.item.item_detail, 'upload/news/image_detail', SystemConstants.IMAGE_API + '/upload/news/image_detail');
          this.item.item_detail = this.replaceAll(this.item.item_detail, 'upload/news/pdf', SystemConstants.IMAGE_API + '/upload/news/pdf');
        }
        this.doneSetupForm = true;
      });
    }, 700);
  }

  public getArrayRequest() {
    let arrRequest = [];
    return arrRequest;
  }
}
