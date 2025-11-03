import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeclaracaoRemuneracaoComponent } from './declaracao-remuneracao.component';

describe('DeclaracaoRemuneracaoComponent', () => {
  let component: DeclaracaoRemuneracaoComponent;
  let fixture: ComponentFixture<DeclaracaoRemuneracaoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeclaracaoRemuneracaoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeclaracaoRemuneracaoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
