import { Component, Output, EventEmitter, Input, ViewChild, ElementRef, ChangeDetectionStrategy, Injector } from '@angular/core';
import { HttpEventType } from '@angular/common/http';
import { UploadDownloadService } from '../../services/upload-download.service';
import { ProgressStatus, ProgressStatusEnum } from '../../models/progress-status.model';
import { Grid } from 'core';

@Component({
  selector: 'app-upload',
  templateUrl: 'upload.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class UploadComponent extends Grid  {
  @Input() public disabled: boolean;
  @Input() public id: any;
  @Input() public category: any;
  @Output() public uploadStatus: EventEmitter<ProgressStatus>;
  @ViewChild('inputFile', {static: false}) inputFile: ElementRef;
  constructor(injector: Injector, private service: UploadDownloadService) {
    super(injector);
    this.uploadStatus = new EventEmitter<ProgressStatus>();
  }
  public upload(event) {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      this.uploadStatus.emit( {status: ProgressStatusEnum.START});
      this.service.uploadFile(file, this.id, this.category).subscribe(
        data => {
          if (data) {
            switch (data.type) {
              case HttpEventType.UploadProgress:
                this.uploadStatus.emit( {status: ProgressStatusEnum.IN_PROGRESS, percentage: Math.round((data.loaded / data.total) * 100)});
                break;
              case HttpEventType.Response:
                this.inputFile.nativeElement.value = '';
                this.uploadStatus.emit( {status: ProgressStatusEnum.COMPLETE});
                break;
            }
          }
          this._changeDetectorRef.detectChanges();
        },
        error => {
          this.inputFile.nativeElement.value = '';
          this.uploadStatus.emit( {status: ProgressStatusEnum.ERROR});
          this._changeDetectorRef.detectChanges();
        }
      );
    }
  }
}
