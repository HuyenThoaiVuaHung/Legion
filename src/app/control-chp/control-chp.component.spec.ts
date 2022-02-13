import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ControlChpComponent } from './control-chp.component';

describe('ControlChpComponent', () => {
  let component: ControlChpComponent;
  let fixture: ComponentFixture<ControlChpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ControlChpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ControlChpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
