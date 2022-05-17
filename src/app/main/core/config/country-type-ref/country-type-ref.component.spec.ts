import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CountryTypeRefComponent } from './country-type-ref.component';

describe('CountryTypeRefComponent', () => {
  let component: CountryTypeRefComponent;
  let fixture: ComponentFixture<CountryTypeRefComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CountryTypeRefComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CountryTypeRefComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
