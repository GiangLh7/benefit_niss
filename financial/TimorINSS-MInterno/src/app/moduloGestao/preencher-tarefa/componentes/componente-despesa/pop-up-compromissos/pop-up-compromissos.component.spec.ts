import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopUpCompromissosComponent } from './pop-up-compromissos.component';

describe('PopUpCompromissosComponent', () => {
  let component: PopUpCompromissosComponent;
  let fixture: ComponentFixture<PopUpCompromissosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopUpCompromissosComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopUpCompromissosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
