/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ChpComponent } from './chp.component';

describe('ChpComponent', () => {
  let component: ChpComponent;
  let fixture: ComponentFixture<ChpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
