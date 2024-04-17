/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { KdComponent } from './kd.component';

describe('KdComponent', () => {
  let component: KdComponent;
  let fixture: ComponentFixture<KdComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KdComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
