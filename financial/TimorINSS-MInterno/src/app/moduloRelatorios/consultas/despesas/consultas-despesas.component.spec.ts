import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultasDespesasComponent } from './consultas-despesas.component';

describe('ConsultasDespesasComponent', () => {
  let component: ConsultasDespesasComponent;
  let fixture: ComponentFixture<ConsultasDespesasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConsultasDespesasComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsultasDespesasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
