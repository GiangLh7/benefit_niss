import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComponenteConcilicacaoComponent } from './componente-concilicacao.component';

describe('ComponenteConcilicacaoComponent', () => {
  let component: ComponenteConcilicacaoComponent;
  let fixture: ComponentFixture<ComponenteConcilicacaoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ComponenteConcilicacaoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ComponenteConcilicacaoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
