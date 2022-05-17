import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
export class PrintService {

    private printSubject = new Subject<PrintInfo>();
    printInfo = this.printSubject.asObservable();

    constructor() { }

    show(src: string, callback: any, options: any = { printer_name: '', paper_size: '', copies: 1, pages: 'all', dup_type: '' }) {
        this.printSubject.next(<PrintInfo>{ show: true, src: src, options: options, callback: callback });
    }

    hide() {
        this.printSubject.next(<PrintInfo>{ show: false });
    }

}

export interface PrintInfo {
    show: boolean;
    options: any;
    src: string;
    callback: any;
}
