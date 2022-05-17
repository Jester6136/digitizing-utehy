import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WebsitePartnerComponent } from './website-partner.component';

describe('WebsitePartnerComponent', () => {
  let component: WebsitePartnerComponent;
  let fixture: ComponentFixture<WebsitePartnerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WebsitePartnerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WebsitePartnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
