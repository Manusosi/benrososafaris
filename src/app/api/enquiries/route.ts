import { after } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import {
  dispatchEnquiryNotifications,
  type EnquiryNotificationPayload
} from '@/lib/enquiries/dispatch-enquiry-notifications';
import {
  sendGuestEnquiryConfirmationEmail,
  shouldSendGuestEnquiryConfirmation
} from '@/lib/email/send-guest-enquiry-confirmation';
import { checkEnquiryRateLimit, getClientIp } from '@/lib/security/enquiry-rate-limit';
import { isTurnstileConfigured, verifyTurnstileToken } from '@/lib/security/turnstile';
import {
  createEnquiryPublicClient,
  createServiceRoleClient,
  hasServiceRoleKey
} from '@/lib/supabase/service-role';

const securityFields = {
  turnstileToken: z.string().optional(),
  website: z.string().optional()
};

const baseFields = {
  email: z.string().email(),
  locale: z.string().default('en'),
  name: z.string().min(2),
  phone: z.string().optional(),
  sourcePath: z.string().optional()
};

// Only name + email are required here; every safari-quote entry point (the full
// contact form, the tour panel, the destination panel) enforces its own required
// fields client-side and sends a different subset. Keeping the API lenient means a
// lead is never dropped just because a lean form omits a field the full form asks for.
const safariQuoteSchema = z.object({
  ...baseFields,
  ...securityFields,
  adults: z.number().int().min(1).optional(),
  budget: z.string().optional(),
  budgetTier: z.string().optional(),
  children: z.number().int().min(0).default(0),
  country: z.string().optional(),
  destinations: z.string().optional(),
  enquiryType: z.literal('safari-quote'),
  infants: z.number().int().min(0).default(0),
  message: z.string().optional(),
  preferredDates: z.string().optional(),
  referralSource: z.string().optional(),
  travelEndDate: z.string().optional(),
  travelPlanningStage: z.string().optional(),
  travelStartDate: z.string().optional(),
  travelers: z.number().int().positive().optional(),
  tripType: z.string().optional()
});

const generalSchema = z.object({
  ...baseFields,
  ...securityFields,
  enquiryType: z.literal('general'),
  message: z.string().min(10),
  topic: z.string().min(1)
});

const otherSchema = z.object({
  ...baseFields,
  ...securityFields,
  bookingReference: z.string().optional(),
  enquiryType: z.literal('other'),
  message: z.string().min(10)
});

const enquirySchema = z.discriminatedUnion('enquiryType', [
  safariQuoteSchema,
  generalSchema,
  otherSchema
]);

const BUDGET_TIER_LABELS: Record<string, string> = {
  budget: 'Budget',
  economy: 'Economy',
  luxury: 'Luxury',
  'high-end': 'High End'
};

const TRAVEL_PLANNING_LABELS: Record<string, string> = {
  'booked-flights': 'I have booked flights and need help with experiences and or where to stay',
  'deciding-how-to-book': 'I am going on this trip and Deciding How to Book',
  'need-more-info': 'I need more information to decide, if this is my next trip'
};

const TRIP_TYPE_LABELS: Record<string, string> = {
  'beach-holiday': 'Beach Holiday',
  'culture-safari': 'Culture Safari',
  'family-holiday': 'Family Holiday',
  honeymoon: 'Honeymoon',
  'nature-wildlife': 'Nature and Wildlife'
};

const REFERRAL_LABELS: Record<string, string> = {
  friends: 'Friends feedback',
  other: 'Other',
  promotional: 'Promotional campaigns',
  social: 'Social networks'
};

function labelFor(map: Record<string, string>, value: string) {
  return map[value] ?? value;
}

function buildSafariMessage(data: z.infer<typeof safariQuoteSchema>) {
  const details = [
    data.destinations ? `Safari quote request for ${data.destinations}.` : 'Safari quote request.'
  ];

  if (data.preferredDates) details.push(`Travel dates: ${data.preferredDates}.`);
  if (data.budgetTier) {
    details.push(`Budget preference: ${labelFor(BUDGET_TIER_LABELS, data.budgetTier)}.`);
  }
  if (data.budget) details.push(`Tour budget per person: ${data.budget}.`);
  if (data.country) details.push(`Country of residence: ${data.country}.`);

  if (data.adults != null) {
    const total = data.travelers ? ` (${data.travelers} total)` : '';
    details.push(
      `Travelers: ${data.adults} adult(s), ${data.children} child(ren), ${data.infants} infant(s)${total}.`
    );
  } else if (data.travelers != null) {
    details.push(`Travelers: ${data.travelers} total.`);
  }

  if (data.travelPlanningStage) {
    details.push(`Travel planning: ${labelFor(TRAVEL_PLANNING_LABELS, data.travelPlanningStage)}.`);
  }
  if (data.tripType) details.push(`Trip type: ${labelFor(TRIP_TYPE_LABELS, data.tripType)}.`);
  if (data.referralSource) {
    details.push(`Referral source: ${labelFor(REFERRAL_LABELS, data.referralSource)}.`);
  }

  if (data.message?.trim()) {
    details.push('', data.message.trim());
  }

  return details.join('\n');
}

function buildFormData(data: z.infer<typeof enquirySchema>) {
  const base = {
    email: data.email,
    enquiryType: data.enquiryType,
    locale: data.locale,
    name: data.name,
    phone: data.phone ?? null,
    sourcePath: data.sourcePath ?? null
  };

  if (data.enquiryType === 'safari-quote') {
    return {
      ...base,
      adults: data.adults,
      budget: data.budget,
      budgetTier: data.budgetTier,
      children: data.children,
      country: data.country,
      destinations: data.destinations,
      infants: data.infants,
      message: data.message?.trim() || null,
      preferredDates: data.preferredDates,
      referralSource: data.referralSource ?? null,
      travelEndDate: data.travelEndDate ?? null,
      travelPlanningStage: data.travelPlanningStage,
      travelStartDate: data.travelStartDate ?? null,
      travelers: data.travelers,
      tripType: data.tripType
    };
  }

  if (data.enquiryType === 'general') {
    return {
      ...base,
      message: data.message,
      topic: data.topic
    };
  }

  return {
    ...base,
    bookingReference: data.bookingReference ?? null,
    message: data.message
  };
}

function buildNotificationPayload(
  data: z.infer<typeof enquirySchema>,
  message: string
): EnquiryNotificationPayload {
  return {
    adults: data.enquiryType === 'safari-quote' ? (data.adults ?? null) : null,
    bookingReference: data.enquiryType === 'other' ? (data.bookingReference ?? null) : null,
    budget: data.enquiryType === 'safari-quote' ? (data.budget ?? null) : null,
    budgetTier: data.enquiryType === 'safari-quote' ? (data.budgetTier ?? null) : null,
    children: data.enquiryType === 'safari-quote' ? data.children : null,
    country: data.enquiryType === 'safari-quote' ? (data.country ?? null) : null,
    destinations: data.enquiryType === 'safari-quote' ? (data.destinations ?? null) : null,
    email: data.email,
    enquiryType: data.enquiryType,
    infants: data.enquiryType === 'safari-quote' ? data.infants : null,
    locale: data.locale,
    message,
    name: data.name,
    phone: data.phone ?? null,
    preferredDates: data.enquiryType === 'safari-quote' ? (data.preferredDates ?? null) : null,
    referralSource: data.enquiryType === 'safari-quote' ? (data.referralSource ?? null) : null,
    sourcePath: data.sourcePath ?? null,
    topic: data.enquiryType === 'general' ? data.topic : null,
    travelPlanningStage:
      data.enquiryType === 'safari-quote' ? (data.travelPlanningStage ?? null) : null,
    travelers: data.enquiryType === 'safari-quote' ? (data.travelers ?? null) : null,
    tripType: data.enquiryType === 'safari-quote' ? (data.tripType ?? null) : null
  };
}

function buildEnquiryInsertRow(
  data: z.infer<typeof enquirySchema>,
  message: string,
  formData: ReturnType<typeof buildFormData>
) {
  return {
    booking_reference: data.enquiryType === 'other' ? (data.bookingReference ?? null) : null,
    budget:
      data.enquiryType === 'safari-quote'
        ? [data.budgetTier ? labelFor(BUDGET_TIER_LABELS, data.budgetTier) : null, data.budget]
            .filter(Boolean)
            .join(' | ') || null
        : null,
    country: data.enquiryType === 'safari-quote' ? data.country : null,
    destinations: data.enquiryType === 'safari-quote' ? data.destinations : null,
    email: data.email,
    enquiry_type: data.enquiryType,
    form_data: formData,
    locale: data.locale,
    message,
    name: data.name,
    phone: data.phone ?? null,
    preferred_dates: data.enquiryType === 'safari-quote' ? data.preferredDates : null,
    source_path: data.sourcePath ?? null,
    status: 'pending' as const,
    topic: data.enquiryType === 'general' ? data.topic : null,
    travelers: data.enquiryType === 'safari-quote' ? (data.travelers ?? null) : null
  };
}

async function persistEnquiry(
  data: z.infer<typeof enquirySchema>,
  message: string,
  formData: ReturnType<typeof buildFormData>
) {
  const row = buildEnquiryInsertRow(data, message, formData);

  if (hasServiceRoleKey()) {
    const supabase = createServiceRoleClient();
    return supabase.from('enquiries').insert(row).select('reference_code').single();
  }

  if (process.env.NODE_ENV === 'development') {
    console.warn(
      '[enquiries] SUPABASE_SERVICE_ROLE_KEY is not set; using submit_enquiry RPC fallback.'
    );
  }

  const supabase = createEnquiryPublicClient();

  return supabase.rpc('submit_enquiry', {
    p_booking_reference: row.booking_reference,
    p_budget: row.budget,
    p_country: row.country,
    p_destinations: row.destinations,
    p_email: row.email,
    p_enquiry_type: row.enquiry_type,
    p_form_data: row.form_data,
    p_locale: row.locale,
    p_message: row.message,
    p_name: row.name,
    p_phone: row.phone,
    p_preferred_dates: row.preferred_dates,
    p_source_path: row.source_path,
    p_topic: row.topic,
    p_travelers: row.travelers
  });
}

function extractReferenceCode(result: { data: unknown }): string | null {
  if (result.data && typeof result.data === 'object' && 'reference_code' in result.data) {
    return (result.data.reference_code as string | null) ?? null;
  }

  return null;
}

export async function POST(request: Request) {
  const clientIp = getClientIp(request);
  const rateLimit = checkEnquiryRateLimit(clientIp);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many enquiries from this connection. Please try again later.' },
      {
        headers: { 'Retry-After': String(rateLimit.retryAfterSec) },
        status: 429
      }
    );
  }

  const body = await request.json().catch(() => null);

  if (body && typeof body === 'object' && 'website' in body && body.website) {
    return NextResponse.json({ ok: true });
  }

  const parsed = enquirySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten() }, { status: 400 });
  }

  if (isTurnstileConfigured()) {
    const token = parsed.data.turnstileToken?.trim();

    if (!token) {
      return NextResponse.json(
        { error: 'Please complete the security check before submitting.' },
        { status: 400 }
      );
    }

    const verification = await verifyTurnstileToken(token, clientIp);

    if (!verification.ok) {
      return NextResponse.json(
        { error: 'Security check failed. Please try again.' },
        { status: 400 }
      );
    }
  }

  const message =
    parsed.data.enquiryType === 'safari-quote'
      ? buildSafariMessage(parsed.data)
      : parsed.data.message;

  const formData = buildFormData(parsed.data);

  let result;

  try {
    result = await persistEnquiry(parsed.data, message, formData);
  } catch (error) {
    console.error('[enquiries] Supabase client unavailable:', error);
    const devDetail =
      process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined;

    return NextResponse.json(
      {
        error: devDetail
          ? `Enquiry service misconfigured: ${devDetail}`
          : 'Enquiry service is temporarily unavailable. Please try again shortly.'
      },
      { status: 503 }
    );
  }

  const { error } = result;

  if (error) {
    console.error('[enquiries] insert failed:', error);
    const devDetail = process.env.NODE_ENV === 'development' ? error.message : undefined;

    return NextResponse.json(
      {
        error: devDetail
          ? `Unable to save enquiry: ${devDetail}`
          : 'Unable to save your enquiry. Please try again shortly.'
      },
      { status: 500 }
    );
  }

  const notificationPayload = buildNotificationPayload(parsed.data, message);
  const referenceCode = extractReferenceCode(result);

  after(async () => {
    await Promise.allSettled([
      dispatchEnquiryNotifications(notificationPayload),
      shouldSendGuestEnquiryConfirmation()
        ? sendGuestEnquiryConfirmationEmail({
            email: parsed.data.email,
            enquiryType: parsed.data.enquiryType,
            name: parsed.data.name,
            referenceCode,
            topic: parsed.data.enquiryType === 'general' ? parsed.data.topic : null
          })
        : Promise.resolve({ ok: false, skipped: true as const })
    ]);
  });

  return NextResponse.json({ ok: true });
}
