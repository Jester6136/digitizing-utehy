import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GrantPermissionComponent } from './grant-permission.component';

describe('GrantPermissionComponent', () => {
  let component: GrantPermissionComponent;
  let fixture: ComponentFixture<GrantPermissionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GrantPermissionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GrantPermissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
});
