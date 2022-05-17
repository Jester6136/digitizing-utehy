
import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ENotificationType, Facility, Grid, NoFullWhitespaceValidator, PageGroup, Permission, Role, SystemConstants } from 'core';
import { combineLatest as observableCombineLatest, of as observableOf } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { GrantPermissionComponent } from './grant-permission/grant-permission.component';
import { UpdateUserSecondDatatableComponent } from './update-user-second-datatable/update-user-second-datatable.component';
declare var $: any;

@Component({
  selector: 'app-role',
  templateUrl: './role.component.html'
})
export class RoleComponent extends Grid implements OnInit {

  @ViewChild('grant-permission', {static: false}) modalGrantPermission: GrantPermissionComponent;
  // Private properties
  public facility: Facility;
  public role: Role;
  public roleGrantPermission: Role;
  public selectedType = false;
  public rolePermissions: Permission[];
  public allPageGroups: PageGroup[];
  public roleScopes: any[];
  // Flag allow load component in modal. If not has this flag, when component init, child's component inside modal init too
  public loadComponent = false;
  selectedOption: string;
  options: any[];
  cities: any[];
  selectedCity: string;
  display = false;
  filteredCountriesSingle: any[];
  countries: any[];
  country: any;
  val: string;
  selectedTypes: string[] = [];
  noSpecial: RegExp = /^[^<>*!]+$/;
  expandedItems: any[] = [];
  showUpdateRoleMembershipModal = false;
  role_id: string;
  role_name: string;
  @ViewChild('addSecondDataTable', {static: false}) addSecondDataTable: UpdateUserSecondDatatableComponent;
  @ViewChild('cmpGrantPermission', {static: false}) cmpGrantPermission: GrantPermissionComponent;
  selectedContext: any;
  contexts: any[];
  refreshFirstDt = false;
  public hasViewRoleMembershipPermission = false;
  public hasAddRoleMembershipPermission = false;
  public hasViewRolePermission = false;
  public hasViewRoleScopePermission = false;
  public hasRemoveRoleMembershipPermission = false;
  public hasGrantPermissionToRole = false;
  public hasGrantScopeToRole = false;

  constructor(injector: Injector) {
    super(injector);
    this.searchApiUrl = '/api/role/search';
    this.filterFields = ['role_code', 'role_name', 'user_number', 'description'];
    this.dataKey = 'role_id';
    this.searchValue.page = this.page;
    this.searchValue.pageSize = this.pageSize;
    this.searchFormGroup = new FormGroup({
      'role_code': new FormControl(''),
      'role_name': new FormControl(''),
      'role_type': new FormControl('')
    });
    this.tableActions = [];
    this.hasViewRoleMembershipPermission = this._authenService.hasPermission(this.pageId, 'view_role_membership');
    this.hasAddRoleMembershipPermission = this._authenService.hasPermission(this.pageId, 'add_role_membership');
    this.hasRemoveRoleMembershipPermission = this._authenService.hasPermission(this.pageId, 'remove_role_membership');
    this.hasViewRoleScopePermission = this._authenService.hasPermission(this.pageId, 'view_role_scope');
    this.hasViewRolePermission = this._authenService.hasPermission(this.pageId, 'view_role_permission');
    this.hasCreatePermission = this._authenService.hasPermission(this.pageId, 'create_role');
    this.hasUpdatePermission = this._authenService.hasPermission(this.pageId, 'update_role');
    this.hasDeletePermission = this._authenService.hasPermission(this.pageId, 'delete_role');
    this.hasGrantPermissionToRole = this._authenService.hasPermission(this.pageId, 'grant_permission_to_role');
    this.hasGrantScopeToRole = this._authenService.hasPermission(this.pageId, 'grant_scope_to_role');
    if (this.hasDeletePermission) {
      this._translateService.get('COMMON.delete').subscribe((message) => {
        this.tableActions.push({ label: message, icon: 'fa-times', command: () => { this.onRemove(this.selectedDataTableItems); } });
      });
    }
  }

  ngOnInit() {
    this.facility = JSON.parse(this._storageService.getItem(SystemConstants.get('PREFIX_CURRENT_FACILITY')));
    this.role = new Role();
    this.role.facility_id = this.facility.facility_id;
    this.search();
  }

  openCreateModal() {
    this.doneSetupForm = false;
    this.showUpdateModal = true;
    setTimeout(() => {
      $('#updateRoleModal').modal('show');
    });
    setTimeout(() => {
      this.role = new Role();
      this.role.facility_id = this.facility.facility_id;
      this.selectedType = false;
      this.isCreate = true;
      observableCombineLatest(this.getArrayRequest()).pipe(takeUntil(this.unsubscribe)).subscribe((res: any) => {
        this.contexts = this.contexts || res[0].data;
        if (this.contexts.length > 0) {
          this.selectedContext = this.contexts[0].context_id;
        }
        this.updateForm = new FormGroup({
          'role_code': new FormControl('', [Validators.required, NoFullWhitespaceValidator, Validators.maxLength(30)]),
          'role_name_e': new FormControl('', [Validators.required, NoFullWhitespaceValidator, Validators.maxLength(250)]),
          'role_name_l': new FormControl('', [Validators.required, NoFullWhitespaceValidator, Validators.maxLength(250)]),
          'facility_name': new FormControl({ value: this.facility.facility_name_l, disabled: true }),
          'facility_name_e': new FormControl({ value: this.facility.facility_name_e, disabled: true }),
          'use_context_secutiry': new FormControl(false),
          'use_context_secutiry_e': new FormControl(false),
          'context': new FormControl(''),
          'description_e': new FormControl('', Validators.maxLength(500)),
          'description_l': new FormControl('', Validators.maxLength(500))
        });
        this.updateFormOriginalData = this.updateForm.getRawValue();
        this.doneSetupForm = true;
        setTimeout(() => {
          this.setAutoFocus();
          this.updateValidator();
        });
      });
    }, 300);
  }

  updateValidator() {
    this.updateForm.get('role_name_e').valueChanges.pipe(takeUntil(this.unsubscribe)).subscribe(
      (value: string) => {
        if (!value || value.trim() == '') {
          this.updateForm.get('role_name_l').setValidators([Validators.required, NoFullWhitespaceValidator, Validators.maxLength(250)]);
        } else {
          this.updateForm.get('role_name_l').clearValidators();
        }
        this.updateForm.get('role_name_l').updateValueAndValidity({ onlySelf: true, emitEvent: false });
      }
    );
    this.updateForm.get('role_name_l').valueChanges.pipe(takeUntil(this.unsubscribe)).subscribe(
      (value: string) => {
        if (!value || value.trim() == '') {
          this.updateForm.get('role_name_e').setValidators([Validators.required, NoFullWhitespaceValidator, Validators.maxLength(250)]);
        } else {
          this.updateForm.get('role_name_e').clearValidators();
        }
        this.updateForm.get('role_name_e').updateValueAndValidity({ onlySelf: true, emitEvent: false });
      }
    );
    this.updateForm.get('use_context_secutiry').valueChanges.pipe(takeUntil(this.unsubscribe)).subscribe(
      (value: boolean) => {
        if (value) {
          this.updateForm.get('context').setValidators([Validators.required]);
          this.updateForm.get('context').updateValueAndValidity();
        } else {
          this.updateForm.get('context').clearValidators();
        }
      }
    );
  }

  onSubmit() {
    if (!this.role.role_name_e) {
      this.role.role_name_e = this.role.role_name_l;
    }
    if (!this.role.role_name_l) {
      this.role.role_name_l = this.role.role_name_e;
    }
    if (!this.role.description_e && this.role.description_l) {
      this.role.description_e = this.role.description_l;
    }
    if (!this.role.description_l && this.role.description_e) {
      this.role.description_l = this.role.description_e;
    }
    this.role.use_context_security = this.selectedType;
    if (this.selectedType) {
      this.role.context_id = this.selectedContext;
    } else {
      this.role.context_id = SystemConstants.get('EMPTY_GUID');
    }
    if (this.isCreate) {
      this.role.role_id = this.Guid.newGuid();
      this._apiService.post('/api/role/create-role', this.role).pipe(takeUntil(this.unsubscribe)).subscribe(res => {
        let item = $.extend(true, {}, this.role);
        let idx;
        if (this._storageService.getItem(SystemConstants.get('PREFIX_DATA_LANGUAGE')) == 'en') {
          item.role_name = item.role_name_e;
        } else {
          item.role_name = item.role_name_l;
        }
        if (this.data.length >= this.pageSize) {
          this.data.splice(this.data.length - 1, 1);
        }
        if (this._storageService.getItem(SystemConstants.get('PREFIX_DATA_LANGUAGE')) == 'en') {
          item.description = item.description_e;
        } else {
          item.description = item.description_l;
        }
        if (this.data.length >= this.pageSize) {
          this.data.splice(this.data.length - 1, 1);
        }
        item.user_number = 0;
        this.data.unshift(item);
        this.data = this.data.slice();
        this.totalRecords += 1;
        this.role = new Role();
        this.resetUpdateForm();
        this._functionConstants.ShowNotification(ENotificationType.GREEN, res.messageCode);
        this.submitting = false;
      }, (error) => { this.submitting = false; });
    } else {
      this._apiService.post('/api/role/update-role', this.role).pipe(takeUntil(this.unsubscribe)).subscribe(res => {
        let index = this.data.findIndex(ds => ds[this.dataKey] == this.role[this.dataKey]);
        let item = $.extend(true, {}, this.role);
        if (this._storageService.getItem(SystemConstants.get('PREFIX_DATA_LANGUAGE')) == 'en') {
          item.role_name = item.role_name_e;
          item.description = item.description_e;
        } else {
          item.role_name = item.role_name_l;
          item.description = item.description_l;
        }
        item.user_number = this.data[index].user_number;
        this.data[index] = item;
        this.data = this.data.slice();
        this.closeUpdateForm(null);
        this._functionConstants.ShowNotification(ENotificationType.GREEN, res.messageCode);
        this.reloadDropdowns();
        this.submitting = false;
      }, (error) => { this.submitting = false; });
    }
  }

  loadDropdowns() {
    this.search();
  }

  openGrantModal(event, row) {
    this.roleGrantPermission = row;
    this.role_name = row.role_name;
    setTimeout(() => {
      $('#modalGrantPermission').modal('show');
    });
    setTimeout(() => {
      let arrRequest = [];
      if (this.hasViewRolePermission && this.allPageGroups == null) {
        arrRequest.push(this._apiService.get('/api/role/get-all-permission'));
      } else {
        arrRequest.push(observableOf(null));
      }
      if (this.hasViewRoleScopePermission && this.roleGrantPermission.use_context_security) {
        arrRequest.push(this._apiService.post('/api/role/get-all-scope', { role_id: this.roleGrantPermission.role_id, context_id: this.roleGrantPermission.context_id }));
      } else {
        arrRequest.push(observableOf(null));
      }
      observableCombineLatest(arrRequest).pipe(takeUntil(this.unsubscribe)).subscribe((res: any) => {
        if (res[0]) {
          this.allPageGroups = res[0].data;
        }
        if (res[1]) {
          this.roleScopes = res[1].data;
        }
        this.loadComponent = true;
      });
    }, 300);
  }

  closeGrantPermissonModal(event) {
    $('#modalGrantPermission').modal('hide');
    setTimeout(() => {
      (this.allPageGroups || []).forEach(pg => {
        pg.pages.forEach(p => {
          p.actions.forEach(ds => {
            ds.granted = null;
          });
        });
      });
      this.allPageGroups = null;
      this.roleScopes = null;
      this.loadComponent = false;
    }, 300);
  }

  onRemove(items: any[]) {
    if (items.length > 0) {
      this._translateService.get('MESSAGE.confirm_delete').subscribe((message) => {
        this._confirmationService.confirm({
          message: message,
          accept: () => {
            let removeIds = [];
            items.forEach(ds => {
              removeIds.push(ds.role_id + ';' + ds.role_code);
            });
            this._apiService.post('/api/role/delete-role', removeIds).pipe(takeUntil(this.unsubscribe)).subscribe(res => {
              this.selectedDataTableItems = [];
              this.search();
              this._functionConstants.ShowNotification(ENotificationType.GREEN, res.messageCode);
            });
          }
        });
      });
    }
  }

  getArrayRequest() {
    let arrRequest = [];
    if (this.contexts == null) {
      arrRequest.push(this._apiService.get('/api/context/get-all'));
    } else {
      arrRequest.push(observableOf(null));
    }
    return arrRequest;
  }

  openUpdateModal(row) {
    this.doneSetupForm = false;
    this.showUpdateModal = true;
    setTimeout(() => {
      $('#updateRoleModal').modal('toggle');
    });
    setTimeout(() => {
      let arrRequest = this.getArrayRequest();
      arrRequest.push(this._apiService.get('/api/role/get-by-id/' + row.role_id));
      observableCombineLatest(arrRequest).pipe(takeUntil(this.unsubscribe)).subscribe((res: any) => {
        this.isCreate = false;
        this.contexts = this.contexts || res[0].data;
        this.role = res[1].data;
        this.selectedType = this.role.use_context_security;
        if (this.role.use_context_security) {
          this.selectedContext = this.role.context_id;
        }
        this.updateForm = new FormGroup({
          'role_code': new FormControl('', [Validators.required, NoFullWhitespaceValidator, Validators.maxLength(30)]),
          'role_name_e': new FormControl('', [Validators.required, NoFullWhitespaceValidator, Validators.maxLength(250)]),
          'role_name_l': new FormControl('', [Validators.required, NoFullWhitespaceValidator, Validators.maxLength(250)]),
          'facility_name': new FormControl({ value: this.facility.facility_name_l, disabled: true }),
          'facility_name_e': new FormControl({ value: this.facility.facility_name_e, disabled: true }),
          'use_context_secutiry': new FormControl(''),
          'use_context_secutiry_e': new FormControl(''),
          'context': new FormControl(''),
          'description_e': new FormControl('', Validators.maxLength(500)),
          'description_l': new FormControl('', Validators.maxLength(500))
        });
        this.updateFormOriginalData = this.updateForm.getRawValue();
        this.doneSetupForm = true;
        setTimeout(() => {
          this.setAutoFocus();
          this.updateValidator();
        });
      });
    }, 300);
  }

  openUpdateRoleMembershipModal(event, row) {
    this.role_id = row.role_id;
    this.role_name = row.role_name;
    this.role = row;
    this.showUpdateRoleMembershipModal = true;
    setTimeout(() => {
      $('#updateRoleMembershipForm').closest('.modal').modal('toggle');
    });
  }

  addToList(items: any[]) {
    if (this.addSecondDataTable.data == null) {
      this.addSecondDataTable.data = [];
    }
    items.forEach(ds => {
      let ins = this.addSecondDataTable.data.find(x => x.user_id == ds.user_id);
      if (ins == null) {
        ds.is_new = true;
        this.addSecondDataTable.data.push(ds);
      }
    });
    this.addSecondDataTable.data = this.addSecondDataTable.data.slice();
    this.addSecondDataTable.makeRowsSameHeight();
  }

  removeFromList(items: any[]) {
    items.forEach(ds => {
      let index = this.addSecondDataTable.data.findIndex(x => x.user_id == ds.user_id);
      if (index > -1) {
        this.addSecondDataTable.data.splice(index, 1);
      }
    });
    this.addSecondDataTable.data = this.addSecondDataTable.data.slice();
  }

  onUpdateRoleMembership() {
    let userIds = [];
    this.addSecondDataTable.data.forEach(ds => {
      userIds.push(ds.user_id);
    });
    this._apiService.post('/api/role/update-role-membership', { role_id: this.role_id, role_name_e: this.role.role_code, role_name_l: this.role.role_code, data: userIds }).pipe(takeUntil(this.unsubscribe)).subscribe(res => {
      this.data.forEach(item => {
        if (item.role_id == this.role_id) {
          item.user_number = this.addSecondDataTable.data.length;
        }
      });
      this.closeUpdateRoleMembershipModal();
      this._functionConstants.ShowNotification(ENotificationType.GREEN, res.messageCode);
    });
  }

  refreshDone() {
    this.refreshFirstDt = false;
    this._changeDetectorRef.detectChanges();
  }

  closeUpdateRoleMembershipModal() {
    this.showUpdateRoleMembershipModal = false;
    $('#updateRoleMembershipForm').closest('.modal').modal('toggle');
    this.role_id = null;
  }

  ok() {
    this.cmpGrantPermission.ok();
    this.closeGrantPermissonModal(null);
  }

}
