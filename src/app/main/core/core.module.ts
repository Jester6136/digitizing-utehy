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
                path: 'countries-ref',
                loadChildren: () => import('./config/countries-ref/countries-ref.module').then(m => m.CountriesRefModule),
                data: {
                    full_path: 'cms/countries-ref',
                    preload: true, delay: true
                }
            },
            {
                path: 'provinces-ref',
                loadChildren: () => import('./config/provinces-ref/provinces-ref.module').then(m => m.ProvincesRefModule),
                data: {
                    full_path: 'cms/provinces-ref',
                    preload: true, delay: true
                }
            },
            {
                path: 'country-type-ref',
                loadChildren: () => import('./config/country-type-ref/country-type-ref.module').then(m => m.CountryTypeRefModule),
                data: {
                    full_path: 'cms/country-type-ref',
                    preload: true, delay: true
                }
            },
            {
                path: 'districts-ref',
                loadChildren: () => import('./config/districts-ref/districts-ref.module').then(m => m.DistrictsRefModule),
                data: {
                    full_path: 'cms/districts-ref',
                    preload: true, delay: true
                }
            },
            {
                path: 'wards-ref',
                loadChildren: () => import('./config/wards-ref/wards-ref.module').then(m => m.WardsRefModule),
                data: {
                    full_path: 'cms/wards-ref',
                    preload: true, delay: true
                }
            },
        ]), // Append position
    ],
    exports: [], // Do not change "// Append position" line above althought only indent
    providers: []
})

export class COREModule { }
