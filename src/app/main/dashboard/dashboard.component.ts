
import { Component, Injector, OnInit } from '@angular/core';
import { SystemConstants, Utils } from 'core';
import { combineLatest as observableCombineLatest } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent extends Utils implements OnInit {

  public employee_id: string;

  public arrHappyBirthday: any[] = [];
  public arrDocument: any[] = [];

  public visiblePanels: any;
  public originVisiblePanels: any;

  public changes: any[] = SystemConstants.get('UPDATE_CHANGES');

  constructor(injector: Injector) {
    super(injector);
    this.employee_id = this._authenService.getLoggedInUser() ? this._authenService.getLoggedInUser().user_id : null;
    this.visiblePanels = JSON.parse(this._storageService.getItem(SystemConstants.get('SETTING_DASHBOARD_PREFIX')) || '["1","2","3","4"]');
    this.originVisiblePanels = $.extend(true, [], this.visiblePanels);
  }

  ngOnInit() {
    // let arrRQ = [];
    // arrRQ.push(this._apiService.post('/api/adapter/execute', { Method: { Method: 'POST' }, Url: '/api/employee-profile/get-birthday-dashboard', Module: 'HR', Data: JSON.stringify({}) }));
    // arrRQ.push(this._apiService.post('/api/adapter/execute', { Method: { Method: 'GET' }, Url: '/api/document/get-list-dashboard/', Module: 'HR' }));
    // observableCombineLatest(arrRQ).pipe(takeUntil(this.unsubscribe)).subscribe(res => {
    //   // this.arrHappyBirthday = res[0].Data;
    //   this.today = this._apiService.GetserverTime();
    //   // this.arrDocument = res[1].Data;
    // });
  }

  onCollapse(panel_index) {
    let index = this.visiblePanels.indexOf(panel_index);
    if (index == -1) {
      this.visiblePanels.push(panel_index);
    } else {
      this.visiblePanels.splice(index, 1);
    }
    this._storageService.setItem(SystemConstants.get('SETTING_DASHBOARD_PREFIX'), JSON.stringify(this.visiblePanels));
  }

}
