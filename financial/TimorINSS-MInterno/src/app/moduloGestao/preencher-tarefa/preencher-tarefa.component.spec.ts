import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreencherTarefaComponent } from './preencher-tarefa.component';

describe('PreencherTarefaComponent', () => {
  let component: PreencherTarefaComponent;
  let fixture: ComponentFixture<PreencherTarefaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PreencherTarefaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PreencherTarefaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
