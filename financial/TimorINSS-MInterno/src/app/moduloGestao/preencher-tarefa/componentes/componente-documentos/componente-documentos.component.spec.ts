import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComponenteDocumentosComponent } from './componente-documentos.component';

describe('ComponenteDocumentosComponent', () => {
  let component: ComponenteDocumentosComponent;
  let fixture: ComponentFixture<ComponenteDocumentosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ComponenteDocumentosComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ComponenteDocumentosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
