import { Routes } from '@angular/router';
import { CustomCanLoad } from 'core';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MainComponent } from './main.component';

export const mainRoutes: Routes = [
    {
        path: '', component: MainComponent,
        children: [
            {
                path: '', component: DashboardComponent
            },
            {
                path: 'security',  loadChildren: () => import('./security/security.module').then(m => m.SecurityModule)
            },
            {
                path: 'core', loadChildren: () => import('./core/core.module').then(m => m.COREModule)
            },
            {
                path: 'cms', loadChildren: () => import('./cms/cms.module').then(m => m.CMSModule)
            },
            {
                path: 'student', loadChildren: () => import('./student/student.module').then(m => m.STUDENTModule)
            }
        ]
    }
];
