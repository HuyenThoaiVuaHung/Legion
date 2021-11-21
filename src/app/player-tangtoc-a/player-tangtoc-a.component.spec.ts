import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerTangtocAComponent } from './player-tangtoc-a.component';

describe('PlayerTangtocAComponent', () => {
  let component: PlayerTangtocAComponent;
  let fixture: ComponentFixture<PlayerTangtocAComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlayerTangtocAComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlayerTangtocAComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
