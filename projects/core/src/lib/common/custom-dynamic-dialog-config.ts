import { DynamicDialogConfig } from 'primeng/api';

export class CustomDynamicDialogConfig extends DynamicDialogConfig {
    buttons: any[];
    inputs: any[];
    outputs: any[];
    footerCloseButtonVisible: boolean;
}
