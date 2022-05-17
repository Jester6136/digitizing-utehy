import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProvincesRefComponent } from './provinces-ref.component';

describe('ProvincesRefComponent', () => {
  let component: ProvincesRefComponent;
  let fixture: ComponentFixture<ProvincesRefComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProvincesRefComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProvincesRefComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
