import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultasExtratosBancariosComponent } from './consultas-extratos-bancarios.component';

describe('ConsultasExtratosBancariosComponent', () => {
  let component: ConsultasExtratosBancariosComponent;
  let fixture: ComponentFixture<ConsultasExtratosBancariosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConsultasExtratosBancariosComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsultasExtratosBancariosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
