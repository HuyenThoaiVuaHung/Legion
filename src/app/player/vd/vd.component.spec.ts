/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { VdComponent } from './vd.component';

describe('VdComponent', () => {
  let component: VdComponent;
  let fixture: ComponentFixture<VdComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VdComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
