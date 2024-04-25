/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { VcnvComponent } from './vcnv.component';

describe('VcnvComponent', () => {
  let component: VcnvComponent;
  let fixture: ComponentFixture<VcnvComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VcnvComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VcnvComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
