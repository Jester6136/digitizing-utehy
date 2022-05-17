import { SharedModule } from './../../../../shared/shared.module';
import { NgModule } from '@angular/core';
import 'rxjs/add/operator/takeUntil';
import { RouterModule } from '@angular/router';
import { PermissionGuard } from 'core';
import { WebsiteSlideComponent } from './website-slide.component';

@NgModule({
    declarations: [
        WebsiteSlideComponent,
    ],
    imports: [
        SharedModule,
        RouterModule.forChild([
            { path: '', component: WebsiteSlideComponent, canActivate: [PermissionGuard] },
        ]), // Append position
    ],
    exports: [], // Do not change "// Append position" line above althought only indent
    providers: []
})

export class WebsiteSlideModule { }
