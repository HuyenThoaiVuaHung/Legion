import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditorItemComponent } from './editor-item.component';

describe('EditorItemComponent', () => {
  let component: EditorItemComponent;
  let fixture: ComponentFixture<EditorItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditorItemComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditorItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
