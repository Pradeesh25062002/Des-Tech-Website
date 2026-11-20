import { Component } from '@angular/core';

@Component({
  selector: 'app-site-footer',
  templateUrl: './site-footer.html',
  styleUrl: './site-footer.css',
})
export class SiteFooterComponent {
  protected readonly address = [
    'Attaikulath Apartments,',
    'Cheruparambath Road,',
    'Kadavanthra, Ernakulam, Kerala.',
  ];

  protected readonly phones = [
    { display: '+91 8590093998', href: 'tel:+918590093998' },
    { display: '+91 8921219805', href: 'tel:+918921219805' },
  ];
}
