import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import 'rxjs/add/operator/takeUntil';
declare var $: any;

@Component({
    selector: 'language-switcher',
    template: `<button pButton type="button" class="btn-language-switcher" tabindex="-1" label="{{ (local_flag ? 'LANG.local_s' : 'LANG.en_s') | translate }}" (click)="changeValue($event)"></button>`
})
export class LanguageSwitcher implements OnInit {

    @Input() local_flag: boolean;
    @Output() local_flagChange: EventEmitter<boolean> = new EventEmitter<boolean>();

    constructor() { }

    ngOnInit() { }

    changeValue(event) {
        this.local_flag = !this.local_flag;
        this.local_flagChange.emit(this.local_flag);
    }
}
