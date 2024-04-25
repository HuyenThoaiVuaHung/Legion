import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TtComponent } from './tt.component';

describe('TtComponent', () => {
  let component: TtComponent;
  let fixture: ComponentFixture<TtComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TtComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
