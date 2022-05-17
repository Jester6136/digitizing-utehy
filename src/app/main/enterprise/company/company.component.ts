import { Component, Injector, OnInit, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ENotificationType, Grid, SystemConstants, CustomizeFileUpload } from 'core';
import { Observable } from 'rxjs';
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/operator/takeUntil';
import {CompanyModel} from '../entities/companymodel';
declare var $: any;

@Component({
  selector: 'app-company',
  templateUrl: './company.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CompanyComponent extends Grid implements OnInit {
  public display = false;
  public fileExcel: any;
  public fileNameExcel: any;
  public isCreate = false;
  public companymodel: CompanyModel;
  public constructor(injector: Injector) {
    super(injector);
    this.LZCompress = true; // using LZString compress data
    this.loadBalancing = true;
    this.APIModuleName = 'ENTERPRISE';
    this.getListByIdApiUrl = '/api/website-item-type-ref/get-list-by-id/';
    this.searchApiUrl = '/api/company/search' ;
    this.exportUrl = '/api/website-item-type-ref/export-to-excel';
    this.exportFilename = 'list_website_item_type_ref.xlsx';
    this.setNullIfEmpty = [];
    this.filterFields = ['item_type_rcd', 'item_type_name', 'item_type_size', 'sort_order', 'item_type_description'];
    this.dataKey = 'item_type_rcd';
    this.searchValue.page = this.page;
    this.searchValue.pageSize = this.pageSize;
    this.searchFormGroup = new FormGroup({
      'company_name': new FormControl(''),
      'company_type': new FormControl('')
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

  showDialog() {
    this.display = true;
    this.doneSetupForm = true;
  }
  public uploadExcel(event) {
    if (event.target.files && event.target.files.length > 0) {
      this.fileExcel = event.target.files[0];
      this.fileNameExcel = this.fileExcel.name;
    }
  }
  public uploadFile() {
    this.doneSetupForm = false;
    if (this.fileExcel) {
      this._apiService.importFile(this.fileExcel, 'http://localhost:57065/api/company/Upload').subscribe((res: any) => {
        if (res.body) {
          this.search();
          this._functionConstants.ShowNotification(ENotificationType.GREEN, res.body.messageCode);
          this.display = false;
          this.doneSetupForm = true;
          this.fileExcel = null;
          this.fileNameExcel = null;
          this._changeDetectorRef.detectChanges();
        }
      });
    } else {
      this.doneSetupForm = true;
      this._functionConstants.ShowNotification(ENotificationType.ORANGE, 'MESSAGE.choose_file');
    }
  }


  public ngOnInit() {
    this.companymodel = new CompanyModel();
    this.loadDropdowns();
  }

  public openCreateModal(row: any = null) {
    this.doneSetupForm = false;
    this.showUpdateModal = true;
    setTimeout(() => {
      $('#updateCompanyModal').appendTo('body').modal('toggle');
    });
    setTimeout(() => {
      this.companymodel = new CompanyModel();
      this.isCreate = true;
      this.updateForm = new FormGroup({
        'company_rcd': new FormControl('', [Validators.required, Validators.maxLength(10)]),
        'company_name': new FormControl('', [Validators.required, Validators.maxLength(100)]),
        'company_found_date': new FormControl('', [Validators.required]),
        'company_type': new FormControl('', [Validators.required, Validators.maxLength(50)]),
        'company_website_address': new FormControl('',[]),
        'company_contact': new FormControl('',[]),
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
    // this.updateForm.get('item_type_name_l').valueChanges.subscribe((value: string) => {
    //   if (!value || value.trim() == '') {
    //     this.updateForm.get('item_type_name_e').setValidators([Validators.required, Validators.maxLength(100)]);
    //   } else {
    //     this.updateForm.get('item_type_name_e').setValidators([Validators.maxLength(100)]);
    //   }
    //   this.updateForm.get('item_type_name_e').updateValueAndValidity({ onlySelf: true, emitEvent: false });
    // });
    // this.updateForm.get('item_type_name_e').valueChanges.subscribe((value: string) => {
    //   if (!value || value.trim() == '') {
    //     this.updateForm.get('item_type_name_l').setValidators([Validators.required, Validators.maxLength(100)]);
    //   } else {
    //     this.updateForm.get('item_type_name_l').setValidators([Validators.maxLength(100)]);
    //   }
    //   this.updateForm.get('item_type_name_l').updateValueAndValidity({ onlySelf: true, emitEvent: false });
    // });
  }

  public onSubmit() {
    if (this.submitting == false) {
      this.submitting = true;
      // if (!this.website_item_type_ref.item_type_name_l && this.website_item_type_ref.item_type_name_e) {
      //   this.website_item_type_ref.item_type_name_l = this.website_item_type_ref.item_type_name_e;
      // }
      // if (!this.website_item_type_ref.item_type_name_e && this.website_item_type_ref.item_type_name_l) {
      //   this.website_item_type_ref.item_type_name_e = this.website_item_type_ref.item_type_name_l;
      // }
      // this.website_item_type_ref.item_type_size = +this.website_item_type_ref.item_type_size;
      // this.website_item_type_ref.sort_order = +this.website_item_type_ref.sort_order;
      // if (!this.website_item_type_ref.item_type_description_l && this.website_item_type_ref.item_type_description_e) {
      //   this.website_item_type_ref.item_type_description_l = this.website_item_type_ref.item_type_description_e;
      // }
      // if (!this.website_item_type_ref.item_type_description_e && this.website_item_type_ref.item_type_description_l) {
      //   this.website_item_type_ref.item_type_description_e = this.website_item_type_ref.item_type_description_l;
      // }
      if (this.isCreate) {
        this._apiService.post('/api/adapter/execute', { Method: { Method: 'POST' }, Url: '/api/company/create', Module: 'ENTERPRISE', Data: JSON.stringify(this.companymodel) }).subscribe(res => {
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
          this.companymodel = new CompanyModel();
          this.resetUpdateForm();
          this._functionConstants.ShowNotification(ENotificationType.GREEN, res.messageCode);
          this.submitting = false;
        }, (error) => { this.submitting = false; });
      } else {
        this._apiService.post('/api/adapter/execute', { Method: { Method: 'POST' }, Url: '/api/company/update', Module: 'ENTERPRISE', Data: JSON.stringify(this.companymodel) }).subscribe(res => {
          let index = this.data.findIndex(ds => ds[this.dataKey] == this.companymodel[this.dataKey]);
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
              this._apiService.post('/api/adapter/execute', { Method: { Method: 'POST' }, Url: '/api/company/delete-website-item-type-ref', Module: 'ENTERPRISE', Data: JSON.stringify(removeIds) }).subscribe(res => {
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
      $('#updateCompanyModal').appendTo('body').modal('toggle');
    });
    setTimeout(() => {
      let arrRequest = this.getArrayRequest();
      arrRequest.push(this._apiService.post('/api/adapter/execute', { Method: { Method: 'GET' }, Url: '/api/company/get-by-id/' + row.company_rcd, Module: 'ENTERPRISE' }));
      Observable.combineLatest(arrRequest).subscribe((res: any) => {
        this.isCreate = false;
        this.companymodel = res[0].data;
        this.companymodel.company_found_date = new Date(this.companymodel.company_found_date);
        this.updateForm = new FormGroup({
          'company_rcd': new FormControl({ value: this.companymodel.company_rcd, disabled: true }, [Validators.required, Validators.maxLength(10)]),
          'company_name': new FormControl(this.companymodel.company_name, [Validators.maxLength(100)]),
          'company_found_date': new FormControl(this.companymodel.company_found_date, []),
          'company_type': new FormControl(this.companymodel.company_type, [Validators.required, Validators.maxLength(50)]),
          'company_website_address': new FormControl(this.companymodel.company_website_address, []),
          'company_contact': new FormControl(this.companymodel.company_contact, []),
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
