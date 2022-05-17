import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { SystemConstants, AuthenService, StorageService, User } from 'core';
declare let $: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  public fnUnload: any;
  public user: User;
  public last_url: string;

  constructor(private location: Location, private _authenService: AuthenService, private _storageService: StorageService) {
    this._storageService.changes.subscribe((data: any) => {
        if (data.key == 'logon') {
            if (this._storageService.getItem('logon') == '0') {
                this.last_url = window.location.pathname;
            } else {
                this._authenService.router.navigate([this.last_url || '']);
                this.last_url = null;
            }
        }
    });
   }

  ngOnInit() {
    this.location.subscribe(x => {
      if (x.pop && x.type == 'popstate') {
        $('body').css('padding-right', '0');
        $('body').removeClass('modal-open');
        $('.modal').remove();
        $('.modal-backdrop').remove();
      }
    });
    let settings = localStorage.getItem(SystemConstants.get('SETTING_PREFIX'));
    if (settings) {
      $('body').removeClass(function (index, className) {
        return (className.match(/(^|\s)ls-\S+/g) || []).join(' ');
      });
      Object.keys(JSON.parse(settings)).forEach(key => {
        $('body').addClass(JSON.parse(settings)[key]);
      });
    }
    let count = localStorage.getItem(SystemConstants.get('TABS_COUNT'));
    let new_count = 0;
    if (!count || count == '') {
      new_count = 0;
    } else {
      new_count = parseInt(count);
    }
    new_count++;
    localStorage.setItem(SystemConstants.get('TABS_COUNT'), new_count.toString());

    let self = this;
    this.fnUnload = function (e: any) {
      let count = localStorage.getItem(SystemConstants.get('TABS_COUNT'));
      let new_count = 0;
      if (!count || count == '') {
        new_count = 1;
      } else {
        new_count = parseInt(count);
      }
      new_count--;
      localStorage.setItem(SystemConstants.get('TABS_COUNT'), new_count.toString());
    };
    window.addEventListener('beforeunload', this.fnUnload);
  }

}
