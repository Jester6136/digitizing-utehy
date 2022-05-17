import { Subject } from 'rxjs';
import { Injectable, OnDestroy } from '@angular/core';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/share';

@Injectable()
export class StorageService implements OnDestroy {
    private onSubject = new Subject<{ key: string, value: any }>();
    public changes = this.onSubject.asObservable().share();

    constructor() {
        this.start();
    }

    ngOnDestroy() {
        this.stop();
    }

    public getStorage() {
        let s = [];
        for (let i = 0; i < localStorage.length; i++) {
            s.push({
                key: localStorage.key(i),
                value: localStorage.getItem(localStorage.key(i))
            });
        }
        return s;
    }

    public setItem(key: string, data: any) {
        localStorage.setItem(key, data);
        this.onSubject.next({ key: key, value: data });
    }

    public getItem(key: string) {
        return localStorage.getItem(key);
    }

    public removeItem(key) {
        localStorage.removeItem(key);
        this.onSubject.next({ key: key, value: null });
    }


    public start() {
        window.addEventListener('storage', this.storageEventListener.bind(this));
    }

    private storageEventListener(event: StorageEvent) {
        if (event.storageArea == localStorage) {
            let v;
            try {
                v = JSON.parse(event.newValue);
            } catch (e) {
                v = event.newValue;
            }
            this.onSubject.next({ key: event.key, value: v });
        }
    }

    public stop() {
        window.removeEventListener('storage', this.storageEventListener.bind(this));
        this.onSubject.complete();
    }
}
