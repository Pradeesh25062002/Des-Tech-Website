import { AfterViewInit, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

type Course = {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  duration: string[];
  mode: 'Offline Classes' | 'Online Classes';
  features: string[];
  image: string;
  alt: string;
  category: 'technical' | 'non-technical';
  placement?: boolean;
};

@Component({
  selector: 'app-courses',
  imports: [CommonModule],
  templateUrl: './courses.html',
  styleUrl: './courses.css',
})
export class CoursesPage implements AfterViewInit {
  protected readonly menuOpen = signal(false);
  protected readonly selectedCategory = signal<'technical' | 'non-technical'>('technical');
  protected readonly courses: Course[] = [
    {
      id: 'hvac', title: 'HVAC', subtitle: 'Heating, Ventilation and Air Conditioning',
      description: 'Learn installation, operation and maintenance of modern HVAC systems with hands-on lab experience.',
      duration: ['1 month classroom training', '1 month live project training'], mode: 'Offline Classes',
      features: ['Hands-on practical training', 'Live project exposure', 'Industry-aligned curriculum and career readiness'],
      image: 'hvac-hero.png', alt: 'Technician working on commercial HVAC equipment', category: 'technical', placement: true,
    },
    {
      id: 'mep', title: 'MEP', subtitle: 'Mechanical, Electrical and Plumbing',
      description: 'Gain practical skills in Mechanical, Electrical and Plumbing systems for modern buildings and infrastructure.',
      duration: ['2 months classroom training', '1 month live project training'], mode: 'Offline Classes',
      features: ['Hands-on practical training', 'Live project exposure', 'Industry-aligned curriculum and career readiness'],
      image: 'mep-training.png', alt: 'MEP ductwork, pipes and building-services equipment', category: 'technical', placement: true,
    },
    {
      id: 'aws-networking', title: 'AWS & IT Networking', subtitle: 'Cloud Computing and Networking',
      description: 'Build in-demand cloud computing and networking skills through practical labs, guided projects and expert-led training.',
      duration: ['Expert-led online training'], mode: 'Online Classes',
      features: ['Live online sessions by skilled professionals', 'Hands-on lab exercises and projects', 'Industry-relevant certification guidance'],
      image: 'cloud-network-training.png', alt: 'Cloud computing and networking lab with server racks', category: 'technical',
    },
    {
      id: 'warehouse-management', title: 'Warehouse Management',
      description: 'Learn warehouse operations, inventory control, stock management, order fulfilment and logistics processes used in modern supply chains. Explore how these functions support accurate stock movement, timely order processing and efficient day-to-day warehouse operations.',
      duration: ['Expert-led online training'], mode: 'Online Classes',
      features: ['Live online sessions by skilled professionals', 'Practical case studies and real-world scenarios', 'Inventory control and stock management', 'Order fulfilment and logistics processes', 'Industry-relevant knowledge and certification guidance'],
      image: 'warehouse-training.png', alt: 'Warehouse storage racks and inventory operations', category: 'non-technical',
    },
    {
      id: 'hse-management', title: 'Health, Safety and Environment (HSE) Management',
      description: 'Develop essential skills in workplace health and safety, hazard identification, risk assessment, environmental management and industry safety practices.',
      duration: ['Expert-led online training'], mode: 'Online Classes',
      features: ['Live online sessions by skilled professionals', 'Practical tools, frameworks and case studies', 'Industry-relevant knowledge and certification guidance'],
      image: 'hse-training.png', alt: 'Safety professional in protective equipment conducting a workplace assessment', category: 'non-technical',
    },
  ];

  protected readonly technicalCourses = this.courses.filter((course) => course.category === 'technical');
  protected readonly nonTechnicalCourses = this.courses.filter((course) => course.category === 'non-technical');
  protected readonly address = 'Near Tripunithura, Kochi, Ernakulam, Kerala – 682301';

  constructor(private readonly route: ActivatedRoute) {}

  ngAfterViewInit(): void {
    const fragment = this.route.snapshot.fragment;
    if (fragment === 'non-technical-courses') this.selectedCategory.set('non-technical');
    if (fragment) requestAnimationFrame(() => document.getElementById(fragment)?.scrollIntoView());
  }

  protected selectCategory(category: 'technical' | 'non-technical', event: MouseEvent): void {
    event.preventDefault();
    this.selectedCategory.set(category);
    const sectionId = category === 'technical' ? 'technical-courses' : 'non-technical-courses';
    history.pushState(null, '', `#${sectionId}`);
    document.getElementById(sectionId)?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'start',
    });
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }
}
