import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class ContactPage {
  protected readonly menuOpen = signal(false);
  protected readonly helpItems = [
    {
      icon: 'course',
      title: 'Course Guidance',
      description: 'Get help choosing the right course, understand the curriculum and find the best option for your career goals.',
    },
    {
      icon: 'training',
      title: 'Training Modes',
      description: 'Learn more about our offline and online training options, class schedules and learning approach.',
    },
    {
      icon: 'admissions',
      title: 'Admissions & Enquiries',
      description: 'Speak with our team about the admission process, eligibility and next steps for joining.',
    },
  ];
  protected readonly addressLines = [
    'Attaikulath Apartments,',
    'Cheruparambath Road,',
    'Kadavanthra, Ernakulam, Kerala.',
  ];
  protected readonly phones = [
    { display: '8590093998', href: 'tel:+918590093998' },
    { display: '8921219805', href: 'tel:+918921219805' },
  ];

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }
}
