import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComponenteListDocumentosComponent } from './componente-list-documentos.component';

describe('ComponenteListDocumentosComponent', () => {
  let component: ComponenteListDocumentosComponent;
  let fixture: ComponentFixture<ComponenteListDocumentosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ComponenteListDocumentosComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ComponenteListDocumentosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
