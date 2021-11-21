import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerVedichComponent } from './player-vedich.component';

describe('PlayerVedichComponent', () => {
  let component: PlayerVedichComponent;
  let fixture: ComponentFixture<PlayerVedichComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlayerVedichComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlayerVedichComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
