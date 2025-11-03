import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImporterToastComponent } from './importer-toast.component';

describe('ImporterToastComponent', () => {
  let component: ImporterToastComponent;
  let fixture: ComponentFixture<ImporterToastComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImporterToastComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImporterToastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
