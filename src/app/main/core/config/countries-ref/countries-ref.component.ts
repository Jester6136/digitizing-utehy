import { Component, Injector, OnInit, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ENotificationType, Grid, SystemConstants, CustomizeFileUpload } from 'core';
import { combineLatest, Observable } from 'rxjs';
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/operator/takeUntil';
import { CountriesRef } from '../../../../main/entities/countries-ref';
declare var $: any;

@Component({
  selector: 'app-countries-ref',
  templateUrl: './countries-ref.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CountriesRefComponent extends Grid implements OnInit {

  public isCreate = false;
  public countries_ref: CountriesRef;
  @ViewChild(CustomizeFileUpload, { static: false }) fu_flags: CustomizeFileUpload;
  public country_type_refs: any;
  public selectedCountryTypeRef: any;
  public constructor(injector: Injector) {
    super(injector);
    this.LZCompress = true; // using LZString compress data
    this.loadBalancing = true;
    this.APIModuleName = 'CORE';
    this.getListByIdApiUrl = '/api/countries-ref/get-list-by-id/';
    this.searchApiUrl = '/api/countries-ref/search';
    this.exportUrl = '/api/countries-ref/export-to-excel';
    this.exportFilename = 'list_countries_ref.xlsx';
    this.setNullIfEmpty = ['country_type_rcd'];
    this.filterFields = ['countries_rcd', 'countries_name', 'capital', 'currency_code', 'currency_name', 'sort_order'];
    this.dataKey = 'countries_rcd';
    this.searchValue.page = this.page;
    this.searchValue.pageSize = this.pageSize;
    this.searchFormGroup = new FormGroup({
      'countries_rcd': new FormControl(''),
      'countries_name': new FormControl(''),
      'country_type_rcd': new FormControl(''),
    });
    this.hasViewPermission = this._authenService.hasPermission(this.pageId, 'view_countries_ref');
    this.hasCreatePermission = this._authenService.hasPermission(this.pageId, 'create_countries_ref');
    this.hasUpdatePermission = this._authenService.hasPermission(this.pageId, 'update_countries_ref');
    this.hasDeletePermission = this._authenService.hasPermission(this.pageId, 'delete_countries_ref');
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
    combineLatest([
      this._functionConstants.getJsonFile(this._storageService.getItem(SystemConstants.get('PREFIX_DATA_LANGUAGE')), 'd', 'country_type_ref',
        this._apiService.post('/api/adapter/execute', { Method: { Method: 'GET' }, Url: '/api/country-type-ref/get-dropdown', Module: 'CORE' })
      ),
    ]).subscribe(res => {
      this.country_type_refs = null;
      setTimeout(() => {
        this.country_type_refs = this.country_type_refs || res[0];
      });
      this.search();
    });
  }

  public ngOnInit() {
    this.countries_ref = new CountriesRef();
    this.loadDropdowns();
  }

  public openCreateModal(row: any = null) {
    this.doneSetupForm = false;
    this.showUpdateModal = true;
    setTimeout(() => {
      $('#updateCountriesRefModal').appendTo('body').modal('toggle');
    });
    setTimeout(() => {
      this.countries_ref = new CountriesRef();
      this.isCreate = true;
      Observable.combineLatest(this.getArrayRequest()).subscribe(res => {
        this.country_type_refs = this.country_type_refs || res[0];
        this.updateForm = new FormGroup({
          'countries_rcd': new FormControl('', [Validators.maxLength(50), Validators.required]),
          'countries_code': new FormControl('', [Validators.required, Validators.maxLength(36)]),
          'countries_name_e': new FormControl('', [Validators.required, Validators.maxLength(100)]),
          'countries_name_l': new FormControl('', [Validators.maxLength(100), Validators.required]),
          'country_type_rcd': new FormControl('', []),
          'capital': new FormControl('', []),
          'currency_code': new FormControl('', []),
          'currency_name': new FormControl('', []),
          'telephone_code': new FormControl('', []),
          'internet_country_code': new FormControl('', []),
          'flags': new FormControl('', []),
          'sort_order': new FormControl('', [Validators.pattern(/^-?(0|[1-9]\d*)?$/)]),
          'countries_note_e': new FormControl('', [Validators.maxLength(250)]),
          'countries_note_l': new FormControl('', [Validators.maxLength(250)]),
          'meta_title': new FormControl('', []),
          'meta_description': new FormControl('', []),
          'meta_keywords': new FormControl('', []),
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

  public updateValidator() {
    this.updateForm.valueChanges.subscribe(res => {
      this.enabledSubmitFlag = this.modified();
    });
    this.updateForm.get('countries_name_e').valueChanges.subscribe((value: string) => {
      if (!value || value.trim() == '') {
        this.updateForm.get('countries_name_l').setValidators([Validators.required, Validators.maxLength(100)]);
      } else {
        this.updateForm.get('countries_name_l').setValidators([Validators.maxLength(100)]);
      }
      this.updateForm.get('countries_name_l').updateValueAndValidity({ onlySelf: true, emitEvent: false });
    });
    this.updateForm.get('countries_name_l').valueChanges.subscribe((value: string) => {
      if (!value || value.trim() == '') {
        this.updateForm.get('countries_name_e').setValidators([Validators.maxLength(100), Validators.required]);
      } else {
        this.updateForm.get('countries_name_e').setValidators([Validators.maxLength(100)]);
      }
      this.updateForm.get('countries_name_e').updateValueAndValidity({ onlySelf: true, emitEvent: false });
    });
  }

  public onSubmit() {
    if (this.submitting == false) {
      this.submitting = true;
      if (!this.countries_ref.countries_name_e && this.countries_ref.countries_name_l) {
        this.countries_ref.countries_name_e = this.countries_ref.countries_name_l;
      }
      if (!this.countries_ref.countries_name_l && this.countries_ref.countries_name_e) {
        this.countries_ref.countries_name_l = this.countries_ref.countries_name_e;
      }
      this.countries_ref.sort_order = +this.countries_ref.sort_order
      if (!this.countries_ref.countries_note_e && this.countries_ref.countries_note_l) {
        this.countries_ref.countries_note_e = this.countries_ref.countries_note_l;
      }
      if (!this.countries_ref.countries_note_l && this.countries_ref.countries_note_e) {
        this.countries_ref.countries_note_l = this.countries_ref.countries_note_e;
      }
      this.countries_ref.country_type_rcd = this.selectedCountryTypeRef;
      if (this.isCreate) {
        Observable.combineLatest(
          this.getEncodeFromImage(this.fu_flags)
        ).subscribe((data: any[]): void => {
          this.countries_ref.flags = data[0] == '' ? null : data[0];
          this._apiService.post('/api/adapter/execute', { Method: { Method: 'POST' }, Url: '/api/countries-ref/create-countries-ref', Module: 'CORE', Data: JSON.stringify(this.countries_ref) }).subscribe(res => {
            let item = this.copyProperty(res.data);
            let idx;
            if (this._storageService.getItem(SystemConstants.get('PREFIX_DATA_LANGUAGE')) == 'en') {
              item.countries_name = item.countries_name_e;
              item.countries_note = item.countries_note_e;
            } else {
              item.countries_name = item.countries_name_l;
              item.countries_note = item.countries_note_l;
            }
            if (this.data.length >= this.pageSize) {
              this.data.splice(this.data.length - 1, 1);
            }
            this.data.unshift(item);
            this.data = this.data.slice();
            this.totalRecords += 1;
            this.countries_ref = new CountriesRef();
            this.fu_flags.fu.files = [];
            this.resetUpdateForm();
            this._functionConstants.ShowNotification(ENotificationType.GREEN, res.messageCode);
            this.submitting = false;
          }, (error) => { this.submitting = false; });
        }, (error) => { this.submitting = false; });
      } else {
        Observable.combineLatest(
          this.getEncodeFromImage(this.fu_flags)
        ).subscribe((data: any[]): void => {
          this.countries_ref.flags = data[0] == '' ? this.countries_ref.flags : data[0];
          this._apiService.post('/api/adapter/execute', { Method: { Method: 'POST' }, Url: '/api/countries-ref/update-countries-ref', Module: 'CORE', Data: JSON.stringify(this.countries_ref) }).subscribe(res => {
            let index = this.data.findIndex(ds => ds[this.dataKey] == this.countries_ref[this.dataKey]);
            let item = this.copyProperty(res.data);
            let idx;
            if (this._storageService.getItem(SystemConstants.get('PREFIX_DATA_LANGUAGE')) == 'en') {
              item.countries_name = item.countries_name_e;
              item.countries_note = item.countries_note_e;
            } else {
              item.countries_name = item.countries_name_l;
              item.countries_note = item.countries_note_l;
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
                removeIds.push(ds.countries_rcd);
              }
            });
            if (removeIds.length > 0) {
              this._apiService.post('/api/adapter/execute', { Method: { Method: 'POST' }, Url: '/api/countries-ref/delete-countries-ref', Module: 'CORE', Data: JSON.stringify(removeIds) }).subscribe(res => {
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
      $('#updateCountriesRefModal').appendTo('body').modal('toggle');
    });
    setTimeout(() => {
      let arrRequest = this.getArrayRequest();
      arrRequest.push(this._apiService.post('/api/adapter/execute', { Method: { Method: 'GET' }, Url: '/api/countries-ref/get-by-id/' + row.countries_rcd, Module: 'CORE' }));
      Observable.combineLatest(arrRequest).subscribe((res: any) => {
        this.country_type_refs = this.country_type_refs || res[0];
        this.isCreate = false;
        this.countries_ref = res[1].data;
        if (this.country_type_refs.length > 0) {
          this.selectedCountryTypeRef = this.countries_ref.country_type_rcd;
        }
        this.updateForm = new FormGroup({
          'countries_rcd': new FormControl({ value: this.countries_ref.countries_rcd, disabled: true }, [Validators.maxLength(50), Validators.required]),
          'countries_code': new FormControl(this.countries_ref.countries_code, [Validators.required, Validators.maxLength(36)]),
          'countries_name_e': new FormControl(this.countries_ref.countries_name_e, [Validators.required, Validators.maxLength(100)]),
          'countries_name_l': new FormControl(this.countries_ref.countries_name_l, [Validators.maxLength(100), Validators.required]),
          'country_type_rcd': new FormControl(this.countries_ref.country_type_rcd, []),
          'capital': new FormControl(this.countries_ref.capital, []),
          'currency_code': new FormControl(this.countries_ref.currency_code, []),
          'currency_name': new FormControl(this.countries_ref.currency_name, []),
          'telephone_code': new FormControl(this.countries_ref.telephone_code, []),
          'internet_country_code': new FormControl(this.countries_ref.internet_country_code, []),
          'flags': new FormControl(this.countries_ref.flags, []),
          'sort_order': new FormControl(this.countries_ref.sort_order, [Validators.pattern(/^-?(0|[1-9]\d*)?$/)]),
          'countries_note_e': new FormControl(this.countries_ref.countries_note_e, [Validators.maxLength(250)]),
          'countries_note_l': new FormControl(this.countries_ref.countries_note_l, [Validators.maxLength(250)]),
          'meta_title': new FormControl(this.countries_ref.meta_title, []),
          'meta_description': new FormControl(this.countries_ref.meta_description, []),
          'meta_keywords': new FormControl(this.countries_ref.meta_keywords, []),
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
    if (this.country_type_refs == null) {
      arrRequest.push(this._functionConstants.getJsonFile(this._storageService.getItem(SystemConstants.get('PREFIX_DATA_LANGUAGE')), 'd', 'country_type_ref',
        this._apiService.post('/api/adapter/execute', { Method: { Method: 'GET' }, Url: '/api/country-type-ref/get-dropdown', Module: 'CORE' })
      ));
    } else {
      arrRequest.push(Observable.of(null));
    }
    return arrRequest;
  }
}
