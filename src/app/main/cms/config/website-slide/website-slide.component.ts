import { Component, Injector, OnInit, ChangeDetectionStrategy, ViewChild} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ENotificationType, Grid, SystemConstants, CustomizeFileUpload } from 'core';
import { Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as FileSaver from 'file-saver';
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/operator/takeUntil';
import { WebsiteSlide } from '../../../../main/entities/website-slide';
declare var $: any;

@Component({
  selector: 'app-website-slide',
  templateUrl: './website-slide.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WebsiteSlideComponent extends Grid implements OnInit {
  
public isCreate = false;
public host_image: any;
public website_slide: WebsiteSlide;
  @ViewChild(CustomizeFileUpload, {static: false}) fu_slide_image: CustomizeFileUpload;
  
public constructor(injector: Injector) {
    super(injector);
	this.LZCompress = true; // using LZString compress data
    this.loadBalancing = true;
    this.host_image = SystemConstants.IMAGE_API + '/';
    this.APIModuleName = 'CMS';
    this.getListByIdApiUrl = '/api/website-slide/get-list-by-id/';
    this.searchApiUrl = '/api/website-slide/search';
    this.exportUrl = '/api/website-slide/export-to-excel';
    this.exportFilename = 'list_website_slide.xlsx';
    this.setNullIfEmpty = [];
    this.filterFields = ['slide_title', 'slide_image', 'slide_type', 'sort_order'];
    this.dataKey = 'slide_id';
    this.searchValue.page = this.page;
    this.searchValue.pageSize = this.pageSize;
    this.searchFormGroup = new FormGroup({
'slide_title': new FormControl(''),
});
    this.hasViewPermission = this._authenService.hasPermission(this.pageId, 'view_website_slide');
    this.hasCreatePermission = this._authenService.hasPermission(this.pageId, 'create_website_slide');
    this.hasUpdatePermission = this._authenService.hasPermission(this.pageId, 'update_website_slide');
    this.hasDeletePermission = this._authenService.hasPermission(this.pageId, 'delete_website_slide');
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
    this.website_slide = new WebsiteSlide();
    this.loadDropdowns();
  }
  
public openCreateModal(row: any = null) {
	this.doneSetupForm = false;
    this.showUpdateModal = true;
    setTimeout(() => {
      $('#updateWebsiteSlideModal').appendTo('body').modal('toggle');
    });
    setTimeout(() => {
		this.website_slide = new WebsiteSlide();
		this.isCreate = true;
		this.updateForm = new FormGroup({
'slide_title_l': new FormControl('', [Validators.maxLength(250)]),
'slide_title_e': new FormControl('', [Validators.maxLength(250)]),
'slide_image': new FormControl('', [Validators.required, Validators.maxLength(250)]),
'slide_url': new FormControl('', [Validators.maxLength(200)]),
'slide_type': new FormControl('', [Validators.required,Validators.pattern(/^-?(0|[1-9]\d*)?$/)]),
'sort_order': new FormControl('', [Validators.pattern(/^-?(0|[1-9]\d*)?$/)]),
'is_show': new FormControl(false, [Validators.required]),
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
		if (!this.website_slide.slide_title_l && this.website_slide.slide_title_e) {
this.website_slide.slide_title_l = this.website_slide.slide_title_e;
}
if (!this.website_slide.slide_title_e && this.website_slide.slide_title_l) {
this.website_slide.slide_title_e = this.website_slide.slide_title_l;
}
this.website_slide.slide_type = +this.website_slide.slide_type;
this.website_slide.sort_order = +this.website_slide.sort_order;
		if (this.isCreate) {
		  Observable.combineLatest(
this.getEncodeFromImage(this.fu_slide_image)
).subscribe((data: any[]): void => {
this.website_slide.slide_image = data[0] == '' ? null : data[0];
		  this._apiService.post('/api/adapter/execute', { Method: { Method: 'POST' }, Url: '/api/website-slide/create-website-slide', Module: 'CMS', Data: JSON.stringify(this.website_slide) }).subscribe(res => {
			let item = this.copyProperty(res.data);
let idx;
if (this._storageService.getItem(SystemConstants.get('PREFIX_DATA_LANGUAGE')) == 'en') {
item.slide_title = item.slide_title_e;
} else {
item.slide_title = item.slide_title_l;
}
if (this.data.length >= this.pageSize) {
  this.data.splice(this.data.length - 1, 1);
}
this.data.unshift(item);
this.data = this.data.slice();
this.totalRecords += 1;
			this.website_slide = new WebsiteSlide();
			this.fu_slide_image.fu.files = [];
			this.resetUpdateForm();
			this._functionConstants.ShowNotification(ENotificationType.GREEN, res.messageCode);
			this.submitting = false;
		  }, (error) => { this.submitting = false; });
		  }, (error) => { this.submitting = false; });
		} else {
		  Observable.combineLatest(
this.getEncodeFromImage(this.fu_slide_image)
).subscribe((data: any[]): void => {
this.website_slide.slide_image = data[0] == '' ? this.website_slide.slide_image : data[0];
		  this._apiService.post('/api/adapter/execute', { Method: { Method: 'POST' }, Url: '/api/website-slide/update-website-slide', Module: 'CMS', Data: JSON.stringify(this.website_slide) }).subscribe(res => {
			let index = this.data.findIndex(ds => ds[this.dataKey] == this.website_slide[this.dataKey]);
let item = this.copyProperty(res.data);
let idx;
if (this._storageService.getItem(SystemConstants.get('PREFIX_DATA_LANGUAGE')) == 'en') {
item.slide_title = item.slide_title_e;
} else {
item.slide_title = item.slide_title_l;
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
                removeIds.push(ds.slide_id);
              }
            });
            if (removeIds.length > 0) {
              this._apiService.post('/api/adapter/execute', { Method: { Method: 'POST' }, Url: '/api/website-slide/delete-website-slide', Module: 'CMS', Data: JSON.stringify(removeIds) }).subscribe(res => {
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
      $('#updateWebsiteSlideModal').appendTo('body').modal('toggle');
    });
    setTimeout(() => {
		let arrRequest = this.getArrayRequest();
		arrRequest.push(this._apiService.post('/api/adapter/execute', { Method: { Method: 'GET' }, Url: '/api/website-slide/get-by-id/' + row.slide_id, Module: 'CMS' }));
		Observable.combineLatest(arrRequest).subscribe((res:any) => {
		  this.isCreate = false;
		  this.website_slide = res[0].data;
		  this.updateForm = new FormGroup({
'slide_title_l': new FormControl(this.website_slide.slide_title_l, [Validators.maxLength(250)]),
'slide_title_e': new FormControl(this.website_slide.slide_title_e, [Validators.maxLength(250)]),
'slide_image': new FormControl(this.website_slide.slide_image, [Validators.required, Validators.maxLength(250)]),
'slide_url': new FormControl(this.website_slide.slide_url, [Validators.maxLength(200)]),
'slide_type': new FormControl(this.website_slide.slide_type, [Validators.required,Validators.pattern(/^-?(0|[1-9]\d*)?$/)]),
'sort_order': new FormControl(this.website_slide.sort_order, [Validators.pattern(/^-?(0|[1-9]\d*)?$/)]),
'is_show': new FormControl(this.website_slide.is_show, [Validators.required]),
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
