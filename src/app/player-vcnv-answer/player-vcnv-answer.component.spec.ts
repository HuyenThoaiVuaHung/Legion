import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerVcnvAnswerComponent } from './player-vcnv-answer.component';

describe('PlayerVcnvAnswerComponent', () => {
  let component: PlayerVcnvAnswerComponent;
  let fixture: ComponentFixture<PlayerVcnvAnswerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlayerVcnvAnswerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlayerVcnvAnswerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
