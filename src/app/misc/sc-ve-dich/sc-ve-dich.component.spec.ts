import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScVeDichComponent } from './sc-ve-dich.component';

describe('ScVeDichComponent', () => {
  let component: ScVeDichComponent;
  let fixture: ComponentFixture<ScVeDichComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [ScVeDichComponent]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ScVeDichComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
