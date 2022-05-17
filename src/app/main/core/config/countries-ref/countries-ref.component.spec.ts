import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CountriesRefComponent } from './countries-ref.component';

describe('CountriesRefComponent', () => {
  let component: CountriesRefComponent;
  let fixture: ComponentFixture<CountriesRefComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CountriesRefComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CountriesRefComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
