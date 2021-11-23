import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ControlKhoiDongComponent } from './control-khoi-dong.component';

describe('ControlKhoiDongComponent', () => {
  let component: ControlKhoiDongComponent;
  let fixture: ComponentFixture<ControlKhoiDongComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ControlKhoiDongComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ControlKhoiDongComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
