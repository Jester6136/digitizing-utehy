import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest, HttpEvent, HttpResponse } from '@angular/common/http';
import { of, Observable } from 'rxjs';
import { SystemConstants } from 'core';

@Injectable()
export class UploadDownloadService {
  private baseApiUrl: string;
  private apiUploadUrl: string;
  private apiFileUrl: string;
  private apiUploadUrlImage: string;
  private apiFileUrlImage: string;
  private apiDeleteUrl: string;

  constructor(private httpClient: HttpClient) {
    this.baseApiUrl = SystemConstants.BASE_API;
    this.apiUploadUrl = this.baseApiUrl + '/api/system/upload-image';
    this.apiFileUrl = this.baseApiUrl + '/api/system/files-image';
    this.apiDeleteUrl = this.baseApiUrl + '/api/system/delete';
  }
  
  public uploadFile(file: Blob, id: string, category: string): Observable<HttpEvent<void>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('id', id);
    formData.append('category', category);
    return this.httpClient.request(new HttpRequest(
      'POST',
      this.apiUploadUrl,
      formData,
      {
        reportProgress: true
      }));
  }

  public deleteFile(path_file: string): Observable<HttpEvent<void>> {
    const formData = new FormData();
    formData.append('path_file', path_file);
    return this.httpClient.request(new HttpRequest(
      'POST',
      this.apiDeleteUrl,
      formData,
      {
        reportProgress: true
      }));
  }

  public getFiles(id: string,category: string): Observable<string[]> {
    return this.httpClient.get<string[]>(this.apiFileUrl + '/' + category + '/' + id);
  }
}
