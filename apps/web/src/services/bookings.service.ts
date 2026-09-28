import { api } from '@/lib/api';

export interface CreateBookingPayload {
  date: string;
  slotTime: string;
  timezone: string;
  fullName: string;
  email: string;
  phone?: string;
  storeUrl?: string;
  notes?: string;
  recaptchaToken?: string;
}

export const bookingsService = {
  /**
   * Get real-time available discovery call slots for a specific date & timezone
   */
  async getAvailableSlots(date: string, timezone: string): Promise<any[]> {
    const res: any = await api.get('/bookings/available-slots', {
      date,
      timezone,
    });
    return Array.isArray(res) ? res : res?.data || res?.slots || [];
  },

  /**
   * Book discovery strategy session
   */
  async createBooking(payload: CreateBookingPayload): Promise<any> {
    return api.post<any>('/bookings', payload);
  },
};
