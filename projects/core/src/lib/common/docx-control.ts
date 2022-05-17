import { Component, Injector, Input, OnInit } from '@angular/core';
import { RadioButton } from 'primeng/radiobutton';
import { Utils } from './utils';
declare var $: any;

@Component({
    selector: 'docx-control',
    template: `
    <div [ngClass]="class">
        <div *ngIf="item.type == 'textbox' && item.is_number && !item.is_datetime" class="no-padding-top ui-form-group" [ngClass]="'ui-g-' + (12 / (item.column_options || 1))">
            <input [attr.disabled]="disabled ? '' : null" plThousandFormater [(ngModel)]="item.content" type="text">
        </div>
        <div *ngIf="item.type == 'textbox' && !item.is_number && !item.is_datetime" class="no-padding-top ui-form-group" [ngClass]="'ui-g-' + (12 / (item.column_options || 1))">
            <input [attr.disabled]="disabled ? '' : null" pInputText [(ngModel)]="item.content" type="text">
        </div>
        <div *ngIf="item.type == 'textarea'" [attr.disabled]="disabled ? '' : null" class="no-padding-top ui-form-group" [ngClass]="'ui-g-' + (12 / (item.column_options || 1))">
            <textarea [rows]="item.rows"  [attr.disabled]="disabled ? '' : null" [(ngModel)]="item.content" pInputTextarea style="resize: vertical"></textarea>
        </div>
        <p-calendar *ngIf="item.type == 'textbox' && item.is_datetime && !item.is_number" appendTo="body" [showIcon]="true" [locale]="locale_calendar"
            [maxDate]="today" [(ngModel)]="item.content" [showTime]="true" (keydown)="onlyNumbers($event)" (input)="addSlash($event)" [dateFormat]="dateFormat" ></p-calendar>
        <ng-container *ngIf="item.type == 'radio'">
            <div class="ui-g">
                <div *ngFor="let option of item.options; let i = index" [ngClass]="'ui-g-' + (12 / (item.column_options || 1))">
                    <p-radioButton #rad [disabled]="disabled" [name]="item.control_id" [value]="i" [label]="option" [ngModel]="item.content" (onClick)="onRadioClick(rad, i)"></p-radioButton>
                </div>
            </div>
        </ng-container>
        <ng-container *ngIf="item.type == 'checkbox'">
            <div class="ui-g">
                <div *ngFor="let option of item.options; let i = index" [ngClass]="'ui-g-' + (12 / (item.column_options || 1))">
                    <p-checkbox [(ngModel)]="item.content" [name]="item.control_id" [value]="i" [disabled]="disabled" [label]="option"></p-checkbox>
                </div>
            </div>
        </ng-container>
    </div>
    `
})
export class DocXControl extends Utils implements OnInit {

    @Input() class: string;
    @Input() disabled: boolean;
    @Input() item: any;

    constructor(injector: Injector) {
        super(injector);
    }

    onRadioClick(rad: RadioButton, option_value: number) {
        if (this.item.content == option_value) {
            this.item.content = null;
            rad.writeValue(null);
        } else {
            this.item.content = rad.value;
        }
    }

    ngOnInit() { }

}
