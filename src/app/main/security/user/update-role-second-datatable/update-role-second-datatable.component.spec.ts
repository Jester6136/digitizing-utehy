import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateRoleSecondDatatableComponent } from './update-role-second-datatable.component';

describe('UpdateRoleSecondDatatableComponent', () => {
  let component: UpdateRoleSecondDatatableComponent;
  let fixture: ComponentFixture<UpdateRoleSecondDatatableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UpdateRoleSecondDatatableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateRoleSecondDatatableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
});
