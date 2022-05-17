import { SharedModule } from './../../../shared/shared.module';
import { NgModule } from '@angular/core';
import 'rxjs/add/operator/takeUntil';
import { RouterModule } from '@angular/router';
import { PermissionGuard } from 'core';
import { BackgroundComponent } from './background.component';

@NgModule({
    declarations: [
        BackgroundComponent,
    ],
    imports: [
        SharedModule,
        RouterModule.forChild([
            { path: '', component: BackgroundComponent, canActivate: [PermissionGuard] },
        ]), // Append position
    ],
    exports: [], // Do not change "// Append position" line above althought only indent
    providers: []
})

export class BackgroundModule { }
