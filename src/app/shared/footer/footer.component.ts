import { Component, Injector, OnInit } from '@angular/core';
import { Grid } from 'core';
@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html'
})
export class FooterComponent extends Grid implements OnInit {
  public constructor(injector: Injector) {
    super(injector);
  }
  ngOnInit() {
  }
}
