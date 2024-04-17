import { ComponentFixture, TestBed } from '@angular/core/testing';

import { McComponent } from './mc.component';

describe('McComponent', () => {
  let component: McComponent;
  let fixture: ComponentFixture<McComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [McComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(McComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
