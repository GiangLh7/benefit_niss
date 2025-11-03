import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopUpAdicionarEditarContatoComponent } from './pop-up-adicionar-editar-contato.component';

describe('PopUpAdicionarEditarContatoComponent', () => {
  let component: PopUpAdicionarEditarContatoComponent;
  let fixture: ComponentFixture<PopUpAdicionarEditarContatoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopUpAdicionarEditarContatoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopUpAdicionarEditarContatoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
