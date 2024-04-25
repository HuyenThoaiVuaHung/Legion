import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KdStreamComponent } from './kd-stream.component';

describe('KdStreamComponent', () => {
  let component: KdStreamComponent;
  let fixture: ComponentFixture<KdStreamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KdStreamComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(KdStreamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
