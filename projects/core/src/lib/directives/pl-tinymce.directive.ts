import { AfterViewInit, Directive, Host, Input, OnChanges, Optional, Self, SimpleChanges } from '@angular/core';
import { TinymceComponent } from 'angular2-tinymce';
import { DomHandler } from 'primeng/api';
declare var tinymce: any;

@Directive({
    // tslint:disable-next-line:directive-selector
    selector: '[plTinyMce]',
    providers: [DomHandler]
})
export class PLTinyMce implements OnChanges, AfterViewInit {

    @Input() public plTinyMce: any;
    @Input() public disabled: boolean;
    public fnAddedEditor: any;
    public handler: any;

    constructor(@Host() @Self() @Optional() public host: TinymceComponent) {
        this.handler = (event) => {
            this.fnAddedEditor = event;
            tinymce.off('addeditor', this.handler);
        };
        tinymce.on('addeditor', this.handler, true);
    }

    ngAfterViewInit() {
        let editor = this.fnAddedEditor.editor;
        if (editor) {
            if (this.disabled == null || this.disabled == false) {
                editor.setMode('design');
            } else {
                editor.setMode('readonly');
                this.enableTinyMceEditorPlugin(editor.id, 'fullscreen', 'mceFullscreen');
            }
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        if (this.fnAddedEditor && this.fnAddedEditor.editor && changes.disabled) {
            this.fnAddedEditor.editor.setMode(changes.disabled.currentValue ? 'readonly' : 'design');
            if (changes.disabled.currentValue) {
                this.enableTinyMceEditorPlugin(this.fnAddedEditor.editor.id, 'fullscreen', 'mceFullscreen');
            }
        }
    }

    enableTinyMceEditorPlugin(editorId, pluginName, commandName) {
        setTimeout(() => {
            let htmlEditorDiv: any = document.getElementById(editorId).previousSibling;
            let editor = tinymce.get(editorId);
            if (htmlEditorDiv) {
                let buttonDiv = htmlEditorDiv.querySelectorAll('.mce-i-' + pluginName.toLowerCase())[0].parentElement.parentElement;
                buttonDiv.className = buttonDiv.className.replace(' mce-disabled', '');
                buttonDiv.removeAttribute('aria-disabled');
                buttonDiv.firstChild.onclick = function () {
                    if (editor.readonly) {
                        editor.execCommand(commandName);
                    }
                };
            }
        }, 1000);
    }

}
