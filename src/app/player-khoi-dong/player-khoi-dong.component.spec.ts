import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerKhoiDongComponent } from './player-khoi-dong.component';

describe('PlayerKhoiDongComponent', () => {
  let component: PlayerKhoiDongComponent;
  let fixture: ComponentFixture<PlayerKhoiDongComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlayerKhoiDongComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlayerKhoiDongComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
