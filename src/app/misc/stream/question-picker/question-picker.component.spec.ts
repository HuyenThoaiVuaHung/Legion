import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionPickerComponent } from './question-picker.component';

describe('QuestionPickerComponent', () => {
  let component: QuestionPickerComponent;
  let fixture: ComponentFixture<QuestionPickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuestionPickerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(QuestionPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
