import { Component, Injector, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ENotificationType, Grid, SystemConstants } from 'core';
import { combineLatest, Observable } from 'rxjs';
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/operator/takeUntil';
import { ProvincesRef } from '../../../../main/entities/provinces-ref';
declare var $: any;

@Component({
  selector: 'app-provinces-ref',
  templateUrl: './provinces-ref.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProvincesRefComponent extends Grid implements OnInit {
  public isCreate = false;
  public provinces_ref: ProvincesRef;
  public countries_refs: any;
  public selectedCountriesRef: any;
  public constructor(injector: Injector) {
    super(injector);
    this.LZCompress = true; // using LZString compress data
    this.loadBalancing = true;
    this.APIModuleName = 'CORE';
    this.getListByIdApiUrl = '/api/provinces-ref/get-list-by-id/';
    this.searchApiUrl = '/api/provinces-ref/search';
    this.exportUrl = '/api/provinces-ref/export-to-excel';
    this.exportFilename = 'list_provinces_ref.xlsx';
    this.setNullIfEmpty = ['countries_rcd'];
    this.filterFields = ['provinces_rcd', 'provinces_name', 'countries_rcd', 'sort_order', 'provinces_type'];
    this.dataKey = 'provinces_rcd';
    this.searchValue.page = this.page;
    this.searchValue.pageSize = this.pageSize;
    this.searchFormGroup = new FormGroup({
      'provinces_rcd': new FormControl(''),
      'provinces_name': new FormControl(''),
      'countries_rcd': new FormControl(''),
    });
    this.hasViewPermission = this._authenService.hasPermission(this.pageId, 'view_provinces_ref');
    this.hasCreatePermission = this._authenService.hasPermission(this.pageId, 'create_provinces_ref');
    this.hasUpdatePermission = this._authenService.hasPermission(this.pageId, 'update_provinces_ref');
    this.hasDeletePermission = this._authenService.hasPermission(this.pageId, 'delete_provinces_ref');
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
      this._functionConstants.getJsonFile(this._storageService.getItem(SystemConstants.get('PREFIX_DATA_LANGUAGE')), 'd', 'countries_ref',
        this._apiService.post('/api/adapter/execute', { Method: { Method: 'GET' }, Url: '/api/countries-ref/get-dropdown', Module: 'CORE' })
      ),
    ]).subscribe(res => {
      this.countries_refs = null;
      setTimeout(() => {
        this.countries_refs = this.countries_refs || res[0];
      });
      this.search();
    });
  }

  public ngOnInit() {
    this.provinces_ref = new ProvincesRef();
    this.loadDropdowns();
  }

  public openCreateModal(row: any = null) {
    this.doneSetupForm = false;
    this.showUpdateModal = true;
    setTimeout(() => {
      $('#updateProvincesRefModal').appendTo('body').modal('toggle');
    });
    setTimeout(() => {
      this.provinces_ref = new ProvincesRef();
      this.isCreate = true;
      Observable.combineLatest(this.getArrayRequest()).subscribe(res => {
        this.countries_refs = this.countries_refs || res[0];
        this.updateForm = new FormGroup({
          'provinces_rcd': new FormControl('', [Validators.required, Validators.maxLength(50)]),
          'provinces_code': new FormControl('', [Validators.required, Validators.maxLength(36)]),
          'provinces_name_e': new FormControl('', [Validators.required, Validators.maxLength(100)]),
          'provinces_name_l': new FormControl('', [Validators.maxLength(100), Validators.required]),
          'telephone_code': new FormControl('', []),
          'zip_code': new FormControl('', []),
          'countries_rcd': new FormControl('', [Validators.maxLength(50), Validators.required]),
          'sort_order': new FormControl('', [Validators.pattern(/^-?(0|[1-9]\d*)?$/)]),
          'provinces_note_e': new FormControl('', [Validators.maxLength(250)]),
          'provinces_note_l': new FormControl('', [Validators.maxLength(250)]),
          'meta_title': new FormControl('', []),
          'meta_description': new FormControl('', []),
          'meta_keywords': new FormControl('', []),
          'provinces_type_e': new FormControl('', [Validators.required]),
          'provinces_type_l': new FormControl('', [Validators.required]),
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
    this.updateForm.get('provinces_name_e').valueChanges.subscribe((value: string) => {
      if (!value || value.trim() == '') {
        this.updateForm.get('provinces_name_l').setValidators([Validators.required, Validators.maxLength(100)]);
      } else {
        this.updateForm.get('provinces_name_l').setValidators([Validators.maxLength(100)]);
      }
      this.updateForm.get('provinces_name_l').updateValueAndValidity({ onlySelf: true, emitEvent: false });
    });
    this.updateForm.get('provinces_name_l').valueChanges.subscribe((value: string) => {
      if (!value || value.trim() == '') {
        this.updateForm.get('provinces_name_e').setValidators([Validators.maxLength(100), Validators.required]);
      } else {
        this.updateForm.get('provinces_name_e').setValidators([Validators.maxLength(100)]);
      }
      this.updateForm.get('provinces_name_e').updateValueAndValidity({ onlySelf: true, emitEvent: false });
    });
    this.updateForm.get('provinces_type_e').valueChanges.subscribe((value: string) => {
      if (!value || value.trim() == '') {
        this.updateForm.get('provinces_type_l').setValidators([Validators.required]);
      } else {
        this.updateForm.get('provinces_type_l').setValidators([]);
      }
      this.updateForm.get('provinces_type_l').updateValueAndValidity({ onlySelf: true, emitEvent: false });
    });
    this.updateForm.get('provinces_type_l').valueChanges.subscribe((value: string) => {
      if (!value || value.trim() == '') {
        this.updateForm.get('provinces_type_e').setValidators([Validators.required]);
      } else {
        this.updateForm.get('provinces_type_e').setValidators([]);
      }
      this.updateForm.get('provinces_type_e').updateValueAndValidity({ onlySelf: true, emitEvent: false });
    });
  }

  public onSubmit() {
    if (this.submitting == false) {
      this.submitting = true;
      if (!this.provinces_ref.provinces_name_e && this.provinces_ref.provinces_name_l) {
        this.provinces_ref.provinces_name_e = this.provinces_ref.provinces_name_l;
      }
      if (!this.provinces_ref.provinces_name_l && this.provinces_ref.provinces_name_e) {
        this.provinces_ref.provinces_name_l = this.provinces_ref.provinces_name_e;
      }
      this.provinces_ref.sort_order = +this.provinces_ref.sort_order
      if (!this.provinces_ref.provinces_note_e && this.provinces_ref.provinces_note_l) {
        this.provinces_ref.provinces_note_e = this.provinces_ref.provinces_note_l;
      }
      if (!this.provinces_ref.provinces_note_l && this.provinces_ref.provinces_note_e) {
        this.provinces_ref.provinces_note_l = this.provinces_ref.provinces_note_e;
      }
      if (!this.provinces_ref.provinces_type_e && this.provinces_ref.provinces_type_l) {
        this.provinces_ref.provinces_type_e = this.provinces_ref.provinces_type_l;
      }
      if (!this.provinces_ref.provinces_type_l && this.provinces_ref.provinces_type_e) {
        this.provinces_ref.provinces_type_l = this.provinces_ref.provinces_type_e;
      }
      this.provinces_ref.countries_rcd = this.selectedCountriesRef;
      if (this.isCreate) {
        this._apiService.post('/api/adapter/execute', { Method: { Method: 'POST' }, Url: '/api/provinces-ref/create-provinces-ref', Module: 'CORE', Data: JSON.stringify(this.provinces_ref) }).subscribe(res => {
          let item = this.copyProperty(res.data);
          let idx;
          if (this._storageService.getItem(SystemConstants.get('PREFIX_DATA_LANGUAGE')) == 'en') {
            item.provinces_name = item.provinces_name_e;
            item.provinces_note = item.provinces_note_e;
            item.provinces_type = item.provinces_type_e;
          } else {
            item.provinces_name = item.provinces_name_l;
            item.provinces_note = item.provinces_note_l;
            item.provinces_type = item.provinces_type_l;
          }
          if (this.data.length >= this.pageSize) {
            this.data.splice(this.data.length - 1, 1);
          }
          this.data.unshift(item);
          this.data = this.data.slice();
          this.totalRecords += 1;
          this.provinces_ref = new ProvincesRef();
          this.resetUpdateForm();
          this._functionConstants.ShowNotification(ENotificationType.GREEN, res.messageCode);
          this.submitting = false;
        }, (error) => { this.submitting = false; });
      } else {
        this._apiService.post('/api/adapter/execute', { Method: { Method: 'POST' }, Url: '/api/provinces-ref/update-provinces-ref', Module: 'CORE', Data: JSON.stringify(this.provinces_ref) }).subscribe(res => {
          let index = this.data.findIndex(ds => ds[this.dataKey] == this.provinces_ref[this.dataKey]);
          let item = this.copyProperty(res.data);
          let idx;
          if (this._storageService.getItem(SystemConstants.get('PREFIX_DATA_LANGUAGE')) == 'en') {
            item.provinces_name = item.provinces_name_e;
            item.provinces_note = item.provinces_note_e;
            item.provinces_type = item.provinces_type_e;
          } else {
            item.provinces_name = item.provinces_name_l;
            item.provinces_note = item.provinces_note_l;
            item.provinces_type = item.provinces_type_l;
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
                removeIds.push(ds.provinces_rcd);
              }
            });
            if (removeIds.length > 0) {
              this._apiService.post('/api/adapter/execute', { Method: { Method: 'POST' }, Url: '/api/provinces-ref/delete-provinces-ref', Module: 'CORE', Data: JSON.stringify(removeIds) }).subscribe(res => {
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
      $('#updateProvincesRefModal').appendTo('body').modal('toggle');
    });
    setTimeout(() => {
      let arrRequest = this.getArrayRequest();
      arrRequest.push(this._apiService.post('/api/adapter/execute', { Method: { Method: 'GET' }, Url: '/api/provinces-ref/get-by-id/' + row.provinces_rcd, Module: 'CORE' }));
      Observable.combineLatest(arrRequest).subscribe((res: any) => {
        this.countries_refs = this.countries_refs || res[0];
        this.isCreate = false;
        this.provinces_ref = res[1].data;
        if (this.countries_refs.length > 0) {
          this.selectedCountriesRef = this.provinces_ref.countries_rcd;
        }
        this.updateForm = new FormGroup({
          'provinces_rcd': new FormControl({ value: this.provinces_ref.provinces_rcd, disabled: true }, [Validators.required, Validators.maxLength(50)]),
          'provinces_code': new FormControl(this.provinces_ref.provinces_code, [Validators.required, Validators.maxLength(36)]),
          'provinces_name_e': new FormControl(this.provinces_ref.provinces_name_e, [Validators.required, Validators.maxLength(100)]),
          'provinces_name_l': new FormControl(this.provinces_ref.provinces_name_l, [Validators.maxLength(100), Validators.required]),
          'telephone_code': new FormControl(this.provinces_ref.telephone_code, []),
          'zip_code': new FormControl(this.provinces_ref.zip_code, []),
          'countries_rcd': new FormControl(this.provinces_ref.countries_rcd, [Validators.maxLength(50), Validators.required]),
          'sort_order': new FormControl(this.provinces_ref.sort_order, [Validators.pattern(/^-?(0|[1-9]\d*)?$/)]),
          'provinces_note_e': new FormControl(this.provinces_ref.provinces_note_e, [Validators.maxLength(250)]),
          'provinces_note_l': new FormControl(this.provinces_ref.provinces_note_l, [Validators.maxLength(250)]),
          'meta_title': new FormControl(this.provinces_ref.meta_title, []),
          'meta_description': new FormControl(this.provinces_ref.meta_description, []),
          'meta_keywords': new FormControl(this.provinces_ref.meta_keywords, []),
          'provinces_type_e': new FormControl(this.provinces_ref.provinces_type_e, [Validators.required]),
          'provinces_type_l': new FormControl(this.provinces_ref.provinces_type_l, [Validators.required]),
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
    if (this.countries_refs == null) {
      arrRequest.push(this._functionConstants.getJsonFile(this._storageService.getItem(SystemConstants.get('PREFIX_DATA_LANGUAGE')), 'd', 'countries_ref',
        this._apiService.post('/api/adapter/execute', { Method: { Method: 'GET' }, Url: '/api/countries-ref/get-dropdown', Module: 'CORE' })
      ));
    } else {
      arrRequest.push(Observable.of(null));
    }
    return arrRequest;
  }
}
