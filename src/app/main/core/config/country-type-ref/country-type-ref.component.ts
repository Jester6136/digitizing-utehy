import { Component, Injector, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ENotificationType, Grid, SystemConstants } from 'core';
import { Observable } from 'rxjs';
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/operator/takeUntil';
import { CountryTypeRef } from '../../../../main/entities/country-type-ref';
declare var $: any;

@Component({
  selector: 'app-country-type-ref',
  templateUrl: './country-type-ref.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CountryTypeRefComponent extends Grid implements OnInit {
  public isCreate = false;
  public country_type_ref: CountryTypeRef;
  public constructor(injector: Injector) {
    super(injector);
    this.LZCompress = true; // using LZString compress data
    this.loadBalancing = true;
    this.APIModuleName = 'CORE';
    this.getListByIdApiUrl = '/api/country-type-ref/get-list-by-id/';
    this.searchApiUrl = '/api/country-type-ref/search';
    this.exportUrl = '/api/country-type-ref/export-to-excel';
    this.exportFilename = 'list_country_type_ref.xlsx';
    this.setNullIfEmpty = [];
    this.filterFields = ['country_type_rcd', 'country_type_name', 'sort_order'];
    this.dataKey = 'country_type_rcd';
    this.searchValue.page = this.page;
    this.searchValue.pageSize = this.pageSize;
    this.searchFormGroup = new FormGroup({
      'country_type_rcd': new FormControl(''),
      'country_type_name': new FormControl(''),
    });
    this.hasViewPermission = this._authenService.hasPermission(this.pageId, 'view_country_type_ref');
    this.hasCreatePermission = this._authenService.hasPermission(this.pageId, 'create_country_type_ref');
    this.hasUpdatePermission = this._authenService.hasPermission(this.pageId, 'update_country_type_ref');
    this.hasDeletePermission = this._authenService.hasPermission(this.pageId, 'delete_country_type_ref');
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
    this.country_type_ref = new CountryTypeRef();
    this.loadDropdowns();
  }

  public openCreateModal(row: any = null) {
    this.doneSetupForm = false;
    this.showUpdateModal = true;
    setTimeout(() => {
      $('#updateCountryTypeRefModal').appendTo('body').modal('toggle');
    });
    setTimeout(() => {
      this.country_type_ref = new CountryTypeRef();
      this.isCreate = true;
      this.updateForm = new FormGroup({
        'country_type_rcd': new FormControl('', [Validators.required, Validators.maxLength(50)]),
        'country_type_name_e': new FormControl('', [Validators.required, Validators.maxLength(100)]),
        'country_type_name_l': new FormControl('', [Validators.required, Validators.maxLength(100)]),
        'sort_order': new FormControl('', [Validators.pattern(/^-?(0|[1-9]\d*)?$/)]),
        'country_type_note_e': new FormControl('', [Validators.maxLength(250)]),
        'country_type_note_l': new FormControl('', [Validators.maxLength(250)]),
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
    this.updateForm.get('country_type_name_e').valueChanges.subscribe((value: string) => {
      if (!value || value.trim() == '') {
        this.updateForm.get('country_type_name_l').setValidators([Validators.required, Validators.maxLength(100)]);
      } else {
        this.updateForm.get('country_type_name_l').setValidators([Validators.maxLength(100)]);
      }
      this.updateForm.get('country_type_name_l').updateValueAndValidity({ onlySelf: true, emitEvent: false });
    });
    this.updateForm.get('country_type_name_l').valueChanges.subscribe((value: string) => {
      if (!value || value.trim() == '') {
        this.updateForm.get('country_type_name_e').setValidators([Validators.required, Validators.maxLength(100)]);
      } else {
        this.updateForm.get('country_type_name_e').setValidators([Validators.maxLength(100)]);
      }
      this.updateForm.get('country_type_name_e').updateValueAndValidity({ onlySelf: true, emitEvent: false });
    });
  }

  public onSubmit() {
    if (this.submitting == false) {
      this.submitting = true;
      if (!this.country_type_ref.country_type_name_e && this.country_type_ref.country_type_name_l) {
        this.country_type_ref.country_type_name_e = this.country_type_ref.country_type_name_l;
      }
      if (!this.country_type_ref.country_type_name_l && this.country_type_ref.country_type_name_e) {
        this.country_type_ref.country_type_name_l = this.country_type_ref.country_type_name_e;
      }
      this.country_type_ref.sort_order = +this.country_type_ref.sort_order
      if (!this.country_type_ref.country_type_note_e && this.country_type_ref.country_type_note_l) {
        this.country_type_ref.country_type_note_e = this.country_type_ref.country_type_note_l;
      }
      if (!this.country_type_ref.country_type_note_l && this.country_type_ref.country_type_note_e) {
        this.country_type_ref.country_type_note_l = this.country_type_ref.country_type_note_e;
      }
      if (this.isCreate) {
        this._apiService.post('/api/adapter/execute', { Method: { Method: 'POST' }, Url: '/api/country-type-ref/create-country-type-ref', Module: 'CORE', Data: JSON.stringify(this.country_type_ref) }).subscribe(res => {
          let item = this.copyProperty(res.data);
          let idx;
          if (this._storageService.getItem(SystemConstants.get('PREFIX_DATA_LANGUAGE')) == 'en') {
            item.country_type_name = item.country_type_name_e;
            item.country_type_note = item.country_type_note_e;
          } else {
            item.country_type_name = item.country_type_name_l;
            item.country_type_note = item.country_type_note_l;
          }
          if (this.data.length >= this.pageSize) {
            this.data.splice(this.data.length - 1, 1);
          }
          this.data.unshift(item);
          this.data = this.data.slice();
          this.totalRecords += 1;
          this.country_type_ref = new CountryTypeRef();
          this.resetUpdateForm();
          this._functionConstants.ShowNotification(ENotificationType.GREEN, res.messageCode);
          this.submitting = false;
        }, (error) => { this.submitting = false; });
      } else {
        this._apiService.post('/api/adapter/execute', { Method: { Method: 'POST' }, Url: '/api/country-type-ref/update-country-type-ref', Module: 'CORE', Data: JSON.stringify(this.country_type_ref) }).subscribe(res => {
          let index = this.data.findIndex(ds => ds[this.dataKey] == this.country_type_ref[this.dataKey]);
          let item = this.copyProperty(res.data);
          let idx;
          if (this._storageService.getItem(SystemConstants.get('PREFIX_DATA_LANGUAGE')) == 'en') {
            item.country_type_name = item.country_type_name_e;
            item.country_type_note = item.country_type_note_e;
          } else {
            item.country_type_name = item.country_type_name_l;
            item.country_type_note = item.country_type_note_l;
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
                removeIds.push(ds.country_type_rcd);
              }
            });
            if (removeIds.length > 0) {
              this._apiService.post('/api/adapter/execute', { Method: { Method: 'POST' }, Url: '/api/country-type-ref/delete-country-type-ref', Module: 'CORE', Data: JSON.stringify(removeIds) }).subscribe(res => {
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
      $('#updateCountryTypeRefModal').appendTo('body').modal('toggle');
    });
    setTimeout(() => {
      let arrRequest = this.getArrayRequest();
      arrRequest.push(this._apiService.post('/api/adapter/execute', { Method: { Method: 'GET' }, Url: '/api/country-type-ref/get-by-id/' + row.country_type_rcd, Module: 'CORE' }));
      Observable.combineLatest(arrRequest).subscribe((res: any) => {
        this.isCreate = false;
        this.country_type_ref = res[0].data;
        this.updateForm = new FormGroup({
          'country_type_rcd': new FormControl({ value: this.country_type_ref.country_type_rcd, disabled: true }, [Validators.required, Validators.maxLength(50)]),
          'country_type_name_e': new FormControl(this.country_type_ref.country_type_name_e, [Validators.required, Validators.maxLength(100)]),
          'country_type_name_l': new FormControl(this.country_type_ref.country_type_name_l, [Validators.required, Validators.maxLength(100)]),
          'sort_order': new FormControl(this.country_type_ref.sort_order, [Validators.pattern(/^-?(0|[1-9]\d*)?$/)]),
          'country_type_note_e': new FormControl(this.country_type_ref.country_type_note_e, [Validators.maxLength(250)]),
          'country_type_note_l': new FormControl(this.country_type_ref.country_type_note_l, [Validators.maxLength(250)]),
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
