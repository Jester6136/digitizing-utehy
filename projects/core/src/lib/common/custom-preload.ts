import 'rxjs/add/observable/of';
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/takeUntil';
import { PreloadingStrategy, Route } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable()
export class CustomPreloadingStrategy implements PreloadingStrategy {
    preloadedModules: string[] = [];

    preload(route: Route, load: () => Observable<any>): Observable<any> {
        if (route.data && route.data['preload']) {
            this.preloadedModules.push(route.path);
            return load();
        } else {
            return Observable.of(null);
        }
    }
}
