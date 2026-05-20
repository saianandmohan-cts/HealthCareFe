import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PastConsultationList } from './past-consultation-list';

describe('PastConsultationList', () => {
  let component: PastConsultationList;
  let fixture: ComponentFixture<PastConsultationList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PastConsultationList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PastConsultationList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
