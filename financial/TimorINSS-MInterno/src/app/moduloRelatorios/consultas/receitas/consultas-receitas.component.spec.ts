import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultasReceitasComponent } from './consultas-receitas.component';

describe('ConsultasReceitasComponent', () => {
  let component: ConsultasReceitasComponent;
  let fixture: ComponentFixture<ConsultasReceitasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConsultasReceitasComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsultasReceitasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
