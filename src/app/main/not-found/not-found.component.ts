import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { FunctionConstants } from 'core';
import 'rxjs/add/operator/takeUntil';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html'
})
export class NotFoundComponent {

  constructor(private router: Router, private transalate: TranslateService, private _functionConstants: FunctionConstants) {
    this.transalate.addLangs(['en', 'local']);
    this.transalate.setDefaultLang(this._functionConstants.GetCurrentCaptionLanguage());
  }
  goToHomePage() {
    this.router.navigate(['/']);
  }
}
