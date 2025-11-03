import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopUpIniciarProcessoComponent } from './pop-up-iniciar-processo.component';

describe('PopUpIniciarProcessoComponent', () => {
  let component: PopUpIniciarProcessoComponent;
  let fixture: ComponentFixture<PopUpIniciarProcessoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopUpIniciarProcessoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopUpIniciarProcessoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
