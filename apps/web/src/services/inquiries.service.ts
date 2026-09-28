import { api } from '@/lib/api';

export interface SubmitInquiryPayload {
  fullName: string;
  businessEmail: string;
  phone?: string;
  companyName?: string;
  serviceCategory?: string;
  projectDescription?: string;
  approxBudget?: string;
  urgencyTimeline?: string;
  ndaRequired?: boolean;
  recaptchaToken?: string;
}

export const inquiriesService = {
  /**
   * Submit client inquiry / project quote request
   */
  async submit(payload: SubmitInquiryPayload): Promise<any> {
    return api.post<any>('/inquiries', payload);
  },
};
