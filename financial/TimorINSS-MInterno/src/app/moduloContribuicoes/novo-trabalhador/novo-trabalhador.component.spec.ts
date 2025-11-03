import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NovoTrabalhadorComponent } from './novo-trabalhador.component';

describe('NovoTrabalhadorComponent', () => {
  let component: NovoTrabalhadorComponent;
  let fixture: ComponentFixture<NovoTrabalhadorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NovoTrabalhadorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NovoTrabalhadorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
