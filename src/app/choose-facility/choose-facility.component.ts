import { Component, OnInit, Injector } from '@angular/core';
import 'rxjs/add/operator/takeUntil';
import { Facility } from 'core';
import { SystemConstants } from 'core';
import { ENotificationType } from 'core';
import { Utils } from 'core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-choose-facility',
  templateUrl: './choose-facility.component.html'
})
export class ChooseFacilityComponent extends Utils implements OnInit {

  public selectedFacility = '';
  public facilities: Facility[];

  public config: any = {
    highlight: false,
    create: false,
    persist: true,
    dropdownDirection: 'down',
    labelField: this.currentLang == 'en' ? 'facility_name_e' : 'facility_name_l',
    valueField: 'id',
    plugins: ['remove_button'],
    maxItems: 1
  };

  constructor(injector: Injector) {
    super(injector);
  }

  ngOnInit() {
    this.facilities = JSON.parse(this._storageService.getItem(SystemConstants.get('PREFIX_FACILITIES')));
    if (this.facilities.length > 0) {
      this.selectedFacility = this.facilities[0].facility_id;
    }
  }

  start() {
    this.spinning = true;
    let selected = this.facilities.find(ds => ds.facility_id == this.selectedFacility);
    this._apiService.get('/api/facility/set-facility?id=' + this.selectedFacility).takeUntil(this.unsubscribe).subscribe(res => {
      this._storageService.setItem(SystemConstants.get('PREFIX_CURRENT_FACILITY'), JSON.stringify(selected));
      this._storageService.setItem(SystemConstants.get('PREFIX_PERMISSIONS'), JSON.stringify(res.Data));
      this._router.navigate(['']);
      this.spinning = false;
      // if (res.IsSuccess) {
      //   this._storageService.setItem(SystemConstants.get('PREFIX_CURRENT_FACILITY'), JSON.stringify(selected));
      //   this._storageService.setItem(SystemConstants.get('PREFIX_PERMISSIONS'), JSON.stringify(res.Data));
      //   this._router.navigate(['']);
      //   this.spinning = false;
      // } else {
      //   this._translateService.get('MESSAGE.action_fail').subscribe((message) => {
      //     this._functionConstants.ShowNotification(ENotificationType.RED, message);
      //   });
      //   this.spinning = false;
      // }
    });

  }

}
