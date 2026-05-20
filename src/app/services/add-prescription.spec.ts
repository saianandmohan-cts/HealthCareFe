import { TestBed } from '@angular/core/testing';

import { AddPrescription } from './add-prescription';

describe('AddPrescription', () => {
  let service: AddPrescription;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AddPrescription);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
