import { Component, Injector, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ENotificationType, Grid, SystemConstants } from 'core';
import { combineLatest, Observable } from 'rxjs';
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/operator/takeUntil';
import { WardsRef } from '../../../../main/entities/wards-ref';
declare var $: any;

@Component({
  selector: 'app-wards-ref',
  templateUrl: './wards-ref.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WardsRefComponent extends Grid implements OnInit {
  public isCreate = false;
  public wards_ref: WardsRef;
  public districts_refs: any;
  public selectedDistrictsRef: any;
  public constructor(injector: Injector) {
    super(injector);
    this.LZCompress = true; // using LZString compress data
    this.loadBalancing = true;
    this.APIModuleName = 'CORE';
    this.getListByIdApiUrl = '/api/wards-ref/get-list-by-id/';
    this.searchApiUrl = '/api/wards-ref/search';
    this.exportUrl = '/api/wards-ref/export-to-excel';
    this.exportFilename = 'list_wards_ref.xlsx';
    this.setNullIfEmpty = ['districts_rcd'];
    this.filterFields = ['wards_rcd', 'wards_name', 'wards_type', 'districts_rcd', 'sort_order'];
    this.dataKey = 'wards_rcd';
    this.searchValue.page = this.page;
    this.searchValue.pageSize = this.pageSize;
    this.searchFormGroup = new FormGroup({
      'wards_rcd': new FormControl(''),
      'wards_name': new FormControl(''),
      'districts_rcd': new FormControl(''),
    });
    this.hasViewPermission = this._authenService.hasPermission(this.pageId, 'view_wards_ref');
    this.hasCreatePermission = this._authenService.hasPermission(this.pageId, 'create_wards_ref');
    this.hasUpdatePermission = this._authenService.hasPermission(this.pageId, 'update_wards_ref');
    this.hasDeletePermission = this._authenService.hasPermission(this.pageId, 'delete_wards_ref');
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
      this._functionConstants.getJsonFile(this._storageService.getItem(SystemConstants.get('PREFIX_DATA_LANGUAGE')), 'd', 'districts_ref',
        this._apiService.post('/api/adapter/execute', { Method: { Method: 'GET' }, Url: '/api/districts-ref/get-dropdown', Module: 'CORE' })
      ),
    ]).subscribe(res => {
      this.districts_refs = null;
      setTimeout(() => {
        debugger;
        this.districts_refs = this.districts_refs || res[0];
      });
      this.search();
    });
  }

  public ngOnInit() {
    this.wards_ref = new WardsRef();
    this.loadDropdowns();
  }

  public openCreateModal(row: any = null) {
    this.doneSetupForm = false;
    this.showUpdateModal = true;
    setTimeout(() => {
      $('#updateWardsRefModal').appendTo('body').modal('toggle');
    });
    setTimeout(() => {
      this.wards_ref = new WardsRef();
      this.isCreate = true;
      Observable.combineLatest(this.getArrayRequest()).subscribe(res => {
        this.districts_refs = this.districts_refs || res[0];
        this.updateForm = new FormGroup({
          'wards_rcd': new FormControl('', [Validators.maxLength(50), Validators.required]),
          'wards_code': new FormControl('', [Validators.required, Validators.maxLength(36)]),
          'wards_name_e': new FormControl('', [Validators.maxLength(100), Validators.required]),
          'wards_name_l': new FormControl('', [Validators.maxLength(100), Validators.required]),
          'wards_type_e': new FormControl('', [Validators.required, Validators.maxLength(10)]),
          'wards_type_l': new FormControl('', [Validators.required, Validators.maxLength(10)]),
          'lati_long_tude': new FormControl('', [Validators.maxLength(50)]),
          'districts_rcd': new FormControl('', [Validators.required, Validators.maxLength(50)]),
          'sort_order': new FormControl('', [Validators.pattern(/^-?(0|[1-9]\d*)?$/)]),
          'wards_note_e': new FormControl('', [Validators.maxLength(250)]),
          'wards_note_l': new FormControl('', [Validators.maxLength(250)]),
          'meta_title': new FormControl('', [Validators.maxLength(250)]),
          'meta_description': new FormControl('', [Validators.maxLength(250)]),
          'meta_keywords': new FormControl('', [Validators.maxLength(250)]),
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
    this.updateForm.get('wards_name_e').valueChanges.subscribe((value: string) => {
      if (!value || value.trim() == '') {
        this.updateForm.get('wards_name_l').setValidators([Validators.maxLength(100), Validators.required]);
      } else {
        this.updateForm.get('wards_name_l').setValidators([Validators.maxLength(100)]);
      }
      this.updateForm.get('wards_name_l').updateValueAndValidity({ onlySelf: true, emitEvent: false });
    });
    this.updateForm.get('wards_name_l').valueChanges.subscribe((value: string) => {
      if (!value || value.trim() == '') {
        this.updateForm.get('wards_name_e').setValidators([Validators.maxLength(100), Validators.required]);
      } else {
        this.updateForm.get('wards_name_e').setValidators([Validators.maxLength(100)]);
      }
      this.updateForm.get('wards_name_e').updateValueAndValidity({ onlySelf: true, emitEvent: false });
    });
    this.updateForm.get('wards_type_e').valueChanges.subscribe((value: string) => {
      if (!value || value.trim() == '') {
        this.updateForm.get('wards_type_l').setValidators([Validators.required, Validators.maxLength(10)]);
      } else {
        this.updateForm.get('wards_type_l').setValidators([Validators.maxLength(10)]);
      }
      this.updateForm.get('wards_type_l').updateValueAndValidity({ onlySelf: true, emitEvent: false });
    });
    this.updateForm.get('wards_type_l').valueChanges.subscribe((value: string) => {
      if (!value || value.trim() == '') {
        this.updateForm.get('wards_type_e').setValidators([Validators.required, Validators.maxLength(10)]);
      } else {
        this.updateForm.get('wards_type_e').setValidators([Validators.maxLength(10)]);
      }
      this.updateForm.get('wards_type_e').updateValueAndValidity({ onlySelf: true, emitEvent: false });
    });
  }

  public onSubmit() {
    if (this.submitting == false) {
      this.submitting = true;
      if (!this.wards_ref.wards_name_e && this.wards_ref.wards_name_l) {
        this.wards_ref.wards_name_e = this.wards_ref.wards_name_l;
      }
      if (!this.wards_ref.wards_name_l && this.wards_ref.wards_name_e) {
        this.wards_ref.wards_name_l = this.wards_ref.wards_name_e;
      }
      if (!this.wards_ref.wards_type_e && this.wards_ref.wards_type_l) {
        this.wards_ref.wards_type_e = this.wards_ref.wards_type_l;
      }
      if (!this.wards_ref.wards_type_l && this.wards_ref.wards_type_e) {
        this.wards_ref.wards_type_l = this.wards_ref.wards_type_e;
      }
      this.wards_ref.sort_order = +this.wards_ref.sort_order
      if (!this.wards_ref.wards_note_e && this.wards_ref.wards_note_l) {
        this.wards_ref.wards_note_e = this.wards_ref.wards_note_l;
      }
      if (!this.wards_ref.wards_note_l && this.wards_ref.wards_note_e) {
        this.wards_ref.wards_note_l = this.wards_ref.wards_note_e;
      }
      this.wards_ref.districts_rcd = this.selectedDistrictsRef;
      if (this.isCreate) {
        this._apiService.post('/api/adapter/execute', { Method: { Method: 'POST' }, Url: '/api/wards-ref/create-wards-ref', Module: 'CORE', Data: JSON.stringify(this.wards_ref) }).subscribe(res => {
          let item = this.copyProperty(res.data);
          let idx;
          if (this._storageService.getItem(SystemConstants.get('PREFIX_DATA_LANGUAGE')) == 'en') {
            item.wards_name = item.wards_name_e;
            item.wards_type = item.wards_type_e;
            item.wards_note = item.wards_note_e;
          } else {
            item.wards_name = item.wards_name_l;
            item.wards_type = item.wards_type_l;
            item.wards_note = item.wards_note_l;
          }
          if (this.data.length >= this.pageSize) {
            this.data.splice(this.data.length - 1, 1);
          }
          this.data.unshift(item);
          this.data = this.data.slice();
          this.totalRecords += 1;
          this.wards_ref = new WardsRef();
          this.resetUpdateForm();
          this._functionConstants.ShowNotification(ENotificationType.GREEN, res.messageCode);
          this.submitting = false;
        }, (error) => { this.submitting = false; });
      } else {
        this._apiService.post('/api/adapter/execute', { Method: { Method: 'POST' }, Url: '/api/wards-ref/update-wards-ref', Module: 'CORE', Data: JSON.stringify(this.wards_ref) }).subscribe(res => {
          let index = this.data.findIndex(ds => ds[this.dataKey] == this.wards_ref[this.dataKey]);
          let item = this.copyProperty(res.data);
          let idx;
          if (this._storageService.getItem(SystemConstants.get('PREFIX_DATA_LANGUAGE')) == 'en') {
            item.wards_name = item.wards_name_e;
            item.wards_type = item.wards_type_e;
            item.wards_note = item.wards_note_e;
          } else {
            item.wards_name = item.wards_name_l;
            item.wards_type = item.wards_type_l;
            item.wards_note = item.wards_note_l;
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
                removeIds.push(ds.wards_rcd);
              }
            });
            if (removeIds.length > 0) {
              this._apiService.post('/api/adapter/execute', { Method: { Method: 'POST' }, Url: '/api/wards-ref/delete-wards-ref', Module: 'CORE', Data: JSON.stringify(removeIds) }).subscribe(res => {
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
      $('#updateWardsRefModal').appendTo('body').modal('toggle');
    });
    setTimeout(() => {
      let arrRequest = this.getArrayRequest();
      arrRequest.push(this._apiService.post('/api/adapter/execute', { Method: { Method: 'GET' }, Url: '/api/wards-ref/get-by-id/' + row.wards_rcd, Module: 'CORE' }));
      Observable.combineLatest(arrRequest).subscribe((res: any) => {
        this.districts_refs = this.districts_refs || res[0];
        this.isCreate = false;
        this.wards_ref = res[1].data;
        if (this.districts_refs.length > 0) {
          this.selectedDistrictsRef = this.wards_ref.districts_rcd;
        }
        this.updateForm = new FormGroup({
          'wards_rcd': new FormControl({ value: this.wards_ref.wards_rcd, disabled: true }, [Validators.maxLength(50), Validators.required]),
          'wards_code': new FormControl(this.wards_ref.wards_code, [Validators.required, Validators.maxLength(36)]),
          'wards_name_e': new FormControl(this.wards_ref.wards_name_e, [Validators.maxLength(100), Validators.required]),
          'wards_name_l': new FormControl(this.wards_ref.wards_name_l, [Validators.maxLength(100), Validators.required]),
          'wards_type_e': new FormControl(this.wards_ref.wards_type_e, [Validators.required, Validators.maxLength(10)]),
          'wards_type_l': new FormControl(this.wards_ref.wards_type_l, [Validators.required, Validators.maxLength(10)]),
          'lati_long_tude': new FormControl(this.wards_ref.lati_long_tude, [Validators.maxLength(50)]),
          'districts_rcd': new FormControl(this.wards_ref.districts_rcd, [Validators.required, Validators.maxLength(50)]),
          'sort_order': new FormControl(this.wards_ref.sort_order, [Validators.pattern(/^-?(0|[1-9]\d*)?$/)]),
          'wards_note_e': new FormControl(this.wards_ref.wards_note_e, [Validators.maxLength(250)]),
          'wards_note_l': new FormControl(this.wards_ref.wards_note_l, [Validators.maxLength(250)]),
          'meta_title': new FormControl(this.wards_ref.meta_title, [Validators.maxLength(250)]),
          'meta_description': new FormControl(this.wards_ref.meta_description, [Validators.maxLength(250)]),
          'meta_keywords': new FormControl(this.wards_ref.meta_keywords, [Validators.maxLength(250)]),
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
    if (this.districts_refs == null) {
      arrRequest.push(this._functionConstants.getJsonFile(this._storageService.getItem(SystemConstants.get('PREFIX_DATA_LANGUAGE')), 'd', 'districts_ref',
        this._apiService.post('/api/adapter/execute', { Method: { Method: 'GET' }, Url: '/api/districts-ref/get-dropdown', Module: 'CORE' })
      ));
    } else {
      arrRequest.push(Observable.of(null));
    }
    return arrRequest;
  }
}
