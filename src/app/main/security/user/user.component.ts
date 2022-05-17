import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CustomEmailValidator, ENotificationType, Facility, Grid, NoContainWhitespaceValidator, NoFullWhitespaceValidator, SystemConstants, User } from 'core';
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/operator/takeUntil';
import { UpdateRoleSecondDatatableComponent } from './update-role-second-datatable/update-role-second-datatable.component';
declare var $: any;

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html'
})
export class UserComponent extends Grid implements OnInit {

  public selectedRoles: any;
  public employees: any[] = []; // Dropdown source: List employees no account
  public domains: any[]; // Dropdown source: List domains
  public user: User; // Creating or updating user object
  public selectedEmployee: any; // NgModel selected employee in dropdown
  public selectedDomain: any; // NgModel selected domain in dropdown
  public facility: Facility; // Current facility
  public showUpdateRoleModal = false; // Show add roles to user flag. By default, set to false to not load child component inside modal
  public user_id: string; // Current user's ID
  public USE_HRM_MODULE = SystemConstants.get('USE_HRM_MODULE');
  public ALLOW_CREATE_EMPLOYEE_FROM_USER_LIST = SystemConstants.get('ALLOW_CREATE_EMPLOYEE_FROM_USER_LIST');
  public USE_DOMAIN = SystemConstants.get('USE_DOMAIN');
  public hasViewRoleOfUserPermission = false;
  public hasAddRoleToUserPermission = false;
  public hasRemoveRoleFromUserPermission = false;
  public enabledInput = true;
  public refreshFirstDt = false;

  @ViewChild(UpdateRoleSecondDatatableComponent, {static: false}) addSecondDataTable: UpdateRoleSecondDatatableComponent; // Child component instance. Declare to call methods or properties

  constructor(injector: Injector) {
    super(injector);
    this.apiUrl = '/api/user';
    this.searchApiUrl = '/api/user/search';
    this.exportUrl = '/api/user/export-to-excel';
    this.exportFilename = 'USER_LIST.xlsx';
    this.getDropdownNoAccountFlag = true;
    this.dataKey = 'user_id';
    this.filterFields = ['username', 'full_name', 'description'];
    this.searchValue.page = this.page;
    this.searchValue.page = this.page;
    this.searchFormGroup = new FormGroup({
      'username': new FormControl(''),
      'full_name': new FormControl(''),
      'active_flag': new FormControl([]),
      'deactive_flag': new FormControl([])
    });
    this.hasCreatePermission = this._authenService.hasPermission(this.pageId, 'create_user');
    this.hasUpdatePermission = this._authenService.hasPermission(this.pageId, 'update_user');
    this.hasDeletePermission = this._authenService.hasPermission(this.pageId, 'delete_user');
    this.hasViewRoleOfUserPermission = this._authenService.hasPermission(this.pageId, 'view_role_of_user');
    this.hasRemoveRoleFromUserPermission = this._authenService.hasPermission(this.pageId, 'remove_role_from_user');
    this.hasAddRoleToUserPermission = this._authenService.hasPermission(this.pageId, 'add_role_to_user');
    this.tableActions = [];
    if (this.hasDeletePermission) {
      this._translateService.get(['COMMON.active', 'COMMON.deactive']).subscribe((message) => {
        this.tableActions.push({ label: message['COMMON.active'], icon: 'fa-unlock', command: () => { this.onChangeActiveStatus(this.selectedDataTableItems, 1); } });
        this.tableActions.push({ label: message['COMMON.deactive'], icon: 'fa-lock', command: () => { this.onChangeActiveStatus(this.selectedDataTableItems, 0); } });
      });
    }
  }

  ngOnInit() {
    this.search();
  }

  /**
   * Event open create user modal
   * sender: Add button
   */
  openCreateModal() {
    this.doneSetupForm = false;
    this.showUpdateModal = true;
    setTimeout(() => {
      $('#createUserModal').modal('toggle');
    });
    setTimeout(() => {
      this.isCreate = true;
      this.user = new User();
      this.user.objectjson_person.date_of_birth = this.today;
      this.updateForm = new FormGroup({
        'username': new FormControl('', [Validators.required, NoFullWhitespaceValidator, NoContainWhitespaceValidator, Validators.maxLength(150)]),
        'description_e': new FormControl('', Validators.maxLength(500)),
        'description_l': new FormControl('', Validators.maxLength(500))
      });
      if (SystemConstants.get('USE_HRM_MODULE')) {
        if (SystemConstants.get('ALLOW_CREATE_EMPLOYEE_FROM_USER_LIST')) {
          this.updateForm.addControl('employee', new FormControl(''));
        } else {
          this.updateForm.addControl('employee', new FormControl('', Validators.required));
        }
      }
      if (SystemConstants.get('USE_DOMAIN')) {
        this.updateForm.addControl('domain', new FormControl('', Validators.required));
      }
      this.updateForm.addControl('full_name', new FormControl({ value: '', disabled: !SystemConstants.get('ALLOW_CREATE_EMPLOYEE_FROM_USER_LIST') }, [Validators.required, NoFullWhitespaceValidator, Validators.maxLength(50)]));
      this.updateForm.addControl('email', new FormControl({ value: '', disabled: !SystemConstants.get('ALLOW_CREATE_EMPLOYEE_FROM_USER_LIST') }, [CustomEmailValidator, Validators.maxLength(50)]));
      this.updateForm.addControl('date_of_birth', new FormControl({ value: '', disabled: !SystemConstants.get('ALLOW_CREATE_EMPLOYEE_FROM_USER_LIST') }, Validators.required));
      this.updateForm.addControl('gender', new FormControl({ value: '', disabled: !SystemConstants.get('ALLOW_CREATE_EMPLOYEE_FROM_USER_LIST') }, Validators.required));
      this.updateFormOriginalData = this.updateForm.getRawValue();
      this.doneSetupForm = true;
      setTimeout(() => {
        this.setAutoFocus();
      });
    }, 300);
  }

  /**
   * Event choose employee on ng-selectize
   * @param selectedValue Selected value on ng-selectize
   */
  chooseEmployee(selectedValue) {
    this.selectedEmployee = selectedValue;
    if (!selectedValue || selectedValue == '' || selectedValue == '00000000-0000-0000-0000-000000000000') {
      this.user.objectjson_person.full_name = '';
      this.user.objectjson_person.email = '';
      this.user.objectjson_person.gender = 1;
      this.user.objectjson_person.date_of_birth = null;
      this.updateForm.get('full_name').enable();
      this.updateForm.get('email').enable();
      this.updateForm.get('date_of_birth').enable();
      this.updateForm.get('gender').enable();
      this.enabledInput = true;
    } else {
      let selects = this.selectizes.filter(ds => ds['$wrapper'].parent().hasClass('employee_id') && ds.items.length > 0);
      if (selects.length > 0) {
        let emp = selects[0].options[selects[0].items[0]];
        this.user.objectjson_person.full_name = emp.objectjson_person.full_name;
        this.user.objectjson_person.email = emp.objectjson_person.email;
        this.user.objectjson_person.gender = emp.objectjson_person.gender;
        this.user.objectjson_person.date_of_birth = new Date(emp.objectjson_person.date_of_birth);
        this.selectedGender = this.user.objectjson_person.gender;
        this.updateForm.get('full_name').disable();
        this.updateForm.get('email').disable();
        this.updateForm.get('date_of_birth').disable();
        this.enabledInput = false;
        this._changeDetectorRef.detectChanges();
      }
    }
  }

  /**
   * Event submit create or update modal
   * sender: OK button inside modal
   */
  onSubmit() {
    if (this.updateForm.valid || !this.user.objectjson_person.email || this.user.objectjson_person.email == '') {
      this.user.objectjson_person.gender = +this.selectedGender;
      if (this.isCreate) {
        if (!this.enabledInput) {
          this.user.user_id = this.selectedEmployee;
        }
        if (SystemConstants.get('USE_DOMAIN')) {
          this.user.domain_name = this.selectedDomain;
        }
        if (!this.user.user_id) {
          this.user.user_id = SystemConstants.get('EMPTY_GUID');
        }
        this._apiService.post('/api/user/create-user', this.user).takeUntil(this.unsubscribe).subscribe(res => {
          let item = $.extend(true, {}, this.user);
          if (this._storageService.getItem(SystemConstants.get('PREFIX_DATA_LANGUAGE')) == 'en') {
            item.description = item.description_e;
          } else {
            item.description = item.description_l;
          }
          if (this.data.length >= this.pageSize) {
            this.data.splice(this.data.length - 1, 1);
          }
          item.active_flag = 0;
          item.user_id = res.data;
          this.data.unshift(item);
          this.data = this.data.slice();
          this.totalRecords += 1;
          this.user = new User();
          this.selectedEmployee = null;
          this._functionConstants.ShowNotification(ENotificationType.GREEN, res.messageCode);
          this.resetUpdateForm();
          this.submitting = false;
        }, (error) => { this.submitting = false; });
      } else {
        this.user.domain_name = this.selectedDomain;
        this._apiService.post('/api/user/update-user', this.user).takeUntil(this.unsubscribe).subscribe(res => {
          let index = this.data.findIndex(ds => ds[this.dataKey] == this.user[this.dataKey]);
          let item = $.extend(true, {}, this.user);
          if (this._storageService.getItem(SystemConstants.get('PREFIX_DATA_LANGUAGE')) == 'en') {
            item.description = item.description_e;
          } else {
            item.description = item.description_l;
          }
          item.active_flag = this.data[index].active_flag;
          this.data[index] = item;
          this.data = this.data.slice();
          this.closeUpdateForm(null);
          this.submitting = false;
          this._functionConstants.ShowNotification(ENotificationType.GREEN, res.messageCode);
        }, (error) => { this.submitting = false; });
      }
    } else {
      this._functionConstants.ShowNotification(ENotificationType.RED, 'MESSAGE.error_occurred');
    }
  }

  onResetPassWord(row) {
    let username = row[0].username;
    if (username) {
      this._translateService.get('MESSAGE.confirm_reset').subscribe((message) => {
        this._confirmationService.confirm({
          message: message,
          accept: () => {
            let data = [];
            data.push(username);
            this._apiService.post('/api/user/request-password', data).takeUntil(this.unsubscribe).subscribe(res => {
              this._functionConstants.ShowNotification(ENotificationType.GREEN, res.messageCode);
            });
          }
        });
      });
    }
  }

  /**
   * Event remove record(s) in datatable
   * sender: Remove button on each datatable's record or Remove multiple records in table actions split button
   */
  onChangeActiveStatus(items: any[], status: number = -1) {
    if (status == -1) {
      status = items[0].active_flag == 0 ? 1 : 0;
    }
    if (items.length > 0) {
      if (status == 1) {
        this._translateService.get('MESSAGE.confirm_active').subscribe((message) => {
          this._confirmationService.confirm({
            message: message,
            accept: () => {
              let removeIds = [];
              items.forEach(ds => {
                removeIds.push(ds.user_id + ';' + ds.username);
              });
              removeIds.push(status.toString());
              this._apiService.post('/api/user/change-active-status-user', removeIds).takeUntil(this.unsubscribe).subscribe(res => {
                this.selectedEmployee = [];
                this.search();
                this._functionConstants.ShowNotification(ENotificationType.GREEN, res.messageCode);
              });
            }
          });
        });
      } else {
        this._translateService.get('MESSAGE.confirm_deactive').subscribe((message) => {
          this._confirmationService.confirm({
            message: message,
            accept: () => {
              let removeIds = [];
              items.forEach(ds => {
                removeIds.push(ds.user_id + ';' + ds.username);
              });
              removeIds.push(status.toString());
              this._apiService.post('/api/user/change-active-status-user', removeIds).takeUntil(this.unsubscribe).subscribe(res => {
                this.selectedEmployee = [];
                this.search();
                this._functionConstants.ShowNotification(ENotificationType.GREEN, res.messageCode);
              });
            }
          });
        });
      }
    }
  }

  /**
   * Event update record in datatable
   * sender: Update button on each datatable's record
   */
  openUpdateModal(event, row) {
    this.doneSetupForm = false;
    this.showUpdateModal = true;
    setTimeout(() => {
      $('#createUserModal').modal('toggle');
    });
    setTimeout(() => {
      this._apiService.get('/api/user/get-by-id/' + row.user_id).takeUntil(this.unsubscribe).subscribe(res => {
        this.isCreate = false;
        this.user = res.data;
        res.data.objectjson_person.date_of_birth = new Date(res.data.objectjson_person.date_of_birth);
        this.selectedDomain = res.data.domain_name;
        this.selectedGender = res.data.objectjson_person.gender;
        this.updateForm = new FormGroup({
          'username': new FormControl(this.user.username, [Validators.required, NoFullWhitespaceValidator, NoContainWhitespaceValidator, Validators.maxLength(150)]),
          'description_e': new FormControl(this.user.description_e, Validators.maxLength(500)),
          'description_l': new FormControl(this.user.description_l, Validators.maxLength(500))
        });
        if (SystemConstants.get('USE_DOMAIN')) {
          this.updateForm.addControl('domain', new FormControl(this.user.domain_name, Validators.required));
        }
        if (SystemConstants.get('ALLOW_CREATE_EMPLOYEE_FROM_USER_LIST')) {
          this.updateForm.addControl('full_name', new FormControl(this.user.objectjson_person.full_name, [Validators.required, NoFullWhitespaceValidator, Validators.maxLength(50)]));
          this.updateForm.addControl('email', new FormControl({ value: this.user.objectjson_person.email, disabled: false }, [Validators.email, Validators.maxLength(50)]));
          this.updateForm.addControl('date_of_birth', new FormControl(this.user.objectjson_person.date_of_birth, Validators.required));
          this.updateForm.addControl('gender', new FormControl(this.user.objectjson_person.gender, Validators.required));
        }
        this.updateFormOriginalData = this.updateForm.getRawValue();
        this.doneSetupForm = true;
        setTimeout(() => {
          this.setAutoFocus();
        });
      });
    }, 300);
  }

  /**
   * Event open add role to user modal
   * sender: Add role to user button on each datatable's record
   */
  openUpdateRoleModal(event, row) {
    this.user_id = row.user_id;
    this.user = row;
    this.showUpdateRoleModal = true;
    setTimeout(() => {
      $('#updateRoleForm').closest('.modal').modal('show');
    });
  }

  /**
   * Event add item(s) to list
   * sender: addToList emitted from child component
   */
  addToList(items: any[]) {
    if (this.addSecondDataTable.data == null) {
      this.addSecondDataTable.data = [];
    }
    items.forEach(ds => {
      let ins = this.addSecondDataTable.data.find(x => x.role_id == ds.role_id);
      if (ins == null) {
        ds.is_new = true;
        this.addSecondDataTable.data.push(ds);
      }
    });
    this.addSecondDataTable.data = this.addSecondDataTable.data.slice();
    this.addSecondDataTable.makeRowsSameHeight();
  }

  /**
   * Event remove item(s) from list
   * sender: removeFromList emitted from child component
   */
  removeFromList(items: any[]) {
    items.forEach(ds => {
      let index = this.addSecondDataTable.data.findIndex(x => x.user_id == ds.user_id);
      if (index > -1) {
        this.addSecondDataTable.data.splice(index, 1);
      }
    });
    this.addSecondDataTable.data = this.addSecondDataTable.data.slice();
  }

  /**
   * Event save action Add role to user
   * sender: OK button on Add role to user modal
   */
  onUpdateRole() {
    let roleIds = [];
    this.addSecondDataTable.data.forEach(ds => {
      roleIds.push(ds.role_id);
    });
    this._apiService.post('/api/user/update-role', { user_id: this.user_id, user_name: this.user.username, data: roleIds }).takeUntil(this.unsubscribe).subscribe(res => {
      this.search();
      this.closeUpdateRoleModal();
      this._functionConstants.ShowNotification(ENotificationType.GREEN, res.messageCode);
    });
  }

  refreshDone() {
    this.refreshFirstDt = false;
    this._changeDetectorRef.detectChanges();
  }

  /**
   * Event close Add role to user modal
   * sender: Cancel button on Add role to user modal
   */
  closeUpdateRoleModal() {
    $('#updateRoleForm').closest('.modal').modal('hide');
    setTimeout(() => {
      this.user_id = null;
      this.showUpdateRoleModal = false;
    }, 300);
  }

}
