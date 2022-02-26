import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormQChpComponent } from './form-q-chp.component';

describe('FormQChpComponent', () => {
  let component: FormQChpComponent;
  let fixture: ComponentFixture<FormQChpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FormQChpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FormQChpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
