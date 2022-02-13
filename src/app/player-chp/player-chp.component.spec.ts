import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerChpComponent } from './player-chp.component';

describe('PlayerChpComponent', () => {
  let component: PlayerChpComponent;
  let fixture: ComponentFixture<PlayerChpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlayerChpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlayerChpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
