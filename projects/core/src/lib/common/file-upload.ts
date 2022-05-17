import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationService } from 'primeng/api';
import { FileUpload } from 'primeng/fileupload';
import 'rxjs/add/operator/takeUntil';
declare var $: any;

@Component({
  selector: 'file-upload',
  template: `<p-fileUpload #fu (onClear)="onClear($event)" (onRemove)="onRemove($event)" (onSelect)="onSelect($event)" [mode]="mode" [multiple]="multiple" multiple="{{multipleText}}" [accept]="accept" [previewWidth]="previewWidth"
    [maxFileSize]="maxFileSize" chooseLabel="{{ 'COMMON.upload_choose_label' | translate }}" uploadLabel="{{ 'COMMON.upload_upload_label' | translate}}"
    cancelLabel="{{ 'COMMON.upload_cancel_label' | translate }}" invalidFileSizeMessageSummary="{{ 'COMMON.invalidFileSizeMessageSummary' | translate }}"
    invalidFileSizeMessageDetail="{{ 'COMMON.invalidFileSizeMessageDetail' | translate}}" invalidFileTypeMessageSummary="{{ 'COMMON.invalidFileTypeMessageSummary' | translate }}"
    invalidFileTypeMessageDetail="{{ 'COMMON.invalidFileTypeMessageDetail' | translate }}" [showUploadButton]="false">
  </p-fileUpload>`
})
export class CustomizeFileUpload implements OnInit {

  @Input() mode: string;
  @Input() parent: CustomizeFileUpload;
  @Input() path: string;
  @Input() multiple: boolean;
  @Input() multipleText: string;
  @Input() accept: string;
  @Input() maxFileSize: any;
  @Input() previewWidth: number;
  @Input() className: number;
  @ViewChild(FileUpload, {static: false}) fu: FileUpload;
  constructor(private _translateService: TranslateService, private _confirmationService: ConfirmationService) { }

  ngOnInit() {
  }

  onSelect(event) {
    if ($('.' + this.className)) {
      $('.' + this.className).remove();
    }
    if (this.fu.files.length > 0) {
      this.fu.files = [event.files[0]];
    }
  }

  onClear(event) {
    // this.emtFileUploadChange.emit({ file: null, cfu: this.parent });
  }

  onRemove(event) {
    // this.emtFileUploadChange.emit({ file: null, cfu: this.parent });
  }
  clear() {
    this.fu.clear();
  }
  removeFile(event: Event, file: any) {
    this._translateService.get('MESSAGE.confirm_delete_file').subscribe((message) => {
      this._confirmationService.confirm({
        message: message,
        accept: () => {
          const index: number = this.fu.files.indexOf(file);
          this.fu.remove(event, index);
        }
      });
    });
  }

}
