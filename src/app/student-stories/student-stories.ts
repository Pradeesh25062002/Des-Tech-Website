import { Component, signal } from '@angular/core';

type StudentStory = {
  name: string;
  designation: string;
  company: string;
  image: string;
};

@Component({
  selector: 'app-student-stories',
  templateUrl: './student-stories.html',
  styleUrl: './student-stories.css',
})
export class StudentStoriesPage {
  protected readonly menuOpen = signal(false);
  protected readonly currentPage = signal(1);
  protected readonly students: StudentStory[] = [
    { name: 'Edwin Thomas', designation: 'Project Engineer', company: 'Triangle Air Systems, Kottayam', image: 'student-stories/edwin-thomas.jpg' },
    { name: 'Akhil G S', designation: 'Design & Project Engineer', company: 'GVJ Aircon, Chennai', image: 'student-stories/akhil-g-s.jpg' },
    { name: 'Sooraj R', designation: 'Project Engineer', company: 'Triangle Air Systems, Kottayam', image: 'student-stories/sooraj-r.jpg' },
    { name: 'Abin Ouseph', designation: 'Design Engineer', company: 'Weather Station, Chennai', image: 'student-stories/abin-ouseph.jpg' },
    { name: 'Gokul V', designation: 'Project Supervisor', company: 'Techtonics, Calicut', image: 'student-stories/gokul-v.jpg' },
    { name: 'Jeevan Jacob', designation: 'Design Engineer', company: 'Intellect, Chennai', image: 'student-stories/jeevan-jacob.jpg' },
    { name: 'Ebin Vinodhan', designation: 'Project Engineer', company: 'Techtonic, Calicut', image: 'student-stories/ebin-vinodhan.jpg' },
    { name: 'Bibin Xavier', designation: 'Project Engineer', company: 'Lead Air Systems, Bangalore', image: 'student-stories/bibin-xavier.jpg' },
    { name: 'Praison K Prakash', designation: 'Design Engineer', company: 'Inspire Engineering, Chennai', image: 'student-stories/praison-k-prakash.jpg' },
  ];
  protected readonly phones = [
    { display: '8590093998', href: 'tel:+918590093998' },
    { display: '8921219805', href: 'tel:+918921219805' },
  ];
  protected get visibleStudents(): StudentStory[] {
    const start = (this.currentPage() - 1) * 3;
    return this.students.slice(start, start + 3);
  }
  protected goToPage(page: number): void {
    if (page < 1 || page > 3 || page === this.currentPage()) return;
    this.currentPage.set(page);
    document.getElementById('student-stories-list')?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'start',
    });
  }
  protected closeMenu(): void { this.menuOpen.set(false); }
}
