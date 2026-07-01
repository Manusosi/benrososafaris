export type SubscriberStatus = 'subscribed' | 'unsubscribed' | 'bounced';
export type CampaignStatus = 'draft' | 'sending' | 'sent' | 'failed';

export interface SubscriberRow {
  id: string;
  email: string;
  name: string | null;
  locale: string;
  status: SubscriberStatus;
  source: string | null;
  subscribedAt: string;
}

export interface SubscriberStats {
  total: number;
  subscribed: number;
  unsubscribed: number;
  /** Sign-ups in the last 30 days and the 30 days before that (for the trend). */
  signupsLast30: number;
  signupsPrev30: number;
  /** Unsubscribes in the last 30 days and the 30 days before that. */
  unsubLast30: number;
  unsubPrev30: number;
}

export interface CampaignRow {
  id: string;
  subject: string;
  preheader: string | null;
  bodyHtml: string | null;
  status: CampaignStatus;
  recipientCount: number;
  sentCount: number;
  sentAt: string | null;
  createdAt: string;
}

export interface SendCampaignResult {
  ok: boolean;
  sent: number;
  skipped?: boolean;
  error?: string;
}
