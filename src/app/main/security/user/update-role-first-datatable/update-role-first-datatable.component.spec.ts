import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateRoleFirstDatatableComponent } from './update-role-first-datatable.component';

describe('UpdateRoleFirstDatatableComponent', () => {
  let component: UpdateRoleFirstDatatableComponent;
  let fixture: ComponentFixture<UpdateRoleFirstDatatableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UpdateRoleFirstDatatableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateRoleFirstDatatableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
});
