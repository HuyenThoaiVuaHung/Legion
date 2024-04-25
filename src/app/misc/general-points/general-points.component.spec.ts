import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralPointsComponent } from './general-points.component';

describe('GeneralPointsComponent', () => {
  let component: GeneralPointsComponent;
  let fixture: ComponentFixture<GeneralPointsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GeneralPointsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GeneralPointsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
