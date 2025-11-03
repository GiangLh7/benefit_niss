import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessosArquivadosComponent } from './processos-arquivados.component';

describe('ProcessosArquivadosComponent', () => {
  let component: ProcessosArquivadosComponent;
  let fixture: ComponentFixture<ProcessosArquivadosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProcessosArquivadosComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcessosArquivadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
