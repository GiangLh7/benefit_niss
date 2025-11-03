import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopUpListarPagamentosExecutadosComponent } from './pop-up-listar-pagamentos-executados.component';

describe('PopUpListarPagamentosExecutadosComponent', () => {
  let component: PopUpListarPagamentosExecutadosComponent;
  let fixture: ComponentFixture<PopUpListarPagamentosExecutadosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopUpListarPagamentosExecutadosComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopUpListarPagamentosExecutadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
