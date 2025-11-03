import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopUpGravarRegimeComponent } from './pop-up-gravar-regime.component';

describe('PopUpGravarRegimeComponent', () => {
  let component: PopUpGravarRegimeComponent;
  let fixture: ComponentFixture<PopUpGravarRegimeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopUpGravarRegimeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopUpGravarRegimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
