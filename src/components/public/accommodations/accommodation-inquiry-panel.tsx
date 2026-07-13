'use client';

import * as React from 'react';
import { useMutation } from '@tanstack/react-query';
import * as z from 'zod';

import { Icons } from '@/components/icons';
import { TravelDatePicker } from '@/components/ui/travel-date-picker';
import { useAppForm } from '@/components/ui/tanstack-form';
import { submitEnquiry } from '@/features/contact/api/service';
import { TurnstileField, useTurnstileGate } from '@/components/public/turnstile-field';
import { formatTravelDateRange } from '@/lib/travel-date-utils';
import { cn } from '@/lib/utils';

type AccommodationInquiryPanelProps = {
  accommodationName: string;
  accommodationSlug: string;
  availabilityLabel: string;
  locale: string;
  price: string | null;
};

const inquirySchema = z.object({
  email: z.email('Enter a valid email'),
  guests: z.number().int().min(1, 'At least one guest is required'),
  message: z.string().optional(),
  name: z.string().min(2, 'Name is required'),
  phone: z.string().optional(),
  rooms: z.number().int().min(1, 'At least one room is required'),
  travelEndDate: z.string().min(1, 'Select a check-out date'),
  travelStartDate: z.string().min(1, 'Select a check-in date')
});

const fieldClassName = 'benroso-contact-field mt-1.5';

const labelClassName = 'block text-sm font-bold text-[var(--benroso-heading)]';

function FormField({
  children,
  className,
  label
}: {
  children: React.ReactNode;
  className?: string;
  label: string;
}) {
  return (
    <label className={cn(labelClassName, className)}>
      {label}
      {children}
    </label>
  );
}

function GuestStepper({
  label,
  min = 1,
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

function buildInquiryMessage(
  values: z.infer<typeof inquirySchema>,
  accommodationName: string,
  accommodationSlug: string
) {
  const dates = formatTravelDateRange(values.travelStartDate, values.travelEndDate);
  const lines = [
    `Accommodation availability enquiry for ${accommodationName} (${accommodationSlug}).`,
    `Travel dates: ${dates}.`,
    `Guests: ${values.guests}.`,
    `Rooms: ${values.rooms}.`
  ];

  if (values.phone?.trim()) {
    lines.push(`Phone: ${values.phone.trim()}.`);
  }

  if (values.message?.trim()) {
    lines.push('', values.message.trim());
  }

  return lines.join('\n');
}

function AccommodationInquiryForm({
  accommodationName,
  accommodationSlug,
  locale
}: {
  accommodationName: string;
  accommodationSlug: string;
  locale: string;
}) {
  const [submitStatus, setSubmitStatus] = React.useState<'idle' | 'success' | 'error'>('idle');
  const turnstile = useTurnstileGate();

  const mutation = useMutation({
    mutationFn: submitEnquiry,
    onSuccess: () => {
      setSubmitStatus('success');
      form.reset();
      turnstile.resetTurnstile();
    },
    onError: () => {
      setSubmitStatus('error');
    }
  });

  const form = useAppForm({
    defaultValues: {
      email: '',
      guests: 2,
      message: '',
      name: '',
      phone: '',
      rooms: 1,
      travelEndDate: '',
      travelStartDate: ''
    },
    validators: {
      onSubmit: inquirySchema as any
    },
    onSubmit: ({ value }) => {
      setSubmitStatus('idle');

      mutation.mutate({
        email: value.email,
        enquiryType: 'other',
        locale,
        message: buildInquiryMessage(value, accommodationName, accommodationSlug),
        name: value.name,
        phone: value.phone || undefined,
        sourcePath: typeof window !== 'undefined' ? window.location.pathname : '',
        turnstileToken: turnstile.token ?? undefined
      });
    }
  });

  return (
    <form.AppForm>
      <form.Form className='mx-0 mt-0 gap-0 p-0'>
        <input name='accommodation' type='hidden' value={accommodationSlug} />

        <div className='space-y-4'>
          <div className='grid gap-4 sm:grid-cols-2'>
            <form.AppField name='name'>
              {(field) => (
                <FormField label='Full name *'>
                  <input
                    className={fieldClassName}
                    name={field.name}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    required
                    value={field.state.value}
                  />
                  <field.FieldError />
                </FormField>
              )}
            </form.AppField>

            <form.AppField name='email'>
              {(field) => (
                <FormField label='Email *'>
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
                </FormField>
              )}
            </form.AppField>
          </div>

          <form.AppField name='phone'>
            {(field) => (
              <FormField label='Phone (optional)'>
                <input
                  className={fieldClassName}
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder='+254 712 345 678 (include country code)'
                  type='tel'
                  value={field.state.value}
                />
                <field.FieldError />
              </FormField>
            )}
          </form.AppField>

          <div>
            <span className={labelClassName}>Travel dates *</span>
            <form.AppField name='travelStartDate'>
              {(startField) => (
                <form.AppField name='travelEndDate'>
                  {(endField) => (
                    <div className='mt-1.5'>
                      <TravelDatePicker
                        endDate={endField.state.value}
                        endLabel='Check-out:'
                        onEndDateChange={(value) => {
                          endField.handleChange(value);
                          endField.handleBlur();
                        }}
                        onStartDateChange={(value) => {
                          startField.handleChange(value);
                          startField.handleBlur();
                        }}
                        startDate={startField.state.value}
                        startLabel='Check-in:'
                        variant='compact'
                      />
                      <startField.FieldError />
                      <endField.FieldError />
                    </div>
                  )}
                </form.AppField>
              )}
            </form.AppField>
          </div>

          <div className='grid gap-4 sm:grid-cols-2'>
            <form.AppField name='guests'>
              {(field) => (
                <>
                  <GuestStepper
                    label='Guests *'
                    min={1}
                    onBlur={field.handleBlur}
                    onChange={field.handleChange}
                    value={field.state.value}
                  />
                  <field.FieldError />
                </>
              )}
            </form.AppField>

            <form.AppField name='rooms'>
              {(field) => (
                <>
                  <GuestStepper
                    label='Rooms *'
                    min={1}
                    onBlur={field.handleBlur}
                    onChange={field.handleChange}
                    value={field.state.value}
                  />
                  <field.FieldError />
                </>
              )}
            </form.AppField>
          </div>

          <form.AppField name='message'>
            {(field) => (
              <FormField label='Notes (optional)'>
                <textarea
                  className={cn(fieldClassName, 'min-h-24 resize-y')}
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder='Special requests, dietary needs, or questions about this property.'
                  value={field.state.value}
                />
              </FormField>
            )}
          </form.AppField>
        </div>

        <div className='mt-5 space-y-3'>
          <TurnstileField onTokenChange={turnstile.setToken} resetSignal={turnstile.resetSignal} />
          <form.SubmitButton
            className={cn(
              'w-full min-h-11 rounded-[var(--benroso-button-radius)] text-sm font-semibold uppercase tracking-[0.08em] shadow-none',
              '!border-[var(--benroso-lime)] !bg-[var(--benroso-lime)] !text-[var(--benroso-primary-dark)]',
              'hover:!border-[var(--benroso-lime-hover)] hover:!bg-[var(--benroso-lime-hover)] hover:!text-[var(--benroso-primary-dark)]'
            )}
            disabled={mutation.isPending || !turnstile.canSubmit}
            variant='outline'
          >
            {mutation.isPending ? 'Sending...' : 'Send Enquiry'}
          </form.SubmitButton>
          <p className='text-xs text-[var(--benroso-muted)]'>
            No payment is collected here. We aim to respond within 24 hours.
          </p>
          {submitStatus === 'success' ? (
            <p className='text-sm text-[var(--benroso-primary)]'>
              Thank you for your enquiry. We will be in touch shortly with availability.
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

export function AccommodationInquiryPanel({
  accommodationName,
  accommodationSlug,
  availabilityLabel,
  locale,
  price
}: AccommodationInquiryPanelProps) {
  const [showForm, setShowForm] = React.useState(false);
  const formRef = React.useRef<HTMLDivElement>(null);

  function handleToggleForm() {
    setShowForm((current) => {
      const next = !current;
      if (next) {
        requestAnimationFrame(() => {
          formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
      }
      return next;
    });
  }

  return (
    <div className='space-y-4'>
      <div className='benroso-contact-credentials-box'>
        {price ? (
          <div>
            <p className='text-xs font-semibold uppercase tracking-wide text-[var(--benroso-muted)]'>
              From
            </p>
            <p className='mt-1 font-price text-3xl text-[var(--benroso-brown)]'>{price}</p>
            <p className='text-sm text-[var(--benroso-muted)]'>per night (USD)</p>
          </div>
        ) : (
          <p className='font-display text-2xl text-[var(--benroso-brown)]'>Price on request</p>
        )}

        <p className='mt-4 text-sm font-semibold text-[var(--benroso-ink)]'>{availabilityLabel}</p>
        <p className='mt-2 text-sm leading-6 text-[var(--benroso-muted)]'>
          No payment is taken here. Our team will confirm availability and rates for your dates.
        </p>

        <div className='mt-6'>
          <button
            aria-expanded={showForm}
            className={cn(
              'inline-flex w-full items-center justify-center gap-2 rounded-[var(--benroso-button-radius)] px-6 py-3 text-sm font-semibold uppercase tracking-[0.08em] transition-colors',
              showForm
                ? 'border border-[var(--benroso-primary)] bg-[var(--benroso-primary)] text-white hover:border-[var(--benroso-primary-dark)] hover:bg-[var(--benroso-primary-dark)]'
                : 'border border-[var(--benroso-lime)] bg-[var(--benroso-lime)] text-[var(--benroso-primary-dark)] hover:border-[var(--benroso-lime-hover)] hover:bg-[var(--benroso-lime-hover)]'
            )}
            onClick={handleToggleForm}
            type='button'
          >
            Inquire Availability
            <Icons.chevronDown
              className={cn('size-4 transition-transform', showForm && 'rotate-180')}
            />
          </button>
        </div>
      </div>

      {showForm ? (
        <div className='benroso-contact-credentials-box' ref={formRef}>
          <h2 className='benroso-heading font-display text-lg'>Check availability</h2>
          <p className='mt-1 text-sm text-[var(--benroso-muted)]'>
            Enquiring about{' '}
            <strong className='text-[var(--benroso-ink)]'>{accommodationName}</strong>
          </p>
          <div className='mt-5'>
            <AccommodationInquiryForm
              accommodationName={accommodationName}
              accommodationSlug={accommodationSlug}
              locale={locale}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
