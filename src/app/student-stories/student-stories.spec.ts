import { TestBed } from '@angular/core/testing';
import { StudentStoriesPage } from './student-stories';

describe('StudentStoriesPage', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [StudentStoriesPage] }).compileComponents();
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

  it('shows the first three students initially', () => {
    const fixture = render();
    expect(visibleNames(fixture)).toEqual(['Edwin Thomas', 'Akhil G S', 'Sooraj R']);
    expect(fixture.nativeElement.querySelectorAll('.student-card')).toHaveLength(3);
    expect(fixture.nativeElement.querySelector('[aria-label="Previous page"]').disabled).toBe(true);
    expect(fixture.nativeElement.querySelector('[aria-label="Next page"]').disabled).toBe(false);
  });

  it('shows the correct three students for each page and disables pagination at the ends', () => {
    const fixture = render();
    const pageTwo = fixture.nativeElement.querySelector('[aria-label="Page 2"]') as HTMLButtonElement;
    pageTwo.click();
    fixture.detectChanges();
    expect(visibleNames(fixture)).toEqual(['Abin Ouseph', 'Gokul V', 'Jeevan Jacob']);
    expect(fixture.nativeElement.querySelectorAll('.student-card')).toHaveLength(3);

    (fixture.nativeElement.querySelector('[aria-label="Next page"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(visibleNames(fixture)).toEqual(['Ebin Vinodhan', 'Bibin Xavier', 'Praison K Prakash']);
    expect(fixture.nativeElement.querySelector('[aria-label="Next page"]').disabled).toBe(true);
    expect(fixture.nativeElement.querySelector('[aria-label="Previous page"]').disabled).toBe(false);

    (fixture.nativeElement.querySelector('[aria-label="Previous page"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(visibleNames(fixture)).toEqual(['Abin Ouseph', 'Gokul V', 'Jeevan Jacob']);
  });
});
