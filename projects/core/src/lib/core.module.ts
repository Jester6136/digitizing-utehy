import { ArraySortPipe } from './pipe/sort.pipe';
import { CommonModule } from '@angular/common';
import { ErrorHandler, ModuleWithProviders, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CKEditorModule } from 'ckeditor4-angular';
import { TinymceModule } from 'angular2-tinymce';
import { NgSelectizeModule } from 'ng-selectize';
import { CurrencyMaskModule } from 'ng2-currency-mask';
import { NgxPaginationModule } from 'ngx-pagination';
import { AccordionModule } from 'primeng/accordion';
import { ConfirmationService, DialogService, DomHandler, DynamicDialogConfig, DynamicDialogRef, MessageService, TreeDragDropService } from 'primeng/api';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { ChartModule } from 'primeng/chart';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ContextMenuModule } from 'primeng/contextmenu';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { FieldsetModule } from 'primeng/fieldset';
import { FileUploadModule } from 'primeng/fileupload';
import { FullCalendarModule } from 'primeng/fullcalendar';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { KeyFilterModule } from 'primeng/keyfilter';
import { ListboxModule } from 'primeng/listbox';
import { MenuModule } from 'primeng/menu';
import { MessageModule } from 'primeng/message';
import { MessagesModule } from 'primeng/messages';
import {ColorPickerModule} from 'primeng/colorpicker';
import { MultiSelectModule } from 'primeng/multiselect';
import { OrganizationChartModule } from 'primeng/organizationchart';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { PaginatorModule } from 'primeng/paginator';
import { PanelModule } from 'primeng/panel';
import { PickListModule } from 'primeng/picklist';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ScheduleModule } from 'primeng/schedule';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { SidebarModule } from 'primeng/sidebar';
import { SplitButtonModule } from 'primeng/splitbutton';
import { TableModule } from 'primeng/table';
import { ToolbarModule } from 'primeng/toolbar';
import { TreeModule } from 'primeng/tree';
import { TreeTableModule } from 'primeng/treetable';
import { TriStateCheckboxModule } from 'primeng/tristatecheckbox';
import { AppPreloadingStrategy } from './common/app_preloading_strategy';
import { CustomDynamicDialogComponent } from './common/cusom-dynamic-dialog';
import { MyErrorHandler } from './common/custom-handle-error';
import { CustomPreloadingStrategy } from './common/custom-preload';
import { DocXControl } from './common/docx-control';
import { DocXLabel } from './common/docx-label';
import { ErrorMessages } from './common/error-messages';
import { CustomizeFileUpload } from './common/file-upload';
import { FunctionConstants } from './common/function.constants';
import { Guid } from './common/guid';
import { KeyboardShortcuts } from './common/keyboard-shortcuts';
import { LapoloDropdown } from './common/l-dropdown';
import { LanguageSwitcher } from './common/language-switcher';
import { LapoloDatetimePicker } from './common/lapolo-datetime-picker';
import { SystemConstants } from './common/system.constants';
import { Bootrstro } from './directives/pl-bootstro.directive';
import { PLDebounceClickDirective } from './directives/pl-debounce-click.directive';
import { PLDocXContainerDirective } from './directives/pl-docx-container.directive';
import { PLInvalidMessage } from './directives/pl-invalid-message.directive';
import { PLThousandFormaterDirective } from './directives/pl-thousand-formater.directive';
import { PLTinyMce } from './directives/pl-tinymce.directive';
import { AuthGuard, ConfirmedGuard, CustomCanLoad, LoggedInGuard, LoginGuard, PermissionCanLoad } from './guards/auth.guard';
import { ConfirmDeactivateGuard } from './guards/candeactive.guard';
import { PermissionGuard } from './guards/permission.guard';
import { AgePipe } from './pipe/age.pipe';
import { RangePipe } from './pipe/range.pipe';
import { ReplaceStringPipe } from './pipe/replace-string.pipe';
import { ReplaceTodayPipe } from './pipe/replace-today.pipe';
import { ReplacePipe } from './pipe/replace.pipe';
import { SafeHTMLPipe } from './pipe/safe-html.pipe';
import { SafeResourceUrlPipe } from './pipe/safe-resource-url.pipe';
import { SafeStylePipe } from './pipe/safe-style.pipe';
import { PLThousandPipe } from './pipe/thousand.pipe';
import { TruncatePipe } from './pipe/truncate.pipe';
import { ApiService } from './services/api.service';
import { AuthenService } from './services/auth.service';
import { CanDeactivateGuard } from './services/can-deactivate-guard.service';
import { ConfigService } from './services/config.service';
import { CustomDialogService } from './services/custom-dialog.service';
import { ImageService } from './services/image.service';
import { SharedService } from './services/shared.service';
import { CustomDynamicDialogContent } from './directives/custom-dynamic-dialog-content';
import { CustomDynamicDialogConfig } from './common/custom-dynamic-dialog-config';
import { ChipsModule } from 'primeng/chips';
import { NgSelectorComponent } from './ng-selector/ng-selector.component';
import { ProgressBarModule } from 'primeng/progressbar';
import { PrintPreviewComponent } from './print-preview/print-preview.component';
import { CardModule } from 'primeng/card';
import { SpinnerModule } from 'primeng/spinner';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { InplaceModule } from 'primeng/inplace';

@NgModule({
  declarations: [
    NgSelectorComponent,
    CustomDynamicDialogComponent,
    CustomizeFileUpload,
    CustomizeFileUpload,
    AgePipe,
    ReplacePipe,
    PLThousandPipe,
    RangePipe,
    ArraySortPipe,
    ReplaceStringPipe,
    ReplaceTodayPipe,
    SafeHTMLPipe,
    SafeResourceUrlPipe,
    SafeStylePipe,
    TruncatePipe,
    LapoloDropdown,
    Bootrstro,
    PLThousandFormaterDirective,
    PLDocXContainerDirective,
    PLDebounceClickDirective,
    PLTinyMce,
    PLInvalidMessage,
    ErrorMessages,
    LanguageSwitcher,
    DocXControl,
    DocXLabel,
    LapoloDatetimePicker,
    CustomDynamicDialogContent,
    PrintPreviewComponent,
  ],
  imports: [
    ColorPickerModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MultiSelectModule,
    TranslateModule,
    FileUploadModule,
    PaginatorModule,
    OverlayPanelModule,
    PanelModule,
    CalendarModule,
    AutoCompleteModule,
    SplitButtonModule,
    DropdownModule,
    ListboxModule,
    RadioButtonModule,
    DialogModule,
    FieldsetModule,
    CheckboxModule,
    InputTextareaModule,
    KeyFilterModule,
    ConfirmDialogModule,
    TreeModule,
    MessageModule,
    MessagesModule,
    ScrollPanelModule,
    TreeTableModule,
    ChipsModule,
    ProgressBarModule,
    NgSelectizeModule,
    CurrencyMaskModule,
    ContextMenuModule,
    OrganizationChartModule,
    SidebarModule,
    ScheduleModule,
    FullCalendarModule,
    PickListModule,
    InputTextModule,
    ButtonModule,
    TableModule,
    AccordionModule,
    ToolbarModule,
    MenuModule,
    NgxPaginationModule,
    ChartModule,
    TriStateCheckboxModule,
    TinymceModule.withConfig({}),
    InputSwitchModule,
    DynamicDialogModule,
    PdfViewerModule,
    CardModule,
    SpinnerModule,
    InplaceModule,
    CKEditorModule
  ],
  exports: [
    ColorPickerModule,
    NgSelectorComponent,
    MultiSelectModule,
    TranslateModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PaginatorModule,
    OverlayPanelModule,
    PanelModule,
    CalendarModule,
    AutoCompleteModule,
    SplitButtonModule,
    DropdownModule,
    ListboxModule,
    RadioButtonModule,
    DialogModule,
    FieldsetModule,
    CheckboxModule,
    InputTextareaModule,
    KeyFilterModule,
    ConfirmDialogModule,
    TreeModule,
    MessageModule,
    MessagesModule,
    ScrollPanelModule,
    TreeTableModule,
    FileUploadModule,
    ContextMenuModule,
    OrganizationChartModule,
    SidebarModule,
    ScheduleModule,
    FullCalendarModule,
    PickListModule,
    InputTextModule,
    ButtonModule,
    TableModule,
    AccordionModule,
    ToolbarModule,
    MenuModule,
    ChartModule,
    TriStateCheckboxModule,
    ChipsModule,
    ProgressBarModule,
    AgePipe,
    ReplacePipe,
    PLThousandPipe,
    RangePipe,
    ArraySortPipe,
    ReplaceStringPipe,
    ReplaceTodayPipe,
    SafeHTMLPipe,
    SafeResourceUrlPipe,
    SafeStylePipe,
    TruncatePipe,
    LapoloDropdown,
    Bootrstro,
    PLThousandFormaterDirective,
    PLDocXContainerDirective,
    PLDebounceClickDirective,
    PLTinyMce,
    PLInvalidMessage,
    ErrorMessages,
    LanguageSwitcher,
    DocXControl,
    DocXLabel,
    LapoloDatetimePicker,
    CustomDynamicDialogContent,
    CustomizeFileUpload,
    TinymceModule,
    NgSelectizeModule,
    CurrencyMaskModule,
    InputSwitchModule,
    DynamicDialogModule,
    PrintPreviewComponent,
    InplaceModule,
    CKEditorModule
  ],
  entryComponents: [
    CustomDynamicDialogComponent
  ],
  providers: [
    PLThousandPipe,
    SystemConstants
  ]
})
export class CoreModule {
  static forRoot(environment: any): ModuleWithProviders {
    return {
      ngModule: CoreModule,
      providers: [
        AppPreloadingStrategy,
        TranslateModule,
        FunctionConstants,
        CustomPreloadingStrategy,
        KeyboardShortcuts,
        Guid,
        AuthGuard,
        ConfirmedGuard,
        PermissionGuard,
        LoggedInGuard,
        LoginGuard,
        ConfirmDeactivateGuard,
        CustomCanLoad,
        PermissionCanLoad,
        CanDeactivateGuard,
        TreeDragDropService,
        ConfirmationService,
        ImageService,
        AuthenService,
        ApiService,
        MessageService,
        SharedService,
        ConfigService,
        DialogService,
        CustomDialogService,
        DomHandler,
        DynamicDialogRef,
        DynamicDialogConfig,
        CustomDynamicDialogConfig,
        {
          provide: ErrorHandler,
          useClass: MyErrorHandler
        },
        {
          provide: 'env',
          useValue: environment
        }
      ]
    };
  }
}
