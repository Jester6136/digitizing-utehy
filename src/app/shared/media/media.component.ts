import { Component, OnInit } from '@angular/core';
import 'rxjs/add/operator/takeUntil';
// import { WebcamImage } from 'ngx-webcam';

@Component({
  selector: 'app-media',
  templateUrl: './media.component.html',
  styleUrls: ['./media.component.css']
})
export class MediaComponent implements OnInit {

  // // latest snapshot
  // public webcamImage: WebcamImage = null;

  // // webcam snapshot trigger
  // private trigger: Subject<void> = new Subject<void>();

  // constructor() { }

  ngOnInit() {
  }

  // public triggerSnapshot(): void {
  //   this.trigger.next();
  // }

  // public handleImage(webcamImage: WebcamImage): void {
  //   this.webcamImage = webcamImage;
  // }

  // public get triggerObservable(): Observable<void> {
  //   return this.trigger.asObservable();
  // }
}
