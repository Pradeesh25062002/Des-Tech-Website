import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { CoursesPage } from './courses';

describe('CoursesPage enquiry links', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoursesPage],
      providers: [{ provide: ActivatedRoute, useValue: { snapshot: { fragment: null } } }],
    }).compileComponents();
  });

  it('passes the allowed course and source for every course enquiry button', () => {
    const fixture = TestBed.createComponent(CoursesPage);
    const page = fixture.componentInstance;
    const courses = page['courses'];
    const enquiryHref = page['courseEnquiryHref'].bind(page);

    expect(enquiryHref(courses[0])).toBe('/enquiry?course=HVAC&source=HVAC%20Course');
    expect(enquiryHref(courses[1])).toBe('/enquiry?course=MEP&source=MEP%20Course');
    expect(enquiryHref(courses[2])).toBe('/enquiry?course=AWS&source=AWS%20Course');
    expect(enquiryHref(courses[3])).toBe(
      '/enquiry?course=Warehouse%20Management&source=Warehouse%20Management%20Course',
    );
    expect(enquiryHref(courses[4])).toBe('/enquiry?course=HSE&source=HSE%20Course');
  });
});
