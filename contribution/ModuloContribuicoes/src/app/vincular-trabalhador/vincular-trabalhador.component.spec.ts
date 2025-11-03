import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VincularTrabalhadorComponent } from './vincular-trabalhador.component';

describe('VincularTrabalhadorComponent', () => {
  let component: VincularTrabalhadorComponent;
  let fixture: ComponentFixture<VincularTrabalhadorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VincularTrabalhadorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VincularTrabalhadorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
