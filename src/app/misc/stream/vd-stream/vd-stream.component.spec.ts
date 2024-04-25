import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VdStreamComponent } from './vd-stream.component';

describe('VdStreamComponent', () => {
  let component: VdStreamComponent;
  let fixture: ComponentFixture<VdStreamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VdStreamComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VdStreamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
