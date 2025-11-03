import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessoDetalheComponent } from './processo-detalhe.component';

describe('ProcessoDetalheComponent', () => {
  let component: ProcessoDetalheComponent;
  let fixture: ComponentFixture<ProcessoDetalheComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProcessoDetalheComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcessoDetalheComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
