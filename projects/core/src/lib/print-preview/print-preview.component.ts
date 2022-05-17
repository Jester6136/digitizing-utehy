import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Dialog } from 'primeng/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FunctionConstants } from '../common/function.constants';
import { SystemConstants } from '../common/system.constants';
import { PrintInfo, PrintService } from '../services/print.service';
import { StorageService } from '../services/storage.service';
declare var $: any;

@Component({
  selector: 'print-preview',
  templateUrl: './print-preview.component.html'
})
export class PrintPreviewComponent implements OnInit, OnDestroy {

  display = false;
  startInitPDF = false;
  doneInitPDF = false;
  all_flag = true;
  total_page = 0;
  copies = 1;
  pages: string;
  dup_type = '1';
  fit_to_page = true;

  show_preview_flag = true;
  unsubscribe = new Subject();

  src: string;
  callback: any;

  @ViewChild('dialog', {static: false}) dialog: Dialog;

  constructor(private _storageService: StorageService, private _printService: PrintService, private _functionConstants: FunctionConstants) {
    let storage = this._storageService.getItem(SystemConstants.get('SETTING_PREFIX'));
    this.show_preview_flag = (storage && storage != '') ? (JSON.parse(storage).print_preview == null ? true : JSON.parse(storage).print_preview) : true;
    this._storageService.changes.pipe(takeUntil(this.unsubscribe)).subscribe((data: any) => {
      if (data.key == SystemConstants.get('SETTING_PREFIX')) {
        let storage = this._storageService.getItem(SystemConstants.get('SETTING_PREFIX'));
        this.show_preview_flag = (storage && storage != '') ? (JSON.parse(storage).print_preview == null ? true : JSON.parse(storage).print_preview) : true;
      }
    });
  }

  ngOnInit() {
    this._printService.printInfo.subscribe((state: PrintInfo) => {
      if (state.show) {
        this.src = state.src;
        Object.keys(state.options).forEach(key => {
          this[key] = state[key];
        });
        this.callback = state.callback;
        this.showDialog();
      } else {
        this.hideDialog();
      }
    });
  }

  showDialog() {
    this.reset();
    if (this.show_preview_flag) {
      this.display = true;
      setTimeout(() => {
        this.startInitPDF = true;
      }, 250);
    } else {
      this.submitPrint(false);
    }
  }

  callBackFn(pdf: any) {
    setTimeout(() => {
      this.doneInitPDF = true;
      this.dialog.center();
      setTimeout(() => {
        $('#btn-print').focus();
      }, 5);
    }, 100);
  }

  pageRendered(e: CustomEvent) {
    this.total_page++;
  }

  allFlagChange(value: boolean) {
    if (value) {
      this.pages = null;
      setTimeout(() => {
        $('#input-page').focus();
      }, 5);
    }
  }

  reset() {
    this.total_page = 0;
    this.copies = 1;
    this.startInitPDF = false;
    this.doneInitPDF = false;
  }

  validPages() {
    if (!this.all_flag) {
      let re = /^\d+(?:-\d+)?(?:,\d+(?:-\d+)?)*$/gi;
      return re.test(this.pages);
    } else {
      return true;
    }
  }

  print(closable: boolean) {
    if (this.validPages) {
      this.submitPrint(closable);
    }
  }

  submitPrint(closable: boolean) {
    if (this.validPages()) {
      this._functionConstants.post('', '', this.copies, this.all_flag ? '1-' + this.total_page : this.pages, this.src, this.dup_type).subscribe(res => {
        if (closable) {
          this.hideDialog();
          // this._printService.hide();
        } else {
          // this._printService.hide();
        }
      });
    } else {
      // this._printService.hide();
    }
  }

  onHide() {
    this.reset();
    // this._printService.hide();
  }

  hideDialog() {
    this.display = false;
    if (this.callback) {
      this.callback();
    }
  }

  ngOnDestroy() {
    let SUBSCRIBLEPREFIX = [
      '_sub'
    ];
    let TIMERPREFIX = [
      '_timer'
    ];
    let IGNORES = [
      '_router',
      '_changeDetectorRef',
      '_http',
      '_translateService',
      '_storageService',
      '_functionConstants',
      '_confirmationService',
      '_authenService',
      '_loaderService',
      '_apiService',
      '_imageService',
      '_fb'
    ];
    this.unsubscribe.next();
    this.unsubscribe.complete();
    Object.keys(this).map(k => {
      if (SUBSCRIBLEPREFIX.findIndex(x => k.startsWith(x)) > -1) {
        this[k].unsubscribe();
      }
      if (TIMERPREFIX.findIndex(x => k.startsWith(x)) > -1) {
        clearInterval(this[k]);
      }
      if (IGNORES.indexOf(k.toString()) == -1) {
        this[k] = null;
      }
    });
  }

}
