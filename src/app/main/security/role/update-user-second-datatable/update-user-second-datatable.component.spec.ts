import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateUserSecondDatatableComponent } from './update-user-second-datatable.component';

describe('UpdateUserSecondDatatableComponent', () => {
  let component: UpdateUserSecondDatatableComponent;
  let fixture: ComponentFixture<UpdateUserSecondDatatableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UpdateUserSecondDatatableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateUserSecondDatatableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
});
