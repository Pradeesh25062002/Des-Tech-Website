import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-placements',
  templateUrl: './placements.html',
  styleUrl: './placements.css',
})
export class PlacementsPage {
  protected readonly menuOpen = signal(false);
  protected readonly brands = [
    { name: 'Blue Star', image: 'placements/blue-star.png' },
    { name: 'Voltas', image: 'placements/voltas.png' },
    { name: 'Daikin', image: 'placements/daikin.png' },
    { name: 'Mitsubishi Electric', image: 'placements/mitsubishi-electric.png' },
    { name: 'Lloyd', image: 'placements/lloyd.png' },
  ];
  protected readonly steps = [
    { title: 'Skill Training', description: 'Industry-focused practical training.' },
    { title: 'Industry Readiness', description: 'Resume, interview and soft-skills support.' },
    { title: 'Company Connect', description: 'Opportunities with authorised industry partners.' },
    { title: 'Placement Support', description: 'Guidance until you join your role.' },
  ];
  protected readonly phones = [
    { display: '8590093998', href: 'tel:+918590093998' },
    { display: '8921219805', href: 'tel:+918921219805' },
  ];
  protected closeMenu(): void { this.menuOpen.set(false); }
}
