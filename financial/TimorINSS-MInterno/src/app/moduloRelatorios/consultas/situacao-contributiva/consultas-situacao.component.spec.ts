import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultasSituacoesContributivasComponent } from './consultas-situacao.component';

describe('ConsultasSituacoesContributivasComponent', () => {
  let component: ConsultasSituacoesContributivasComponent;
  let fixture: ComponentFixture<ConsultasSituacoesContributivasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConsultasSituacoesContributivasComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsultasSituacoesContributivasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
