import { Component, OnInit, Injector, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import 'rxjs/add/operator/takeUntil';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { Grid, ENotificationType, SystemConstants, CustomizeFileUpload } from 'core';
import 'rxjs/add/observable/combineLatest';
import { ItemGroup } from '../../../../entities/item-group';

@Component({
  selector: 'app-detail-item-group',
  templateUrl: './detail-item-group.component.html'
})
export class ItemGroupDetailComponent extends Grid implements OnInit {

  @Input() isCreate: boolean;
  @Input() row: any;
  @Input() group_type_refs: any;
  @Input() data_table_tree: any;
  @Input() item_group: ItemGroup;
  @Input() item_groups: any[];
  @Output() emtSelectItemGroup: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild(CustomizeFileUpload, {static: false}) file_image_url: CustomizeFileUpload;
  public selectedItemGroup: any;
  public selectedGroupTypeRef: any;
  public item_groupsshow: any[];
  public host_image: any;
  public constructor(injector: Injector) {
    super(injector);
    this.host_image = SystemConstants.IMAGE_API + '/';
    this.setNullIfEmpty = ['parent_item_group_id'];
    this.dataLabel = 'item_group_name';
  }
  public ngOnInit() {
    if (this.isCreate) {
      this.item_groupsshow = this.item_groups;
      this.item_group = new ItemGroup();
      if (this.row != null) {
        this.selectedItemGroup = this.row.item_group_id;
        this.selectedGroupTypeRef = this.row.group_type_rcd;
      }
      this.updateForm = new FormGroup({
        'file_image_url': new FormControl('', []),
        'icon_class': new FormControl('', []),
        'item_group_url': new FormControl('', []),
        'sort_order': new FormControl('', []),
        'parent_item_group_id': new FormControl('', []),
        'group_type_rcd': new FormControl('', [Validators.required]),
        'item_group_name_e': new FormControl('', [Validators.required, Validators.maxLength(250)]),
        'item_group_name_l': new FormControl('', [Validators.required, Validators.maxLength(250)]),
        'item_group_code': new FormControl('', [Validators.required, Validators.maxLength(50)]),
      });
      this.updateValidator();
      this.updateFormOriginalData = this.updateForm.getRawValue();
      if (this.group_type_refs) {
        this.selectedGroupTypeRef = this.group_type_refs[0].value;
      }
    } else {
      this.item_groupsshow = this.item_groups.filter(it => (it.value != this.item_group.item_group_id && it.keystruct.indexOf(this.item_group.item_group_id) == -1));
      if (this.item_groupsshow.length > 0) {
        this.selectedItemGroup = this.item_group.parent_item_group_id;
      }
      if (this.row != null) {
        this.selectedGroupTypeRef = this.row.group_type_rcd;
      }
      this.updateForm = new FormGroup({
        'file_image_url': new FormControl('', []),
        'icon_class': new FormControl('', []),
        'item_group_url': new FormControl('', []),
        'sort_order': new FormControl('', []),
        'group_type_rcd': new FormControl('', [Validators.required]),
        'parent_item_group_id': new FormControl(this.item_group.parent_item_group_id, []),
        'item_group_name_e': new FormControl(this.item_group.item_group_name_e, [Validators.required, Validators.maxLength(250)]),
        'item_group_name_l': new FormControl(this.item_group.item_group_name_l, [Validators.required, Validators.maxLength(250)]),
        'item_group_code': new FormControl(this.item_group.item_group_code, [Validators.required, Validators.maxLength(50)]),
      });
      this.updateFormOriginalData = this.updateForm.getRawValue();
      this.updateValidator();
    }
  }

  public itemgroupChanged(event) {
    let ok = false;
    this.executeRecursiveAfter(this.data_table_tree, (item) => {
      if (item.data['item_group_id'] == event && item.data['group_type_rcd'] == 'ONE') {
        ok = true;
      }
    });
    if (event && ok) {
      this._functionConstants.ShowNotification(ENotificationType.ORANGE, 'MESSAGE.item_group_is_news');
      this.emtSelectItemGroup.emit('ONE');
    }
  }
  public updateValidator() {
    this.updateForm.get('item_group_name_e').valueChanges.takeUntil(this.unsubscribe).subscribe((value: string) => {
      if (!value || value.trim() == '') {
        this.updateForm.get('item_group_name_l').setValidators([Validators.required, Validators.maxLength(150)]);
      } else {
        this.updateForm.get('item_group_name_l').setValidators([Validators.maxLength(150)]);
      }
      this.updateForm.get('item_group_name_l').updateValueAndValidity({ onlySelf: true, emitEvent: false });
    });
    this.updateForm.get('item_group_name_l').valueChanges.takeUntil(this.unsubscribe).subscribe((value: string) => {
      if (!value || value.trim() == '') {
        this.updateForm.get('item_group_name_e').setValidators([Validators.required, Validators.maxLength(150)]);
      } else {
        this.updateForm.get('item_group_name_e').setValidators([Validators.maxLength(150)]);
      }
      this.updateForm.get('item_group_name_e').updateValueAndValidity({ onlySelf: true, emitEvent: false });
    });
  }

  public saveDetail() {
    this.item_group.file_image_url = this.file_image_url;

    if (!this.item_group.item_group_name_e && this.item_group.item_group_name_l) {
      this.item_group.item_group_name_e = this.item_group.item_group_name_l;
    }
    if (!this.item_group.item_group_name_l && this.item_group.item_group_name_e) {
      this.item_group.item_group_name_l = this.item_group.item_group_name_e;
    }
    this.item_group.parent_item_group_id = this.selectedItemGroup;
    this.item_group.group_type_rcd = this.selectedGroupTypeRef;
    this.item_group.sort_order = +this.item_group.sort_order;

    if (this._storageService.getItem('data_lang') == 'local') {
      this.item_group[this.dataLabel] = this.item_group[this.dataLabel + '_l'];
    } else {
      this.item_group[this.dataLabel] = this.item_group[this.dataLabel + '_e'];
    }
    if (this.isCreate) {
      this.submitting = false;
      return this.item_group;
    } else {
      this.submitting = false;
      return this.item_group;
    }
  }

  public resetForm() {
    this.resetUpdateForm();
  }
}
