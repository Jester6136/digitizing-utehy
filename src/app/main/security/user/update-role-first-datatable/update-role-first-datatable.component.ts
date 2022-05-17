import { Component, OnInit, Input, Output, EventEmitter, Injector, OnChanges, SimpleChanges, AfterViewInit } from '@angular/core';
import 'rxjs/add/operator/takeUntil';
import { Grid } from 'core';
import { FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'app-update-role-first-datatable',
  templateUrl: './update-role-first-datatable.component.html'
})
export class UpdateRoleFirstDatatableComponent extends Grid implements OnInit, OnChanges, AfterViewInit {

  @Input() isAdd: boolean;
  @Input() user_id: string;
  @Input() selectedRoles: any[];
  @Input() refresh: boolean;
  @Input() hasAddRoleToUserPermission: boolean;
  @Output() refreshDone: EventEmitter<void> = new EventEmitter<void>();
  @Output() emiterAddToList: EventEmitter<any[]> = new EventEmitter<any[]>();

  constructor(injector: Injector) {
    super(injector);
    this.searchValue.page = this.page;
    this.searchValue.pageSize = this.pageSize;
    this.makeRowSameHeightAfterLoad = true;
    this.searchFormGroup = new FormGroup({
      'key': new FormControl('')
    });
    this.tableActions = [];
    this._translateService.get('COMMON.add_to_list').subscribe((message) => {
      this.tableActions.push({ label: message, icon: 'fa-plus', command: () => { this.addToList(this.selectedDataTableItems, true); } });
    });
  }

  ngOnInit() {
    this.searchApiUrl = '/api/role/search';
    this.search();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.refresh && changes.refresh.currentValue == true && !this.isAdd) {
      if (changes.selectedRoles && changes.selectedRoles.previousValue) {
        let removed: any[] = changes.selectedRoles.previousValue;
        for (let i = this.data.length - 1; i >= 0; i--) {
          let ins = removed.find(x => x.role_id == this.data[i].role_id);
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
    if (changes.selectedRoles && changes.selectedRoles.currentValue) {
      this.data.forEach(ds => {
        let ins = changes.selectedRoles.currentValue.find(x => x.role_id == ds.role_id);
        if (ins) {
          ds.added = true;
        } else {
          ds.added = false;
        }
      });
      this.data = this.data.slice();
    }
  }

  ngAfterViewInit() {
    this.makeRowsSameHeight();
  }

  onValueChange(value) {
    if (this.selectedRoles && this.selectedRoles.length > 0) {
      this.data.forEach(ds => {
        let ins = this.selectedRoles.find(x => x.role_id == ds.role_id);
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
      }
    });
    if (clearSelected) {
      this.selectedDataTableItems = [];
    }
    this.emiterAddToList.emit(items);
  }

}
