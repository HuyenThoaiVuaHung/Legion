import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScKhoiDongComponent } from './sc-khoi-dong.component';

describe('ScKhoiDongComponent', () => {
  let component: ScKhoiDongComponent;
  let fixture: ComponentFixture<ScKhoiDongComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScKhoiDongComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ScKhoiDongComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
