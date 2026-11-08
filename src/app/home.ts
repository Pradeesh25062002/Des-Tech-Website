import { Component, OnDestroy, OnInit, signal } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class HomePage implements OnInit, OnDestroy {
  protected readonly menuOpen = signal(false);
  protected readonly activeSlide = signal(0);
  protected readonly rotationPaused = signal(false);
  private rotationTimer?: ReturnType<typeof setInterval>;

  protected readonly heroSlides = [
    {
      title: 'HVAC Training',
      courseId: 'hvac',
      description: 'Learn installation, operation and maintenance of modern HVAC systems with hands-on lab experience.',
      image: 'hvac-hero.png',
      alt: 'Technician working on commercial HVAC equipment',
    },
    {
      title: 'MEP Training',
      courseId: 'mep',
      description: 'Gain practical skills in Mechanical, Electrical and Plumbing systems for modern buildings and infrastructure.',
      image: 'mep-training.png',
      alt: 'Industrial MEP ductwork, pipes and building-services equipment',
    },
    {
      title: 'AWS & IT Networking',
      courseId: 'aws-networking',
      description: 'Build in-demand cloud computing and networking skills through practical labs, guided projects and industry-relevant training.',
      image: 'cloud-network-training.png',
      alt: 'Network engineer working with blue-cabled server racks',
    },
    {
      title: 'Health, Safety and Environment (HSE) Management',
      courseId: 'hse-management',
      description: 'Develop essential skills in workplace health and safety, hazard identification, risk assessment, environmental management and industry safety practices.',
      image: 'hse-training.png',
      alt: 'HSE professional in protective equipment conducting a construction-site safety inspection',
    },
    {
      title: 'Warehouse Management',
      courseId: 'warehouse-management',
      description: 'Learn warehouse operations, inventory control, stock management, order fulfilment and logistics processes used in modern supply chains.',
      image: 'warehouse-training.png',
      alt: 'Warehouse professional checking inventory in a modern distribution center',
    },
  ];

  protected readonly benefits = [
    { title: 'Industry-relevant curriculum', text: 'Learn from real industry experience.' },
    { title: 'Hands-on practical training', text: 'Work on live equipment and lab setups.' },
    { title: 'Placement assistance', text: 'Dedicated placement support to help you take the next step.' },
  ];

  protected readonly features = [
    { title: 'Taught by practitioners', text: 'Learn from industry professionals with real project experience.' },
    { title: 'Built for real-world skills', text: 'Hands-on training with practical tools and lab sessions.' },
    { title: 'Guidance beyond the classroom', text: 'Get career support and placement assistance.' },
  ];

  protected readonly courses = [
    {
      id: 'hvac',
      title: 'HVAC Training',
      description: 'Learn installation, operation and maintenance of modern HVAC systems with hands-on lab experience.',
      image: 'hvac-hero.png',
      alt: 'Technician working on a commercial HVAC unit',
    },
    {
      id: 'mep',
      title: 'MEP Training',
      description: 'Gain practical skills in Mechanical, Electrical and Plumbing systems for modern buildings and infrastructure.',
      image: 'mep-training.png',
      alt: 'Industrial mechanical systems and pipework',
    },
    {
      id: 'aws-networking',
      title: 'AWS & IT Networking',
      description: 'Build in-demand cloud computing and networking skills through practical labs, guided projects and industry-relevant training.',
      image: 'cloud-network-training.png',
      alt: 'Blue network cabling and server equipment',
    },
  ];

  protected readonly contact = {
    address: 'Near Tripunithura, Kochi, Ernakulam, Kerala – 682301',
    phone: '+91 6238 882299',
    phoneLink: '+916238882299',
  };

  ngOnInit(): void {
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.rotationTimer = setInterval(() => {
        if (!this.rotationPaused()) this.showSlide(this.activeSlide() + 1);
      }, 5000);
    }
  }

  ngOnDestroy(): void {
    if (this.rotationTimer) clearInterval(this.rotationTimer);
  }

  protected showSlide(index: number): void {
    this.activeSlide.set((index + this.heroSlides.length) % this.heroSlides.length);
  }

  protected pauseRotation(): void {
    this.rotationPaused.set(true);
  }

  protected resumeRotation(): void {
    this.rotationPaused.set(false);
  }

  protected handleCarouselKey(event: KeyboardEvent): void {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.showSlide(this.activeSlide() - 1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.showSlide(this.activeSlide() + 1);
    }
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }

  protected courseEnquiryHref(courseId: string, source: string): string {
    const courses: Record<string, string> = {
      hvac: 'HVAC',
      mep: 'MEP',
      'aws-networking': 'AWS',
      'warehouse-management': 'Warehouse Management',
      'hse-management': 'HSE',
    };
    const course = courses[courseId];
    return `/enquiry?course=${encodeURIComponent(course ?? '')}&source=${encodeURIComponent(course ? `${course} Course` : source)}`;
  }
}
