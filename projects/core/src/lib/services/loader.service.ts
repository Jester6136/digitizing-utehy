import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { SystemConstants } from '../common/system.constants';

@Injectable()
export class LoaderService {

    private timer: any;
    private loaderSubject = new Subject<LoaderState>();
    loaderState = this.loaderSubject.asObservable();
    private bool = true;

    constructor() { }

    show() {
        if (!this.bool) {
            return;
        }
        this.bool = false;
        this.timer = setTimeout(() => {
            this.loaderSubject.next(<LoaderState>{ show: true });
        }, SystemConstants.get('LOADING_DEBOUND') || 500);
    }

    hide() {
        clearTimeout(this.timer);
        this.bool = true;
        this.loaderSubject.next(<LoaderState>{ show: false });
    }
}

export interface LoaderState {
    show: boolean;
}
