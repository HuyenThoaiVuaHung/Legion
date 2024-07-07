/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { TtComponent } from './tt.component';

describe('TtComponent', () => {
  let component: TtComponent;
  let fixture: ComponentFixture<TtComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TtComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
