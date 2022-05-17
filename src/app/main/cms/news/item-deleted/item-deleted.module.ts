import { ItemDeletedComponent } from './item-deleted.component';
import { MainSharedModule } from './../../../shared/main-shared.module';
import { NgModule } from '@angular/core';
import 'rxjs/add/operator/takeUntil';
import { RouterModule } from '@angular/router';
import { PermissionGuard } from 'core';
import { UploadDownloadService } from '../../../services/upload-download.service';

@NgModule({
    declarations: [
        ItemDeletedComponent
    ],
    imports: [
        MainSharedModule,
        RouterModule.forChild([
            { path: '', component: ItemDeletedComponent, canActivate: [PermissionGuard] },
        ]), // Append position
    ],
    exports: [], // Do not change "// Append position" line above althought only indent
    providers: [UploadDownloadService]
})

export class ItemDeletedModule { }
