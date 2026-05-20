import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Modifyappointment } from './modifyappointment';

describe('Modifyappointment', () => {
  let component: Modifyappointment;
  let fixture: ComponentFixture<Modifyappointment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Modifyappointment]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Modifyappointment);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
