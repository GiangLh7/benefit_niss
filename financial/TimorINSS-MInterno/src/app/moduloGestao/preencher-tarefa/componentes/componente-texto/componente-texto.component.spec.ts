import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComponenteTextoComponent } from './componente-texto.component';

describe('ComponenteTextoComponent', () => {
  let component: ComponenteTextoComponent;
  let fixture: ComponentFixture<ComponenteTextoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ComponenteTextoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ComponenteTextoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
