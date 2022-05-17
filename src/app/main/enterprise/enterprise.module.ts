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
                path: 'quan-ly-doanh-nghiep',
                loadChildren: () => import('./company/company.module').then(m => m.CompanyModule),
                data: {
                    full_path: 'enterprise/quan-ly-doanh-nghiep',
                    preload: true, delay: true
                }
            },
        ]), // Append position
    ],
    exports: [], // Do not change "// Append position" line above althought only indent
    providers: []
})

export class ENTERPRISEModule { }
