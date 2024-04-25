import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VdComponent } from './vd.component';

describe('VdComponent', () => {
  let component: VdComponent;
  let fixture: ComponentFixture<VdComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VdComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
