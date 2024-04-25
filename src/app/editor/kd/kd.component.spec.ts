import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditorKdComponent } from './kd.component';

describe('KdComponent', () => {
  let component: EditorKdComponent;
  let fixture: ComponentFixture<EditorKdComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
