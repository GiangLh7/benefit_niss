import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComponenteOrcamentoComponent } from './componente-orcamento.component';

describe('ComponenteOrcamentoComponent', () => {
  let component: ComponenteOrcamentoComponent;
  let fixture: ComponentFixture<ComponenteOrcamentoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ComponenteOrcamentoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ComponenteOrcamentoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
