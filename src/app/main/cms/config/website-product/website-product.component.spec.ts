import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WebsiteProductComponent } from './website-product.component';

describe('WebsiteProductComponent', () => {
  let component: WebsiteProductComponent;
  let fixture: ComponentFixture<WebsiteProductComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WebsiteProductComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WebsiteProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
