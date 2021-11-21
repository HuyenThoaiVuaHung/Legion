import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerVcnvQuestionComponent } from './player-vcnv-question.component';

describe('PlayerVcnvQuestionComponent', () => {
  let component: PlayerVcnvQuestionComponent;
  let fixture: ComponentFixture<PlayerVcnvQuestionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlayerVcnvQuestionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlayerVcnvQuestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
