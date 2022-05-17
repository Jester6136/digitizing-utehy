import { NgModule, ModuleWithProviders } from '@angular/core';
import { CoreModule, StorageService, LoaderService } from 'core';
import { environment } from '../../environments/environment';
import { NotFoundComponent } from '../main/not-found/not-found.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { PickerModule } from '@ctrl/ngx-emoji-mart';

@NgModule({
    imports: [
        CoreModule.forRoot(environment),
        NgxPaginationModule,
        InfiniteScrollModule,
        PickerModule
    ],
    declarations: [
         NotFoundComponent,         
    ],
    exports: [
        CoreModule,
        NgxPaginationModule,
        InfiniteScrollModule,
        PickerModule
    ]
})
export class SharedModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: SharedModule,
            providers: [StorageService, LoaderService]
        };
    }
}
