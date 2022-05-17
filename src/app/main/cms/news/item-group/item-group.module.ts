import { NgModule } from '@angular/core';
import 'rxjs/add/operator/takeUntil';
import { RouterModule } from '@angular/router';
import { PermissionGuard } from 'core';
import { SharedModule } from './../../../../shared/shared.module';
import { ItemGroupComponent } from './item-group.component';
import { ItemGroupDetailComponent } from './detail-item-group/detail-item-group.component';

@NgModule({
    declarations: [
        ItemGroupDetailComponent,
        ItemGroupComponent
    ],
    imports: [
        SharedModule,
        RouterModule.forChild([
            { path: '', component: ItemGroupComponent, canActivate: [PermissionGuard] },
        ]), // Append position
    ],
    exports: [ItemGroupDetailComponent], // Do not change "// Append position" line above althought only indent
    providers: []
})

export class ItemGroupModule { }
