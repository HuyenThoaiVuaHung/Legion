import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormQTtComponent } from './form-q-tt.component';

describe('FormQTtComponent', () => {
  let component: FormQTtComponent;
  let fixture: ComponentFixture<FormQTtComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FormQTtComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FormQTtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
