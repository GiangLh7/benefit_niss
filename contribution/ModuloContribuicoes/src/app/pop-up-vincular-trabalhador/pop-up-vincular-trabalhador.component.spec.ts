import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopUpVincularTrabalhadorComponent } from './pop-up-vincular-trabalhador.component';

describe('PopUpVincularTrabalhadorComponent', () => {
  let component: PopUpVincularTrabalhadorComponent;
  let fixture: ComponentFixture<PopUpVincularTrabalhadorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopUpVincularTrabalhadorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopUpVincularTrabalhadorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
