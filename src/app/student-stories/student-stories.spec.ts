import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, ParamMap, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { StudentStoriesPage } from './student-stories';

describe('StudentStoriesPage', () => {
  let queryParamMap: BehaviorSubject<ParamMap>;
  let navigate: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    queryParamMap = new BehaviorSubject(convertToParamMap({}));
    navigate = vi.fn().mockImplementation((_commands, extras) => {
      queryParamMap.next(convertToParamMap(extras.queryParams));
      return Promise.resolve(true);
    });
    await TestBed.configureTestingModule({
      imports: [StudentStoriesPage],
      providers: [
        { provide: ActivatedRoute, useValue: { queryParamMap } },
        { provide: Router, useValue: { navigate } },
      ],
    }).compileComponents();
    HTMLElement.prototype.scrollIntoView = vi.fn();
    window.matchMedia = vi.fn().mockReturnValue({ matches: false }) as typeof window.matchMedia;
  });

  function render() {
    const fixture = TestBed.createComponent(StudentStoriesPage);
    fixture.detectChanges();
    return fixture;
  }

  function visibleNames(fixture: ReturnType<typeof render>): string[] {
    return Array.from(fixture.nativeElement.querySelectorAll('.student-card h3'), (heading: Element) =>
      heading.textContent?.trim() ?? '',
    );
  }

  it('shows the first three testimonial students initially', () => {
    const fixture = render();
    expect(visibleNames(fixture)).toEqual(['Edwin Thomas', 'Sooraj R', 'Abin Ouseph']);
    expect(fixture.nativeElement.querySelectorAll('.student-card')).toHaveLength(3);
    expect(fixture.nativeElement.querySelectorAll('.testimonial')).toHaveLength(3);
    expect(fixture.nativeElement.querySelector('[aria-label="Previous page"]').disabled).toBe(true);
    expect(fixture.nativeElement.querySelector('[aria-label="Next page"]').disabled).toBe(false);
  });

  it('shows the correct students across all four pages and updates the URL page parameter', () => {
    const fixture = render();
    const expectedPages = [
      ['Edwin Thomas', 'Sooraj R', 'Abin Ouseph'],
      ['Praison K Prakash', 'Vaishnavi E', 'Bibin Xavier'],
      ['Jeevan Jacob', 'Veena B', 'Fayaz Mohamed A M'],
      ['Akhil G S', 'Gokul V', 'Ebin Vinodhan'],
    ];

    for (let page = 2; page <= 4; page++) {
      (fixture.nativeElement.querySelector(`[aria-label="Page ${page}"]`) as HTMLButtonElement).click();
      fixture.detectChanges();
      expect(visibleNames(fixture)).toEqual(expectedPages[page - 1]);
      expect(fixture.nativeElement.querySelectorAll('.student-card')).toHaveLength(3);
      expect(navigate).toHaveBeenLastCalledWith([], expect.objectContaining({ queryParams: { page } }));
    }

    expect(fixture.nativeElement.querySelectorAll('.testimonial')).toHaveLength(0);
    expect(fixture.nativeElement.querySelector('[aria-label="Next page"]').disabled).toBe(true);
    expect(fixture.nativeElement.querySelector('[aria-label="Previous page"]').disabled).toBe(false);

    (fixture.nativeElement.querySelector('[aria-label="Previous page"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(visibleNames(fixture)).toEqual(expectedPages[2]);
  });

  it('opens on the page provided in the query string', () => {
    queryParamMap.next(convertToParamMap({ page: '3' }));
    const fixture = render();
    expect(visibleNames(fixture)).toEqual(['Jeevan Jacob', 'Veena B', 'Fayaz Mohamed A M']);
  });
});
