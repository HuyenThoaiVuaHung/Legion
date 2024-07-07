import { TestBed } from '@angular/core/testing';

import { EditorMediaService } from './editor.media.service';

describe('EditorMediaService', () => {
  let service: EditorMediaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EditorMediaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
