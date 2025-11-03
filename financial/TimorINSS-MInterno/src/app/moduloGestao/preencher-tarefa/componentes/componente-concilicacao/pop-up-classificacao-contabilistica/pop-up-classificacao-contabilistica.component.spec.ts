import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopUpClassificacaoContabilisticaComponent } from './pop-up-classificacao-contabilistica.component';

describe('PopUpClassificacaoContabilisticaComponent', () => {
  let component: PopUpClassificacaoContabilisticaComponent;
  let fixture: ComponentFixture<PopUpClassificacaoContabilisticaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopUpClassificacaoContabilisticaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopUpClassificacaoContabilisticaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
