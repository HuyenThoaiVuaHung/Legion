import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChpComponent } from './chp.component';

describe('ChpComponent', () => {
  let component: ChpComponent;
  let fixture: ComponentFixture<ChpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChpComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
