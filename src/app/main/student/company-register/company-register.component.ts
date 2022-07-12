import { Component, Injector, OnInit, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ENotificationType, Grid, SystemConstants, CustomizeFileUpload } from 'core';
import { Observable } from 'rxjs';
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/operator/takeUntil';
import { PreCompanyRecruitment } from '../entities/precompanyrecuitment';
import { CompanyRecruitment } from '../entities/companyrecuitment';
import { StudentJobCandidate } from '../entities/studentjobcandidate';
declare var $: any;

@Component({
  selector: 'app-company-register',
  templateUrl: './company-register.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CompanyRegisterComponent extends Grid implements OnInit {
  public state= false;
  public iCreate = false;
  public iUpdate = false;
  public tmpData :any;
  public inactive = false;
  public viewForm: FormGroup;
  public isCreate = false;
  public pre_company_recruitment: PreCompanyRecruitment;
  public company_recruitment: CompanyRecruitment;
  public student_job_candidate: StudentJobCandidate;
  public student_wish_values: any;
  public empty_guid ='00000000-0000-0000-0000-000000000000';
  public hasRegisterPermission = true;

  public doneSetupFormView :any;
  public showUpdateModalView :any;

  public constructor(injector: Injector) {
    super(injector);
    this.LZCompress = true; // using LZString compress data
    this.loadBalancing = true;
    this.APIModuleName = 'STUDENT';
    this.getListByIdApiUrl = '/api/website-item-type-ref/get-list-by-id/';
    this.searchApiUrl = '/api/company-recruitment/search';
    this.exportUrl = '/api/website-item-type-ref/export-to-excel';
    this.exportFilename = 'list_website_item_type_ref.xlsx';
    this.setNullIfEmpty = [];
    this.filterFields = [ 'company_rcd', 'recruitment_job', 'company_website_address','student_wish_rcd'];
    this.dataKey = 'recruitment_id';
    this.searchValue.page = this.page;
    this.searchValue.pageSize = this.pageSize;
    this.searchFormGroup = new FormGroup({
      'company_rcd': new FormControl(''),
      'recruitment_job': new FormControl(''),
    });
    this.hasViewPermission = this._authenService.hasPermission(this.pageId, 'student-recruitmentwishregister');
    this.hasCreatePermission = this._authenService.hasPermission(this.pageId, 'create-job-candidata');
    this.tableActions = [];
    if (this.hasDeletePermission) {
      this._translateService.get('COMMON.delete').subscribe((message) => {
        this.tableActions.push({ label: message, icon: 'fa-close', command: () => { this.onRemove(this.selectedDataTableItems); } });
      });
    }
    this.predicateAfterSearch = () => {
      this.hasRegisterPermission=true;
      setTimeout(() => {
        this._apiService.post('/api/adapter/execute', { Method: { Method: 'GET' },
         Url: '/api/job-candidate/check-able-to-register', Module: 'STUDENT'})
        .subscribe(res => {
          
          this.hasRegisterPermission=res.data.value;
          setTimeout(() => {
            this._changeDetectorRef.detectChanges();
          });
        }, (error) => { 
          this.submitting = false;
          console.log(error);
         });
        })
        
      setTimeout(()=> {
        this._changeDetectorRef.detectChanges();
      },300)

    };
  }

  public loadDropdowns() {
    Observable.combineLatest(
      this._apiService.post('/api/adapter/execute', { Method: { Method: 'GET' }, Url: '/api/company-recruitment/get-dropdown/', Module: 'STUDENT' }),
    ).takeUntil(this.unsubscribe).subscribe(res => {
      this.student_wish_values = null;
      setTimeout(() => {
        this.student_wish_values = this.student_wish_values || res[0].data;
        this.search();
      });
    });
  }

  public changeState(row){
    this.state = true;
    if(row.student_wish_rcd == null){
      this.iCreate = true;
    }
    else if(row.student_wish_rcd ==""){
      this.iCreate = true;
    }
    else{
      this.iCreate = false;
    }
  }

  public ngOnInit() {
    this.pre_company_recruitment =new PreCompanyRecruitment();
    this.company_recruitment=new CompanyRecruitment();
    this.loadDropdowns();
  }

  public register(row){
    this._translateService.get('MESSAGE.confirm_delete').subscribe(() => {
      this._confirmationService.confirm({
        message: "Bạn có chắc chắn đăng kí thực tập doanh nghiệp này?",
        accept: () => {

          this.student_job_candidate = new StudentJobCandidate();
          this.student_job_candidate.recruitment_id=row.recruitment_id;
          this.student_job_candidate.candidate_id=row.candidate_id;
          this.student_job_candidate.course_year=row.course_year;
      
          setTimeout(() => {
            this._apiService.post('/api/adapter/execute', { Method: { Method: 'POST' },
             Url: '/api/job-candidate/create', Module: 'STUDENT',
              Data: JSON.stringify(this.student_job_candidate)  })
            .subscribe(res => {
              row.candidate_id = res.data.candidate_id;
              row.available_to_register = false;
              this.hasRegisterPermission = false;
              this._changeDetectorRef.detectChanges();
              this._functionConstants.ShowNotification(ENotificationType.GREEN, res.messageCode);
              setTimeout(() => {
                this._changeDetectorRef.detectChanges();
              });
            }, (error) => { 
              this.submitting = false;
              console.log(error);
             });
            })

        }
      });
    });    
  }

  public cancelregister(row){
    this._translateService.get('MESSAGE.confirm_delete').subscribe((message) => {
      this._confirmationService.confirm({
        message: "Bạn có chắc chắn hủy thực tập doanh nghiệp này?",
        accept: () => {
          this.student_job_candidate = new StudentJobCandidate();
          this.student_job_candidate.recruitment_id=row.recruitment_id;
          this.student_job_candidate.candidate_id=row.candidate_id;
          
          this._apiService.post('/api/adapter/execute', { Method: { Method: 'POST' }, Url: '/api/job-candidate/delete', Module: 'STUDENT', 
          Data: JSON.stringify(this.student_job_candidate) }).subscribe(res => {
            row.available_to_register = true;
            row.candidate_id = this.empty_guid;
            this.hasRegisterPermission = true;
            this._functionConstants.ShowNotification(ENotificationType.GREEN, res.messageCode);
            setTimeout(() => {
              this._changeDetectorRef.detectChanges();
            });
          }, (error) => { 
            this.submitting = false;
           });
        }
      });
    });
  }

  public chooseStudentWish(event,row){
    // this.student_job_candidate = new StudentJobCandidate();
    // this.student_job_candidate.recruitment_id=row.recruitment_id;
    // this.student_job_candidate.candidate_id=row.candidate_id;
    // this.student_job_candidate.course_year=row.course_year;
    // var empty_guid ='00000000-0000-0000-0000-000000000000'
    // var tmp_row = this.copyProperty(row);
    // if(this.state && event!=''){
    //   //Create
    //   if (this.iCreate){        
    //     this.student_job_candidate.student_wish_rcd=event;
    //     this.student_job_candidate.candidate_id = empty_guid;
    //     this._apiService.post('/api/adapter/execute', { Method: { Method: 'POST' }, Url: '/api/job-candidate/create', Module: 'STUDENT', 
    //     Data: JSON.stringify(this.student_job_candidate) }).subscribe(res => {
    //       this.student_job_candidate.student_wish_rcd = event
    //       row.candidate_id = res.data.candidate_id
    //       this._functionConstants.ShowNotification(ENotificationType.GREEN, res.messageCode);
    //     }, (error) => { 
    //       row.student_wish_rcd = null;
    //       setTimeout(() => {
    //         this._changeDetectorRef.detectChanges();
    //       });
    //       this.submitting = false;
    //      });
    //   }
    //   //Update
    //   else{
    //     this.student_job_candidate.student_wish_rcd=event;
    //     this._apiService.post('/api/adapter/execute', { Method: { Method: 'POST' }, Url: '/api/job-candidate/update', Module: 'STUDENT', 
    //     Data: JSON.stringify(this.student_job_candidate) }).subscribe(res => {
    //       this.student_job_candidate.student_wish_rcd = event
    //       row.candidate_id = res.data.candidate_id
    //       this._functionConstants.ShowNotification(ENotificationType.GREEN, res.messageCode);
    //     }, (error) => { 
    //       this._functionConstants.ShowNotification(ENotificationType.ORANGE,"Hãy load lại trang");
    //       this.submitting = false;
    //      });
    //   }
    // }
    
    // if(event == ''){
    //   //delete 2 
    //     this._apiService.post('/api/adapter/execute', { Method: { Method: 'POST' }, Url: '/api/job-candidate/delete', Module: 'STUDENT', 
    //     Data: JSON.stringify(this.student_job_candidate) }).subscribe(res => {
    //       this.student_job_candidate.student_wish_rcd = event
    //       row= tmp_row;
    //       row.candidate_id = null;
    //       this._functionConstants.ShowNotification(ENotificationType.GREEN, res.messageCode);
    //     }, (error) => { 
    //       this._functionConstants.ShowNotification(ENotificationType.ORANGE,"Hãy load lại trang");
    //       this.submitting = false;
    //      });

    // }
     
      
  }

  

  public closeViewForm(event){
    $(event.target).closest('.modal').modal('hide');
  }

  // public openCreateModal(row: any = null) {
  //   this.doneSetupForm = false;
  //   this.showUpdateModal = true;
  //   setTimeout(() => {
  //     $('#updateStudentJobCandidate').appendTo('body').modal('toggle');
  //   });
  //   setTimeout(() => {
  //     this.student_job_candidate = new StudentJobCandidate();
  //     this.student_job_candidate.student_rcd = '11219686';
  //     this.student_job_candidate.recruitment_id = row.recruitment_id;
  //     this.student_job_candidate.status_rcd = '1';
  //     this.student_job_candidate.course_year = row.course_year;
  //     this.student_job_candidate.company_rcd = row.company_rcd;
      
  //     this.isCreate = true;
  //     this.updateForm = new FormGroup({
  //       'company_rcd': new FormControl({ value: this.student_job_candidate.company_rcd, disabled: true }, []),
  //       'student_wish_rcd': new FormControl('', [Validators.required]),
  //       'cv_path': new FormControl('', [Validators.required]),
  //       'course_year': new FormControl({ value: this.student_job_candidate.company_rcd, disabled: true }, []),
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
  convertDate(date) {
    let result;
    if (date)
      date = new Date(date);
      var month = String((date.getMonth() + 1));
      if(month.length == 1) month = '0'+month;
      var day = String(date.getDate());
      if(day.length == 1) day = '0'+day;
      result = day + '/' + month + '/' +date.getFullYear()+ ' ' + date.getHours() + 'h';
    return result;
  }

  auto_grow(element) {
    element.style.height = "";
    element.style.height = (element.scrollHeight)+3+"px";
  }
  
  public ViewModal(row){
    this.doneSetupFormView = false;
    this.showUpdateModalView = true;
    setTimeout(() => {
      $('#viewCompanyRecruiment').appendTo('body').modal('toggle');
    });
    setTimeout(() => {
      let arrRequest = this.getArrayRequest();
      arrRequest.push(this._apiService.post('/api/adapter/execute', { Method: { Method: 'GET' }, Url: '/api/company-recruitment/get-by-id?id=' + row.recruitment_id, Module: 'STUDENT' }));
      Observable.combineLatest(arrRequest).subscribe((res: any) => {
        this.company_recruitment = res[0].data;
        this.company_recruitment.recruitment_expiry_date = this.convertDate(this.company_recruitment.recruitment_expiry_date);
        this.viewForm = new FormGroup({
          'company_rcd': new FormControl({ value: this.company_recruitment.company_rcd, disabled: true }, []),
          'recruitment_title': new FormControl({ value: this.company_recruitment.recruitment_title, disabled: true }, []),
          'recruitment_job': new FormControl({ value: this.company_recruitment.recruitment_job, disabled: true }, []),
          'recruitment_quantity': new FormControl({ value: this.company_recruitment.recruitment_quantity, disabled: true }, []),
          'recruitment_description': new FormControl({ value: this.company_recruitment.recruitment_description,disabled:true}, []),
          'recruitment_skill_requirement': new FormControl({ value: this.company_recruitment.recruitment_skill_requirement, disabled: true }, []),
          'recruitment_job_requirement': new FormControl({ value: this.company_recruitment.recruitment_job_requirement, disabled: true }, []),
          'recruitment_cv_requirement': new FormControl({ value: this.company_recruitment.recruitment_cv_requirement, disabled: true }, []),
          'recruitment_benefit': new FormControl({ value: this.company_recruitment.recruitment_benefit, disabled: true }, []),
          'recruitment_expiry_date': new FormControl({ value: this.company_recruitment.recruitment_expiry_date, disabled: true }, []),
          'recruitment_contact': new FormControl({ value: this.company_recruitment.recruitment_contact, disabled: true }, []),
          'course_year': new FormControl({ value: this.company_recruitment.course_year, disabled: true }, []),
        
        });
        this.doneSetupFormView = true;
        setTimeout(() => {
          this._changeDetectorRef.detectChanges();
          this.setAutoFocus();
        });
      });
    }, 300);
  }


  public updateValidator() {
    this.updateForm.valueChanges.subscribe(res => {
      this.enabledSubmitFlag = this.modified();
    });
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
      if (this.isCreate) {
        
        this._apiService.post('/api/adapter/execute', { Method: { Method: 'POST' }, Url: '/api/job-candidate/create', Module: 'STUDENT', Data: JSON.stringify(this.student_job_candidate) }).subscribe(res => {
          let item = this.copyProperty(res.data);
          let idx;
          if (this._storageService.getItem(SystemConstants.get('PREFIX_DATA_LANGUAGE')) == 'en') {
            item.item_type_name = item.item_type_name_e;
            item.item_type_description = item.item_type_description_e;
          } else {
            item.item_type_name = item.item_type_name_l;
            item.item_type_description = item.item_type_description_l;
          }
          if (this.data.length >= this.pageSize) {
            this.data.splice(this.data.length - 1, 1);
          }
          this.data.unshift(item);
          this.data = this.data.slice();
          this.totalRecords += 1;
          this.pre_company_recruitment =new PreCompanyRecruitment();
          this.company_recruitment=new CompanyRecruitment();
          this.resetUpdateForm();
          this._functionConstants.ShowNotification(ENotificationType.GREEN, res.messageCode);
          this.submitting = false;
        }, (error) => { this.submitting = false; });
      } else {
        this._apiService.post('/api/adapter/execute', { Method: { Method: 'POST' }, Url: '/api/job-candidate/update', Module: 'STUDENT', Data: JSON.stringify(this.student_job_candidate) }).subscribe(res => {
          let index = this.data.findIndex(ds => ds[this.dataKey] == this.student_job_candidate[this.dataKey]);
          let item = this.copyProperty(res.data);
          let idx;
          if (this._storageService.getItem(SystemConstants.get('PREFIX_DATA_LANGUAGE')) == 'en') {
            item.item_type_name = item.item_type_name_e;
            item.item_type_description = item.item_type_description_e;
          } else {
            item.item_type_name = item.item_type_name_l;
            item.item_type_description = item.item_type_description_l;
          }
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

  // public openUpdateModal(row) {
  //   this.doneSetupForm = false;
  //   this.showUpdateModal = true;
  //   setTimeout(() => {
  //     $('#updateWebsiteItemTypeRefModal').appendTo('body').modal('toggle');
  //   });
  //   setTimeout(() => {
  //     let arrRequest = this.getArrayRequest();
  //     arrRequest.push(this._apiService.post('/api/adapter/execute', { Method: { Method: 'GET' }, Url: '/api/website-item-type-ref/get-by-id/' + row.item_type_rcd, Module: 'CMS' }));
  //     Observable.combineLatest(arrRequest).subscribe((res: any) => {
  //       this.isCreate = false;
  //       this.website_item_type_ref = res[0].data;
  //       this.updateForm = new FormGroup({
  //         'item_type_rcd': new FormControl({ value: this.website_item_type_ref.item_type_rcd, disabled: true }, [Validators.required, Validators.maxLength(50)]),
  //         'item_type_icon': new FormControl(this.website_item_type_ref.item_type_icon, [Validators.maxLength(100)]),
  //         'item_type_name_l': new FormControl(this.website_item_type_ref.item_type_name_l, [Validators.required, Validators.maxLength(100)]),
  //         'item_type_name_e': new FormControl(this.website_item_type_ref.item_type_name_e, [Validators.required, Validators.maxLength(100)]),
  //         'item_type_size': new FormControl(this.website_item_type_ref.item_type_size, [Validators.pattern(/^-?(0|[1-9]\d*)?$/)]),
  //         'sort_order': new FormControl(this.website_item_type_ref.sort_order, [Validators.pattern(/^-?(0|[1-9]\d*)?$/)]),
  //         'item_type_description_l': new FormControl(this.website_item_type_ref.item_type_description_l, [Validators.maxLength(1000)]),
  //         'item_type_description_e': new FormControl(this.website_item_type_ref.item_type_description_e, [Validators.maxLength(1000)]),
  //       });
  //       this.updateFormOriginalData = this.updateForm.getRawValue();
  //       this.doneSetupForm = true;
  //       setTimeout(() => {
    //         this._changeDetectorRef.detectChanges();
    //         this.setAutoFocus();
    //         this.updateValidator();
    //       });
    //     });
    //   }, 300);
    // }
    
    
  public getArrayRequest() {
    let arrRequest = [];
    return arrRequest;
  }
}
