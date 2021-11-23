import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ControlVcnvComponent } from './control-vcnv.component';

describe('ControlVcnvComponent', () => {
  let component: ControlVcnvComponent;
  let fixture: ComponentFixture<ControlVcnvComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ControlVcnvComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ControlVcnvComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
