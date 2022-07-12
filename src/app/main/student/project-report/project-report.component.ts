import { Component, Injector, OnInit, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ENotificationType, Grid, SystemConstants, CustomizeFileUpload } from 'core';
import { Observable } from 'rxjs';
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/operator/takeUntil';
import { WebsiteItemTypeRef } from '../../../main/entities/website-item-type-ref';
import {ProjectReport} from '../entities/projectreport' 
import {ProjectRegister} from '../entities/projectregister' 
declare var $: any;

@Component({
  selector: 'app-project-report',
  templateUrl: './project-report.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectReportComponent extends Grid implements OnInit {
  public isCreate = false;
  public fileExcel : any;
  public display: any;
  
  public isCreate_Custom = false;
  public website_item_type_ref: WebsiteItemTypeRef;
  public project_register: ProjectRegister;
  public project_report: ProjectReport;
  public selectedProject = 5;
  public project_types :any;

  public hasUploadPermission :any;

  public constructor(injector: Injector) {
    super(injector);
    this.LZCompress = true; // using LZString compress data
    this.loadBalancing = true;
    this.APIModuleName = 'STUDENT';
    this.getListByIdApiUrl = '/api/website-item-type-ref/get-list-by-id/';
    this.searchApiUrl = '/api/project_report/search';
    this.exportUrl = '/api/website-item-type-ref/export-to-excel';
    this.exportFilename = 'list_website_item_type_ref.xlsx';
    this.setNullIfEmpty = [];
    this.filterFields = ['item_type_rcd', 'item_type_name', 'item_type_size', 'sort_order', 'item_type_description'];
    this.dataKey = 'report_week';
    this.searchValue.page = this.page;
    this.searchValue.pageSize = this.pageSize;
    this.searchFormGroup = new FormGroup({
      'project_type': new FormControl(''),
    });
    this.hasViewPermission = this._authenService.hasPermission(this.pageId, 'api/project_report/search');
    this.hasCreatePermission = this._authenService.hasPermission(this.pageId, 'api/project_report/create');
    this.hasUpdatePermission = this._authenService.hasPermission(this.pageId, 'api/project_report/update');
    this.hasUploadPermission = this._authenService.hasPermission(this.pageId, 'api/project_report/upload');
    this.tableActions = [];
    if (this.hasDeletePermission) {
      this._translateService.get('COMMON.delete').subscribe((message) => {
        this.tableActions.push({ label: message, icon: 'fa-close', command: () => { this.onRemove(this.selectedDataTableItems); } });
      });
    }
    this.predicateAfterSearch = () => {      
      // if(this.data.length === 0){

      // }
      // else{
      //   this.hasRegisterPermission=true;
      //   this.data.forEach(element => {
      //     if(element.available_to_register === false){
      //       this.hasRegisterPermission=false;
      //     }
      //   });
      // }

      setTimeout(()=>{
        this._apiService.post('/api/adapter/execute', { Method: { Method: 'GET' },
         Url: '/api/project_register/get-by-id?project_type='+this.selectedProject,
          Module: 'STUDENT'})
        .subscribe(res => {
          console.log(res.data);
          
          this.project_register = res.data;
          if(this.project_register === null){
            this.project_register = new ProjectRegister();
            this.project_register.student_project_name = "";
            this.project_register.teacher_name = "";
          }
          setTimeout(()=> {
            this._changeDetectorRef.detectChanges();
          })
        }, (error) => { 
          this._functionConstants.ShowNotification(ENotificationType.RED, error.messageCode);
         });
      })

      setTimeout(() => {
        this._changeDetectorRef.detectChanges();
      });
    }

    this.predicateBeforeSearch = () => {
      this.searchFormGroup.get('project_type').setValue(this.selectedProject);
      this.pageSize = 20;
    }
  }
  showDialog() {
    this.display = true;
    this.doneSetupForm = true;
    
 }

  public loadDropdowns() {
    // setTimeout(() => {
    //   this._apiService.post('/api/adapter/execute', { Method: { Method: 'GET' }, Url: '/api/course-year/get-dropdown?prev=5&next=1', Module: 'CORE' })
    //   .subscribe(res => {
    //     console.log(res.data);
        
    //     this.courseyears = res.data;        
    //     setTimeout(() => {
    //       this._changeDetectorRef.detectChanges();
    //     });
    //   }, (error) => { 
    //     this.submitting = false;
    //     console.log(error);
    //    });
    //   })
      // this.semesters =[{"parent_id": null, "label": "Kì 1", "value": "1", "sort_order": null, "level": null, "label_e": null, "label_l": null }, {"parent_id": null, "label": "Kì 2", "value": "2", "sort_order": null, "level": null, "label_e": null, "label_l": null }];
      this.project_types =[{"parent_id": null, "label": "Đồ án 1", "value": 1, "sort_order": null, "level": null, "label_e": null, "label_l": null },{"parent_id": null, "label": "Đồ án 2", "value": 2, "sort_order": null, "level": null, "label_e": null, "label_l": null },{"parent_id": null, "label": "Đồ án 3", "value": 3, "sort_order": null, "level": null, "label_e": null, "label_l": null },{"parent_id": null, "label": "Đồ án 4", "value": 4, "sort_order": null, "level": null, "label_e": null, "label_l": null },{"parent_id": null, "label": "Đồ án 5", "value": 5, "sort_order": null, "level": null, "label_e": null, "label_l": null }]
      this.search();
  }

  public ngOnInit() {
    this.website_item_type_ref = new WebsiteItemTypeRef();
    this.project_register = new ProjectRegister();
    this.loadDropdowns();
    
  }
  
  public uploadExcel(event) {
    if (event.target.files && event.target.files.length > 0) {
      this.fileExcel = event.target.files[0];
      this.project_report.report_final_file = this.fileExcel.name;
    }
  }

  public uploadFile() {
    this.doneSetupForm = false;
    if (this.fileExcel) {
      this._apiService.importFile(this.fileExcel, 'http://localhost:57065/api/project_report/upload').subscribe((res: any) => {
        if (res.body) {
          // this.search();
          this._functionConstants.ShowNotification(ENotificationType.GREEN, res.body.messageCode);
          this.display = false;
          this.doneSetupForm = true;
          // this.fileExcel = null;
          // this.fileNameExcel = null;

           //Update student
          //  this._apiService.post('/api/adapter/execute', { Method: { Method: 'POST' }, Url: '/api/project_report/update-report', Module: 'STUDENT',
          //  Data: JSON.stringify(this.student_recruitment_report) }).subscribe(res => {
          //   this._functionConstants.ShowNotification(ENotificationType.GREEN, res.messageCode);
          //  }, (error) => { this.submitting = false; });
           //Update student


          this._changeDetectorRef.detectChanges();
        }
      });
    } else {
      this.doneSetupForm = true;
      this._functionConstants.ShowNotification(ENotificationType.ORANGE, 'MESSAGE.choose_file');
    }
  }
  // public openCreateModal(row: any = null) {
  //   this.doneSetupForm = false;
  //   this.showUpdateModal = true;
  //   setTimeout(() => {
  //     $('#updateWebsiteItemTypeRefModal').appendTo('body').modal('toggle');
  //   });
  //   setTimeout(() => {
  //     this.website_item_type_ref = new WebsiteItemTypeRef();
  //     this.isCreate = true;
  //     this.updateForm = new FormGroup({
  //       'item_type_rcd': new FormControl('', [Validators.required, Validators.maxLength(50)]),
  //       'item_type_icon': new FormControl('', [Validators.maxLength(100)]),
  //       'item_type_name_l': new FormControl('', [Validators.required, Validators.maxLength(100)]),
  //       'item_type_name_e': new FormControl('', [Validators.required, Validators.maxLength(100)]),
  //       'item_type_size': new FormControl('', [Validators.pattern(/^-?(0|[1-9]\d*)?$/)]),
  //       'sort_order': new FormControl('', [Validators.pattern(/^-?(0|[1-9]\d*)?$/)]),
  //       'item_type_description_l': new FormControl('', [Validators.maxLength(1000)]),
  //       'item_type_description_e': new FormControl('', [Validators.maxLength(1000)]),
  //     });
  //     this.updateFormOriginalData = this.updateForm.getRawValue();
  //     this.doneSetupForm = true;
  //     setTimeout(() => {
  //       this._changeDetectorRef.detectChanges();
  //       this.setAutoFocus();
  //       this.updateValidator();
  //     });
  //   }, 300);
  // }

  public updateValidator() {
    // this.updateForm.valueChanges.subscribe(res => {
    //   this.enabledSubmitFlag = this.modified();
    // });
    // this.updateForm.get('item_type_name_l').valueChanges.subscribe((value: string) => {
    //   if (!value || value.trim() == '') {
    //     this.updateForm.get('item_type_name_e').setValidators([Validators.required, Validators.maxLength(100)]);
    //   } else {
    //     this.updateForm.get('item_type_name_e').setValidators([Validators.maxLength(100)]);
    //   }
    //   this.updateForm.get('item_type_name_e').updateValueAndValidity({ onlySelf: true, emitEvent: false });
    // });
    // this.updateForm.get('item_type_name_e').valueChanges.subscribe((value: string) => {
    //   if (!value || value.trim() == '') {
    //     this.updateForm.get('item_type_name_l').setValidators([Validators.required, Validators.maxLength(100)]);
    //   } else {
    //     this.updateForm.get('item_type_name_l').setValidators([Validators.maxLength(100)]);
    //   }
    //   this.updateForm.get('item_type_name_l').updateValueAndValidity({ onlySelf: true, emitEvent: false });
    // });
  }

  public onSubmit() {
    if (this.submitting == false) {
      this.submitting = true;
      if (this.isCreate_Custom) {
        this._apiService.post('/api/adapter/execute', { Method: { Method: 'POST' }, Url: '/api/project_report/create', Module: 'STUDENT',
         Data: JSON.stringify(this.project_report) }).subscribe(res => {
          let index = this.data.findIndex(ds => ds[this.dataKey] == this.project_report[this.dataKey]);
          let item = this.copyProperty(res.data);
          let idx;

          this.data[index] = item;
          this.data = this.data.slice();
          this.closeUpdateForm(null);
          this._functionConstants.ShowNotification(ENotificationType.GREEN, res.messageCode);
          this.submitting = false;
        }, (error) => { this.submitting = false; });
      } else {
        this._apiService.post('/api/adapter/execute', { Method: { Method: 'POST' }, Url: '/api/project_report/update', Module: 'STUDENT',
         Data: JSON.stringify(this.project_report) }).subscribe(res => {
          let index = this.data.findIndex(ds => ds[this.dataKey] == this.project_report[this.dataKey]);
          let item = this.copyProperty(res.data);
          let idx;

          this.data[index] = item;
          this.data = this.data.slice();
          this.closeUpdateForm(null);
          this._functionConstants.ShowNotification(ENotificationType.GREEN, res.messageCode);
          this.submitting = false;
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
                removeIds.push(ds.item_type_rcd);
              }
            });
            if (removeIds.length > 0) {
              this._apiService.post('/api/adapter/execute', { Method: { Method: 'POST' }, Url: '/api/website-item-type-ref/delete-website-item-type-ref', Module: 'CMS', Data: JSON.stringify(removeIds) }).subscribe(res => {
                this.search();
                this.selectedDataTableItems = [];
                this._functionConstants.ShowNotification(ENotificationType.GREEN, res.messageCode);
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
    setTimeout(() => {
      $('#updateWebsiteItemTypeRefModal').appendTo('body').modal('toggle');
    });
    //Chưa có báo cáo sẵn
    if(row.student_project_report_id=="00000000-0000-0000-0000-000000000000"){
      setTimeout(() => {
        this.project_report = new ProjectReport();
        this.isCreate_Custom = true;  
        this.project_report.student_project_register_id=row.student_project_register_id;
        this.project_report.student_project_report_id=row.student_project_report_id;
        this.project_report.report_week=row.report_week;
        this.project_report.report_url=row.report_url;
        this.project_report.project_type=this.selectedProject;
        this.updateForm = new FormGroup({
          'report_week': new FormControl({ value: this.project_report.report_week, disabled: true }, []), 
          'report_url': new FormControl(this.project_report.report_url, []),
        });
        this.updateFormOriginalData = this.updateForm.getRawValue();
        this.doneSetupForm = true;
        setTimeout(() => {
          this._changeDetectorRef.detectChanges();
          this.setAutoFocus();
          this.updateValidator();
        });
      }, 300);
    }
    //Chỉnh sửa báo cáo
    else{
      setTimeout(() => {
        this.project_report = new ProjectReport();
        this.isCreate_Custom = false;
        this.project_report.student_project_register_id=row.student_project_register_id;
        this.project_report.student_project_report_id=row.student_project_report_id;
        this.project_report.report_week=row.report_week;
        this.project_report.report_url=row.report_url;
        console.log(this.project_report);
        this.updateForm = new FormGroup({
          'report_week': new FormControl({ value: this.project_report.report_week, disabled: true }, []), 
          'report_url': new FormControl(this.project_report.report_url, []),
        });
        this.updateFormOriginalData = this.updateForm.getRawValue();
        this.doneSetupForm = true;
        setTimeout(() => {
          this._changeDetectorRef.detectChanges();
          this.setAutoFocus();
          this.updateValidator();
        });
      }, 300);
    }
  }

  public getArrayRequest() {
    let arrRequest = [];
    return arrRequest;
  }
}
