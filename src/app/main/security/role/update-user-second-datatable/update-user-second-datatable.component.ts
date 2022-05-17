import { Component, EventEmitter, Injector, Input, OnInit, Output } from '@angular/core';
import { Grid } from 'core';
import 'rxjs/add/operator/takeUntil';

@Component({
  selector: 'app-update-user-second-datatable',
  templateUrl: './update-user-second-datatable.component.html'
})
export class UpdateUserSecondDatatableComponent extends Grid implements OnInit {

  @Input() selectedUsers: any[];
  @Input() role_id: string;
  @Input() hasAddRoleMembershipPermission: boolean;
  @Input() hasRemoveRoleMembershipPermission: boolean;
  @Output() emiterRemoveFromList = new EventEmitter<any[]>();

  constructor(injector: Injector) {
    super(injector);
    this.searchApiUrl = '/api/role/search-user';
    this.dataKey = 'id';
    this.filterFields = ['username', 'full_name', 'description'];
    this.pageSize = 0;
    this.makeRowSameHeightAfterLoad = true;
    this.tableActions = [];
    this._translateService.get(['COMMON.remove_from_list']).subscribe((message) => {
      this.tableActions.push({ label: message['COMMON.remove_from_list'], icon: 'fa-minus', command: () => { this.removeFromList(this.selectedDataTableItems, true); } });
    });
  }

  ngOnInit() {
    this.searchValue.role_id = this.role_id;
    this.search(null, false);
  }

  removeFromList(items: any[], clearSelected: boolean = false) {
    if (clearSelected) {
      this.selectedDataTableItems = [];
    }
    this.emiterRemoveFromList.emit(items);
  }

}
