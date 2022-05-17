import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ChooseFacilityComponent } from './choose-facility.component';
describe('ChooseFacilityComponent', () => {
  let component: ChooseFacilityComponent;
  let fixture: ComponentFixture<ChooseFacilityComponent>;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChooseFacilityComponent ]
    })
    .compileComponents();
  }));
  beforeEach(() => {
    fixture = TestBed.createComponent(ChooseFacilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
});
