import { UploadDownloadService } from './../../../services/upload-download.service';
import { MainSharedModule } from './../../../shared/main-shared.module';
import { NgModule } from '@angular/core';
import 'rxjs/add/operator/takeUntil';
import { RouterModule } from '@angular/router';
import { PermissionGuard } from 'core';
import { WebsiteProductComponent } from './website-product.component';

@NgModule({
    declarations: [
        WebsiteProductComponent,
    ],
    imports: [
        MainSharedModule,
        RouterModule.forChild([
            { path: '', component: WebsiteProductComponent, canActivate: [PermissionGuard] },
        ]), // Append position
    ],
    exports: [], // Do not change "// Append position" line above althought only indent
    providers: [UploadDownloadService]
})

export class WebsiteProductModule { }
