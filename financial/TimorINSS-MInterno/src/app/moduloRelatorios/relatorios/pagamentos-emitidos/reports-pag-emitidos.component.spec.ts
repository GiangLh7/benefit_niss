import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RelatoriosPagamentosEmiditosComponent } from './reports-pag-emitidos.component';

describe('ConsultasPagamentosEmiditosComponent', () => {
  let component: RelatoriosPagamentosEmiditosComponent;
  let fixture: ComponentFixture<RelatoriosPagamentosEmiditosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RelatoriosPagamentosEmiditosComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RelatoriosPagamentosEmiditosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
