import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopUpMovimentosDespesaReceitaUpsertComponent } from './logic';

describe('PopUpMovimentosDespesaReceitaUpsertComponent', () => {
  let component: PopUpMovimentosDespesaReceitaUpsertComponent;
  let fixture: ComponentFixture<PopUpMovimentosDespesaReceitaUpsertComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopUpMovimentosDespesaReceitaUpsertComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopUpMovimentosDespesaReceitaUpsertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
