import { TestBed } from '@angular/core/testing';

import { FsService } from './fs.service';

describe('FsService', () => {
  let service: FsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
