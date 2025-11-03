import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComponentePrazoComponent } from './componente-prazo.component';

describe('ComponentePrazoComponent', () => {
  let component: ComponentePrazoComponent;
  let fixture: ComponentFixture<ComponentePrazoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ComponentePrazoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ComponentePrazoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
