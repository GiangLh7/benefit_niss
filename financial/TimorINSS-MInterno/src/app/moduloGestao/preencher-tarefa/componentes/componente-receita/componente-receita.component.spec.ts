import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComponenteReceitaComponent } from './componente-receita.component';

describe('ComponenteReceitaComponent', () => {
  let component: ComponenteReceitaComponent;
  let fixture: ComponentFixture<ComponenteReceitaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ComponenteReceitaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ComponenteReceitaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
