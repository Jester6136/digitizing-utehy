import { SharedModule } from './../../shared/shared.module';
import { NgModule } from '@angular/core';
import 'rxjs/add/operator/takeUntil';
import { FileManagerComponent } from './file-manager/file-manager.component';
import { UploadComponent } from './upload/upload.component';
@NgModule({
    declarations: [
        FileManagerComponent, UploadComponent
    ],
    imports: [SharedModule],
    exports: [
        SharedModule,FileManagerComponent, UploadComponent
    ],
    providers: []
})

export class MainSharedModule { }
