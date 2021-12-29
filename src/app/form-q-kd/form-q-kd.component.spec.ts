import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormQKdComponent } from './form-q-kd.component';

describe('FormQKdComponent', () => {
  let component: FormQKdComponent;
  let fixture: ComponentFixture<FormQKdComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FormQKdComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FormQKdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
