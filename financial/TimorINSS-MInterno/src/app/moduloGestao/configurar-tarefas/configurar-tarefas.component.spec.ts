import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigurarTarefasComponent } from './configurar-tarefas.component';

describe('ConfigurarTarefasComponent', () => {
  let component: ConfigurarTarefasComponent;
  let fixture: ComponentFixture<ConfigurarTarefasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConfigurarTarefasComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigurarTarefasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
