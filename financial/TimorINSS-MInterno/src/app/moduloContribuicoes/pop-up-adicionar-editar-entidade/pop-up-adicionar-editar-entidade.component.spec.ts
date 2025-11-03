import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopUpAdicionarEditarEntidadeComponent } from './pop-up-adicionar-editar-entidade.component';

describe('PopUpAdicionarEditarEntidadeComponent', () => {
  let component: PopUpAdicionarEditarEntidadeComponent;
  let fixture: ComponentFixture<PopUpAdicionarEditarEntidadeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopUpAdicionarEditarEntidadeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopUpAdicionarEditarEntidadeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
