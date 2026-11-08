import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-about',
  templateUrl: './about.html',
  styleUrl: './about.css',
})
export class AboutPage {
  protected readonly menuOpen = signal(false);

  protected readonly impactMetrics = [
    { value: 'Dedicated', label: 'Placement assistance' },
    { value: 'Career-focused', label: 'Training programs' },
    { value: 'Modern', label: 'Lab facilities' },
    { value: 'Experienced', label: 'Trainers and mentors' },
  ];

  protected readonly advantages = [
    { icon: 'building', title: 'Modern Lab Facilities', text: 'Train on real equipment and industry-standard tools.' },
    { icon: 'people', title: 'Experienced Trainers', text: 'Learn from industry professionals with practical experience.' },
    { icon: 'curriculum', title: 'Industry-Relevant Curriculum', text: 'Courses designed based on current industry needs.' },
    { icon: 'growth', title: 'Placement Support', text: 'Dedicated guidance to help you take the next step.' },
  ];

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }
}
