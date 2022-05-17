import { Directive, Input } from '@angular/core';
import { DomHandler } from 'primeng/api';

@Directive({
    // tslint:disable-next-line:directive-selector
    selector: '[plDocXContainer]',
    providers: [DomHandler],
    host: {
        '[style.padding-left.px]': '(item.level - 1) * 15',
    }
})
export class PLDocXContainerDirective {

    @Input('plDocXContainer') item: any;

    constructor() {
    }

}
