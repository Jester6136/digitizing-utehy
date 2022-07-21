import { Component, Injector, OnInit, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ENotificationType, Grid, SystemConstants, CustomizeFileUpload } from 'core';
import { Observable } from 'rxjs';
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/operator/takeUntil';
import { WebsiteItemTypeRef } from '../../../main/entities/website-item-type-ref';
import { Student } from '../entities/student';
declare var $: any;

@Component({
  selector: 'app-background',
  templateUrl: './background.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BackgroundComponent extends Grid implements OnInit {
  public student:Student;
  public isCreate = false;
  public display: any;
  public website_item_type_ref: WebsiteItemTypeRef;
  public provinces1 : any;
  public districs1: any;
  public wards1: any;
  public provinces2 : any;
  public districs2: any;
  public wards2: any;
  public test: any;
  public hasUploadPermission: any;
  public constructor(injector: Injector) {
    super(injector);
    this.LZCompress = true; // using LZString compress data
    this.loadBalancing = true;
    this.APIModuleName = 'STUDENT';
    this.getListByIdApiUrl = '/api/website-item-type-ref/get-list-by-id/';
    // this.searchApiUrl = '/api/website-item-type-ref/search';
    this.exportUrl = '/api/website-item-type-ref/export-to-excel';
    this.exportFilename = 'list_website_item_type_ref.xlsx';
    this.setNullIfEmpty = [];
    this.filterFields = ['item_type_rcd', 'item_type_name', 'item_type_size', 'sort_order', 'item_type_description'];
    this.dataKey = 'item_type_rcd';
    this.searchValue.page = this.page;
    this.searchValue.pageSize = this.pageSize;
    // this.searchFormGroup = new FormGroup({
    //   'item_type_rcd': new FormControl(''),
    //   'item_type_name': new FormControl(''),
    // });
    this.hasUpdatePermission = this._authenService.hasPermission(this.pageId, 'student-update');
    this.hasUploadPermission = this._authenService.hasPermission(this.pageId, 'student-upload');
    this.tableActions = [];
    // if (this.hasDeletePermission) {
    //   this._translateService.get('COMMON.delete').subscribe((message) => {
    //     this.tableActions.push({ label: message, icon: 'fa-close', command: () => { this.onRemove(this.selectedDataTableItems); } });
    //   });
    // }
    this.predicateAfterSearch = () => {
      this._changeDetectorRef.detectChanges();
    };
  }

  public loadDropdowns() {
    setTimeout(() => {
      this._apiService.post('/api/adapter/execute', { Method: { Method: 'GET' }, Url: '/api/student/get-provinces', Module: 'STUDENT'})
      .subscribe(res => {
        this.provinces1 = res.data;        
        this.provinces2 = res.data;        
        setTimeout(() => {
          this._changeDetectorRef.detectChanges();
        });
      }, (error) => { 
        this.submitting = false;
        console.log(error);
       });
      })    
  }

  public getStudent(){
    setTimeout(() => {
    this._apiService.post('/api/adapter/execute', { Method: { Method: 'GET' }, Url: '/api/student/get-by-id', Module: 'STUDENT'})
    .subscribe(res => {
      this.student = res.data;
      if(this.student.date_of_birth == null){
        this._functionConstants.ShowNotification(ENotificationType.ORANGE,"Bạn hãy cập nhật lại ngày sinh!!");
      }

      console.log(this.student);
      
      if(this.student.student_resident_district != ""){
        setTimeout(() => {
          this._apiService.post('/api/adapter/execute', { Method: { Method: 'GET' }, Url: '/api/student/get-wards-by-id/'+this.student.student_resident_district, Module: 'STUDENT'})
          .subscribe(res => {
            this.wards1 = res.data; 
            setTimeout(() => {
              this._changeDetectorRef.detectChanges();
            });
          }, (error) => { 
            this.submitting = false;
            console.log(error);
           });
          })
      }

      if(this.student.student_district_born != ""){
        setTimeout(() => {
          this._apiService.post('/api/adapter/execute', { Method: { Method: 'GET' }, Url: '/api/student/get-wards-by-id/'+this.student.student_district_born, Module: 'STUDENT'})
          .subscribe(res => {
            this.wards2 = res.data; 
            setTimeout(() => {
              this._changeDetectorRef.detectChanges();
            });
          }, (error) => { 
            this.submitting = false;
            console.log(error);
           });
          })
      }
      
      setTimeout(() => {
        this._changeDetectorRef.detectChanges();
      });
    }, (error) => { 
      this.submitting = false;
      console.log(error);
     });
    },500)
  }

  public ngOnInit() {
    this.student = new Student();
    this.website_item_type_ref = new WebsiteItemTypeRef();
    this.getStudent();
    this.loadDropdowns();
  }

  public chooseprovinces1($event){
    if($event == ''){
      this.districs1 = null;
    }
    else{
      setTimeout(() => {
        this._apiService.post('/api/adapter/execute', { Method: { Method: 'GET' }, Url: '/api/student/get-districts-by-id/'+$event, Module: 'STUDENT'})
        .subscribe(res => {
          this.districs1 = res.data;        
          setTimeout(() => {
            this._changeDetectorRef.detectChanges();
          });
        }, (error) => { 
          this.submitting = false;
          console.log(error);
         });
        })
    }
  }

  public choosedistrics1($event){
    if($event == ''){
      this.wards1 = null;
    }
    else{
      setTimeout(() => {
        this._apiService.post('/api/adapter/execute', { Method: { Method: 'GET' }, Url: '/api/student/get-wards-by-id/'+$event, Module: 'STUDENT'})
        .subscribe(res => {
          this.wards1 = res.data;
          setTimeout(() => {
            this._changeDetectorRef.detectChanges();
          });
        }, (error) => { 
          this.submitting = false;
          console.log(error);
         });
        })
    }
  }

  public chooseprovinces2($event){
    setTimeout(() => {
      this._apiService.post('/api/adapter/execute', { Method: { Method: 'GET' }, Url: '/api/student/get-districts-by-id/'+$event, Module: 'STUDENT'})
      .subscribe(res => {
        this.districs2 = res.data;        
        setTimeout(() => {
          this._changeDetectorRef.detectChanges();
        });
      }, (error) => { 
        this.submitting = false;
        console.log(error);
       });
      })
  }

  public choosedistrics2($event){
    setTimeout(() => {
      this._apiService.post('/api/adapter/execute', { Method: { Method: 'GET' }, Url: '/api/student/get-wards-by-id/'+$event, Module: 'STUDENT'})
      .subscribe(res => {
        this.wards2 = res.data; 
        setTimeout(() => {
          this._changeDetectorRef.detectChanges();
        });
      }, (error) => { 
        this.submitting = false;
        console.log(error);
       });
      })
      
  }

  showDialog() {
    this.display = true;
    this.doneSetupForm = true;
  }

  // public uploadExcel(event) {
  //   if (event.target.files && event.target.files.length > 0) {
  //     this.fileExcel = event.target.files[0];
  //     this.student.cv_path = this.fileExcel.name;
  //   }
  // }


  
  
  public uploadFile() {
     //Update student
     this._apiService.post('/api/adapter/execute', { Method: { Method: 'POST' }, Url: '/api/student/update', Module: 'STUDENT',
     Data: JSON.stringify(this.student) }).subscribe(res => {
      this._functionConstants.ShowNotification(ENotificationType.GREEN, res.messageCode);
      this._changeDetectorRef.detectChanges();
     }, (error) => { this.submitting = false; });
     //Update student



    // this.doneSetupForm = false;
    // if (this.fileExcel) {
    //   this._apiService.importFile(this.fileExcel, 'http://localhost:57065/api/student/upload').subscribe((res: any) => {
    //     if (res.body) {
    //       // this.search();
    //       this._functionConstants.ShowNotification(ENotificationType.GREEN, res.body.messageCode);
    //       this.display = false;
    //       this.doneSetupForm = true;
    //       // this.fileExcel = null;
    //       // this.fileNameExcel = null;

    //       this._changeDetectorRef.detectChanges();
    //     }
    //   });
    // } else {
    //   this.doneSetupForm = true;
    //   this._functionConstants.ShowNotification(ENotificationType.ORANGE, 'MESSAGE.choose_file');
    // }
  }

  convert_time(str) {
    if(typeof str === "string")
      return str;
    var date = new Date(str),
      mnth = ("0" + (date.getMonth() + 1)).slice(-2),
      day = ("0" + date.getDate()).slice(-2);
    return [day,mnth,date.getFullYear()].join("/");
  }

  public Update(){  
    console.log(this.student.date_of_birth);
    
    if(this.student.date_of_birth==null){
      this.student.date_of_birth =null;
    }
    else{
      this.student.date_of_birth = this.convert_time(this.student.date_of_birth);
    }
    
    this._apiService.post('/api/adapter/execute', { Method: { Method: 'POST' }, Url: '/api/student/update', Module: 'STUDENT',
     Data: JSON.stringify(this.student) }).subscribe(res => {
      this._functionConstants.ShowNotification(ENotificationType.GREEN, res.messageCode);
    }, (error) => { this.submitting = false; });
  }


  public updateValidator() {
    this.updateForm.valueChanges.subscribe(res => {
      this.enabledSubmitFlag = this.modified();
    });
    this.updateForm.get('item_type_name_l').valueChanges.subscribe((value: string) => {
      if (!value || value.trim() == '') {
        this.updateForm.get('item_type_name_e').setValidators([Validators.required, Validators.maxLength(100)]);
      } else {
        this.updateForm.get('item_type_name_e').setValidators([Validators.maxLength(100)]);
      }
      this.updateForm.get('item_type_name_e').updateValueAndValidity({ onlySelf: true, emitEvent: false });
    });
    this.updateForm.get('item_type_name_e').valueChanges.subscribe((value: string) => {
      if (!value || value.trim() == '') {
        this.updateForm.get('item_type_name_l').setValidators([Validators.required, Validators.maxLength(100)]);
      } else {
        this.updateForm.get('item_type_name_l').setValidators([Validators.maxLength(100)]);
      }
      this.updateForm.get('item_type_name_l').updateValueAndValidity({ onlySelf: true, emitEvent: false });
    });
  }

  public getArrayRequest() {
    let arrRequest = [];
    return arrRequest;
  }
}
