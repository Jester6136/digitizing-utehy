import { Component, Injector, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ENotificationType, Grid, SystemConstants } from 'core';
import { combineLatest, Observable } from 'rxjs';
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/operator/takeUntil';
import { DistrictsRef } from '../../../../main/entities/districts-ref';
declare var $: any;

@Component({
  selector: 'app-districts-ref',
  templateUrl: './districts-ref.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DistrictsRefComponent extends Grid implements OnInit {

  public isCreate = false;
  public districts_ref: DistrictsRef;
  public provinces_refs: any;
  public selectedProvincesRef: any;
  public constructor(injector: Injector) {
    super(injector);
    this.LZCompress = true; // using LZString compress data
    this.loadBalancing = true;
    this.APIModuleName = 'CORE';
    this.getListByIdApiUrl = '/api/districts-ref/get-list-by-id/';
    this.searchApiUrl = '/api/districts-ref/search';
    this.exportUrl = '/api/districts-ref/export-to-excel';
    this.exportFilename = 'list_districts_ref.xlsx';
    this.setNullIfEmpty = ['provinces_rcd'];
    this.filterFields = ['districts_rcd', 'districts_name', 'districts_type', 'provinces_rcd', 'sort_order'];
    this.dataKey = 'districts_rcd';
    this.searchValue.page = this.page;
    this.searchValue.pageSize = this.pageSize;
    this.searchFormGroup = new FormGroup({
      'districts_rcd': new FormControl(''),
      'districts_name': new FormControl(''),
      'provinces_rcd': new FormControl(''),
    });
    this.hasViewPermission = this._authenService.hasPermission(this.pageId, 'view_districts_ref');
    this.hasCreatePermission = this._authenService.hasPermission(this.pageId, 'create_districts_ref');
    this.hasUpdatePermission = this._authenService.hasPermission(this.pageId, 'update_districts_ref');
    this.hasDeletePermission = this._authenService.hasPermission(this.pageId, 'delete_districts_ref');
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
      this._functionConstants.getJsonFile(this._storageService.getItem(SystemConstants.get('PREFIX_DATA_LANGUAGE')), 'd', 'provinces_ref',
        this._apiService.post('/api/adapter/execute', { Method: { Method: 'GET' }, Url: '/api/provinces-ref/get-dropdown', Module: 'CORE' })
      ),
    ]).subscribe(res => {
      this.provinces_refs = null;
      setTimeout(() => {
        this.provinces_refs = this.provinces_refs || res[0];
      });
      this.search();
    });
  }

  public ngOnInit() {
    this.districts_ref = new DistrictsRef();
    this.loadDropdowns();
  }

  public openCreateModal(row: any = null) {
    this.doneSetupForm = false;
    this.showUpdateModal = true;
    setTimeout(() => {
      $('#updateDistrictsRefModal').appendTo('body').modal('toggle');
    });
    setTimeout(() => {
      this.districts_ref = new DistrictsRef();
      this.isCreate = true;
      Observable.combineLatest(this.getArrayRequest()).subscribe(res => {
        this.provinces_refs = this.provinces_refs || res[0];
        this.updateForm = new FormGroup({
          'districts_rcd': new FormControl('', [Validators.maxLength(50), Validators.required]),
          'districts_code': new FormControl('', [Validators.required, Validators.maxLength(36)]),
          'districts_name_e': new FormControl('', [Validators.required, Validators.maxLength(100)]),
          'districts_name_l': new FormControl('', [Validators.required, Validators.maxLength(100)]),
          'districts_type_e': new FormControl('', [Validators.required, Validators.maxLength(20)]),
          'districts_type_l': new FormControl('', [Validators.required, Validators.maxLength(20)]),
          'lati_long_tude': new FormControl('', [Validators.maxLength(50)]),
          'provinces_rcd': new FormControl('', [Validators.required, Validators.maxLength(50)]),
          'sort_order': new FormControl('', [Validators.pattern(/^-?(0|[1-9]\d*)?$/)]),
          'districts_note_e': new FormControl('', [Validators.maxLength(250)]),
          'districts_note_l': new FormControl('', [Validators.maxLength(250)]),
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
    this.updateForm.get('districts_name_e').valueChanges.subscribe((value: string) => {
      if (!value || value.trim() == '') {
        this.updateForm.get('districts_name_l').setValidators([Validators.required, Validators.maxLength(100)]);
      } else {
        this.updateForm.get('districts_name_l').setValidators([Validators.maxLength(100)]);
      }
      this.updateForm.get('districts_name_l').updateValueAndValidity({ onlySelf: true, emitEvent: false });
    });
    this.updateForm.get('districts_name_l').valueChanges.subscribe((value: string) => {
      if (!value || value.trim() == '') {
        this.updateForm.get('districts_name_e').setValidators([Validators.required, Validators.maxLength(100)]);
      } else {
        this.updateForm.get('districts_name_e').setValidators([Validators.maxLength(100)]);
      }
      this.updateForm.get('districts_name_e').updateValueAndValidity({ onlySelf: true, emitEvent: false });
    });
    this.updateForm.get('districts_type_e').valueChanges.subscribe((value: string) => {
      if (!value || value.trim() == '') {
        this.updateForm.get('districts_type_l').setValidators([Validators.required, Validators.maxLength(20)]);
      } else {
        this.updateForm.get('districts_type_l').setValidators([Validators.maxLength(20)]);
      }
      this.updateForm.get('districts_type_l').updateValueAndValidity({ onlySelf: true, emitEvent: false });
    });
    this.updateForm.get('districts_type_l').valueChanges.subscribe((value: string) => {
      if (!value || value.trim() == '') {
        this.updateForm.get('districts_type_e').setValidators([Validators.required, Validators.maxLength(20)]);
      } else {
        this.updateForm.get('districts_type_e').setValidators([Validators.maxLength(20)]);
      }
      this.updateForm.get('districts_type_e').updateValueAndValidity({ onlySelf: true, emitEvent: false });
    });
  }

  public onSubmit() {
    if (this.submitting == false) {
      this.submitting = true;
      if (!this.districts_ref.districts_name_e && this.districts_ref.districts_name_l) {
        this.districts_ref.districts_name_e = this.districts_ref.districts_name_l;
      }
      if (!this.districts_ref.districts_name_l && this.districts_ref.districts_name_e) {
        this.districts_ref.districts_name_l = this.districts_ref.districts_name_e;
      }
      if (!this.districts_ref.districts_type_e && this.districts_ref.districts_type_l) {
        this.districts_ref.districts_type_e = this.districts_ref.districts_type_l;
      }
      if (!this.districts_ref.districts_type_l && this.districts_ref.districts_type_e) {
        this.districts_ref.districts_type_l = this.districts_ref.districts_type_e;
      }
      this.districts_ref.sort_order = +this.districts_ref.sort_order
      if (!this.districts_ref.districts_note_e && this.districts_ref.districts_note_l) {
        this.districts_ref.districts_note_e = this.districts_ref.districts_note_l;
      }
      if (!this.districts_ref.districts_note_l && this.districts_ref.districts_note_e) {
        this.districts_ref.districts_note_l = this.districts_ref.districts_note_e;
      }
      this.districts_ref.provinces_rcd = this.selectedProvincesRef;
      if (this.isCreate) {
        this._apiService.post('/api/adapter/execute', { Method: { Method: 'POST' }, Url: '/api/districts-ref/create-districts-ref', Module: 'CORE', Data: JSON.stringify(this.districts_ref) }).subscribe(res => {
          let item = this.copyProperty(res.data);
          let idx;
          if (this._storageService.getItem(SystemConstants.get('PREFIX_DATA_LANGUAGE')) == 'en') {
            item.districts_name = item.districts_name_e;
            item.districts_type = item.districts_type_e;
            item.districts_note = item.districts_note_e;
          } else {
            item.districts_name = item.districts_name_l;
            item.districts_type = item.districts_type_l;
            item.districts_note = item.districts_note_l;
          }
          if (this.data.length >= this.pageSize) {
            this.data.splice(this.data.length - 1, 1);
          }
          this.data.unshift(item);
          this.data = this.data.slice();
          this.totalRecords += 1;
          this.districts_ref = new DistrictsRef();
          this.resetUpdateForm();
          this._functionConstants.ShowNotification(ENotificationType.GREEN, res.messageCode);
          this.submitting = false;
        }, (error) => { this.submitting = false; });
      } else {
        this._apiService.post('/api/adapter/execute', { Method: { Method: 'POST' }, Url: '/api/districts-ref/update-districts-ref', Module: 'CORE', Data: JSON.stringify(this.districts_ref) }).subscribe(res => {
          let index = this.data.findIndex(ds => ds[this.dataKey] == this.districts_ref[this.dataKey]);
          let item = this.copyProperty(res.data);
          let idx;
          if (this._storageService.getItem(SystemConstants.get('PREFIX_DATA_LANGUAGE')) == 'en') {
            item.districts_name = item.districts_name_e;
            item.districts_type = item.districts_type_e;
            item.districts_note = item.districts_note_e;
          } else {
            item.districts_name = item.districts_name_l;
            item.districts_type = item.districts_type_l;
            item.districts_note = item.districts_note_l;
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
                removeIds.push(ds.districts_rcd);
              }
            });
            if (removeIds.length > 0) {
              this._apiService.post('/api/adapter/execute', { Method: { Method: 'POST' }, Url: '/api/districts-ref/delete-districts-ref', Module: 'CORE', Data: JSON.stringify(removeIds) }).subscribe(res => {
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
      $('#updateDistrictsRefModal').appendTo('body').modal('toggle');
    });
    setTimeout(() => {
      let arrRequest = this.getArrayRequest();
      arrRequest.push(this._apiService.post('/api/adapter/execute', { Method: { Method: 'GET' }, Url: '/api/districts-ref/get-by-id/' + row.districts_rcd, Module: 'CORE' }));
      Observable.combineLatest(arrRequest).subscribe((res: any) => {
        this.provinces_refs = this.provinces_refs || res[0];
        this.isCreate = false;
        this.districts_ref = res[1].data;
        if (this.provinces_refs.length > 0) {
          this.selectedProvincesRef = this.districts_ref.provinces_rcd;
        }
        this.updateForm = new FormGroup({
          'districts_rcd': new FormControl({ value: this.districts_ref.districts_rcd, disabled: true }, [Validators.maxLength(50), Validators.required]),
          'districts_code': new FormControl(this.districts_ref.districts_code, [Validators.required, Validators.maxLength(36)]),
          'districts_name_e': new FormControl(this.districts_ref.districts_name_e, [Validators.required, Validators.maxLength(100)]),
          'districts_name_l': new FormControl(this.districts_ref.districts_name_l, [Validators.required, Validators.maxLength(100)]),
          'districts_type_e': new FormControl(this.districts_ref.districts_type_e, [Validators.required, Validators.maxLength(20)]),
          'districts_type_l': new FormControl(this.districts_ref.districts_type_l, [Validators.required, Validators.maxLength(20)]),
          'lati_long_tude': new FormControl(this.districts_ref.lati_long_tude, [Validators.maxLength(50)]),
          'provinces_rcd': new FormControl(this.districts_ref.provinces_rcd, [Validators.required, Validators.maxLength(50)]),
          'sort_order': new FormControl(this.districts_ref.sort_order, [Validators.pattern(/^-?(0|[1-9]\d*)?$/)]),
          'districts_note_e': new FormControl(this.districts_ref.districts_note_e, [Validators.maxLength(250)]),
          'districts_note_l': new FormControl(this.districts_ref.districts_note_l, [Validators.maxLength(250)]),
          'meta_title': new FormControl(this.districts_ref.meta_title, [Validators.maxLength(250)]),
          'meta_description': new FormControl(this.districts_ref.meta_description, [Validators.maxLength(250)]),
          'meta_keywords': new FormControl(this.districts_ref.meta_keywords, [Validators.maxLength(250)]),
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
    if (this.provinces_refs == null) {
      arrRequest.push(this._functionConstants.getJsonFile(this._storageService.getItem(SystemConstants.get('PREFIX_DATA_LANGUAGE')), 'd', 'provinces_ref',
        this._apiService.post('/api/adapter/execute', { Method: { Method: 'GET' }, Url: '/api/provinces-ref/get-dropdown', Module: 'CORE' })
      ));
    } else {
      arrRequest.push(Observable.of(null));
    }
    return arrRequest;
  }
}
