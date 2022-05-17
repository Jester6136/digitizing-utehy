import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateUserFirstDatatableComponent } from './update-user-first-datatable.component';

describe('UpdateUserFirstDatatableComponent', () => {
  let component: UpdateUserFirstDatatableComponent;
  let fixture: ComponentFixture<UpdateUserFirstDatatableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UpdateUserFirstDatatableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateUserFirstDatatableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
});
