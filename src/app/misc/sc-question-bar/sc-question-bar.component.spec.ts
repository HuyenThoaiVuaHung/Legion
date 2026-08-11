import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScQuestionBarComponent } from './sc-question-bar.component';

describe('ScQuestionBarComponent', () => {
  let component: ScQuestionBarComponent;
  let fixture: ComponentFixture<ScQuestionBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [ScQuestionBarComponent]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ScQuestionBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
