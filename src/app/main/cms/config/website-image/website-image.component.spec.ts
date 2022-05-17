import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WebsiteImageComponent } from './website-image.component';

describe('WebsiteImageComponent', () => {
  let component: WebsiteImageComponent;
  let fixture: ComponentFixture<WebsiteImageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WebsiteImageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WebsiteImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
