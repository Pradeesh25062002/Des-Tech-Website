import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EnquiryService } from './enquiry.service';
import { SiteFooterComponent } from '../shared/site-footer/site-footer';
import {
  EnquiryCourse,
  EnquiryRequest,
  EnquiryResponse,
  enquiryCourses,
  qualifications,
} from './enquiry.models';

const sourcePages = [
  'Homepage',
  'HVAC Course',
  'MEP Course',
  'Warehouse Management Course',
  'AWS Course',
  'HSE Course',
  'Courses Page',
  'About Page',
  'Contact Page',
  'Placements Page',
  'Student Stories Page',
  'Other',
] as const;

@Component({
  selector: 'app-enquiry',
  imports: [ReactiveFormsModule, RouterLink, SiteFooterComponent],
  templateUrl: './enquiry.html',
  styleUrl: './enquiry.css',
})
export class EnquiryPage implements OnInit {
  protected readonly menuOpen = signal(false);
  private readonly formBuilder = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly qualifications = qualifications;
  protected readonly courses = enquiryCourses;
  protected readonly submitting = signal(false);
  protected readonly submitted = signal(false);
  protected readonly notificationWarning = signal(false);
  protected readonly submissionError = signal('');
  protected readonly serverFieldErrors = signal<NonNullable<EnquiryResponse['fieldErrors']>>({});
  protected readonly sourcePage = signal<(typeof sourcePages)[number]>('Other');
  protected readonly form = this.formBuilder.nonNullable.group({
    firstName: ['', [Validators.required, Validators.maxLength(80), Validators.pattern(/\S/)]],
    lastName: ['', [Validators.required, Validators.maxLength(80), Validators.pattern(/\S/)]],
    qualification: ['', Validators.required],
    course: ['', Validators.required],
    contactNumber: [
      '',
      [Validators.required, Validators.maxLength(14), Validators.pattern(/^(?:\+91[\s-]?)?[6-9]\d{9}$/)],
    ],
    website: [''],
  });

  constructor(
    private readonly route: ActivatedRoute,
    private readonly enquiryService: EnquiryService,
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const course = params.get('course');
      if (course && (enquiryCourses as readonly string[]).includes(course)) {
        this.form.controls.course.setValue(course as EnquiryCourse);
      } else {
        this.form.controls.course.setValue('');
      }

      const source = params.get('source');
      this.sourcePage.set(
        source && (sourcePages as readonly string[]).includes(source)
          ? (source as (typeof sourcePages)[number])
          : 'Other',
      );
    });
  }

  protected hasError(field: 'firstName' | 'lastName' | 'qualification' | 'course' | 'contactNumber'):
    boolean {
    const control = this.form.controls[field];
    return (control.invalid && control.touched) || Boolean(this.serverFieldErrors()[field]);
  }

  protected fieldError(
    field: 'firstName' | 'lastName' | 'qualification' | 'course' | 'contactNumber',
    fallback: string,
  ): string {
    return this.serverFieldErrors()[field] || fallback;
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }

  protected async submitEnquiry(): Promise<void> {
    this.submissionError.set('');
    this.serverFieldErrors.set({});
    this.form.markAllAsTouched();
    if (this.form.invalid || this.submitting()) return;

    this.submitting.set(true);
    const values = this.form.getRawValue();
    const request: EnquiryRequest = {
      ...values,
      qualification: values.qualification as EnquiryRequest['qualification'],
      course: values.course as EnquiryCourse,
      sourcePage: this.sourcePage(),
    };

    try {
      const response = await new Promise<EnquiryResponse>((resolve, reject) => {
        this.enquiryService
          .submit(request)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({ next: resolve, error: reject });
      });

      if (!response || typeof response.saved !== 'boolean') {
        throw new Error('INVALID_ENQUIRY_RESPONSE');
      }
      if (!response.saved) {
        this.serverFieldErrors.set(response.fieldErrors ?? {});
        this.submissionError.set('We could not save your enquiry. Please check your details and try again.');
        return;
      }

      this.notificationWarning.set(response.notificationSent === false);
      this.submitted.set(true);
    } catch (error) {
      const code = error instanceof Error ? error.message : '';
      this.submissionError.set(
        code === 'ENQUIRY_ENDPOINT_NOT_CONFIGURED'
          ? 'Online enquiries are not configured yet. Please contact the academy directly, or try again later.'
          : 'We could not submit your enquiry right now. Your details are still here; please try again.',
      );
    } finally {
      this.submitting.set(false);
    }
  }
}
