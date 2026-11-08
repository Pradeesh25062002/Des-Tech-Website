import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, firstValueFrom, of, throwError } from 'rxjs';
import { HomePage } from '../home';
import { environment } from '../../environments/environment';
import { EnquiryService } from './enquiry.service';
import { EnquiryPage } from './enquiry';

describe('EnquiryPage', () => {
  let queryParamMap: BehaviorSubject<URLSearchParams>;
  let submit: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    queryParamMap = new BehaviorSubject(new URLSearchParams());
    submit = vi.fn().mockReturnValue(of({ ok: true, saved: true, notificationSent: true }));
    await TestBed.configureTestingModule({
      imports: [EnquiryPage],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            queryParamMap: queryParamMap.asObservable(),
          },
        },
        { provide: EnquiryService, useValue: { submit } },
      ],
    }).compileComponents();
  });

  function createPage() {
    const fixture = TestBed.createComponent(EnquiryPage);
    fixture.componentInstance.ngOnInit();
    return fixture.componentInstance;
  }

  it('preselects only supported course query values and tracks an allowed source', () => {
    queryParamMap.next(new URLSearchParams('course=Warehouse%20Management&source=Warehouse%20Management%20Course'));
    const page = createPage();
    expect(page['form'].controls.course.value).toBe('Warehouse Management');
    expect(page['sourcePage']()).toBe('Warehouse Management Course');

    queryParamMap.next(new URLSearchParams('course=Unknown&source=made-up'));
    expect(page['form'].controls.course.value).toBe('');
    expect(page['sourcePage']()).toBe('Other');
  });

  it('requires all fields and accepts valid Indian mobile formats without rewriting them', () => {
    const page = createPage();
    const form = page['form'];
    expect(form.invalid).toBe(true);

    form.setValue({
      firstName: 'Asha',
      lastName: 'Kumar',
      qualification: 'B.Tech',
      course: 'HVAC',
      contactNumber: '1234567890',
      website: '',
    });
    expect(form.controls.contactNumber.invalid).toBe(true);

    form.controls.contactNumber.setValue('+91 9876543210');
    expect(form.controls.contactNumber.valid).toBe(true);
    expect(form.controls.contactNumber.value).toBe('+91 9876543210');
    expect(form.valid).toBe(true);
  });

  it('does not submit invalid form data', async () => {
    const page = createPage();
    await page['submitEnquiry']();
    expect(submit).not.toHaveBeenCalled();
    expect(page['submitted']()).toBe(false);
  });

  it('shows success only when the response confirms a saved enquiry', async () => {
    submit.mockReturnValueOnce(of({ ok: false, saved: false, notificationSent: false }));
    const page = createPage();
    page['form'].setValue({
      firstName: 'Asha',
      lastName: 'Kumar',
      qualification: 'B.Tech',
      course: 'HVAC',
      contactNumber: '9876543210',
      website: '',
    });

    await page['submitEnquiry']();
    expect(page['submitted']()).toBe(false);
    expect(page['submissionError']()).toContain('could not save');
    expect(page['form'].controls.firstName.value).toBe('Asha');

    submit.mockReturnValueOnce(of({ ok: true, saved: true, notificationSent: false }));
    await page['submitEnquiry']();
    expect(page['submitted']()).toBe(true);
    expect(page['notificationWarning']()).toBe(true);
  });

  it('keeps the form open and does not claim success when submission fails', async () => {
    submit.mockReturnValueOnce(throwError(() => new Error('network error')));
    const page = createPage();
    page['form'].setValue({
      firstName: 'Asha',
      lastName: 'Kumar',
      qualification: 'B.Tech',
      course: 'HVAC',
      contactNumber: '9876543210',
      website: '',
    });

    await page['submitEnquiry']();

    expect(page['submitted']()).toBe(false);
    expect(page['submissionError']()).toContain('could not submit');
    expect(page['form'].controls.firstName.value).toBe('Asha');
  });

  it('accepts a saved response from the Apps Script bridge origin', async () => {
    vi.spyOn(HTMLFormElement.prototype, 'submit').mockImplementation(() => {});
    const request = {
      firstName: 'Asha',
      lastName: 'Kumar',
      qualification: 'B.Tech' as const,
      course: 'HVAC' as const,
      contactNumber: '9876543210',
      sourcePage: 'Homepage',
      website: '',
    };
    const responsePromise = firstValueFrom(new EnquiryService().submit(request));
    const form = document.querySelector<HTMLFormElement>('form[target^="destech-enquiry-"]');
    expect(form).not.toBeNull();
    const nonce = form!.querySelector<HTMLInputElement>('input[name="nonce"]')!.value;
    const message = JSON.stringify({
      channel: 'destech-enquiry-response',
      nonce,
      response: { ok: true, saved: true, notificationSent: true },
    });

    window.dispatchEvent(new MessageEvent('message', { origin: 'https://attacker.example', data: message }));
    window.dispatchEvent(
      new MessageEvent('message', {
        origin: 'https://n-pt4kcdjpnejz3znoxehotjwijrl3aa2unvmp2sy-0lu-script.googleusercontent.com',
        data: message,
      }),
    );

    await expect(responsePromise).resolves.toMatchObject({ saved: true });
    vi.restoreAllMocks();
  });

  it('fails closed when the Apps Script deployment URL is not configured', async () => {
    const page = createPage();
    const service = new EnquiryService();
    const configuredUrl = environment.googleAppsScriptUrl;
    environment.googleAppsScriptUrl = '';
    const request = {
      firstName: 'Asha',
      lastName: 'Kumar',
      qualification: 'B.Tech' as const,
      course: 'HVAC' as const,
      contactNumber: '9876543210',
      sourcePage: 'Homepage',
      website: '',
    };
    try {
      await expect(firstValueFrom(service.submit(request))).rejects.toThrow(
        'ENQUIRY_ENDPOINT_NOT_CONFIGURED',
      );
      expect(page['submitted']()).toBe(false);
    } finally {
      environment.googleAppsScriptUrl = configuredUrl;
    }
  });

  it('uses the active home course for the hero Enquire Now link', () => {
    const page = new HomePage();
    expect(page['courseEnquiryHref']('hvac', 'Homepage')).toBe(
      '/enquiry?course=HVAC&source=HVAC%20Course',
    );
    expect(page['courseEnquiryHref']('warehouse-management', 'Homepage')).toBe(
      '/enquiry?course=Warehouse%20Management&source=Warehouse%20Management%20Course',
    );
  });
});
