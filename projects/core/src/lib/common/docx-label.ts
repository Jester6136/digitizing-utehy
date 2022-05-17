import { Component, Input, OnInit } from '@angular/core';
declare var $: any;

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'docx-label',
    template: `
        <div *ngIf="item.title && item.title != ''" [ngClass]="class">
            <span *ngIf="!item.is_bold" [attr.title]="item.title" style="margin-top: 5px;" [ngStyle]="{'display': under_line ? 'block' : 'inline-block', 'border-bottom': under_line ? '1px solid' : 'none'}">
                {{ show_index ? item.index + ' ' : '' }}{{ item.title }}
            </span>
            <b *ngIf="item.is_bold" style="margin-top: 5px; text-transform: uppercase;" [attr.title]="item.title">
                {{ show_index ? item.index + ' ' : '' }}{{ item.title }}
            </b>
        </div>
    `
})
export class DocXLabel implements OnInit {

    @Input() item: any;
    @Input() class: string;
    @Input() under_line: boolean;
    @Input() show_index: boolean;

    constructor() { }

    ngOnInit() {
        if (this.item.title[0] == '{' && this.item.title.indexOf('}') > -1 && this.item.title.indexOf('}') == this.item.title.lastIndexOf('}')) {
            this.item.title = this.item.title.substring(1, this.item.title.length - 1);
            this.item.title = this.item.title.replace('}', '');
        }
    }

}
