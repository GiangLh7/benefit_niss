import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComponenteTarefaASeguirComponent } from './componente-tarefa-a-seguir.component';

describe('ComponenteTarefaASeguirComponent', () => {
  let component: ComponenteTarefaASeguirComponent;
  let fixture: ComponentFixture<ComponenteTarefaASeguirComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ComponenteTarefaASeguirComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ComponenteTarefaASeguirComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
