import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPrescription } from './add-prescription';

describe('AddPrescription', () => {
  let component: AddPrescription;
  let fixture: ComponentFixture<AddPrescription>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddPrescription]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddPrescription);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
