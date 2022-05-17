import { animate, state, style, transition, trigger } from '@angular/animations';
import { ChangeDetectorRef, Component, ComponentFactoryResolver, NgZone, Renderer2, ViewChild, Type } from '@angular/core';
import { DomHandler, DynamicDialogRef } from 'primeng/api';
import { DynamicDialogComponent } from 'primeng/dynamicdialog';
import { CustomDynamicDialogContent } from '../directives/custom-dynamic-dialog-content';
import { CustomDynamicDialogConfig } from './custom-dynamic-dialog-config';

@Component({
    selector: 'lpl-dynamicDialog',
    template: `
        <div #mask class="ui-widget-overlay ui-dialog-mask ui-dialog-mask-scrollblocker" *ngIf="visible" (click)="onMaskClick()"></div>
        <div [ngClass]="{'ui-dialog ui-dynamicdialog ui-widget ui-widget-content ui-corner-all ui-shadow':true, 'has-footer': (config['buttons'] && config['buttons'].length > 0) || config['footerCloseButtonVisible'], 'ui-dialog-rtl': config.rtl}" [ngStyle]="config.style" [class]="config.styleClass"
            [@animation]="{value: 'visible', params: {transitionParams: config.transitionOptions || '400ms cubic-bezier(0.25, 0.8, 0.25, 1)'}}"
            (@animation.start)="onAnimationStart($event)" (@animation.done)="onAnimationEnd($event)" role="dialog" *ngIf="visible"
            [style.width]="config.width" [style.height]="config.height">
            <div class="ui-dialog-titlebar ui-widget-header ui-helper-clearfix ui-corner-top" *ngIf="config.showHeader === false ? false: true">
                <span class="ui-dialog-title">{{ config.header | translate }}</span>
                <a [ngClass]="'ui-dialog-titlebar-icon ui-dialog-titlebar-close ui-corner-all'" tabindex="0" role="button" (click)="close()" (keydown.enter)="close()" *ngIf="config['closable'] === false ? false : true">
                    <span class="pi pi-times"></span>
                </a>
            </div>
            <div class="ui-dialog-content ui-widget-content" [ngStyle]="config.contentStyle">
                <ng-template pCustomDynamicDialogContent></ng-template>
            </div>
            <div *ngIf="(config['buttons'] && config['buttons'].length > 0) || config['footerCloseButtonVisible']" class="ui-dialog-footer ui-widget-content">
                <ng-container *ngFor="let button of config['buttons']">
                    <button type="button" *ngIf="button.condition != null ? button.condition : true" pButton icon="{{ button.icon }}" (click)="button.command()"
                        label="{{ button.label | translate }}"></button>
                </ng-container>
                <button type="button" *ngIf="config['footerCloseButtonVisible']" pButton icon="fa-times" (click)="close()" label="{{ 'COMMON.cancel' | translate }}"></button>
            </div>
        </div>
    `,
    animations: [
        trigger('animation', [
            state('void', style({
                transform: 'translate3d(-50%, -25%, 0) scale(0.9)',
                opacity: 0
            })),
            state('visible', style({
                transform: 'translateX(-50%) translateY(-50%)',
                opacity: 1
            })),
            transition('* => *', animate('{{transitionParams}}'))
        ])
    ]
})
export class CustomDynamicDialogComponent extends DynamicDialogComponent {

    @ViewChild(CustomDynamicDialogContent, {static: false}) insertionPoint: CustomDynamicDialogContent;

    constructor(componentFactoryResolver: ComponentFactoryResolver, cd: ChangeDetectorRef, renderer: Renderer2, config: CustomDynamicDialogConfig, dialogRef: DynamicDialogRef, zone: NgZone) {
        super(componentFactoryResolver, cd, renderer, config, dialogRef, zone);
    }

    loadChildComponent(componentType: Type<any>) {
        super.loadChildComponent(componentType);
        if (this.componentRef.instance.emiterCloseDynamicDialog) {
            this.componentRef.instance.emiterCloseDynamicDialog.subscribe((event: any) => this['dialogRef'].close());
        }
        if (this.config['inputs']) {
            Object.keys(this.config['inputs']).forEach(key => {
                this.componentRef.instance[key] = this.config['inputs'][key];
            });
        }
        if (this.config['outputs']) {
            // Object.keys(this.config['outputs']).forEach(key => {
            //     this.componentRef.instance[key].subscribe((event: any) => this.config['outputs'][key](event));
            // });
        }
        if (this.config['buttons']) {
            this.config['buttons'].forEach(button => {
                if (button.command) {
                    if (typeof button.command == 'string') {
                        let fn: string = button.command;
                        button.command = () => {
                            this.componentRef.instance[fn]();
                        };
                    }
                }
            });
        }
    }

}
