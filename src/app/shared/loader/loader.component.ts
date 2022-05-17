import { Component, OnInit } from '@angular/core';
import { LoaderService, LoaderState } from 'core';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.css']
})
export class LoaderComponent implements OnInit {

  public show = true;
  public request_count = 0;
  constructor(private loaderService: LoaderService) { }

  ngOnInit() {
    this.loaderService.loaderState.subscribe((state: LoaderState) => {
      if (state.show) {
        this.request_count++;
        this.show = true;
      } else {
        this.request_count--;
        if (this.request_count <= 0) {
          this.show = false;
          this.request_count = 0;
        }
      }
    });
  }

}
