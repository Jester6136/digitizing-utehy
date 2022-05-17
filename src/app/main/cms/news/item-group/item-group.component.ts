import { Component, OnInit, ViewChild, Injector, ChangeDetectionStrategy } from '@angular/core';
import 'rxjs/add/operator/takeUntil';
import { SystemConstants } from 'core';
import { ENotificationType } from 'core';
import { FormGroup } from '@angular/forms';
import { Grid } from 'core';
import { Observable } from 'rxjs';
import 'rxjs/add/observable/combineLatest';
import * as FileSaver from 'file-saver';
import { ItemGroup } from '../../../entities/item-group';
import { ItemGroupDetailComponent } from './detail-item-group/detail-item-group.component';
declare var $: any;

@Component({
  selector: 'app-item-group',
  templateUrl: './item-group.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemGroupComponent extends Grid implements OnInit {

  public isCreate = false;
  public item_group: ItemGroup;
  public group_type_refs: any;
  public row: any;
  public item_groups: any;
  public is_news: any;
  @ViewChild(ItemGroupDetailComponent, { static: false}) cmpItemGroupDetail: ItemGroupDetailComponent;
  public constructor(injector: Injector) {
    super(injector);
    this.LZCompress = true; // using LZString compress data
    this.loadBalancing = true;
    this.APIModuleName = 'CMS';
    this.isTreeTable = true;
    this.isTree = true;
    this.notByLanguageLabels = ['item_group_name'];
    this.dataLabel = 'item_group_name';
    this.loadTreeFromLocalFile = false;
    this.treeLoadedAll = true;
    this.tableName = 'item_group';
    this.getListByIdApiUrl = '/api/item-group/get-list-by-id/';
    this.searchApiUrl = '/api/item-group/search';
    this.exportUrl = '/api/item-group/export-to-excel';
    this.exportFilename = 'item_group.xlsx';
    this.filterFields = ['item_group_name', 'item_group_code'];
    this.setNullIfEmpty = ['parent_item_group_id', 'item_type_rcd'];
    this.dataKey = 'item_group_id';
    this.searchValue.page = this.page;
    this.searchValue.pageSize = this.pageSize;
    this.searchFormGroup = new FormGroup({
    });
    this.hasViewPermission = this._authenService.hasPermission(this.pageId, 'view_item_group');
    this.hasCreatePermission = this._authenService.hasPermission(this.pageId, 'create_item_group');
    this.hasUpdatePermission = this._authenService.hasPermission(this.pageId, 'update_item_group');
    this.hasDeletePermission = this._authenService.hasPermission(this.pageId, 'delete_item_group');
    this.tableActions = [];
    if (this.hasDeletePermission) {
      this._translateService.get('COMMON.delete').subscribe((message) => {
        this.tableActions.push({ label: message, icon: 'fa-close', command: () => { this.onRemove(this.selectedDataTableItems); } });
      });
    }
    this.predicateAfterSearch = () => {
      this.treeSort(this.data_table_tree, 'sort_order', this.dataLabel, 1);
      this.executeRecursive(this.data_table_tree, (item) => {
        item.leaf = item.data.children == null || item.data.children.length == 0;
        if (item.children) {
          this.treeSort(item.children, 'sort_order', this.dataLabel, 1);
        }
      });
      this.data_table_tree = [...this.data_table_tree];
      let dropdown = this.GenerateDropDownfromTree(this.data_table_tree);
      this.globalFilterText = '';
      this.item_groups = dropdown;
      this._changeDetectorRef.detectChanges();
    };
  }

  public emtSelectItemGroup(event) {
    this.is_news = event;
  }

  exportToExcel() {
    this._apiService.post(SystemConstants.get('ADAPTER_API'), {
      Method: { Method: 'POST' },
      Url: this.exportUrl,
      Module: 'CMS',
      AcceptType: SystemConstants.get('CONTENT_TYPE_OCTET_STREAM'),
      Data: JSON.stringify({
      })
    }, true, true).takeUntil(this.unsubscribe).subscribe(fileData => {
      FileSaver.saveAs(fileData, this.exportFilename);
    });
  }

  getArrayRequest() {
    let arrRequest = [];
    if (this.group_type_refs == null) {
      arrRequest.push( this._apiService.post('/api/adapter/execute', { Method: { Method: 'GET' }, Url: '/api/website-group-type-ref/get-dropdown', Module: 'CMS' }));
    } else {
      arrRequest.push(Observable.of(null));
    }
    return arrRequest;
  }

  public ngOnInit() {
    this.item_group = new ItemGroup();
    this.search();
  }
  public openCreateModal(row: any = null) {
    this.doneSetupForm = false;
    this.showUpdateModal = true;
    this.isCreate = true;
    this.row = row;
    this.is_news =  null;
    setTimeout(() => {
      $('#updateItemGroupModal').modal('toggle');
    });
    setTimeout(() => {
      Observable.combineLatest(this.getArrayRequest()).takeUntil(this.unsubscribe).subscribe((res: any) => {
        this.group_type_refs = this.group_type_refs || res[0].data;
        this.doneSetupForm = true;
        setTimeout(() => {
          this._changeDetectorRef.detectChanges();
          this.setAutoFocus();
        });
      });
    }, 700);
  }
  public onSubmit() {
    if (!this.submitting) {
      this.submitting = true;
      this.item_group = this.cmpItemGroupDetail.saveDetail();
    
      if (this.isCreate) {
        Observable.combineLatest(
          this.getEncodeFromImage(this.item_group.file_image_url)
        ).takeUntil(this.unsubscribe).subscribe((data: any[]): void => {
          this.item_group.image_url = data[0] == '' ? this.item_group.image_url : data[0];
          this.item_group.file_image_url = null;
          this._apiService.post('/api/adapter/execute', { Method: { Method: 'POST' }, Url: '/api/item-group/create-item-group', Module: 'CMS', Data: JSON.stringify(this.item_group) }).takeUntil(this.unsubscribe).subscribe(res => {
            let itemtotree = Object.assign({}, this.item_group);
            itemtotree.item_group_id = res.data.item_group_id;
            this.item_group = new ItemGroup();
            this.cmpItemGroupDetail.updateForm.markAsPristine();
            this.setAutoFocus();
            this.AddItemNode(itemtotree);
            let dropdown = this.GenerateDropDownfromTree(this.data_table_tree);
            this.item_groups = dropdown;
            this._functionConstants.ShowNotification(ENotificationType.GREEN, res.messageCode);
            this.submitting = false;
            this._changeDetectorRef.detectChanges();
          }, () => this.submitting = false);
        }, (error) => { this.submitting = false; });
      } else {
        Observable.combineLatest(
          this.getEncodeFromImage(this.item_group.file_image_url)
        ).takeUntil(this.unsubscribe).subscribe((data: any[]): void => {
          this.item_group.image_url = data[0] == '' ? this.item_group.image_url : data[0];
          this.item_group.file_image_url = null;
          this._apiService.post('/api/adapter/execute', { Method: { Method: 'POST' }, Url: '/api/item-group/update-item-group', Module: 'CMS', Data: JSON.stringify(this.item_group) }).takeUntil(this.unsubscribe).subscribe(res => {
            this.showUpdateModal = false;
            $('#updateForm').closest('.modal').modal('toggle');
            this.submitting = false;
            this.UpdateItemNode(this.item_group);
            let dropdown = this.GenerateDropDownfromTree(this.data_table_tree);
            this.item_groups = dropdown;
            this._functionConstants.ShowNotification(ENotificationType.GREEN, res.messageCode);
            this._changeDetectorRef.detectChanges();
          }, () => this.submitting = false);
        }, (error) => { this.submitting = false; });
      }
    }
  }

  public onRemove(items: any[]) {
    if (items.length > 0) {
      this._translateService.get('MESSAGE.confirm_delete').subscribe((message) => {
        this._confirmationService.confirm({
          message: message,
          accept: () => {
            let removeIds = [];
            items.forEach(ds => {
              if (!ds.must_not_change_flag) {
                removeIds.push(ds.item_group_id);
              }
            });
            if (removeIds.length > 0) {
              this._apiService.post('/api/adapter/execute', { Method: { Method: 'POST' }, Url: '/api/item-group/delete-item-group', Module: 'CMS', Data: JSON.stringify(removeIds) }).takeUntil(this.unsubscribe).subscribe(res => {
                if (res.data) {
                  this.RemoveItemNode(items);
                  let dropdown = this.GenerateDropDownfromTree(this.data_table_tree);
                  this.item_groups = dropdown;
                  this.selectedDataTableItems = [];
                  this._functionConstants.ShowNotification(ENotificationType.GREEN, res.messageCode);
                } else {
                  this._functionConstants.ShowNotification(ENotificationType.ORANGE, 'MESSAGE.item_group_exist_item');
                }
              }, () => {
                this._functionConstants.ShowNotification(ENotificationType.ORANGE, 'MESSAGE.item_group_exist_item');
              });
            }
          }
        });
      });
    }
  }

  public openUpdateModal(row) {
    this.doneSetupForm = false;
    this.showUpdateModal = true;
    this.origin_parent = row.parent_item_group_id;
    this.isCreate = false;
    this.row = row;
    setTimeout(() => {
      $('#updateItemGroupModal').modal('toggle');
    });
    setTimeout(() => {
      let arrRequest = this.getArrayRequest();
      arrRequest.push(this._apiService.post('/api/adapter/execute', { Method: { Method: 'GET' }, Url: '/api/item-group/get-by-id/' + row.item_group_id, Module: 'CMS' }));
      Observable.combineLatest(arrRequest).takeUntil(this.unsubscribe).subscribe((res: any) => {
        this.group_type_refs = this.group_type_refs || res[0].data;
        this.item_group = res[1].data;
        this.doneSetupForm = true;
        setTimeout(() => {
          this._changeDetectorRef.detectChanges();
          this.setAutoFocus();
        });
      });
    }, 700);
  }

  public resetForm() {
    if (this.cmpItemGroupDetail) {
      this.cmpItemGroupDetail.resetForm();
    }
  }
}
