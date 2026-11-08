import { Routes } from '@angular/router';
import { AboutPage } from './about/about';
import { HomePage } from './home';
import { CoursesPage } from './courses/courses';
import { ContactPage } from './contact/contact';
import { PlacementsPage } from './placements/placements';
import { StudentStoriesPage } from './student-stories/student-stories';
import { EnquiryPage } from './enquiry/enquiry';

export const routes: Routes = [
  { path: '', component: HomePage, title: 'DES-TECH ACADEMY | Career-Focused Training' },
  { path: 'about', component: AboutPage, title: 'About DES-TECH ACADEMY' },
  { path: 'courses', component: CoursesPage, title: 'Courses | DES-TECH ACADEMY' },
  { path: 'contact', component: ContactPage, title: 'Contact | DES-TECH ACADEMY' },
  { path: 'placements', component: PlacementsPage, title: 'Placements | DES-TECH ACADEMY' },
  { path: 'student-stories', component: StudentStoriesPage, title: 'Student Stories | DES-TECH ACADEMY' },
  { path: 'enquiry', component: EnquiryPage, title: 'Course Enquiry | DES-TECH ACADEMY' },
  { path: '**', redirectTo: '' },
];
