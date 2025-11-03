import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultasGuiasComponent } from './consultas-guias.component';

describe('ConsultasGuiasComponent', () => {
  let component: ConsultasGuiasComponent;
  let fixture: ComponentFixture<ConsultasGuiasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConsultasGuiasComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsultasGuiasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
