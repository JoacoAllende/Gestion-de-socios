import { TestBed } from '@angular/core/testing';

import { DailyBoxService } from './daily-box.service';

describe('DailyBoxService', () => {
  let service: DailyBoxService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DailyBoxService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
