import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditorCardComponent } from './editor-card.component';

describe('EditorCardComponent', () => {
  let component: EditorCardComponent;
  let fixture: ComponentFixture<EditorCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditorCardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditorCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
