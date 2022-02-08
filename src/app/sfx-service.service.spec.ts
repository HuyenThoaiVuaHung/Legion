import { TestBed } from '@angular/core/testing';

import { SfxServiceService } from './sfx-service.service';

describe('SfxServiceService', () => {
  let service: SfxServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SfxServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
