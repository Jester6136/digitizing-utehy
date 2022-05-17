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
                path: 'website-item-type-ref',
                loadChildren: () => import('./config/website-item-type-ref/website-item-type-ref.module').then(m => m.WebsiteItemTypeRefModule),
                data: {
                    full_path: 'cms/website-item-type-ref',
                    preload: true, delay: true
                }
            },
            {
                path: 'website-info-ref',
                loadChildren: () => import('./config/website-info-ref/website-info-ref.module').then(m => m.WebsiteInfoRefModule),
                data: {
                    full_path: 'cms/website-info-ref',
                    preload: true, delay: true
                }
            },
            {
                path: 'website-partner',
                loadChildren: () => import('./config/website-partner/website-partner.module').then(m => m.WebsitePartnerModule),
                data: {
                    full_path: 'cms/website-partner',
                    preload: true, delay: true
                }
            },
            {
                path: 'website-product',
                loadChildren: () => import('./config/website-product/website-product.module').then(m => m.WebsiteProductModule),
                data: {
                    full_path: 'cms/website-product',
                    preload: true, delay: true
                }
            },
            {
                path: 'website-image',
                loadChildren: () => import('./config/website-image/website-image.module').then(m => m.WebsiteImageModule),
                data: {
                    full_path: 'cms/website-image',
                    preload: true, delay: true
                }
            },
            {
                path: 'website-slide',
                loadChildren: () => import('./config/website-slide/website-slide.module').then(m => m.WebsiteSlideModule),
                data: {
                    full_path: 'cms/website-slide',
                    preload: true, delay: true
                }
            },
            {
                path: 'website-tag',
                loadChildren: () => import('./config/website-tag/website-tag.module').then(m => m.WebsiteTagModule),
                data: {
                    full_path: 'cms/website-tag',
                    preload: true, delay: true
                }
            },
            {
                path: 'website-item-group',
                loadChildren: () => import('./news/item-group/item-group.module').then(m => m.ItemGroupModule),
                data: {
                    full_path: 'cms/website-item-group',
                    preload: true, delay: true
                }
            },
            {
                path: 'website-item-composing',
                loadChildren: () => import('./news/item-composing/item-composing.module').then(m => m.ItemComposingModule),
                data: {
                    full_path: 'cms/website-item-composing',
                    preload: true, delay: true
                }
            },
            {
                path: 'website-item-published',
                loadChildren: () => import('./news/item-published/item-published.module').then(m => m.ItemPublishedModule),
                data: {
                    full_path: 'cms/website-item-published',
                    preload: true, delay: true
                }
            },
            {
                path: 'website-item-deleted',
                loadChildren: () => import('./news/item-deleted/item-deleted.module').then(m => m.ItemDeletedModule),
                data: {
                    full_path: 'cms/website-item-deleted',
                    preload: true, delay: true
                }
            },
        ]), // Append position
    ],
    exports: [], // Do not change "// Append position" line above althought only indent
    providers: []
})

export class CMSModule { }
