import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CnvViewerComponent } from './cnv-viewer.component';

describe('CnvViewerComponent', () => {
  let component: CnvViewerComponent;
  let fixture: ComponentFixture<CnvViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CnvViewerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CnvViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
