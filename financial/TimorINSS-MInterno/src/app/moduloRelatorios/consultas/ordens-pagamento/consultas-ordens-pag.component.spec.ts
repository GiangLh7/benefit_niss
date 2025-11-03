import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultasOrdensPagamentoComponent } from './consultas-ordens-pag.component';

describe('ConsultasOrdensPagamentoComponent', () => {
  let component: ConsultasOrdensPagamentoComponent;
  let fixture: ComponentFixture<ConsultasOrdensPagamentoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConsultasOrdensPagamentoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsultasOrdensPagamentoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
