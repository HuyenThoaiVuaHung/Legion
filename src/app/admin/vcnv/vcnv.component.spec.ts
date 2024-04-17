import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VcnvComponent } from './vcnv.component';

describe('VcnvComponent', () => {
  let component: VcnvComponent;
  let fixture: ComponentFixture<VcnvComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VcnvComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VcnvComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
