import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerTangtocQComponent } from './player-tangtoc-q.component';

describe('PlayerTangtocQComponent', () => {
  let component: PlayerTangtocQComponent;
  let fixture: ComponentFixture<PlayerTangtocQComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlayerTangtocQComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlayerTangtocQComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
