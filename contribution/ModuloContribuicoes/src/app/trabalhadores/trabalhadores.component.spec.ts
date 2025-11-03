import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrabalhadoresComponent } from './trabalhadores.component';

describe('TrabalhadoresComponent', () => {
  let component: TrabalhadoresComponent;
  let fixture: ComponentFixture<TrabalhadoresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TrabalhadoresComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TrabalhadoresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
