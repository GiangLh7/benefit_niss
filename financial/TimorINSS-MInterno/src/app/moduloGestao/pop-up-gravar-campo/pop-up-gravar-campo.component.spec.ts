import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopUpGravarCampoComponent } from './pop-up-gravar-campo.component';

describe('PopUpGravarCampoComponent', () => {
  let component: PopUpGravarCampoComponent;
  let fixture: ComponentFixture<PopUpGravarCampoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopUpGravarCampoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopUpGravarCampoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
