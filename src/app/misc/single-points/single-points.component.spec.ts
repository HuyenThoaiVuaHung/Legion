import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SinglePointsComponent } from './single-points.component';

describe('SinglePointsComponent', () => {
  let component: SinglePointsComponent;
  let fixture: ComponentFixture<SinglePointsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SinglePointsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SinglePointsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
