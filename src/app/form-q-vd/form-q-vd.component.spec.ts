import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormQVdComponent } from './form-q-vd.component';

describe('FormQVdComponent', () => {
  let component: FormQVdComponent;
  let fixture: ComponentFixture<FormQVdComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FormQVdComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FormQVdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
