import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopUpEditarComponenteOrcamentoValorComponent } from './pop-up-editar-componente-orcamento-valor.component';

describe('PopUpEditarComponenteOrcamentoValorComponent', () => {
  let component: PopUpEditarComponenteOrcamentoValorComponent;
  let fixture: ComponentFixture<PopUpEditarComponenteOrcamentoValorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopUpEditarComponenteOrcamentoValorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopUpEditarComponenteOrcamentoValorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
