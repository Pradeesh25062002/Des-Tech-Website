import { Component, signal } from '@angular/core';
import { SiteFooterComponent } from '../shared/site-footer/site-footer';

@Component({
  selector: 'app-about',
  imports: [SiteFooterComponent],
  templateUrl: './about.html',
  styleUrl: './about.css',
})
export class AboutPage {
  protected readonly menuOpen = signal(false);

  protected readonly journeyStages = [
    { number: '01', title: 'Learn', description: 'Build strong technical foundations.' },
    { number: '02', title: 'Practice', description: 'Gain practical, hands-on experience.' },
    { number: '03', title: 'Get Industry Ready', description: 'Develop skills relevant to real workplace requirements.' },
    { number: '04', title: 'Career Support', description: 'Receive guidance and placement assistance.' },
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
