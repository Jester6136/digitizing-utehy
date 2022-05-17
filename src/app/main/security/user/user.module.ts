import { NgModule } from '@angular/core';
import 'rxjs/add/operator/takeUntil';
import { RouterModule } from '@angular/router';
import { PermissionGuard } from 'core';
import { SharedModule } from '../../../shared/shared.module';
import { UpdateRoleFirstDatatableComponent } from './../user/update-role-first-datatable/update-role-first-datatable.component';
import { UpdateRoleSecondDatatableComponent } from './../user/update-role-second-datatable/update-role-second-datatable.component';
import { UserComponent } from './../user/user.component';

@NgModule({
    declarations: [
        UserComponent,
        UpdateRoleFirstDatatableComponent,
        UpdateRoleSecondDatatableComponent
    ],
    imports: [
        SharedModule,
        RouterModule.forChild([
            {
                path: '', component: UserComponent, canActivate: [PermissionGuard]
            }
        ]),
    ],
    exports: [],
    providers: []
})

export class UserModule { }
