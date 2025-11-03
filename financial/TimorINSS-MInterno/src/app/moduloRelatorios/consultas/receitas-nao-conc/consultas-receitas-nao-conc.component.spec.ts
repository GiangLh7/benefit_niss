import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultasReceitasNaoConciliadasComponent } from './consultas-receitas-nao-conc.component';

describe('ConsultasReceitasNaoConciliadasComponent', () => {
  let component: ConsultasReceitasNaoConciliadasComponent;
  let fixture: ComponentFixture<ConsultasReceitasNaoConciliadasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConsultasReceitasNaoConciliadasComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsultasReceitasNaoConciliadasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
