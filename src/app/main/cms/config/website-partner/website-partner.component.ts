import { Component, Injector, OnInit, ChangeDetectionStrategy, ViewChild} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ENotificationType, Grid, SystemConstants, CustomizeFileUpload } from 'core';
import { Observable } from 'rxjs';
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/operator/takeUntil';
import { WebsitePartner } from '../../../../main/entities/website-partner';
declare var $: any;

@Component({
  selector: 'app-website-partner',
  templateUrl: './website-partner.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WebsitePartnerComponent extends Grid implements OnInit {
  
public isCreate = false;
public host_image: any;
public website_partner: WebsitePartner;
  @ViewChild(CustomizeFileUpload, {static: false}) fu_partner_logo: CustomizeFileUpload;
  
public constructor(injector: Injector) {
    super(injector);
	this.LZCompress = true; // using LZString compress data
    this.loadBalancing = true;
    this.host_image = SystemConstants.IMAGE_API + '/';
    this.APIModuleName = 'CMS';
    this.getListByIdApiUrl = '/api/website-partner/get-list-by-id/';
    this.searchApiUrl = '/api/website-partner/search';
    this.exportUrl = '/api/website-partner/export-to-excel';
    this.exportFilename = 'list_website_partner.xlsx';
    this.setNullIfEmpty = [];
    this.filterFields = ['partner_logo', 'partner_link', 'partner_name', 'sort_order'];
    this.dataKey = 'partner_id';
    this.searchValue.page = this.page;
    this.searchValue.pageSize = this.pageSize;
    this.searchFormGroup = new FormGroup({
'partner_name': new FormControl(''),
});
    this.hasViewPermission = this._authenService.hasPermission(this.pageId, 'view_website_partner');
    this.hasCreatePermission = this._authenService.hasPermission(this.pageId, 'create_website_partner');
    this.hasUpdatePermission = this._authenService.hasPermission(this.pageId, 'update_website_partner');
    this.hasDeletePermission = this._authenService.hasPermission(this.pageId, 'delete_website_partner');
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
    this.website_partner = new WebsitePartner();
    this.loadDropdowns();
  }
  
public openCreateModal(row: any = null) {
	this.doneSetupForm = false;
    this.showUpdateModal = true;
    setTimeout(() => {
      $('#updateWebsitePartnerModal').appendTo('body').modal('toggle');
    });
    setTimeout(() => {
		this.website_partner = new WebsitePartner();
		this.isCreate = true;
		this.updateForm = new FormGroup({
'partner_logo': new FormControl('', [Validators.required, Validators.maxLength(200)]),
'partner_link': new FormControl('', [Validators.required, Validators.maxLength(200)]),
'partner_name': new FormControl('', [Validators.required, Validators.maxLength(150)]),
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
		this.website_partner.sort_order = +this.website_partner.sort_order;
		if (this.isCreate) {
		  Observable.combineLatest(
this.getEncodeFromImage(this.fu_partner_logo)
).subscribe((data: any[]): void => {
this.website_partner.partner_logo = data[0] == '' ? null : data[0];
		  this._apiService.post('/api/adapter/execute', { Method: { Method: 'POST' }, Url: '/api/website-partner/create-website-partner', Module: 'CMS', Data: JSON.stringify(this.website_partner) }).subscribe(res => {
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
			this.website_partner = new WebsitePartner();
			this.fu_partner_logo.fu.files = [];
			this.resetUpdateForm();
			this._functionConstants.ShowNotification(ENotificationType.GREEN, res.messageCode);
			this.submitting = false;
		  }, (error) => { this.submitting = false; });
		  }, (error) => { this.submitting = false; });
		} else {
		  Observable.combineLatest(
this.getEncodeFromImage(this.fu_partner_logo)
).subscribe((data: any[]): void => {
this.website_partner.partner_logo = data[0] == '' ? this.website_partner.partner_logo : data[0];
		  this._apiService.post('/api/adapter/execute', { Method: { Method: 'POST' }, Url: '/api/website-partner/update-website-partner', Module: 'CMS', Data: JSON.stringify(this.website_partner) }).subscribe(res => {
			let index = this.data.findIndex(ds => ds[this.dataKey] == this.website_partner[this.dataKey]);
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
                removeIds.push(ds.partner_id);
              }
            });
            if (removeIds.length > 0) {
              this._apiService.post('/api/adapter/execute', { Method: { Method: 'POST' }, Url: '/api/website-partner/delete-website-partner', Module: 'CMS', Data: JSON.stringify(removeIds) }).subscribe(res => {
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
      $('#updateWebsitePartnerModal').appendTo('body').modal('toggle');
    });
    setTimeout(() => {
		let arrRequest = this.getArrayRequest();
		arrRequest.push(this._apiService.post('/api/adapter/execute', { Method: { Method: 'GET' }, Url: '/api/website-partner/get-by-id/' + row.partner_id, Module: 'CMS' }));
		Observable.combineLatest(arrRequest).subscribe((res:any) => {
		  this.isCreate = false;
		  this.website_partner = res[0].data;
		  this.updateForm = new FormGroup({
'partner_logo': new FormControl(this.website_partner.partner_logo, [Validators.required, Validators.maxLength(200)]),
'partner_link': new FormControl(this.website_partner.partner_link, [Validators.required, Validators.maxLength(200)]),
'partner_name': new FormControl(this.website_partner.partner_name, [Validators.required, Validators.maxLength(150)]),
'sort_order': new FormControl(this.website_partner.sort_order, [Validators.pattern(/^-?(0|[1-9]\d*)?$/)]),
'is_show': new FormControl(this.website_partner.is_show, [Validators.required]),
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
