import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RelatoriosExecucaoOrcamentalComponent } from './reports-execucao-orcamental.component';

describe('RelatoriosExecucaoOrcamentalComponent', () => {
  let component: RelatoriosExecucaoOrcamentalComponent;
  let fixture: ComponentFixture<RelatoriosExecucaoOrcamentalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RelatoriosExecucaoOrcamentalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RelatoriosExecucaoOrcamentalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
