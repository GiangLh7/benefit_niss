import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopUpMovimentosDesfazerConciliacaoComponent } from './logic';

describe('PopUpMovimentosDesfazerConciliacaoComponent', () => {
  let component: PopUpMovimentosDesfazerConciliacaoComponent;
  let fixture: ComponentFixture<PopUpMovimentosDesfazerConciliacaoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopUpMovimentosDesfazerConciliacaoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopUpMovimentosDesfazerConciliacaoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
