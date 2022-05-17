
import { Component, EventEmitter, Injector, Input, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ENotificationType, PageGroup, Role, Utils, Grid } from 'core';
import { TreeNode } from 'primeng/api';
import { takeUntil } from 'rxjs/operators';
declare let $: any;

@Component({
  selector: 'grant-permission',
  templateUrl: './grant-permission.component.html'
})
export class GrantPermissionComponent extends Grid implements OnInit {

  public chosingPermissions: any[];
  public rolePermissions: any[];
  public treeData: any[] = [];
  public contextScopes: any[];
  public isPermissionTab = true;
  public hasGrantPermissionToRole = false;
  public hasGrantScopeToRole = false;
  public data: TreeNode[];
  public origin_data: TreeNode[];
  public dataKey_Permissions: any;
  public dataKey_Scopes: any;
  @Input() role: Role;
  @Input() allPageGroups: PageGroup[];
  @Input() roleScopes: any[];
  @Input() hasViewRolePermission: boolean;
  @Input() hasViewRoleScopePermission: boolean;
  @Output() disposeModal: EventEmitter<void> = new EventEmitter<void>();
  constructor(injector: Injector) {
    super(injector);
    this.filterFields = ['path', 'action_name', 'code', 'name'];
    this.dataKey_Permissions = 'id';
    this.dataKey_Scopes = 'id';
  }

  ngOnInit() {
    if (this.allPageGroups) {
      if (this._functionConstants.GetCurrentCaptionLanguage() == 'en') {
        this.treeData = JSON.parse(JSON.stringify(this.allPageGroups).replace(/pages/g, 'children')
          .replace(/page_name_e/g, 'label').replace(/page_group_name_e/g, 'label'));
      } else {
        this.treeData = JSON.parse(JSON.stringify(this.allPageGroups).replace(/pages/g, 'children')
          .replace(/page_name_l/g, 'label').replace(/page_group_name_l/g, 'label'));
      }
    }
    if (this.treeData) {
      this.treeData.forEach(ds => {
        if (!ds.isAll && ds.children.length == 0) {
          ds.icon = 'fa-folder';
        } else {
          ds.expandedIcon = 'fa-folder-open';
          ds.collapsedIcon = 'fa-folder';
        }
      });
      this.data = this.treeData;
      this.origin_data = $.extend(true, [], this.data);
    }
    this.hasGrantPermissionToRole = this._authenService.hasPermission(this.pageId, 'grant_permission_to_role');
    this.hasGrantScopeToRole = this._authenService.hasPermission(this.pageId, 'grant_scope_to_role');
    if (this.roleScopes) {
      this.contextScopes = this.roleScopes;
    }
    this._apiService.get('/api/permission/get-by-role-id/' + this.role.role_id).pipe(takeUntil(this.unsubscribe)).subscribe(res => {
      this.rolePermissions = res.data;
      this.treeSelectionChange(this.data[0]);
    });
    if (this.hasViewRolePermission) {
      this.isPermissionTab = true;
    } else {
      this.isPermissionTab = false;
    }
  }

  public treeSelectionChange(node) {
    if (node) {
      this.chosingPermissions = [];
      let id = node.page_id ? node.page_id : node.page_group_id;
      let pageGroup = this.allPageGroups.find(ds => ds.page_group_id == id);
      if (pageGroup) {
        // If user click to page group node
        // Loop all child pages, each page loop all actions, each action set page_group_id, action_name, path
        // and push actions to permissions array
        for (let i = 0; i < pageGroup.pages.length; i++) {
          if (pageGroup.pages[i].actions) {
            pageGroup.pages[i].actions.forEach(ds => {
              ds.id =  this.Guid.newGuid();
              ds.page_group_id = node.page_group_id;
              ds.action_name = (this.currentLang == 'en' ? ds.action_name_e : ds.action_name_l);
              ds.path = '[' + node.label + '].[' + (this.currentLang == 'en' ? pageGroup.pages[i].page_name_e : pageGroup.pages[i].page_name_l) + ']';
              if (ds.granted == null) {
                ds.granted = (this.rolePermissions || []).find(x => x.action_code == ds.action_code) != null;
              }
              this.chosingPermissions.push(ds);
            });
          }
        }
      } else { // Else user click to page node
        // Loop all child actions, each action set page_group_id, action_name, path
        // and push actions to permissions array
        pageGroup = this.allPageGroups.find(ds => ds.page_group_id == node.parent.page_group_id);
        let page = pageGroup.pages.find(ds => ds.page_id == node.page_id);
        if (page.actions) {
          page.actions.forEach(ds => {
            ds.page_group_id = node.parent.page_group_id;
            ds.action_name = (this.currentLang == 'en' ? ds.action_name_e : ds.action_name_l);
            ds.path = '[' + node.parent.label + '].[' + node.label + ']';
            if (ds.granted == null) {
              ds.granted = (this.rolePermissions || []).find(x => x.action_code == ds.action_code) != null;
            }
            this.chosingPermissions.push(ds);
          });
        }
      }
    }
  }

  okGrantPermissionToRole() {
    let newPermissions = [];
    this.allPageGroups.forEach(pg => {
      pg.pages.forEach(p => {
        p.actions.forEach(ds => {
          if (ds.granted != false) {
            if (!ds.granted) {
              if (this.rolePermissions.findIndex(x => x.action_code == ds.action_code) > -1) {
                newPermissions.push({ page_id: ds.page_id, action_code: ds.action_code });
              }
            } else {
              newPermissions.push({ page_id: ds.page_id, action_code: ds.action_code });
            }
          }
        });
      });
    });
    this._apiService.post('/api/role/update-role-permission', { role_id: this.role.role_id, role_name_e: this.role.role_code, role_name_l: this.role.role_code, data: newPermissions }).pipe(takeUntil(this.unsubscribe)).subscribe(res => {
      this.disposeModal.emit();
      this._functionConstants.ShowNotification(ENotificationType.GREEN, res.messageCode);
    });
  }

  okGrantScopeToRole() {
    let newScopes = [];
    this.contextScopes.forEach(ds => {
      if (ds.granted) {
        newScopes.push({ id: ds.id });
      }
    });
    this._apiService.post('/api/role/update-role-scope', { role_id: this.role.role_id, role_name_e: this.role.role_code, role_name_l: this.role.role_code, data: newScopes }).pipe(takeUntil(this.unsubscribe)).subscribe(res => {
      this.disposeModal.emit();
      this._functionConstants.ShowNotification(ENotificationType.GREEN, res.messageCode);
    });
  }

  ok() {
    if (this.isPermissionTab) {
      this.okGrantPermissionToRole();
    } else {
      this.okGrantScopeToRole();
    }
  }

  checkAll(event) {
    let arrcode = [];
    $('#permission tbody :checkbox').each(function () {
      arrcode.push(this.value);
    });
    this.chosingPermissions.forEach(ds => {
      if (arrcode.findIndex(code => code == ds.action_code) > -1) {
        ds.granted = event.target.checked;
      }
    });
  }

  checkAllScope(event) {
    let arrcode = [];
    $('#scope tbody :checkbox').each(function () {
      arrcode.push(this.value);
    });
    this.contextScopes.forEach(ds => {
      if (arrcode.findIndex(id => id == ds.id) > -1) {
        ds.granted = event.target.checked;
      }
    });
  }

  filterInTable_Permissions(event: any) {
    if (event.type == 'click' || event.keyCode == 13) {
        let container = $(event.target).closest('.datatable-container-permission');
        if (this.globalFilterText.trim() != '') {
            (this.chosingPermissions || []).forEach(ds => {
                if (Object.keys(ds).some(k => this.filterFields.indexOf(k) > -1
                    && ds[k] != null && ds[k].toString().toLowerCase().includes(this.globalFilterText.toLowerCase()))) {
                    let ele = container.find('.index_' + ds[this.dataKey]).closest('tr');
                    if (ele.closest('.ui-table-frozen-view')) {
                        ele.closest('.ui-table-scrollable-wrapper').find('.ui-table-unfrozen-view tbody tr').eq(ele.index()).show();
                    }
                    ds.hide = false;
                    ele.show();
                } else {
                    let ele = container.find('.index_' + ds[this.dataKey]).closest('tr');
                    if (ele.closest('.ui-table-frozen-view')) {
                        ele.closest('.ui-table-scrollable-wrapper').find('.ui-table-unfrozen-view tbody tr').eq(ele.index()).hide();
                    }
                    ds.hide = true;
                    ele.hide();
                }
            });
        } else {
            (this.chosingPermissions || []).forEach(ds => {
                let ele = container.find('.index_' + ds[this.dataKey]).closest('tr');
                if (ele.closest('.ui-table-frozen-view')) {
                    ele.closest('.ui-table-scrollable-wrapper').find('.ui-table-unfrozen-view tbody tr').eq(ele.index()).show();
                }
                ds.hide = false;
                ele.show();
            });
        }
    }
}
filterInTable_Scopes(event: any) {
  if (event.type == 'click' || event.keyCode == 13) {
      let container = $(event.target).closest('.datatable-container-scopes');
      if (this.globalFilterText.trim() != '') {
          (this.contextScopes || []).forEach(ds => {
              if (Object.keys(ds).some(k => this.filterFields.indexOf(k) > -1
                  && ds[k] != null && ds[k].toString().toLowerCase().includes(this.globalFilterText.toLowerCase()))) {
                  let ele = container.find('.index_' + ds[this.dataKey]).closest('tr');
                  if (ele.closest('.ui-table-frozen-view')) {
                      ele.closest('.ui-table-scrollable-wrapper').find('.ui-table-unfrozen-view tbody tr').eq(ele.index()).show();
                  }
                  ds.hide = false;
                  ele.show();
              } else {
                  let ele = container.find('.index_' + ds[this.dataKey]).closest('tr');
                  if (ele.closest('.ui-table-frozen-view')) {
                      ele.closest('.ui-table-scrollable-wrapper').find('.ui-table-unfrozen-view tbody tr').eq(ele.index()).hide();
                  }
                  ds.hide = true;
                  ele.hide();
              }
          });
      } else {
          (this.contextScopes || []).forEach(ds => {
              let ele = container.find('.index_' + ds[this.dataKey]).closest('tr');
              if (ele.closest('.ui-table-frozen-view')) {
                  ele.closest('.ui-table-scrollable-wrapper').find('.ui-table-unfrozen-view tbody tr').eq(ele.index()).show();
              }
              ds.hide = false;
              ele.show();
          });
      }
  }
}

  filterTree2(value) {
    let kw: string = value.filter_text;
    if (kw) {
      let source = $.extend(true, [], this.treeData.filter(ds => {
        if (ds.label.toLowerCase().indexOf(kw.toLowerCase()) > -1) {
          return true;
        }
        if (ds.children.filter(x => x.label.toLowerCase().indexOf(kw.toLowerCase()) > -1).length > 0) {
          return true;
        }
        return false;
      }));
      source.forEach(ds => {
        ds.children = ds.children.filter(x => x.label.toLowerCase().indexOf(kw.toLowerCase()) > -1);
      });
      this.data = source;
      setTimeout(() => {
        if (this.data && this.data.length > 0) {
          this.data[0].expanded = true;
          this.treeSelectionChange(this.data[0]);
        }
      });
    } else {
      this.data = $.extend(true, [], this.origin_data);
      this.data[0].expanded = true;
      this.treeSelectionChange(this.data[0]);
    }
  }

  filterInScope(value) {
  }

  isCheckAllScope() {
    if (!this.contextScopes) {
      return false;
    }
    return this.contextScopes.every(ds => ds.granted);
  }

  isCheckAllPermission() {
    if (!this.chosingPermissions) {
      return false;
    }
    return this.chosingPermissions.every(ds => ds.granted);
  }

}
