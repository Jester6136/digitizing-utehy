
import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthenService, ENotificationType, FunctionConstants, StorageService, SystemConstants } from 'core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit, AfterViewInit, OnDestroy {

  public currentLang = '';
  public loginForm: FormGroup;
  public today = new Date();
  private unsubscribe = new Subject();

  constructor(public _translateService: TranslateService, private _storageService: StorageService,
    public functionConstant: FunctionConstants, private router: Router, private authenService: AuthenService) {
    this.currentLang = this.functionConstant.GetCurrentCaptionLanguage();
    _translateService.addLangs(['en', 'local']);
    _translateService.setDefaultLang(this.currentLang);
  }

  ngOnInit() {
    this.loginForm = new FormGroup({
      'username': new FormControl('', Validators.required),
      'password': new FormControl('', Validators.required),
      'remember': new FormControl(false, []),
      'lang': new FormControl(this.currentLang == SystemConstants.get('LOCAL') ? true : false, []),
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.loginForm.markAsPristine();
      setTimeout(() => {
        if ($('[autofocus]')[0]) {
          $('[autofocus]')[0].focus();
        }
      }, 100);
    });
  }

  changeLanguage(event) {
    let lang = SystemConstants.get('LOCAL');
    if (event.target.checked) {
      lang = SystemConstants.get('LOCAL');
    } else {
      lang = SystemConstants.get('EN');
    }
    this._translateService.use(lang);
    this._storageService.setItem(SystemConstants.get('PREFIX_CAPTION_LANGUAGE'), lang);
  }

  onSubmit(value: any) {
    this.authenService.login(value.username, value.password).pipe(takeUntil(this.unsubscribe)).subscribe(data => {
      let facilities = JSON.parse(this._storageService.getItem(SystemConstants.get('PREFIX_FACILITIES')));
      if (facilities) {
        this.router.navigate(['']);
      } else {
        this.router.navigate([SystemConstants.get('CHOOSE_FACILITY_URL')]);
      }
    }, error => {
      if (typeof error._body === 'string') {
        let errorMessage = JSON.parse(error._body);
        this.functionConstant.ShowNotification(ENotificationType.RED, 'MESSAGE.' + errorMessage.error);
      } else {
        this.functionConstant.ShowNotification(ENotificationType.RED, 'MESSAGE.cannot_connect_to_server');
      }
    });
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

}
