import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopUpMovimentosUpsertComponent } from './logic';

describe('PopUpMovimentosUpsertComponent', () => {
  let component: PopUpMovimentosUpsertComponent;
  let fixture: ComponentFixture<PopUpMovimentosUpsertComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopUpMovimentosUpsertComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopUpMovimentosUpsertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
