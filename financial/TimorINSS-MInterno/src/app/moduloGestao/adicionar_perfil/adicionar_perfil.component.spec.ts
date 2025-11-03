import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdicionarPerfilComponent } from './adicionar_perfil.component';

describe('AdicionarPerfilComponent', () => {
  let component: AdicionarPerfilComponent;
  let fixture: ComponentFixture<AdicionarPerfilComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdicionarPerfilComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdicionarPerfilComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
