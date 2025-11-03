import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComponenteCabecalhoProcessoComponent } from './componente-cabecalho.component';

describe('ComponenteCabecalhoProcessoComponent', () => {
  let component: ComponenteCabecalhoProcessoComponent;
  let fixture: ComponentFixture<ComponenteCabecalhoProcessoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ComponenteCabecalhoProcessoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ComponenteCabecalhoProcessoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
