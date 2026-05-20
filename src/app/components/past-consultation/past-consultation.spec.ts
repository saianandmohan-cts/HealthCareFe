import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PastConsultation } from './past-consultation';

describe('PastConsultation', () => {
  let component: PastConsultation;
  let fixture: ComponentFixture<PastConsultation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PastConsultation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PastConsultation);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
