import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultasFornecedoresComponent } from './consultas-fornecedores.component';

describe('ConsultasFornecedoresComponent', () => {
  let component: ConsultasFornecedoresComponent;
  let fixture: ComponentFixture<ConsultasFornecedoresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConsultasFornecedoresComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsultasFornecedoresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
