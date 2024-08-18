import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormQchpComponent } from './form-qchp.component';

describe('FormQchpComponent', () => {
  let component: FormQchpComponent;
  let fixture: ComponentFixture<FormQchpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FormQchpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FormQchpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
