'use client';

import * as React from 'react';
import { useMutation } from '@tanstack/react-query';
import * as z from 'zod';

import { Icons } from '@/components/icons';
import { TravelDatePicker } from '@/components/ui/travel-date-picker';
import { useAppForm } from '@/components/ui/tanstack-form';
import { submitEnquiry } from '@/features/contact/api/service';
import { formatTravelDateRange } from '@/lib/travel-date-utils';
import { cn } from '@/lib/utils';

type DestinationInquiryPanelProps = {
  destinationName: string;
  destinationSlug: string;
  country: string | null;
  locale: string;
};

const inquirySchema = z.object({
  email: z.email('Enter a valid email'),
  message: z.string().optional(),
  name: z.string().min(2, 'Name is required'),
  phone: z.string().optional(),
  travelers: z.number().int().min(1, 'At least one traveller is required'),
  travelEndDate: z.string().optional(),
  travelStartDate: z.string().optional()
});

const fieldClassName = 'benroso-contact-field mt-1.5';
const labelClassName = 'block text-sm font-bold text-[var(--benroso-heading)]';

function FormField({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <label className={labelClassName}>
      {label}
      {children}
    </label>
  );
}

function buildInquiryMessage(values: z.infer<typeof inquirySchema>, destinationName: string) {
  const lines = [`Safari enquiry about ${destinationName}.`, `Travellers: ${values.travelers}.`];

  if (values.travelStartDate) {
    lines.push(
      `Travel dates: ${formatTravelDateRange(values.travelStartDate, values.travelEndDate ?? '')}.`
    );
  }
  if (values.phone?.trim()) {
    lines.push(`Phone: ${values.phone.trim()}.`);
  }
  if (values.message?.trim()) {
    lines.push('', values.message.trim());
  }

  return lines.join('\n');
}

function DestinationInquiryForm({
  destinationName,
  destinationSlug,
  country,
  locale
}: DestinationInquiryPanelProps) {
  const [submitStatus, setSubmitStatus] = React.useState<'idle' | 'success' | 'error'>('idle');

  const mutation = useMutation({
    mutationFn: submitEnquiry,
    onSuccess: () => {
      setSubmitStatus('success');
      form.reset();
    },
    onError: () => setSubmitStatus('error')
  });

  const form = useAppForm({
    defaultValues: {
      email: '',
      message: '',
      name: '',
      phone: '',
      travelers: 2,
      travelEndDate: '',
      travelStartDate: ''
    },
    validators: {
      onSubmit: inquirySchema as any
    },
    onSubmit: ({ value }) => {
      setSubmitStatus('idle');
      mutation.mutate({
        country: country || undefined,
        destinations: destinationName,
        email: value.email,
        enquiryType: 'safari-quote',
        locale,
        message: buildInquiryMessage(value, destinationName),
        name: value.name,
        phone: value.phone || undefined,
        preferredDates: value.travelStartDate
          ? formatTravelDateRange(value.travelStartDate, value.travelEndDate || '')
          : undefined,
        sourcePath: typeof window !== 'undefined' ? window.location.pathname : '',
        travelers: value.travelers
      });
    }
  });

  return (
    <form.AppForm>
      <form.Form className='mx-0 mt-0 gap-0 p-0'>
        <input name='destination' type='hidden' value={destinationSlug} />
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
            <span className={labelClassName}>Preferred travel dates (optional)</span>
            <form.AppField name='travelStartDate'>
              {(startField) => (
                <form.AppField name='travelEndDate'>
                  {(endField) => (
                    <div className='mt-1.5'>
                      <TravelDatePicker
                        endDate={endField.state.value}
                        endLabel='Return:'
                        onEndDateChange={(value) => {
                          endField.handleChange(value);
                          endField.handleBlur();
                        }}
                        onStartDateChange={(value) => {
                          startField.handleChange(value);
                          startField.handleBlur();
                        }}
                        startDate={startField.state.value}
                        startLabel='Depart:'
                        variant='compact'
                      />
                    </div>
                  )}
                </form.AppField>
              )}
            </form.AppField>
          </div>

          <form.AppField name='travelers'>
            {(field) => (
              <div>
                <span className={labelClassName}>Travellers *</span>
                <div className='benroso-traveler-stepper mt-1.5'>
                  <button
                    aria-label='Decrease travellers'
                    className='benroso-traveler-stepper-btn'
                    disabled={field.state.value <= 1}
                    onClick={() => field.handleChange(Math.max(1, field.state.value - 1))}
                    type='button'
                  >
                    <Icons.minus className='h-4 w-4' />
                  </button>
                  <span aria-live='polite' className='benroso-traveler-stepper-value'>
                    {field.state.value}
                  </span>
                  <button
                    aria-label='Increase travellers'
                    className='benroso-traveler-stepper-btn'
                    onClick={() => field.handleChange(field.state.value + 1)}
                    type='button'
                  >
                    <Icons.add className='h-4 w-4' />
                  </button>
                </div>
                <field.FieldError />
              </div>
            )}
          </form.AppField>

          <form.AppField name='message'>
            {(field) => (
              <FormField label='Your message (optional)'>
                <textarea
                  className={cn(fieldClassName, 'min-h-24 resize-y')}
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder='Tell us what you would like to see and do on this safari.'
                  value={field.state.value}
                />
              </FormField>
            )}
          </form.AppField>
        </div>

        <div className='mt-5 space-y-3'>
          <form.SubmitButton
            className={cn(
              'w-full min-h-11 rounded-[var(--benroso-button-radius)] text-sm font-semibold uppercase tracking-[0.08em] shadow-none',
              '!border-[var(--benroso-lime)] !bg-[var(--benroso-lime)] !text-[var(--benroso-primary-dark)]',
              'hover:!border-[var(--benroso-lime-hover)] hover:!bg-[var(--benroso-lime-hover)] hover:!text-[var(--benroso-primary-dark)]'
            )}
            disabled={mutation.isPending}
            variant='outline'
          >
            {mutation.isPending ? 'Sending...' : 'Send Enquiry'}
          </form.SubmitButton>
          <p className='text-xs text-[var(--benroso-muted)]'>
            No payment is collected here. We aim to respond within 24 hours.
          </p>
          {submitStatus === 'success' ? (
            <p className='text-sm text-[var(--benroso-primary)]'>
              Thank you for your enquiry. Our safari team will be in touch shortly.
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

export function DestinationInquiryPanel(props: DestinationInquiryPanelProps) {
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
      <div className='rounded-[var(--benroso-radius)] border border-[var(--benroso-line)] bg-white p-6 shadow-sm'>
        <p className='text-xs font-semibold uppercase tracking-wide text-[var(--benroso-muted)]'>
          Plan your trip
        </p>
        <p className='mt-1 font-display text-2xl text-[var(--benroso-brown)]'>
          Visit {props.destinationName}
        </p>
        <p className='mt-2 text-sm leading-6 text-[var(--benroso-muted)]'>
          Tell us your dates and group size and our safari experts will build a tailor-made
          itinerary for this destination.
        </p>
        <div className='mt-6'>
          {/* Same animated fill as the homepage "Discover Our Story" button (section 2):
              a lime layer wipes in from the left on hover, white text stays. */}
          <button
            aria-expanded={showForm}
            className='benroso-fill-hover inline-flex w-full items-center justify-center gap-2 rounded-[var(--benroso-button-radius)] border border-[var(--benroso-primary)] bg-[var(--benroso-primary)] px-6 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-white transition-colors duration-200'
            onClick={handleToggleForm}
            type='button'
          >
            Enquire About This Destination
            <Icons.chevronDown
              className={cn('size-4 transition-transform', showForm && 'rotate-180')}
            />
          </button>
        </div>
      </div>

      {showForm ? (
        <div
          className='rounded-[var(--benroso-radius)] border border-[var(--benroso-line)] bg-white p-6 shadow-sm'
          ref={formRef}
        >
          <h2 className='benroso-heading font-display text-lg'>Start your enquiry</h2>
          <p className='mt-1 text-sm text-[var(--benroso-muted)]'>
            Enquiring about{' '}
            <strong className='text-[var(--benroso-ink)]'>{props.destinationName}</strong>
          </p>
          <div className='mt-5'>
            <DestinationInquiryForm {...props} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
