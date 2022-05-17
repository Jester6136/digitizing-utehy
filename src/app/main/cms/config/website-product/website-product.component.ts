import { Component, Injector, OnInit, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ENotificationType, Grid, SystemConstants, CustomizeFileUpload } from 'core';
import { Observable } from 'rxjs';
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/operator/takeUntil';
import { WebsiteProduct } from '../../../../main/entities/website-product';
declare var $: any;

@Component({
  selector: 'app-website-product',
  templateUrl: './website-product.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WebsiteProductComponent extends Grid implements OnInit {
  public host_image: any;
  public isCreate = false;
  public website_product: WebsiteProduct;
  @ViewChild(CustomizeFileUpload, { static: false }) fu_product_image: CustomizeFileUpload;
  @ViewChild('ckeditor_e', { static: false }) ckeditor_e: any;
  @ViewChild('ckeditor_l', { static: false }) ckeditor_l: any;
  public constructor(injector: Injector) {
    super(injector);
    this.LZCompress = true; // using LZString compress data
    this.loadBalancing = true;
    this.host_image = SystemConstants.IMAGE_API + '/';
    this.APIModuleName = 'CMS';
    this.ckeditorConfig();
    this.getListByIdApiUrl = '/api/website-product/get-list-by-id/';
    this.searchApiUrl = '/api/website-product/search';
    this.exportUrl = '/api/website-product/export-to-excel';
    this.exportFilename = 'list_website_product.xlsx';
    this.setNullIfEmpty = [];
    this.filterFields = ['product_name', 'product_link', 'sort_order'];
    this.dataKey = 'product_id';
    this.searchValue.page = this.page;
    this.searchValue.pageSize = this.pageSize;
    this.searchFormGroup = new FormGroup({
      'product_name': new FormControl(''),
    });
    this.hasViewPermission = this._authenService.hasPermission(this.pageId, 'view_website_product');
    this.hasCreatePermission = this._authenService.hasPermission(this.pageId, 'create_website_product');
    this.hasUpdatePermission = this._authenService.hasPermission(this.pageId, 'update_website_product');
    this.hasDeletePermission = this._authenService.hasPermission(this.pageId, 'delete_website_product');
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
    this.website_product = new WebsiteProduct();
    this.loadDropdowns();
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
      link.setAttribute('alt', 'Image');
      link.setAttribute('width', '100%');
      link.setAttribute('height', '100%');
      link.setAttribute('src', SystemConstants.IMAGE_API + '/' + url);
      this.ckeditor_e.instance.insertElement(link);
    }
  }
  
  public openCreateModal(row: any = null) {
    this.doneSetupForm = false;
    this.showUpdateModal = true;
    setTimeout(() => {
      $('#updateWebsiteProductModal').appendTo('body').modal('toggle');
    });
    setTimeout(() => {
      this.website_product = new WebsiteProduct();
      this.website_product.product_id = this.Guid.newGuid();
      this.isCreate = true;
      this.updateForm = new FormGroup({
        'product_name_l': new FormControl('', [Validators.required, Validators.maxLength(100)]),
        'product_name_e': new FormControl('', [Validators.required, Validators.maxLength(100)]),
        'product_description_l': new FormControl('', []),
        'product_description_e': new FormControl('', []),
        'product_link': new FormControl('', [Validators.maxLength(500)]),
        'product_image': new FormControl('', [Validators.required, Validators.maxLength(500)]),
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
    this.updateForm.get('product_name_l').valueChanges.subscribe((value: string) => {
      if (!value || value.trim() == '') {
        this.updateForm.get('product_name_e').setValidators([Validators.required, Validators.maxLength(100)]);
      } else {
        this.updateForm.get('product_name_e').setValidators([Validators.maxLength(100)]);
      }
      this.updateForm.get('product_name_e').updateValueAndValidity({ onlySelf: true, emitEvent: false });
    });
    this.updateForm.get('product_name_e').valueChanges.subscribe((value: string) => {
      if (!value || value.trim() == '') {
        this.updateForm.get('product_name_l').setValidators([Validators.required, Validators.maxLength(100)]);
      } else {
        this.updateForm.get('product_name_l').setValidators([Validators.maxLength(100)]);
      }
      this.updateForm.get('product_name_l').updateValueAndValidity({ onlySelf: true, emitEvent: false });
    });
  }

  public onSubmit() {
    if (this.submitting == false) {
      this.submitting = true;
      if (!this.website_product.product_name_l && this.website_product.product_name_e) {
        this.website_product.product_name_l = this.website_product.product_name_e;
      }
      if (!this.website_product.product_name_e && this.website_product.product_name_l) {
        this.website_product.product_name_e = this.website_product.product_name_l;
      }
      if (!this.website_product.product_description_l && this.website_product.product_description_e) {
        this.website_product.product_description_l = this.website_product.product_description_e;
      }
      if (!this.website_product.product_description_e && this.website_product.product_description_l) {
        this.website_product.product_description_e = this.website_product.product_description_l;
      }
      this.website_product.sort_order = +this.website_product.sort_order;

      this.website_product.product_description_e = this.replaceAll(this.website_product.product_description_e, SystemConstants.IMAGE_API + '/upload/product/image-detail', 'upload/product/image-detail');
      this.website_product.product_description_l = this.replaceAll(this.website_product.product_description_l, SystemConstants.IMAGE_API + '/upload/product/image-detail', 'upload/product/image-detail');

      if (this.isCreate) {
        Observable.combineLatest(
          this.getEncodeFromImage(this.fu_product_image)
        ).subscribe((data: any[]): void => {
          this.website_product.product_image = data[0] == '' ? null : data[0];
          this._apiService.post('/api/adapter/execute', { Method: { Method: 'POST' }, Url: '/api/website-product/create-website-product', Module: 'CMS', Data: JSON.stringify(this.website_product) }).subscribe(res => {
            let item = this.copyProperty(res.data);
            let idx;
            if (this._storageService.getItem(SystemConstants.get('PREFIX_DATA_LANGUAGE')) == 'en') {
              item.product_name = item.product_name_e;
              item.product_description = item.product_description_e;
            } else {
              item.product_name = item.product_name_l;
              item.product_description = item.product_description_l;
            }
            if (this.data.length >= this.pageSize) {
              this.data.splice(this.data.length - 1, 1);
            }
            this.data.unshift(item);
            this.data = this.data.slice();
            this.totalRecords += 1;
            this.website_product = new WebsiteProduct();
            this.fu_product_image.fu.files = [];
            this.resetUpdateForm();
            this._functionConstants.ShowNotification(ENotificationType.GREEN, res.messageCode);
            this.submitting = false;
          }, (error) => { this.submitting = false; });
        }, (error) => { this.submitting = false; });
      } else {
        Observable.combineLatest(
          this.getEncodeFromImage(this.fu_product_image)
        ).subscribe((data: any[]): void => {
          this.website_product.product_image = data[0] == '' ? this.website_product.product_image : data[0];
          this._apiService.post('/api/adapter/execute', { Method: { Method: 'POST' }, Url: '/api/website-product/update-website-product', Module: 'CMS', Data: JSON.stringify(this.website_product) }).subscribe(res => {
            let index = this.data.findIndex(ds => ds[this.dataKey] == this.website_product[this.dataKey]);
            let item = this.copyProperty(res.data);
            let idx;
            if (this._storageService.getItem(SystemConstants.get('PREFIX_DATA_LANGUAGE')) == 'en') {
              item.product_name = item.product_name_e;
              item.product_description = item.product_description_e;
            } else {
              item.product_name = item.product_name_l;
              item.product_description = item.product_description_l;
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
                removeIds.push(ds.product_id);
              }
            });
            if (removeIds.length > 0) {
              this._apiService.post('/api/adapter/execute', { Method: { Method: 'POST' }, Url: '/api/website-product/delete-website-product', Module: 'CMS', Data: JSON.stringify(removeIds) }).subscribe(res => {
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
      $('#updateWebsiteProductModal').appendTo('body').modal('toggle');
    });
    setTimeout(() => {
      let arrRequest = this.getArrayRequest();
      arrRequest.push(this._apiService.post('/api/adapter/execute', { Method: { Method: 'GET' }, Url: '/api/website-product/get-by-id/' + row.product_id, Module: 'CMS' }));
      Observable.combineLatest(arrRequest).subscribe((res: any) => {
        this.isCreate = false;
        this.website_product = res[0].data;
        this.website_product.product_description_e = this.replaceAll(this.website_product.product_description_e, 'upload/product/image-detail', SystemConstants.IMAGE_API + '/upload/product/image-detail');
        this.website_product.product_description_l = this.replaceAll(this.website_product.product_description_l, 'upload/product/image-detail', SystemConstants.IMAGE_API + '/upload/product/image-detail');
        this.updateForm = new FormGroup({
          'product_name_l': new FormControl(this.website_product.product_name_l, [Validators.required, Validators.maxLength(100)]),
          'product_name_e': new FormControl(this.website_product.product_name_e, [Validators.required, Validators.maxLength(100)]),
          'product_description_l': new FormControl(this.website_product.product_description_l, []),
          'product_description_e': new FormControl(this.website_product.product_description_e, []),
          'product_link': new FormControl(this.website_product.product_link, [Validators.maxLength(500)]),
          'product_image': new FormControl(this.website_product.product_image, [Validators.required, Validators.maxLength(500)]),
          'sort_order': new FormControl(this.website_product.sort_order, [Validators.pattern(/^-?(0|[1-9]\d*)?$/)]),
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
