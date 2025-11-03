import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistoSuspensaoComponent } from './registoSuspensao.component';

describe('RegistoSuspensaoComponent', () => {
  let component: RegistoSuspensaoComponent;
  let fixture: ComponentFixture<RegistoSuspensaoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RegistoSuspensaoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistoSuspensaoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
