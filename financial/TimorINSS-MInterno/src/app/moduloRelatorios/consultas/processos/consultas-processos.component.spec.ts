import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultasProcessosComponent } from './consultas-processos.component';

describe('ConsultasProcessosComponent', () => {
  let component: ConsultasProcessosComponent;
  let fixture: ComponentFixture<ConsultasProcessosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConsultasProcessosComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsultasProcessosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
