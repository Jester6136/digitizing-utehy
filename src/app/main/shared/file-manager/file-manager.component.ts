import { Component, OnInit, Input, EventEmitter, Output, ChangeDetectionStrategy, Injector } from '@angular/core';
import { ProgressStatus, ProgressStatusEnum } from '../../models/progress-status.model';
import { UploadDownloadService } from '../../services/upload-download.service';
import { HttpEventType } from '@angular/common/http';
import { SystemConstants, Grid } from 'core';

@Component({
  selector: 'app-filemanager',
  templateUrl: './file-manager.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileManagerComponent extends Grid implements OnInit {
  @Input() public id: any;
  @Input() public category: any;
  @Output() eveInsertImage: EventEmitter<any> = new EventEmitter<any>();
  public files: string[];
  public fileInDownload: string;
  public percentage: number;
  public showProgress: boolean;
  public showDownloadError: boolean;
  public showUploadError: boolean;
   public host_image: any;
  constructor(injector: Injector, private service: UploadDownloadService) {
    super(injector);
    this.host_image = SystemConstants.IMAGE_API + '/';
   }
  ngOnInit() {
    this.getFiles();
  }
  private getFiles() {
    this.service.getFiles(this.id, this.category).subscribe(
      data => {
        this.files = data;
        this._changeDetectorRef.detectChanges();
      }
    );
  }
  public insertImage(file_path) {
    this.eveInsertImage.emit(file_path);
  }
  public deleteFile(file_path) {
    this.service.deleteFile(file_path).subscribe(
      data => {
        if (data) {
          switch (data.type) {
            case HttpEventType.UploadProgress:
              break;
            case HttpEventType.Response:
              this.getFiles();
              break;
          }
        }
        this._changeDetectorRef.detectChanges();
      }
    );
  }
  public uploadStatus(event: ProgressStatus) {
    switch (event.status) {
      case ProgressStatusEnum.START:
        this.showUploadError = false;
        break;
      case ProgressStatusEnum.IN_PROGRESS:
        this.showProgress = true;
        this.percentage = event.percentage;
        break;
      case ProgressStatusEnum.COMPLETE:
        this.showProgress = false;
        this.getFiles();
        break;
      case ProgressStatusEnum.ERROR:
        this.showProgress = false;
        this.showUploadError = true;
        break;
    }
    this._changeDetectorRef.detectChanges();
  }
}
