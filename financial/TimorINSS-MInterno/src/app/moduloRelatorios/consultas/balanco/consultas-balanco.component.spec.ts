import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultasBalancoComponent } from './consultas-balanco.component';

describe('ConsultasBalancoComponent', () => {
  let component: ConsultasBalancoComponent;
  let fixture: ComponentFixture<ConsultasBalancoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConsultasBalancoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsultasBalancoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
