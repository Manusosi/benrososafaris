'use client';

import * as React from 'react';
import { useMutation } from '@tanstack/react-query';
import * as z from 'zod';

import { Icons } from '@/components/icons';
import { CountryCombobox } from '@/components/public/contact/country-combobox';
import { TravelDatePicker } from '@/components/ui/travel-date-picker';
import { useAppForm } from '@/components/ui/tanstack-form';
import { getCountryDialCode } from '@/constants/world-countries';
import { submitEnquiry } from '@/features/contact/api/service';
import { TurnstileField, useTurnstileGate } from '@/components/public/turnstile-field';
import { formatTravelDateRange } from '@/lib/travel-date-utils';
import { cn } from '@/lib/utils';

type TourInquiryPanelProps = {
  days: number | null;
  locale: string;
  nights: number | null;
  price: string | null;
  tourSlug: string;
  tourTitle: string;
};

const inquirySchema = z.object({
  adults: z.number().int().min(1, 'At least one adult is required'),
  budget: z.string(),
  budgetTier: z.string(),
  children: z.number().int().min(0),
  country: z.string().min(2, 'Country is required'),
  email: z.email('Enter a valid email'),
  infants: z.number().int().min(0),
  message: z.string(),
  name: z.string().min(2, 'Name is required'),
  phone: z.string().min(6, 'Phone number is required'),
  travelEndDate: z.string(),
  travelPlanningStage: z.string(),
  travelStartDate: z.string(),
  tripType: z.string()
});

const fieldClassName = 'benroso-contact-field mt-1.5';
const labelClassName = 'block text-sm font-bold text-[var(--benroso-heading)]';

const BUDGET_TIER_OPTIONS = [
  { label: 'Budget', value: 'budget' },
  { label: 'Economy', value: 'economy' },
  { label: 'Luxury', value: 'luxury' },
  { label: 'High End', value: 'high-end' }
] as const;

const TRAVEL_PLANNING_OPTIONS = [
  {
    label: 'I need more information to decide if this is my next trip',
    value: 'need-more-info'
  },
  {
    label: 'I am going on this trip and deciding how to book',
    value: 'deciding-how-to-book'
  },
  {
    label: 'I have booked flights and need help with experiences or where to stay',
    value: 'booked-flights'
  }
] as const;

const TRIP_TYPE_OPTIONS = [
  { label: 'Nature and Wildlife', value: 'nature-wildlife' },
  { label: 'Family Holiday', value: 'family-holiday' },
  { label: 'Honeymoon', value: 'honeymoon' },
  { label: 'Beach Holiday', value: 'beach-holiday' },
  { label: 'Culture Safari', value: 'culture-safari' }
] as const;

function stripNonDigits(value: string) {
  return value.replace(/\D/g, '');
}

function formatUsdBudget(amount: string) {
  return amount ? `USD ${Number(amount).toLocaleString('en-US')}` : undefined;
}

function formatTourDuration(days: number | null, nights: number | null) {
  if (!days) return null;
  return `${days} Days${nights ? ` / ${nights} Nights` : ''}`;
}

function buildInquiryMessage(
  values: z.infer<typeof inquirySchema>,
  tourTitle: string,
  tourSlug: string
) {
  const dates =
    values.travelStartDate && values.travelEndDate
      ? formatTravelDateRange(values.travelStartDate, values.travelEndDate)
      : 'Flexible / not provided';
  const travelers = values.adults + values.children + values.infants;

  const lines = [
    `Tour enquiry for ${tourTitle} (${tourSlug}).`,
    `Travel dates: ${dates}.`,
    `Travelers: ${travelers} (${values.adults} adults, ${values.children} children, ${values.infants} infants).`
  ];

  if (values.country) lines.push(`Country of residence: ${values.country}.`);
  if (values.phone?.trim()) lines.push(`Phone: ${values.phone.trim()}.`);
  if (values.budgetTier) lines.push(`Budget tier: ${values.budgetTier}.`);
  if (values.budget) lines.push(`Budget: ${formatUsdBudget(values.budget)} per person.`);
  if (values.travelPlanningStage) lines.push(`Planning stage: ${values.travelPlanningStage}.`);
  if (values.tripType) lines.push(`Trip type: ${values.tripType}.`);
  if (values.message?.trim()) lines.push('', values.message.trim());

  return lines.join('\n');
}

function FieldLabel({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <label className={labelClassName}>
      {label}
      {children}
    </label>
  );
}

function CounterStepper({
  label,
  min = 0,
  onBlur,
  onChange,
  value
}: {
  label: string;
  min?: number;
  onBlur?: () => void;
  onChange: (value: number) => void;
  value: number;
}) {
  return (
    <div>
      <span className={labelClassName}>{label}</span>
      <div className='benroso-traveler-stepper mt-1.5'>
        <button
          aria-label={`Decrease ${label}`}
          className='benroso-traveler-stepper-btn'
          disabled={value <= min}
          onBlur={onBlur}
          onClick={() => onChange(Math.max(min, value - 1))}
          type='button'
        >
          <Icons.minus className='h-4 w-4' />
        </button>
        <span aria-live='polite' className='benroso-traveler-stepper-value'>
          {value}
        </span>
        <button
          aria-label={`Increase ${label}`}
          className='benroso-traveler-stepper-btn'
          onBlur={onBlur}
          onClick={() => onChange(value + 1)}
          type='button'
        >
          <Icons.add className='h-4 w-4' />
        </button>
      </div>
    </div>
  );
}

function OptionField({
  label,
  name,
  onBlur,
  onChange,
  options,
  value
}: {
  label: string;
  name: string;
  onBlur?: () => void;
  onChange: (value: string) => void;
  options: ReadonlyArray<{ label: string; value: string }>;
  value: string;
}) {
  return (
    <FieldLabel label={label}>
      <select
        className={cn(fieldClassName, 'cursor-pointer')}
        name={name}
        onBlur={onBlur}
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        <option value=''>Select</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldLabel>
  );
}

function TourInquiryForm({
  locale,
  tourSlug,
  tourTitle
}: {
  locale: string;
  tourSlug: string;
  tourTitle: string;
}) {
  const [submitStatus, setSubmitStatus] = React.useState<'idle' | 'success' | 'error'>('idle');
  const turnstile = useTurnstileGate();

  const mutation = useMutation({
    mutationFn: submitEnquiry,
    onError: () => setSubmitStatus('error'),
    onSuccess: () => {
      setSubmitStatus('success');
      form.reset();
      turnstile.resetTurnstile();
    }
  });

  const form = useAppForm({
    defaultValues: {
      adults: 2,
      budget: '',
      budgetTier: '',
      children: 0,
      country: '',
      email: '',
      infants: 0,
      message: '',
      name: '',
      phone: '',
      travelEndDate: '',
      travelPlanningStage: '',
      travelStartDate: '',
      tripType: ''
    },
    validators: {
      onSubmit: inquirySchema
    },
    onSubmit: ({ value }) => {
      setSubmitStatus('idle');
      mutation.mutate({
        email: value.email,
        enquiryType: 'safari-quote',
        adults: value.adults,
        budget: formatUsdBudget(value.budget),
        budgetTier: value.budgetTier || undefined,
        children: value.children,
        country: value.country,
        infants: value.infants,
        locale,
        message: buildInquiryMessage(value, tourTitle, tourSlug),
        name: value.name,
        preferredDates:
          value.travelStartDate && value.travelEndDate
            ? formatTravelDateRange(value.travelStartDate, value.travelEndDate)
            : undefined,
        phone: value.phone || undefined,
        travelEndDate: value.travelEndDate || undefined,
        travelPlanningStage: value.travelPlanningStage || undefined,
        travelStartDate: value.travelStartDate || undefined,
        travelers: value.adults + value.children + value.infants,
        tripType: value.tripType || undefined,
        sourcePath: typeof window !== 'undefined' ? window.location.pathname : '',
        turnstileToken: turnstile.token ?? undefined
      });
    }
  });

  return (
    <form.AppForm>
      <form.Form className='mx-0 mt-0 gap-0 p-0'>
        <div className='space-y-4'>
          <form.AppField name='name'>
            {(field) => (
              <FieldLabel label='Full name *'>
                <input
                  className={fieldClassName}
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  required
                  value={field.state.value}
                />
                <field.FieldError />
              </FieldLabel>
            )}
          </form.AppField>

          <form.AppField name='email'>
            {(field) => (
              <FieldLabel label='Email *'>
                <input
                  className={fieldClassName}
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  required
                  type='email'
                  value={field.state.value}
                />
                <field.FieldError />
              </FieldLabel>
            )}
          </form.AppField>

          <form.AppField name='country'>
            {(field) => (
              <FieldLabel label='Nationality / Country *'>
                <CountryCombobox
                  onBlur={field.handleBlur}
                  onChange={(country) => {
                    field.handleChange(country);
                    const dialCode = getCountryDialCode(country);
                    if (dialCode) field.form.setFieldValue('phone', dialCode);
                  }}
                  value={field.state.value}
                />
                <field.FieldError />
              </FieldLabel>
            )}
          </form.AppField>

          <form.AppField name='phone'>
            {(field) => (
              <FieldLabel label='Phone *'>
                <input
                  className={fieldClassName}
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder='+254 712 345 678'
                  required
                  type='tel'
                  value={field.state.value}
                />
                <field.FieldError />
              </FieldLabel>
            )}
          </form.AppField>

          <div>
            <span className={labelClassName}>Travel dates</span>
            <form.AppField name='travelStartDate'>
              {(startField) => (
                <form.AppField name='travelEndDate'>
                  {(endField) => (
                    <div className='mt-1.5'>
                      <TravelDatePicker
                        endDate={endField.state.value}
                        endLabel='End of the journey:'
                        onEndDateChange={(value) => {
                          endField.handleChange(value);
                          endField.handleBlur();
                        }}
                        onStartDateChange={(value) => {
                          startField.handleChange(value);
                          startField.handleBlur();
                        }}
                        startDate={startField.state.value}
                        startLabel='Start of the journey:'
                      />
                    </div>
                  )}
                </form.AppField>
              )}
            </form.AppField>
          </div>

          <div className='grid gap-3 sm:grid-cols-3'>
            <form.AppField name='adults'>
              {(field) => (
                <>
                  <CounterStepper
                    label='Adults *'
                    min={1}
                    onBlur={field.handleBlur}
                    onChange={field.handleChange}
                    value={field.state.value}
                  />
                  <field.FieldError />
                </>
              )}
            </form.AppField>

            <form.AppField name='children'>
              {(field) => (
                <>
                  <CounterStepper
                    label='Children'
                    onBlur={field.handleBlur}
                    onChange={field.handleChange}
                    value={field.state.value}
                  />
                  <field.FieldError />
                </>
              )}
            </form.AppField>

            <form.AppField name='infants'>
              {(field) => (
                <>
                  <CounterStepper
                    label='Infants'
                    onBlur={field.handleBlur}
                    onChange={field.handleChange}
                    value={field.state.value}
                  />
                  <field.FieldError />
                </>
              )}
            </form.AppField>
          </div>

          <form.AppField name='budgetTier'>
            {(field) => (
              <OptionField
                label='Budget preference'
                name={field.name}
                onBlur={field.handleBlur}
                onChange={field.handleChange}
                options={BUDGET_TIER_OPTIONS}
                value={field.state.value}
              />
            )}
          </form.AppField>

          <form.AppField name='budget'>
            {(field) => (
              <FieldLabel label='Budget per person (USD)'>
                <input
                  className={fieldClassName}
                  inputMode='numeric'
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(stripNonDigits(event.target.value))}
                  placeholder='e.g. 3500'
                  value={field.state.value}
                />
              </FieldLabel>
            )}
          </form.AppField>

          <form.AppField name='travelPlanningStage'>
            {(field) => (
              <OptionField
                label='Travel planning stage'
                name={field.name}
                onBlur={field.handleBlur}
                onChange={field.handleChange}
                options={TRAVEL_PLANNING_OPTIONS}
                value={field.state.value}
              />
            )}
          </form.AppField>

          <form.AppField name='tripType'>
            {(field) => (
              <OptionField
                label='Trip type'
                name={field.name}
                onBlur={field.handleBlur}
                onChange={field.handleChange}
                options={TRIP_TYPE_OPTIONS}
                value={field.state.value}
              />
            )}
          </form.AppField>

          <form.AppField name='message'>
            {(field) => (
              <FieldLabel label='Notes'>
                <textarea
                  className={cn(fieldClassName, 'min-h-24 resize-y')}
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder='Tell us your preferred comfort level, dates, or questions.'
                  value={field.state.value}
                />
              </FieldLabel>
            )}
          </form.AppField>
        </div>

        <div className='mt-5 space-y-3'>
          <TurnstileField onTokenChange={turnstile.setToken} resetSignal={turnstile.resetSignal} />
          <form.SubmitButton
            className='w-full min-h-11 rounded-[var(--benroso-button-radius)] text-sm font-semibold uppercase tracking-[0.08em]'
            disabled={mutation.isPending || !turnstile.canSubmit}
          >
            {mutation.isPending ? 'Sending...' : 'Send Trip Enquiry'}
          </form.SubmitButton>
          <p className='text-xs text-[var(--benroso-muted)]'>
            No payment is collected here. We aim to respond within 24 hours.
          </p>
          {submitStatus === 'success' ? (
            <p className='text-sm text-[var(--benroso-primary)]'>
              Thank you. We will reply with a tailored quote shortly.
            </p>
          ) : null}
          {submitStatus === 'error' ? (
            <p className='text-sm text-red-700'>
              {mutation.error instanceof Error
                ? mutation.error.message
                : 'Something went wrong. Please try again.'}
            </p>
          ) : null}
        </div>
      </form.Form>
    </form.AppForm>
  );
}

export function TourInquiryPanel({
  days,
  locale,
  nights,
  price,
  tourSlug,
  tourTitle
}: TourInquiryPanelProps) {
  const [showForm, setShowForm] = React.useState(false);
  const formRef = React.useRef<HTMLDivElement>(null);
  const duration = formatTourDuration(days, nights);

  const scrollFormIntoView = React.useCallback(() => {
    requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }, []);

  const openForm = React.useCallback(() => {
    setShowForm(true);
    scrollFormIntoView();
  }, [scrollFormIntoView]);

  React.useEffect(() => {
    function handleOpenInquiry() {
      openForm();
    }

    window.addEventListener('benroso:open-tour-inquiry', handleOpenInquiry);
    return () => window.removeEventListener('benroso:open-tour-inquiry', handleOpenInquiry);
  }, [openForm]);

  function handleToggleForm() {
    setShowForm((current) => {
      if (!current) {
        requestAnimationFrame(() => {
          formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
      }
      return !current;
    });
  }

  return (
    <div className='space-y-4'>
      <div className='benroso-contact-credentials-box'>
        {duration ? (
          <p className='text-xs font-semibold uppercase tracking-wide text-[var(--benroso-muted)]'>
            {duration}
          </p>
        ) : null}
        {price ? (
          <p className='mt-2'>
            <span className='text-xs uppercase tracking-wide text-[var(--benroso-muted)]'>
              Price from
            </span>
            <strong className='font-price block text-3xl text-[var(--benroso-brown)]'>
              {price}
            </strong>
          </p>
        ) : (
          <p className='font-display text-2xl text-[var(--benroso-brown)]'>Custom quote</p>
        )}
        <p className='mt-4 text-sm leading-6 text-[var(--benroso-muted)]'>
          Request the exact quote for your dates, comfort level, and number of travelers.
        </p>
        <div className='mt-5 benroso-dual-actions'>
          <button
            aria-expanded={showForm}
            className={cn(
              'inline-flex items-center justify-center gap-2 rounded-[var(--benroso-button-radius)] px-5 py-3 text-sm font-semibold uppercase tracking-[0.08em] transition-colors',
              showForm
                ? 'border border-[var(--benroso-primary)] bg-[var(--benroso-primary)] text-white'
                : 'border border-[var(--benroso-lime)] bg-[var(--benroso-lime)] text-[var(--benroso-primary-dark)] hover:border-[var(--benroso-lime-hover)] hover:bg-[var(--benroso-lime-hover)]'
            )}
            onClick={handleToggleForm}
            type='button'
          >
            Enquire Now
            <Icons.chevronDown
              className={cn('size-4 transition-transform', showForm && 'rotate-180')}
            />
          </button>
          <a
            className='inline-flex items-center justify-center rounded-[var(--benroso-button-radius)] border border-[var(--benroso-line)] px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-[var(--benroso-primary)] transition hover:bg-[var(--benroso-ivory)]'
            href='#price-seasons'
          >
            View Cost Tables
          </a>
        </div>
      </div>

      {showForm ? (
        <div className='benroso-contact-credentials-box' ref={formRef}>
          <h3 className='benroso-heading font-display text-lg'>Plan this trip</h3>
          <p className='mt-1 text-sm text-[var(--benroso-muted)]'>{tourTitle}</p>
          <div className='mt-5'>
            <TourInquiryForm locale={locale} tourSlug={tourSlug} tourTitle={tourTitle} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
