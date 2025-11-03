import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopUpExecutarPagamentosComponent } from './pop-up-executar-pagamentos.component';

describe('PopUpExecutarPagamentosComponent', () => {
  let component: PopUpExecutarPagamentosComponent;
  let fixture: ComponentFixture<PopUpExecutarPagamentosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopUpExecutarPagamentosComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopUpExecutarPagamentosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
