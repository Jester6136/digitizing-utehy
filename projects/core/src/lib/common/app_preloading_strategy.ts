import { Inject, Injectable } from '@angular/core';
import { PreloadingStrategy, Route } from '@angular/router';
import { Observable, of, timer } from 'rxjs';
import 'rxjs/add/operator/takeUntil';
import { mergeMap } from 'rxjs/operators';
import { AuthenService } from './../services/auth.service';
import { SystemConstants } from './system.constants';

@Injectable()
export class AppPreloadingStrategy implements PreloadingStrategy {

    private count: number;

    constructor(private _authService: AuthenService, @Inject('env') private env) {
        this.count = 0;
    }

    preload(route: Route, load: Function): Observable<any> {
        if (this.env.production) {
            this.count++;
            const loadRoute = (delay) => delay ? timer(this.count * SystemConstants.get('PRELOAD_DELAY')).pipe(mergeMap(_ => load())) : load();
            const checkCanActivate = (url) => this._authService.canActivate(url);
            return route.data && (route.data.full_path == null || checkCanActivate(route.data.full_path)) && route.data.preload ? loadRoute(route.data.delay) : of(null);
        } else {
            return Observable.of(null);
        }
    }

}
