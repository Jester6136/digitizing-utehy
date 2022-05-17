import { AfterViewInit, Directive, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DomHandler } from 'primeng/api';

@Directive({
    // tslint:disable-next-line:directive-selector
    selector: '[plBootstro]',
    providers: [DomHandler],
    host: {
        '[class.bootstro]': 'true',
        '[attr.data-bootstro-step]': 'step',
        '[attr.data-bootstro-title]': 'title',
        '[attr.data-bootstro-content]': 'content',
        '[attr.data-bootstro-width]': 'width',
        '[attr.data-bootstro-placement]': 'placement',
    }
})
export class Bootrstro implements AfterViewInit {

    @Input('plBootstro') options: any;

    step: number;
    title: string;
    content: string;
    width: string;
    placement: string;

    constructor(private _translateService: TranslateService) {

    }

    ngAfterViewInit() {
        this._translateService.get(['GUIDE.step', this.options.title, this.options.content]).subscribe(messages => {
            this.step = this.options.step || 0;
            this.title = this.options.title ? messages[this.options.title] : (messages['GUIDE.step'] + ' ' + (this.step + 1));
            this.content = this.options.content ? messages[this.options.content] : '';
            this.width = this.options.width || '400px';
            this.placement = this.options.placement || 'bottom';
        });
    }

}
