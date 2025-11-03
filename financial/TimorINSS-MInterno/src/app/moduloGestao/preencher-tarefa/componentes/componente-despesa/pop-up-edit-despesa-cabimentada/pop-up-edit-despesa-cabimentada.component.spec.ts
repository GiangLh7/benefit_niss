import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopUpEditDespesaCabimentadaComponent } from './pop-up-edit-despesa-cabimentada.component';

describe('PopUpEditDespesaCabimentadaComponent', () => {
  let component: PopUpEditDespesaCabimentadaComponent;
  let fixture: ComponentFixture<PopUpEditDespesaCabimentadaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopUpEditDespesaCabimentadaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopUpEditDespesaCabimentadaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
