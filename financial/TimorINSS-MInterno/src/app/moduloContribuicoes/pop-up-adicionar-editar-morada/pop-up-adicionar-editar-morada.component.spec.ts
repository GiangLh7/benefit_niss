import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopUpAdicionarEditarMoradaComponent } from './pop-up-adicionar-editar-morada.component';

describe('PopUpAdicionarEditarMoradaComponent', () => {
  let component: PopUpAdicionarEditarMoradaComponent;
  let fixture: ComponentFixture<PopUpAdicionarEditarMoradaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopUpAdicionarEditarMoradaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopUpAdicionarEditarMoradaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
