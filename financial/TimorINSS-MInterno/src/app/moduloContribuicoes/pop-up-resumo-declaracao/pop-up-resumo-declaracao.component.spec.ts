import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopUpResumoDeclaracaoComponent } from './pop-up-resumo-declaracao.component';

describe('PopUpResumoDeclaracaoComponent', () => {
  let component: PopUpResumoDeclaracaoComponent;
  let fixture: ComponentFixture<PopUpResumoDeclaracaoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopUpResumoDeclaracaoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopUpResumoDeclaracaoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
