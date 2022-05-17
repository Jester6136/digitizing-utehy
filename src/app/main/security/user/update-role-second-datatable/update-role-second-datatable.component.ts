import { Component, EventEmitter, Injector, Input, OnInit, Output } from '@angular/core';
import { Grid } from 'core';
import 'rxjs/add/operator/takeUntil';

@Component({
  selector: 'app-update-role-second-datatable',
  templateUrl: './update-role-second-datatable.component.html'
})
export class UpdateRoleSecondDatatableComponent extends Grid implements OnInit {

  @Input() selectedRoles: any[];
  @Input() user_id: string;
  @Input() hasAddRoleToUserPermission: boolean;
  @Input() hasRemoveRoleFromUserPermission: boolean;
  @Output() emiterRemoveFromList = new EventEmitter<any[]>();

  constructor(injector: Injector) {
    super(injector);
    this.searchApiUrl = '/api/role/search-user-role';
    this.dataKey = 'id';
    this.filterFields = ['role_code', 'role_name', 'user_number', 'description'];
    this.pageSize = 0;
    this.tableActions = [];
    this.makeRowSameHeightAfterLoad = true;
    this._translateService.get(['COMMON.remove_from_list']).subscribe((message) => {
      this.tableActions.push({ label: message['COMMON.remove_from_list'], icon: 'fa-minus', command: () => { this.removeFromList(this.selectedDataTableItems, true); } });
    });
  }

  ngOnInit() {
    this.searchValue.user_id = this.user_id;
    this.search(null, false);
  }

  removeFromList(items: any[], clearSelected: boolean = false) {
    if (clearSelected) {
      this.selectedDataTableItems = [];
    }
    this.emiterRemoveFromList.emit(items);
  }

}
