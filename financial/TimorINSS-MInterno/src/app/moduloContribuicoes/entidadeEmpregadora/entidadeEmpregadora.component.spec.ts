import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntidadeEmpregadoraComponent } from './entidadeEmpregadora.component';

describe('EntidadeEmpregadoraComponent', () => {
  let component: EntidadeEmpregadoraComponent;
  let fixture: ComponentFixture<EntidadeEmpregadoraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EntidadeEmpregadoraComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EntidadeEmpregadoraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
