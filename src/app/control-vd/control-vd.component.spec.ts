import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ControlVdComponent } from './control-vd.component';

describe('ControlVdComponent', () => {
  let component: ControlVdComponent;
  let fixture: ComponentFixture<ControlVdComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ControlVdComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ControlVdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
