import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopUpSelecionarValoresParaRegistoComponent } from './pop-up-selecionar_valores.component';

describe('PopUpSelecionarValoresParaRegistoComponent', () => {
  let component: PopUpSelecionarValoresParaRegistoComponent;
  let fixture: ComponentFixture<PopUpSelecionarValoresParaRegistoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopUpSelecionarValoresParaRegistoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopUpSelecionarValoresParaRegistoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
