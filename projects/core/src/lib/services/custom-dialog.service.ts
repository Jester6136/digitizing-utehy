import { ApplicationRef, ComponentFactoryResolver, ComponentRef, EmbeddedViewRef, Injectable, Injector, Type } from '@angular/core';
import { DynamicDialogRef } from 'primeng/api';
import { CustomDynamicDialogComponent } from '../common/cusom-dynamic-dialog';
import { CustomDynamicDialogConfig } from '../common/custom-dynamic-dialog-config';
import { DynamicDialogInjector } from '../common/custom-dynamic-dialog-injector';

@Injectable()
export class CustomDialogService {

    dialogComponentRef: ComponentRef<CustomDynamicDialogComponent>;

    constructor(private componentFactoryResolver: ComponentFactoryResolver, private appRef: ApplicationRef, private injector: Injector) { }

    public open(componentType: Type<any>, config: any) {
        const dialogRef = this.appendDialogComponentToBody(config);

        this.dialogComponentRef.instance.childComponentType = componentType;

        return dialogRef;
    }

    private appendDialogComponentToBody(config: CustomDynamicDialogConfig) {
        const map = new WeakMap();
        map.set(CustomDynamicDialogConfig, config);

        const dialogRef = new DynamicDialogRef();
        map.set(DynamicDialogRef, dialogRef);

        const sub = dialogRef.onClose.subscribe(() => {
            this.removeDialogComponentFromBody();
            sub.unsubscribe();
        });

        const componentFactory = this.componentFactoryResolver.resolveComponentFactory(CustomDynamicDialogComponent);
        const componentRef = componentFactory.create(new DynamicDialogInjector(this.injector, map));

        this.appRef.attachView(componentRef.hostView);

        const domElem = (componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
        document.body.appendChild(domElem);

        this.dialogComponentRef = componentRef;

        return dialogRef;
    }

    private removeDialogComponentFromBody() {
        this.appRef.detachView(this.dialogComponentRef.hostView);
        this.dialogComponentRef.destroy();
    }
}
