import { SharedModule } from './../../shared/shared.module';
import { NgModule } from '@angular/core';
import 'rxjs/add/operator/takeUntil';
import { RouterModule } from '@angular/router';

@NgModule({
    declarations: [],
    imports: [
        SharedModule,
        RouterModule.forChild([
            {
                path: 'enterprise-register',
                loadChildren: () => import('./company-register/company-register.module').then(m => m.CompanyRegisterModule),
                data: {
                    full_path: 'student/enterprise-register',
                    preload: true, delay: true
                }
            },
            {
                path: 'report-recruitment-weekly',
                loadChildren: () => import('./recruitment-report-weekly/recruitment-report-weekly.module').then(m => m.RecruitmentReportWeeklyModule),
                data: {
                    full_path: 'student/report-recruitment-weekly',
                    preload: true, delay: true
                }
            },
            {
                path: 'student-info',
                loadChildren: () => import('./background/background.module').then(m => m.BackgroundModule),
                data: {
                    full_path: 'student/student-info',
                    preload: true, delay: true
                }
            },
            {
                path: 'student-projects',
                loadChildren: () => import('./project-register/project-register.module').then(m => m.ProjectRegisterModule),
                data: {
                    full_path: 'student/student-projects',
                    preload: true, delay: true
                }
            },
            {
                path: 'student-project-report',
                loadChildren: () => import('./project-report/project-report.module').then(m => m.ProjectReportModule),
                data: {
                    full_path: 'student/student/student-project-report',
                    preload: true, delay: true
                }
            },
        ]), // Append position
    ],
    exports: [], // Do not change "// Append position" line above althought only indent
    providers: []
})

export class STUDENTModule { }
