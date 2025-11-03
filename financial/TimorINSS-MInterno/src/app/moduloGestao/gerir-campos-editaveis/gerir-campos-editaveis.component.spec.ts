import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GerirCamposEditaveisComponent } from './gerir-campos-editaveis.component';

describe('GerirCamposEditaveisComponent', () => {
  let component: GerirCamposEditaveisComponent;
  let fixture: ComponentFixture<GerirCamposEditaveisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GerirCamposEditaveisComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GerirCamposEditaveisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
