import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NovoConfigurarProcessosComponent } from './create-edit-configurar-processos.component';

describe('CreateEditConfigurarProcessosComponent', () => {
  let component: NovoConfigurarProcessosComponent;
  let fixture: ComponentFixture<NovoConfigurarProcessosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NovoConfigurarProcessosComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NovoConfigurarProcessosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
