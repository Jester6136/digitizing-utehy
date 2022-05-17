import { Component } from '@angular/core';
import 'rxjs/add/operator/takeUntil';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { FunctionConstants } from 'core';

@Component({
  selector: 'app-unauthorized',
  templateUrl: './unauthorized.component.html'
})
export class UnauthorizedComponent {

  constructor(private router: Router, private transalate: TranslateService, private _functionConstants: FunctionConstants) {
    this.transalate.addLangs(['en', 'local']);
    this.transalate.setDefaultLang(this._functionConstants.GetCurrentCaptionLanguage());
  }
  goToHomePage() {
    this.router.navigate(['/']);
  }

}
