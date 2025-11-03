import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopUpHandleInvoiceComponent } from './pop-up-handle-invoice.component';

describe('PopUpHandleInvoiceComponent', () => {
  let component: PopUpHandleInvoiceComponent;
  let fixture: ComponentFixture<PopUpHandleInvoiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopUpHandleInvoiceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopUpHandleInvoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
