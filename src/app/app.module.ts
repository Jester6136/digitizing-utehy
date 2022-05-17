import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpModule, JsonpModule } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { TranslateLoader, TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { AppPreloadingStrategy, LoaderInterceptorService, SystemConstants } from 'core';
import { AppComponent } from './app.component';
import { AppRoute } from './app.route';
import { LoaderComponent } from './shared/loader/loader.component';
import { SharedModule } from './shared/shared.module';
import { PrintService } from '../../projects/core/src/lib/services/print.service';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, '../assets/i18n/', '.json');
}

@NgModule({
  bootstrap: [
    AppComponent
  ],
  declarations: [
    AppComponent,
    LoaderComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CommonModule,
    HttpModule,
    HttpClientModule,
    SharedModule.forRoot(),
    RouterModule.forRoot(AppRoute,
      { preloadingStrategy: AppPreloadingStrategy}  
    ),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    ReactiveFormsModule,
    JsonpModule
  ],
  exports: [
    LoaderComponent,
    TranslatePipe
  ],
  providers: [
    PrintService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoaderInterceptorService,
      multi: true
    }
  ]
})
export class AppModule {
  constructor(private _systemConstants: SystemConstants) {
  }
}
