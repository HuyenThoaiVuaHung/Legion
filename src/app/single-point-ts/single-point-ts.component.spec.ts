import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SinglePointTsComponent } from './single-point-ts.component';

describe('SinglePointTsComponent', () => {
  let component: SinglePointTsComponent;
  let fixture: ComponentFixture<SinglePointTsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SinglePointTsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SinglePointTsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
