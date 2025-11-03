import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComponenteHistoricoTextoComponent } from './componente-historico-texto.component';

describe('ComponenteHistoricoTextoComponent', () => {
  let component: ComponenteHistoricoTextoComponent;
  let fixture: ComponentFixture<ComponenteHistoricoTextoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ComponenteHistoricoTextoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ComponenteHistoricoTextoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
