import { NgModule} from '@angular/core';
import 'rxjs/add/operator/takeUntil';
import {BrowserModule} from '@angular/platform-browser';
// import { WebcamModule } from 'ngx-webcam';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { MediaComponent } from './media.component';

@NgModule({
    imports: [
        BrowserModule,
        // WebcamModule,
        // TranslatePipe,
        // TranslateService,
    ],
    exports: [MediaComponent],
    declarations: [MediaComponent],
    providers: [],
})
export class MediaModule { }
