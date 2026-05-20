import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorAvailabilitySlot } from './doctor-availability-slot';

describe('DoctorAvailabilitySlot', () => {
  let component: DoctorAvailabilitySlot;
  let fixture: ComponentFixture<DoctorAvailabilitySlot>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorAvailabilitySlot]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorAvailabilitySlot);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
