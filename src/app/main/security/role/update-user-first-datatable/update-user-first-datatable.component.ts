import { Component, OnInit, Injector, Output, EventEmitter, Input, SimpleChanges, OnChanges, AfterViewInit } from '@angular/core';
import 'rxjs/add/operator/takeUntil';
import { Grid } from 'core';
import { UpdateUserSecondDatatableComponent } from '../update-user-second-datatable/update-user-second-datatable.component';
import { FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'app-update-user-first-datatable',
  templateUrl: './update-user-first-datatable.component.html'
})
export class UpdateUserFirstDatatableComponent extends Grid implements OnInit, OnChanges {

  @Input() isAdd: boolean;
  @Input() role_id: string;
  @Input() selectedUsers: any[];
  @Input() refresh: boolean;
  @Input() hasAddRoleMembershipPermission: boolean;
  @Output() refreshDone: EventEmitter<void> = new EventEmitter<void>();
  @Output() emiterAddToList: EventEmitter<any[]> = new EventEmitter<any[]>();

  constructor(injector: Injector) {
    super(injector);
    this.searchValue.page = this.page;
    this.searchValue.pageSize = this.pageSize;
    this.makeRowSameHeightAfterLoad = true;
    this.searchFormGroup = new FormGroup({
      'Key_word': new FormControl('')
    });
    this.tableActions = [];
    this._translateService.get('COMMON.add_to_list').subscribe((message) => {
      this.tableActions.push({ label: message, icon: 'fa-plus', command: () => { this.addToList(this.selectedDataTableItems, true); } });
    });
  }

  ngOnInit() {
    this.searchApiUrl = '/api/user/search';
    this.search();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.refresh && changes.refresh.currentValue == true) {
      if (changes.selectedUsers && changes.selectedUsers.previousValue) {
        let removed: any[] = changes.selectedUsers.previousValue;
        for (let i = this.data.length - 1; i >= 0; i--) {
          let ins = removed.find(x => x.user_id == this.data[i].user_id);
          if (ins) {
            this.data.splice(i, 1);
          }
        }
        this.data = this.data.slice();
        setTimeout(() => {
          this.refreshDone.emit();
        });
      }
    }
    if (changes.selectedUsers && changes.selectedUsers.currentValue) {
      this.data.forEach(ds => {
        let ins = changes.selectedUsers.currentValue.find(x => x.user_id == ds.user_id);
        if (ins) {
          ds.added = true;
        } else {
          ds.added = false;
        }
      });
      this.data = this.data.slice();
    }
  }

  onValueChange(value) {
    if (this.selectedUsers && this.selectedUsers.length > 0) {
      this.data.forEach(ds => {
        let ins = this.selectedUsers.find(x => x.user_id == ds.user_id);
        if (ins) {
          ds.added = true;
        } else {
          ds.added = false;
        }
      });
    }
  }

  setRowStyle(rowData, rowIndex) {
    if (rowData.added) {
      return 'added';
    }
    return '';
  }

  addToList(items: any[], clearSelected: boolean = false) {
    this.data.forEach(ds => {
      if (items.indexOf(ds) > -1) {
        ds.added = true;
        ds.full_name = ds.objectjson_person.full_name;
      }
    });
    if (clearSelected) {
      this.selectedDataTableItems = [];
    }
    this.emiterAddToList.emit(items);
  }

}
