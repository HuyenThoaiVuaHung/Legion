import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ControlTangtocComponent } from './control-tangtoc.component';

describe('ControlTangtocComponent', () => {
  let component: ControlTangtocComponent;
  let fixture: ComponentFixture<ControlTangtocComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ControlTangtocComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ControlTangtocComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
