import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PermissionGuard } from 'core';
import { SharedModule } from '../../shared/shared.module';
import { NotFoundComponent } from '../not-found/not-found.component';
import { ProfileComponent } from './profile/profile.component';
import { GrantPermissionComponent } from './role/grant-permission/grant-permission.component';
import { RoleComponent } from './role/role.component';
import { UpdateUserFirstDatatableComponent } from './role/update-user-first-datatable/update-user-first-datatable.component';
import { UpdateUserSecondDatatableComponent } from './role/update-user-second-datatable/update-user-second-datatable.component';
import { UnauthorizedComponent } from '../unauthorized/unauthorized.component';

@NgModule({
    declarations: [
        RoleComponent,
        GrantPermissionComponent,
        ProfileComponent,
        UnauthorizedComponent,
        UpdateUserFirstDatatableComponent,
        UpdateUserSecondDatatableComponent
    ],
    imports: [
        SharedModule,
        RouterModule.forChild([
            {
                path: 'role', component: RoleComponent, canActivate: [PermissionGuard],
                data: {
                    full_path: 'security/role',
                    preload: true, delay: true
                }
            },
            {
                path: 'user',  loadChildren: () => import('./user/user.module').then(m => m.UserModule),
                data: {
                    full_path: 'security/user',
                    preload: true, delay: true
                }
            },
            {
                path: 'profile', component: ProfileComponent, canActivate: [PermissionGuard],
                data: {
                    full_path: 'security/profile',
                    preload: true, delay: true
                }
            },
            {
                path: 'not-found', component: NotFoundComponent,
                data: {
                    full_path: 'security/not-found',
                    preload: true, delay: true
                }
            },
            {
                path: 'unauthorized', component: UnauthorizedComponent,
                data: {
                    full_path: 'security/unauthorized',
                    preload: true, delay: true
                }
            },
        ]), // Append position
    ],
    exports: [],
    providers: []
})

export class SecurityModule { }
