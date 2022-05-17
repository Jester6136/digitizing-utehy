import { Component, OnInit, Injector } from '@angular/core';
import 'rxjs/add/operator/takeUntil';
import { Utils } from 'core';
import { User } from 'core';
declare var $: any;

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html'
})
export class ProfileComponent extends Utils implements OnInit {

  user: User;

  constructor(injector: Injector) {
    super(injector);
  }

  ngOnInit() {
    this.user = this._authenService.getLoggedInUser();
  }

}
