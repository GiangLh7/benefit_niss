import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopUpInfoLegalRemuneracaoComponent } from './pop-up-info-legal-remuneracao.component';

describe('PopUpInfoLegalRemuneracaoComponent', () => {
  let component: PopUpInfoLegalRemuneracaoComponent;
  let fixture: ComponentFixture<PopUpInfoLegalRemuneracaoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopUpInfoLegalRemuneracaoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopUpInfoLegalRemuneracaoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
