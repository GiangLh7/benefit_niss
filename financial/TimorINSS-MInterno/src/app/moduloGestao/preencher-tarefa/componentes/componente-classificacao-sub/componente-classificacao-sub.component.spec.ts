import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComponenteClassificacaoSubComponent } from './componente-classificacao-sub.component';

describe('ComponenteClassificacaoSubComponent', () => {
  let component: ComponenteClassificacaoSubComponent;
  let fixture: ComponentFixture<ComponenteClassificacaoSubComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ComponenteClassificacaoSubComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ComponenteClassificacaoSubComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
