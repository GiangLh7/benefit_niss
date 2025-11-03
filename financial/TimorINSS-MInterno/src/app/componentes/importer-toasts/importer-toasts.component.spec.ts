import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImporterToastsComponent } from './importer-toasts.component';

describe('ImporterToastsComponent', () => {
  let component: ImporterToastsComponent;
  let fixture: ComponentFixture<ImporterToastsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImporterToastsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImporterToastsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
