import { Component, Injector, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ENotificationType, Grid, SystemConstants } from 'core';
import { Observable } from 'rxjs';
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/operator/takeUntil';
import { Item } from '../../../entities/item';
declare var $: any;

@Component({
  selector: 'app-item-published',
  templateUrl: './item-published.component.html'
})
export class ItemPublishedComponent extends Grid implements OnInit {
  public auto_fill = false;
  public isCreate = false;
  public item: Item;
  public selectedItemGroupSearch: any;
  public item_groups: any;
  public hasUpdateDownermission: boolean;
  public hasSearchAllPermission: boolean;
  public host_image: any;
  public constructor(injector: Injector) {
    super(injector);
    this.ckeditorConfig();
    this.host_image = SystemConstants.IMAGE_API + '/';
    this.LZCompress = true; // using LZString compress data
    this.loadBalancing = true;
    this.APIModuleName = 'CMS';
    this.searchApiUrl = '/api/item/search';
    this.filterFields = ['title', 'item_group_name'];
    this.dataKey = 'item_id';
    this.searchValue.page = this.page;
    this.searchValue.pageSize = this.pageSize;
    this.searchFormGroup = new FormGroup({
      'item_group_id': new FormControl(''),
      'content_search': new FormControl(''),
      'fr_published_date_time': new FormControl(''),
      'to_published_date_time': new FormControl(''),
      'item_status_rcd': new FormControl(''),
      'search_all': new FormControl(''),
    });
    this.hasSearchAllPermission = this._authenService.hasPermission(this.pageId, 'search_item_temp_all');
    this.hasViewPermission = this._authenService.hasPermission(this.pageId, 'view_item_pub');
    this.hasUpdateDownermission = this._authenService.hasPermission(this.pageId, 'update_item_down');
    if (this.hasSearchAllPermission) {
      this.searchFormGroup.get('search_all').setValue('1');
    } else {
      this.searchFormGroup.get('search_all').setValue('0');
    }
    this.predicateBeforeSearch = () => {
      let first = new Date();
      first.setDate(1);
      if (!this.searchFormGroup.get('fr_published_date_time').value || this.searchFormGroup.get('fr_published_date_time').value == '') {
        this.searchFormGroup.controls['fr_published_date_time'].setValue(first);
      }
      if (!this.searchFormGroup.get('to_published_date_time').value || this.searchFormGroup.get('to_published_date_time').value == '') {
        this.searchFormGroup.controls['to_published_date_time'].setValue(this.today);
      }
      this.searchFormGroup.get('item_status_rcd').setValue('PUP');
      this.searchFormGroup.get('item_group_id').setValue(this.selectedItemGroupSearch);
    };
  }

  public loadDropdowns() {
    Observable.combineLatest(
      this._apiService.post('/api/adapter/execute', { Method: { Method: 'GET' }, Url: '/api/item-group/get-dropdown/', Module: 'CMS' }),
    ).takeUntil(this.unsubscribe).subscribe(res => {
      this.item_groups = null;
      setTimeout(() => {
        this.item_groups = this.item_groups || res[0].data;
        this.search();
      });
    });
  }

  public ngOnInit() {
    this.loadDropdowns();
  }

  public onDown(row) {
    this._translateService.get('MESSAGE.confirm_publisded').subscribe((message) => {
      this._confirmationService.confirm({
        message: message,
        accept: () => {
          this._apiService.post('/api/adapter/execute', { Method: { Method: 'POST' }, Url: '/api/item/update-item-down', Module: 'CMS', Data: JSON.stringify(row) }).takeUntil(this.unsubscribe).subscribe(res => {
            this.searchFormGroup.get('item_group_id').setValue(this.selectedItemGroupSearch);
            this.search();
            this._functionConstants.ShowNotification(ENotificationType.GREEN, res.messageCode);
          });
        }
      });
    });
  }

  public openViewUpdateModal(row) {
    this.doneSetupForm = false;
    setTimeout(() => {
      $('#updateViewItemModal').appendTo('body').modal('toggle');
    });
    setTimeout(() => {
      let arrRequest = this.getArrayRequest();
      arrRequest.push(this._apiService.post('/api/adapter/execute', { Method: { Method: 'GET' }, Url: '/api/item/get-by-id/' + row.item_id, Module: 'CMS' }));
      Observable.combineLatest(arrRequest).takeUntil(this.unsubscribe).subscribe((res: any)  => {
        this.isCreate = false;
        this.item = res[0].data;
        if (this._storageService.getItem(SystemConstants.get('PREFIX_DATA_LANGUAGE')) == 'en') {
          this.item.item_title = this.item.item_title_e;
        } else {
          this.item.item_title = this.item.item_title_l;
        }
        if (this._storageService.getItem(SystemConstants.get('PREFIX_DATA_LANGUAGE')) == 'en') {
          this.item.item_sub_title = this.item.item_sub_title_e;
        } else {
          this.item.item_sub_title = this.item.item_sub_title_l;
        }
        if (this._storageService.getItem(SystemConstants.get('PREFIX_DATA_LANGUAGE')) == 'en') {
          this.item.item_detail = this.item.item_detail_e;
          this.item.item_detail = this.replaceAll(this.item.item_detail, 'upload/news/image_detail', SystemConstants.IMAGE_API + '/upload/news/image_detail');
          this.item.item_detail = this.replaceAll(this.item.item_detail, 'upload/news/pdf', SystemConstants.IMAGE_API + '/upload/news/pdf');
        } else {
          this.item.item_detail = this.item.item_detail_l;
          this.item.item_detail = this.replaceAll(this.item.item_detail, 'upload/news/image_detail', SystemConstants.IMAGE_API + '/upload/news/image_detail');
          this.item.item_detail = this.replaceAll(this.item.item_detail, 'upload/news/pdf', SystemConstants.IMAGE_API + '/upload/news/pdf');
        }
        this.doneSetupForm = true;
      });
    }, 700);
  }

  public getArrayRequest() {
    let arrRequest = [];
    return arrRequest;
  }
}
