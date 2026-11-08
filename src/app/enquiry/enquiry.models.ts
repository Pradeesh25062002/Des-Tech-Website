export const qualifications = ['Plus Two', 'Diploma', 'B.Tech', 'B.E', 'B.Sc', 'B.Com', 'Other'] as const;
export const enquiryCourses = ['HVAC', 'MEP', 'Warehouse Management', 'AWS', 'HSE'] as const;

export type Qualification = (typeof qualifications)[number];
export type EnquiryCourse = (typeof enquiryCourses)[number];

export interface EnquiryRequest {
  firstName: string;
  lastName: string;
  qualification: Qualification;
  course: EnquiryCourse;
  contactNumber: string;
  sourcePage: string;
  website: string;
}

export interface EnquiryResponse {
  ok: boolean;
  saved: boolean;
  notificationSent: boolean;
  enquiryId?: string;
  code?: string;
  fieldErrors?: Partial<
    Record<'firstName' | 'lastName' | 'qualification' | 'course' | 'contactNumber', string>
  >;
}
