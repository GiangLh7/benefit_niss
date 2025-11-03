import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComponenteDespesaComponent } from './componente-despesa.component';

describe('ComponenteDespesaComponent', () => {
  let component: ComponenteDespesaComponent;
  let fixture: ComponentFixture<ComponenteDespesaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ComponenteDespesaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ComponenteDespesaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
