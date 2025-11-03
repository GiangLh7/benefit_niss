import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ControloDeAcessoComponent } from './controlo-de-acesso.component';

describe('ControloDeAcessoComponent', () => {
  let component: ControloDeAcessoComponent;
  let fixture: ComponentFixture<ControloDeAcessoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ControloDeAcessoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ControloDeAcessoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
