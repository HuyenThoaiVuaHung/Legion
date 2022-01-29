import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormQVcnvComponent } from './form-q-vcnv.component';

describe('FormQVcnvComponent', () => {
  let component: FormQVcnvComponent;
  let fixture: ComponentFixture<FormQVcnvComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FormQVcnvComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FormQVcnvComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
