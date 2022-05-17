import { Directive, ViewContainerRef } from '@angular/core';
import { DynamicDialogContent } from 'primeng/components/dynamicdialog/dynamicdialogcontent';

@Directive({
    // tslint:disable-next-line:directive-selector
    selector: '[pCustomDynamicDialogContent]'
})
export class CustomDynamicDialogContent extends DynamicDialogContent {

    constructor(public viewContainerRef: ViewContainerRef) {
        super(viewContainerRef);
    }

}
