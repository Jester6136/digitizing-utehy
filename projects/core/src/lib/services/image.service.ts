import { Injectable } from '@angular/core';
import 'rxjs/add/operator/takeUntil';
import { Http, Response, ResponseContentType } from '@angular/http';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/finally';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs';

@Injectable()
export class ImageService {

    constructor(private _http: Http) { }

    getImage(imageUrl: string): Observable<any> {
        return this._http
            .get(imageUrl, { responseType: ResponseContentType.Blob })
            .map((res: Response) => res.blob());
    }
}
