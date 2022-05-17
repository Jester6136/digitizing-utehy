import { Component, Injector, OnInit, ChangeDetectionStrategy, ViewChild} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ENotificationType, Grid, SystemConstants, CustomizeFileUpload } from 'core';
import { Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as FileSaver from 'file-saver';
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/operator/takeUntil';
import { WebsiteTag } from '../../../../main/entities/website-tag';
declare var $: any;

@Component({
  selector: 'app-website-tag',
  templateUrl: './website-tag.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WebsiteTagComponent extends Grid implements OnInit {
  
public isCreate = false;
  
public website_tag: WebsiteTag;
  
public constructor(injector: Injector) {
    super(injector);
	this.LZCompress = true; // using LZString compress data
    this.loadBalancing = true;
    this.APIModuleName = 'CMS';
    this.getListByIdApiUrl = '/api/website-tag/get-list-by-id/';
    this.searchApiUrl = '/api/website-tag/search';
    this.exportUrl = '/api/website-tag/export-to-excel';
    this.exportFilename = 'list_website_tag.xlsx';
    this.setNullIfEmpty = [];
    this.filterFields = ['tag_name', 'sort_order'];
    this.dataKey = 'tag_id';
    this.searchValue.page = this.page;
    this.searchValue.pageSize = this.pageSize;
    this.searchFormGroup = new FormGroup({
'tag_name': new FormControl(''),
});
    this.hasViewPermission = this._authenService.hasPermission(this.pageId, 'view_website_tag');
    this.hasCreatePermission = this._authenService.hasPermission(this.pageId, 'create_website_tag');
    this.hasUpdatePermission = this._authenService.hasPermission(this.pageId, 'update_website_tag');
    this.hasDeletePermission = this._authenService.hasPermission(this.pageId, 'delete_website_tag');
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
    this.website_tag = new WebsiteTag();
    this.loadDropdowns();
  }
  
public openCreateModal(row: any = null) {
	this.doneSetupForm = false;
    this.showUpdateModal = true;
    setTimeout(() => {
      $('#updateWebsiteTagModal').appendTo('body').modal('toggle');
    });
    setTimeout(() => {
		this.website_tag = new WebsiteTag();
		this.isCreate = true;
		this.updateForm = new FormGroup({
'tag_name_l': new FormControl('', [Validators.required, Validators.maxLength(1000)]),
'tag_name_e': new FormControl('', [Validators.required, Validators.maxLength(1000)]),
'tag_description_l': new FormControl('', [Validators.maxLength(1500)]),
'tag_description_e': new FormControl('', [Validators.maxLength(1500)]),
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
this.updateForm.get('tag_name_l').valueChanges.subscribe((value: string) => {
if (!value || value.trim() == '') {
this.updateForm.get('tag_name_e').setValidators([Validators.required, Validators.maxLength(1000)]);
} else {
this.updateForm.get('tag_name_e').setValidators([Validators.maxLength(1000)]);
}
this.updateForm.get('tag_name_e').updateValueAndValidity({ onlySelf: true, emitEvent: false });
});
this.updateForm.get('tag_name_e').valueChanges.subscribe((value: string) => {
if (!value || value.trim() == '') {
this.updateForm.get('tag_name_l').setValidators([Validators.required, Validators.maxLength(1000)]);
} else {
this.updateForm.get('tag_name_l').setValidators([Validators.maxLength(1000)]);
}
this.updateForm.get('tag_name_l').updateValueAndValidity({ onlySelf: true, emitEvent: false });
});
}
  
public onSubmit() {
    if (this.submitting == false) {
		this.submitting = true;
		if (!this.website_tag.tag_name_l && this.website_tag.tag_name_e) {
this.website_tag.tag_name_l = this.website_tag.tag_name_e;
}
if (!this.website_tag.tag_name_e && this.website_tag.tag_name_l) {
this.website_tag.tag_name_e = this.website_tag.tag_name_l;
}
if (!this.website_tag.tag_description_l && this.website_tag.tag_description_e) {
this.website_tag.tag_description_l = this.website_tag.tag_description_e;
}
if (!this.website_tag.tag_description_e && this.website_tag.tag_description_l) {
this.website_tag.tag_description_e = this.website_tag.tag_description_l;
}
this.website_tag.sort_order = +this.website_tag.sort_order;
		if (this.isCreate) {
		  this._apiService.post('/api/adapter/execute', { Method: { Method: 'POST' }, Url: '/api/website-tag/create-website-tag', Module: 'CMS', Data: JSON.stringify(this.website_tag) }).subscribe(res => {
			let item = this.copyProperty(res.data);
let idx;
if (this._storageService.getItem(SystemConstants.get('PREFIX_DATA_LANGUAGE')) == 'en') {
item.tag_name = item.tag_name_e;
item.tag_description = item.tag_description_e;
} else {
item.tag_name = item.tag_name_l;
item.tag_description = item.tag_description_l;
}
if (this.data.length >= this.pageSize) {
  this.data.splice(this.data.length - 1, 1);
}
this.data.unshift(item);
this.data = this.data.slice();
this.totalRecords += 1;
			this.website_tag = new WebsiteTag();
			this.resetUpdateForm();
			this._functionConstants.ShowNotification(ENotificationType.GREEN, res.messageCode);
			this.submitting = false;
		  }, (error) => { this.submitting = false; });
		} else {
		  this._apiService.post('/api/adapter/execute', { Method: { Method: 'POST' }, Url: '/api/website-tag/update-website-tag', Module: 'CMS', Data: JSON.stringify(this.website_tag) }).subscribe(res => {
			let index = this.data.findIndex(ds => ds[this.dataKey] == this.website_tag[this.dataKey]);
let item = this.copyProperty(res.data);
let idx;
if (this._storageService.getItem(SystemConstants.get('PREFIX_DATA_LANGUAGE')) == 'en') {
item.tag_name = item.tag_name_e;
item.tag_description = item.tag_description_e;
} else {
item.tag_name = item.tag_name_l;
item.tag_description = item.tag_description_l;
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
                removeIds.push(ds.tag_id);
              }
            });
            if (removeIds.length > 0) {
              this._apiService.post('/api/adapter/execute', { Method: { Method: 'POST' }, Url: '/api/website-tag/delete-website-tag', Module: 'CMS', Data: JSON.stringify(removeIds) }).subscribe(res => {
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
      $('#updateWebsiteTagModal').appendTo('body').modal('toggle');
    });
    setTimeout(() => {
		let arrRequest = this.getArrayRequest();
		arrRequest.push(this._apiService.post('/api/adapter/execute', { Method: { Method: 'GET' }, Url: '/api/website-tag/get-by-id/' + row.tag_id, Module: 'CMS' }));
		Observable.combineLatest(arrRequest).subscribe((res:any) => {
		  this.isCreate = false;
		  this.website_tag = res[0].data;
		  this.updateForm = new FormGroup({
'tag_name_l': new FormControl(this.website_tag.tag_name_l, [Validators.required, Validators.maxLength(1000)]),
'tag_name_e': new FormControl(this.website_tag.tag_name_e, [Validators.required, Validators.maxLength(1000)]),
'tag_description_l': new FormControl(this.website_tag.tag_description_l, [Validators.maxLength(1500)]),
'tag_description_e': new FormControl(this.website_tag.tag_description_e, [Validators.maxLength(1500)]),
'sort_order': new FormControl(this.website_tag.sort_order, [Validators.pattern(/^-?(0|[1-9]\d*)?$/)]),
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
