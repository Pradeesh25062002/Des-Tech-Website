import { Component, DestroyRef, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

type StudentStory = {
  name: string;
  designation: string;
  company: string;
  image: string;
  testimonial?: string;
};

@Component({
  selector: 'app-student-stories',
  templateUrl: './student-stories.html',
  styleUrl: './student-stories.css',
})
export class StudentStoriesPage {
  protected readonly menuOpen = signal(false);
  protected readonly currentPage = signal(1);
  protected readonly pages = [1, 2, 3, 4];
  protected readonly students: StudentStory[] = [
    {
      name: 'Edwin Thomas',
      designation: 'Project Engineer',
      company: 'Triangle Air Systems, Kottayam',
      image: 'student-stories/edwin-thomas.jpg',
      testimonial:
        'A great academy for job seekers who have interest in HVAC engineering. They provide excellent training (both theory and designing) and genuine placement support. I was placed right after the course completion.',
    },
    {
      name: 'Sooraj R',
      designation: 'Project Engineer',
      company: 'Triangle Air Systems, Kottayam',
      image: 'student-stories/sooraj-r.jpg',
      testimonial:
        'Excellent, DES-TECH provides more opportunities and good guidance. Faculties provide great support for placements. I was a student at DES-TECH and I have been placed as an HVAC Project Engineer at Triangle Air Systems. Thank you DES-TECH 🤍',
    },
    {
      name: 'Abin Ouseph',
      designation: 'Design Engineer',
      company: 'Weather Station, Chennai',
      image: 'student-stories/abin-ouseph.jpg',
      testimonial:
        'This institute is a good option for those who are interested in getting into the HVAC and MEP field, and I am very satisfied with the services they provided.',
    },
    {
      name: 'Praison K Prakash',
      designation: 'Design Engineer',
      company: 'Inspire Engineering, Chennai',
      image: 'student-stories/praison-k-prakash.jpg',
      testimonial: 'Good classes and better placement opportunities.',
    },
    {
      name: 'Vaishnavi E',
      designation: 'Design Engineer',
      company: 'Techtonic Air Conditioning, Calicut',
      image: 'student-stories/vaishnavi-e.jpg',
      testimonial:
        "Studying at DES-TECH Academy has been a great experience. The faculty members are supportive, patient, and focus heavily on practical learning rather than just theory. The concepts are taught clearly, making it easy to build real-world skills. Overall, it's a helpful and encouraging environment for students looking to improve their technical expertise and career readiness.",
    },
    {
      name: 'Bibin Xavier',
      designation: 'Project Engineer',
      company: 'Lead Air Systems, Bangalore',
      image: 'student-stories/bibin-xavier.jpg',
      testimonial:
        'First of all, this institution gives job-oriented courses that are helpful for everyone. It has given me a new pathway for my career. After my course completion, the support and guidance from Mr. Pradeep Kumar were absolutely top-notch, and he never disappoints any of the students. He puts full effort into getting students placed or securing internships.\n\nThank you for your support and guidance. Whenever I need you, I will call you.',
    },
    {
      name: 'Jeevan Jacob',
      designation: 'Design Engineer',
      company: 'Intellect, Chennai',
      image: 'student-stories/jeevan-jacob.jpg',
    },
    {
      name: 'Veena B',
      designation: 'Design Engineer',
      company: 'Anugreen Technologies, Ernakulam',
      image: 'student-stories/veena-b.jpg',
      testimonial:
        'Good classes and a good learning experience. The sessions are clear, informative, and helpful.',
    },
    {
      name: 'Fayaz Mohamed A M',
      designation: 'Sales Engineer',
      company: 'Lead Air Systems, Bangalore',
      image: 'student-stories/fayaz-mohamed-a-m.jpg',
      testimonial:
        'I’m really happy to have been part of this institute. The classes were more focused on HVAC design, which helped me gain practical knowledge and a better understanding of the industry. I’m also happy to share that I’ve now got a job in the HVAC field as a sales engineer, and I’m truly grateful for the knowledge and guidance I received here. A special thanks to Pratheep Sir, the design faculty, and the entire team for their support and encouragement throughout my learning journey. Thank you for helping me take this step forward in my career! ❤️',
    },
    {
      name: 'Akhil G S',
      designation: 'Design & Project Engineer',
      company: 'GVJ Aircon, Chennai',
      image: 'student-stories/akhil-g-s.jpg',
    },
    {
      name: 'Gokul V',
      designation: 'Project Supervisor',
      company: 'Techtonics, Calicut',
      image: 'student-stories/gokul-v.jpg',
    },
    {
      name: 'Ebin Vinodhan',
      designation: 'Project Engineer',
      company: 'Techtonic, Calicut',
      image: 'student-stories/ebin-vinodhan.jpg',
    },
  ];
  protected readonly phones = [
    { display: '8590093998', href: 'tel:+918590093998' },
    { display: '8921219805', href: 'tel:+918921219805' },
  ];

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    destroyRef: DestroyRef,
  ) {
    this.route.queryParamMap.pipe(takeUntilDestroyed(destroyRef)).subscribe((params) => {
      const page = Number(params.get('page'));
      this.currentPage.set(Number.isInteger(page) && page >= 1 && page <= 4 ? page : 1);
    });
  }

  protected get visibleStudents(): StudentStory[] {
    const start = (this.currentPage() - 1) * 3;
    return this.students.slice(start, start + 3);
  }

  protected goToPage(page: number): void {
    if (page < 1 || page > this.pages.length || page === this.currentPage()) return;
    this.currentPage.set(page);
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page },
      queryParamsHandling: 'merge',
    });
    document.getElementById('student-stories-list')?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'start',
    });
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }
}
