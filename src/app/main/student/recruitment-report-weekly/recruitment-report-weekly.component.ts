import { Component, Injector, OnInit, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ENotificationType, Grid, SystemConstants, CustomizeFileUpload } from 'core';
import { Observable } from 'rxjs';
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/operator/takeUntil';
import { WebsiteItemTypeRef } from '../../../main/entities/website-item-type-ref';
import { StudentRecruitmentReport} from '../entities/studentrecruitmentreport';
import { InternshipProcessEvaluate } from '../entities/internshipprocessevaluate';
import { StudentJobCandidate } from '../entities/studentjobcandidate';
declare var $: any;

@Component({
  selector: 'app-recruitment-report-weekly',
  templateUrl: './recruitment-report-weekly.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecruitmentReportWeeklyComponent extends Grid implements OnInit {
  public dataKey1: any;
  public dataKey2: any;
  public isCreate_Custom = false;
  public Uploadable = true;
  public isRemove = true;
  public result_report_weekly = "Chưa có";
  public selectedWeekSearch = "1";
  public weeks : any;
  public isCreate = false;
  public file_report ="";
  public fileExcel : any;
  public display: any;
  public website_item_type_ref: WebsiteItemTypeRef;
  public student_recruitment_report: StudentRecruitmentReport;
  public internship_process_evaluate: InternshipProcessEvaluate;
  public student_job_candidate: StudentJobCandidate;
  public constructor(injector: Injector) {
    super(injector);
    this.LZCompress = true; // using LZString compress data
    this.loadBalancing = true;
    this.APIModuleName = 'STUDENT';
    this.getListByIdApiUrl = '/api/website-item-type-ref/get-list-by-id/';
    this.searchApiUrl = '/api/student-recruitment-report-weekly/search';
    this.exportUrl = '/api/website-item-type-ref/export-to-excel';
    this.exportFilename = 'list_website_item_type_ref.xlsx';
    this.setNullIfEmpty = [];
    this.filterFields = ['item_type_rcd', 'item_type_name', 'item_type_size', 'sort_order', 'item_type_description'];
    //this.dataKey = 'item_type_rcd';
    this.dataKey = 'report_day';
    this.searchValue.page = this.page;
    this.searchValue.pageSize = this.pageSize;
    this.searchFormGroup = new FormGroup({
      'report_week': new FormControl(''),
    });
    this.hasViewPermission = this._authenService.hasPermission(this.pageId, 'view_website_item_type_ref');
    this.hasCreatePermission = this._authenService.hasPermission(this.pageId, 'create_website_item_type_ref');
    this.hasUpdatePermission = this._authenService.hasPermission(this.pageId, 'update-student-recruitment-weekly');
    this.hasDeletePermission = this._authenService.hasPermission(this.pageId, 'delete_website_item_type_ref');
    this.tableActions = [];
    if (this.hasDeletePermission) {
      this._translateService.get('COMMON.delete').subscribe((message) => {
        this.tableActions.push({ label: message, icon: 'fa-close', command: () => { this.onRemove(this.selectedDataTableItems); } });
      });
    }
    this.predicateAfterSearch = () => {
      //Lấy nhận xét tuần của doanh nghiệp
      setTimeout(()=>{
        this._apiService.post('/api/adapter/execute', { Method: { Method: 'GET' },
         Url: '/api/student-recruitment-report-weekly/get-internship-process-evaluate-by-id?report_week='+this.selectedWeekSearch,
          Module: 'STUDENT'})
        .subscribe(res => {
            this.internship_process_evaluate = res.data;
            if( this.internship_process_evaluate == null){
              this.internship_process_evaluate=new InternshipProcessEvaluate();
              this.internship_process_evaluate.process_comment="";
            }
          setTimeout(()=> {
            this._changeDetectorRef.detectChanges();
          })
        }, (error) => { 
          this._functionConstants.ShowNotification(ENotificationType.RED, error.messageCode);
         });
      })


      setTimeout(()=> {
        this._changeDetectorRef.detectChanges();
      })
    };

    this.predicateBeforeSearch = () => {
      this.searchFormGroup.get('report_week').setValue(this.selectedWeekSearch);
    }
  }

  public loadDropdowns() {
    Observable.combineLatest(
      this._apiService.post('/api/adapter/execute', { Method: { Method: 'GET' }, Url: '/api/student-recruitment-report-weekly/get-dropdown/', Module: 'STUDENT' }),
    ).takeUntil(this.unsubscribe).subscribe(res => {
      setTimeout(() => {
        this.weeks = res[0].data;
        this.search();  
      });
      
    });
  }

  
  public ngOnInit() {
    this.website_item_type_ref = new WebsiteItemTypeRef();
    this.student_recruitment_report = new  StudentRecruitmentReport();
    this.internship_process_evaluate = new InternshipProcessEvaluate();
    this.student_job_candidate = new StudentJobCandidate();
    this.loadDropdowns();
    this.getRecruitmentReport();    
  }

  public getRecruitmentReport(){
    setTimeout(() => {
    this._apiService.post('/api/adapter/execute', { Method: { Method: 'GET' }, Url: '/api/job-candidate/get-by-id', Module: 'STUDENT'})
    .subscribe(res => {
      this.student_job_candidate = res.data;
      if(this.student_job_candidate == null){
          
      }
      else{
        if(this.student_job_candidate.report_src == null){
          this.student_job_candidate.report_src="";
        }
      }
      console.log(this.student_job_candidate);
      setTimeout(()=> {
        this._changeDetectorRef.detectChanges();
      })
    }, (error) => { 
      this._functionConstants.ShowNotification(ENotificationType.RED, error.messageCode);
     });
    })
  }

  showDialog() {
     this.display = true;
     this.doneSetupForm = true;
     console.log(this.student_job_candidate);
     
  }

  public uploadExcel(event) {
    if (event.target.files && event.target.files.length > 0) {
      this.fileExcel = event.target.files[0];
      this.student_job_candidate.report_src = this.fileExcel.name;
    }
  }

  public uploadFile() {
    this.doneSetupForm = false;
    if (this.fileExcel) {
      this._apiService.importFile(this.fileExcel, 'http://localhost:57065/api/student-recruitment-report-weekly/upload').subscribe((res: any) => {
        if (res.body) {
          // this.search();
          this._functionConstants.ShowNotification(ENotificationType.GREEN, res.body.messageCode);
          this.display = false;
          this.doneSetupForm = true;
          // this.fileExcel = null;
          // this.fileNameExcel = null;

           //Update student
           this._apiService.post('/api/adapter/execute', { Method: { Method: 'POST' }, Url: '/api/job-candidate/update-report-src', Module: 'STUDENT',
           Data: JSON.stringify(this.student_job_candidate) }).subscribe(res => {
            this._functionConstants.ShowNotification(ENotificationType.GREEN, res.messageCode);
           }, (error) => { this.submitting = false; });
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
        this._apiService.post('/api/adapter/execute', { Method: { Method: 'POST' }, Url: '/api/student-recruitment-report-weekly/create', Module: 'STUDENT',
         Data: JSON.stringify(this.student_recruitment_report) }).subscribe(res => {
          let index = this.data.findIndex(ds => ds[this.dataKey] == this.student_recruitment_report[this.dataKey]);
          let item = this.copyProperty(res.data);
          let idx;

          this.data[index] = item;
          this.data = this.data.slice();
          this.closeUpdateForm(null);
          this._functionConstants.ShowNotification(ENotificationType.GREEN, res.messageCode);
          this.submitting = false;
        }, (error) => { this.submitting = false; });
      } else {
        this._apiService.post('/api/adapter/execute', { Method: { Method: 'POST' }, Url: '/api/student-recruitment-report-weekly/update', Module: 'STUDENT',
         Data: JSON.stringify(this.student_recruitment_report) }).subscribe(res => {
          let index = this.data.findIndex(ds => ds[this.dataKey] == this.student_recruitment_report[this.dataKey]);
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
    console.log(row);
    
    this.doneSetupForm = false;
    this.showUpdateModal = true;
    setTimeout(() => {
      $('#updateStudentRecruitmentReportWeeklyModal').appendTo('body').modal('toggle');
    });
    if(row.candidate_id=="00000000-0000-0000-0000-000000000000"){
      setTimeout(() => {
        this.student_recruitment_report = new StudentRecruitmentReport();
        this.student_recruitment_report= this.copyProperty(row);
        this.student_recruitment_report.report_week = Number(this.selectedWeekSearch);
        this.student_recruitment_report.report_day = Number(row.report_day);
        if(this.student_recruitment_report.job_assignment ==null){
          this.student_recruitment_report.job_assignment = "";
        }
        if(this.student_recruitment_report.result_in_day == null){
          this.student_recruitment_report.result_in_day = "";
        }
        if(this.student_recruitment_report.description == null){
          this.student_recruitment_report.description = "";
        }
        this.isCreate_Custom = true;
        console.log(this.student_recruitment_report);
        
        this.updateForm = new FormGroup({
          'report_week': new FormControl({ value: this.student_recruitment_report.report_week, disabled: true }, []),
          'report_day': new FormControl({ value:this.student_recruitment_report.report_day,disabled: true}, []),
          'job_assignment': new FormControl(this.student_recruitment_report.job_assignment, []),
          'result_in_day': new FormControl(this.student_recruitment_report.result_in_day, []),
          'description': new FormControl(this.student_recruitment_report.description, []),
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
        setTimeout(() => {
          this.student_recruitment_report= this.copyProperty(row);
          this.student_recruitment_report.report_week = Number(this.selectedWeekSearch);
          this.isCreate_Custom = false;
          
          this.updateForm = new FormGroup({
            'report_week': new FormControl({ value: this.student_recruitment_report.report_week, disabled: true }, []),
            'report_day': new FormControl({ value:this.student_recruitment_report.report_day,disabled: true}, []),
            'job_assignment': new FormControl(this.student_recruitment_report.job_assignment, []),
            'result_in_day': new FormControl(this.student_recruitment_report.result_in_day, []),
            'description': new FormControl(this.student_recruitment_report.description, []),
          });
  
          this.updateFormOriginalData = this.updateForm.getRawValue();
          this.doneSetupForm = true;
          setTimeout(() => {
            this._changeDetectorRef.detectChanges();
            this.setAutoFocus();
            this.updateValidator();
          });
        }, 300);
      })
    }
  }

  public getArrayRequest() {
    let arrRequest = [];
    return arrRequest;
  }
}
