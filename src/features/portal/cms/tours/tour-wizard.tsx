'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';

import { revalidateLogic, useStore } from '@tanstack/react-form';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Icons } from '@/components/icons';
import { useAppForm } from '@/components/ui/tanstack-form';
import { useFormStepper } from '@/hooks/use-stepper';
import { slugify } from '@/lib/utils';
import { getMediaByIds } from '../media/api/client';
import { mediaKeys } from '../media/api/queries';
import { MediaGalleryField } from '../media/components/media-picker';
import { SEO_LIMITS } from '../seo/analyze';
import { KeywordInput } from '../seo/components/keyword-input';
import { SeoAnalyzer } from '../seo/components/seo-analyzer';
import { FaqInput } from '../shared/faq-input';
import { HighlightsInput } from '../shared/highlights-input';
import { MultiCombobox } from '../shared/multi-combobox';
import { htmlToText, RichTextEditor } from '../shared/rich-text-editor';
import { WizardShell, type WizardPendingAction } from '../shared/wizard-shell';
import { ExperiencePricingSelector } from './experience-pricing-selector';
import {
  emptyTourValues,
  tourFormSchema,
  tourStepSchemas,
  tourWizardSteps,
  type ItineraryDay,
  type RouteLeg,
  type TourFormValues
} from './schema';
import { saveTour, type RelationOption, type SaveStatus } from './service';

interface TourWizardProps {
  id?: string;
  initialValues?: TourFormValues;
  options: {
    parks: RelationOption[];
    destinations: RelationOption[];
    experiences: RelationOption[];
    accommodations: RelationOption[];
    fleet: RelationOption[];
  };
}

function ItineraryInput({
  value,
  onChange
}: {
  value: ItineraryDay[];
  onChange: (next: ItineraryDay[]) => void;
}) {
  function addDay() {
    onChange([...value, { day: value.length + 1, title: '', description: '' }]);
  }
  function updateDay(index: number, patch: Partial<ItineraryDay>) {
    onChange(value.map((day, i) => (i === index ? { ...day, ...patch } : day)));
  }
  function removeDay(index: number) {
    onChange(value.filter((_, i) => i !== index).map((day, i) => ({ ...day, day: i + 1 })));
  }

  return (
    <div className='grid gap-4'>
      {value.map((day, index) => (
        <div key={index} className='rounded-lg border p-4'>
          <div className='mb-3 flex items-center justify-between'>
            <span className='text-sm font-semibold'>Day {day.day}</span>
            <Button type='button' size='sm' variant='ghost' onClick={() => removeDay(index)}>
              <Icons.trash className='size-4' />
            </Button>
          </div>
          <div className='grid gap-3'>
            <Input
              value={day.title}
              onChange={(event) => updateDay(index, { title: event.target.value })}
              placeholder='Day title — e.g. Nairobi to Masai Mara'
            />
            <Textarea
              value={day.description}
              onChange={(event) => updateDay(index, { description: event.target.value })}
              placeholder='What happens on this day…'
              rows={3}
            />
          </div>
        </div>
      ))}
      <Button
        type='button'
        variant='outline'
        size='sm'
        onClick={addDay}
        className='justify-self-start'
      >
        <Icons.add className='mr-2 size-4' />
        Add day
      </Button>
    </div>
  );
}

function RouteLegsInput({
  endLocation,
  onChange,
  startLocation,
  value
}: {
  endLocation: string;
  onChange: (next: RouteLeg[]) => void;
  startLocation: string;
  value: RouteLeg[];
}) {
  function addLeg() {
    const previousTo = value[value.length - 1]?.to;
    onChange([
      ...value,
      {
        from: previousTo || startLocation || '',
        to: value.length ? '' : endLocation || ''
      }
    ]);
  }

  function updateLeg(index: number, patch: Partial<RouteLeg>) {
    onChange(value.map((leg, i) => (i === index ? { ...leg, ...patch } : leg)));
  }

  function removeLeg(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  return (
    <div className='rounded-lg border p-4'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <h3 className='text-sm font-semibold'>Route legs</h3>
        <Button type='button' size='sm' variant='outline' onClick={addLeg}>
          <Icons.add className='mr-2 size-4' />
          Add leg
        </Button>
      </div>

      {value.length ? (
        <div className='mt-4 grid gap-3'>
          {value.map((leg, index) => (
            <div
              className='grid gap-3 rounded-md border bg-background p-3 md:grid-cols-[1fr_1fr_auto]'
              key={index}
            >
              <div className='grid gap-1.5'>
                <Label htmlFor={`route-leg-from-${index}`}>From</Label>
                <Input
                  id={`route-leg-from-${index}`}
                  value={leg.from}
                  onChange={(event) => updateLeg(index, { from: event.target.value })}
                  placeholder='e.g. Nairobi'
                />
              </div>
              <div className='grid gap-1.5'>
                <Label htmlFor={`route-leg-to-${index}`}>To</Label>
                <Input
                  id={`route-leg-to-${index}`}
                  value={leg.to}
                  onChange={(event) => updateLeg(index, { to: event.target.value })}
                  placeholder='e.g. Lake Naivasha'
                />
              </div>
              <Button
                className='self-end'
                type='button'
                size='icon'
                variant='ghost'
                onClick={() => removeLeg(index)}
              >
                <Icons.trash className='size-4' />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <p className='mt-4 text-sm text-muted-foreground'>
          Optional — add legs for multi-stop routes, or rely on start/end above.
        </p>
      )}
    </div>
  );
}

function RoutePreview({
  destinations,
  values
}: {
  destinations: RelationOption[];
  values: TourFormValues;
}) {
  const stops = buildWizardRouteStops(values, destinations);
  const mapSrc = buildWizardMapSrc(values.routeLegs, values.startLocation, values.endLocation);

  return (
    <div className='rounded-lg border bg-muted/20 p-4'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <h3 className='text-sm font-semibold'>Route preview</h3>
        {stops.length ? (
          <span className='text-xs text-muted-foreground'>
            {stops.length} stop{stops.length === 1 ? '' : 's'}
          </span>
        ) : null}
      </div>
      {stops.length ? (
        <ol className='mt-4 grid gap-3 sm:grid-cols-2'>
          {stops.map((stop, index) => (
            <li className='flex gap-3 rounded-md border bg-background p-3' key={stop.key}>
              <span className='flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground'>
                {index + 1}
              </span>
              <span className='min-w-0'>
                <span className='block text-[11px] font-medium uppercase tracking-wide text-muted-foreground'>
                  {stop.label}
                </span>
                <span className='block truncate text-sm font-medium'>{stop.value}</span>
              </span>
            </li>
          ))}
        </ol>
      ) : (
        <p className='mt-3 text-sm text-muted-foreground'>
          Fill in start/end locations or route legs to see the map.
        </p>
      )}
      {mapSrc ? (
        <div className='mt-4 overflow-hidden rounded-md border bg-background'>
          <iframe
            className='h-56 w-full'
            loading='lazy'
            referrerPolicy='no-referrer-when-downgrade'
            sandbox='allow-forms allow-popups allow-scripts'
            src={mapSrc}
            title='Route map preview'
          />
        </div>
      ) : null}
    </div>
  );
}

export function TourWizard({ id, initialValues, options }: TourWizardProps) {
  const router = useRouter();
  const [pendingAction, setPendingAction] = React.useState<WizardPendingAction>(null);

  const autoSlugRef = React.useRef(!id);
  const autoTitleRef = React.useRef(!id);
  const autoDaysRef = React.useRef(!id);
  const autoNightsRef = React.useRef(!id);

  const {
    currentStep,
    isFirstStep,
    step,
    currentValidator,
    handleNextStepOrSubmit,
    handleCancelOrBack
  } = useFormStepper(tourStepSchemas);

  const form = useAppForm({
    defaultValues: initialValues ?? emptyTourValues,
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: currentValidator as typeof tourFormSchema
    },
    onSubmit: () => {
      // Submission is driven explicitly by Save draft / Publish below.
    }
  });

  const values = useStore(form.store, (state) => state.values);

  const { data: galleryAssets = [] } = useQuery({
    queryKey: [...mediaKeys.all, 'byIds', values.gallery],
    queryFn: () => getMediaByIds(values.gallery),
    enabled: values.gallery.length > 0
  });
  const imagesWithAlt = galleryAssets.filter((asset) => (asset.alt ?? '').trim().length > 0).length;

  async function persist(status: SaveStatus) {
    const schema = status === 'published' ? tourFormSchema : tourStepSchemas[0];
    const parsed = schema.safeParse(values);

    if (!parsed.success) {
      await form.handleSubmit();
      toast.error(
        status === 'published'
          ? 'Fix the highlighted fields before publishing.'
          : 'Add a title and slug to save a draft.'
      );
      return;
    }

    setPendingAction(status === 'published' ? 'publish' : 'draft');
    try {
      await saveTour({ id, values, status });
      toast.success(status === 'published' ? 'Tour published.' : 'Draft saved.');
      router.push('/portal/tours');
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Something went wrong. Please try again.'
      );
    } finally {
      setPendingAction(null);
    }
  }

  return (
    <form.AppForm>
      <WizardShell
        steps={tourWizardSteps}
        currentStep={currentStep}
        isFirstStep={isFirstStep}
        isLastStep={step.isCompleted}
        pendingAction={pendingAction}
        onBack={() => handleCancelOrBack({ onBack: () => {} })}
        onNext={() => void handleNextStepOrSubmit(form)}
        onSaveDraft={() => void persist('draft')}
        onPublish={() => void persist('published')}
      >
        {currentStep === 1 ? (
          <div className='grid gap-4'>
            <form.AppField
              name='title'
              listeners={{
                onChange: ({ value }) => {
                  if (autoSlugRef.current) form.setFieldValue('slug', slugify(value));
                  if (autoTitleRef.current) form.setFieldValue('seoTitle', value);
                  const parsedDays = parseDaysFromTitle(value);
                  if (parsedDays !== null) {
                    if (autoDaysRef.current) form.setFieldValue('days', String(parsedDays));
                    if (autoNightsRef.current) {
                      form.setFieldValue('nights', String(Math.max(0, parsedDays - 1)));
                    }
                  }
                }
              }}
            >
              {(field) => (
                <field.TextField
                  label='Tour title'
                  required
                  placeholder='e.g. 7-Day Great Migration Safari'
                />
              )}
            </form.AppField>
            <form.AppField
              name='slug'
              listeners={{
                onChange: ({ value }) => {
                  if (value !== slugify(form.getFieldValue('title'))) autoSlugRef.current = false;
                }
              }}
            >
              {(field) => (
                <field.TextField
                  label='URL slug'
                  required
                  placeholder='auto-generated-from-title'
                />
              )}
            </form.AppField>
            <form.AppField name='excerpt'>
              {(field) => (
                <field.TextareaField
                  label='Excerpt'
                  placeholder='One or two sentences shown on listing cards.'
                  rows={2}
                  maxLength={280}
                />
              )}
            </form.AppField>
            <div className='grid gap-4 sm:grid-cols-3'>
              <form.AppField
                name='days'
                listeners={{
                  onChange: ({ value }) => {
                    const parsed = parseDaysFromTitle(form.getFieldValue('title'));
                    if (parsed === null ? value !== '' : value !== String(parsed)) {
                      autoDaysRef.current = false;
                    }
                  }
                }}
              >
                {(field) => <field.TextField label='Days' placeholder='7' inputMode='numeric' />}
              </form.AppField>
              <form.AppField
                name='nights'
                listeners={{
                  onChange: ({ value }) => {
                    const parsed = parseDaysFromTitle(form.getFieldValue('title'));
                    const expected = parsed !== null ? String(Math.max(0, parsed - 1)) : '';
                    if (expected ? value !== expected : value !== '') {
                      autoNightsRef.current = false;
                    }
                  }
                }}
              >
                {(field) => <field.TextField label='Nights' placeholder='6' inputMode='numeric' />}
              </form.AppField>
              <form.AppField name='priceFrom'>
                {(field) => (
                  <field.TextField
                    label='Price from (USD)'
                    placeholder='1500'
                    inputMode='numeric'
                    disabled={
                      Boolean(values.pricingExperienceId) && values.pricingTableKeys.length > 0
                    }
                    description={
                      values.pricingExperienceId && values.pricingTableKeys.length
                        ? 'Auto-filled from selected experience pricing tables.'
                        : undefined
                    }
                  />
                )}
              </form.AppField>
            </div>
            <div className='grid gap-4 sm:grid-cols-2'>
              <form.AppField name='startLocation'>
                {(field) => <field.TextField label='Starts in' placeholder='e.g. Nairobi' />}
              </form.AppField>
              <form.AppField name='endLocation'>
                {(field) => <field.TextField label='Ends in' placeholder='e.g. Nairobi' />}
              </form.AppField>
            </div>
            <RouteLegsInput
              endLocation={values.endLocation}
              startLocation={values.startLocation}
              value={values.routeLegs}
              onChange={(next) => form.setFieldValue('routeLegs', next)}
            />
            <RoutePreview destinations={options.destinations} values={values} />
          </div>
        ) : null}

        {currentStep === 2 ? (
          <div className='grid gap-4'>
            <ItineraryInput
              value={values.itineraryDays}
              onChange={(next) => form.setFieldValue('itineraryDays', next)}
            />
            <RouteLegsInput
              endLocation={values.endLocation}
              startLocation={values.startLocation}
              value={values.routeLegs}
              onChange={(next) => form.setFieldValue('routeLegs', next)}
            />
            <RoutePreview destinations={options.destinations} values={values} />
          </div>
        ) : null}

        {currentStep === 3 ? (
          <div className='grid gap-5'>
            <RoutePreview destinations={options.destinations} values={values} />
            <div className='grid gap-2'>
              <Label htmlFor='tour-parks'>National parks</Label>
              <MultiCombobox
                id='tour-parks'
                options={options.parks}
                value={values.parkIds}
                onChange={(next) => form.setFieldValue('parkIds', next)}
                placeholder='Select national parks this safari visits'
                searchPlaceholder='Search parks…'
                emptyText='No national parks yet. Add them under National Parks.'
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='tour-destinations'>Destinations</Label>
              <MultiCombobox
                id='tour-destinations'
                options={options.destinations}
                value={values.destinationIds}
                onChange={(next) => form.setFieldValue('destinationIds', next)}
                placeholder='Select destinations'
                searchPlaceholder='Search destinations…'
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='tour-experiences'>Experiences</Label>
              <MultiCombobox
                id='tour-experiences'
                options={options.experiences}
                value={values.experienceIds}
                onChange={(next) => form.setFieldValue('experienceIds', next)}
                placeholder='Select experiences'
                searchPlaceholder='Search experiences…'
              />
              <p className='text-muted-foreground text-xs'>
                Linked experiences supply pricing tables on the Pricing step — updates on the
                experience flow through to this trip automatically.
              </p>
            </div>
            <div className='grid gap-4 sm:grid-cols-2'>
              <div className='grid gap-2'>
                <Label htmlFor='tour-accommodations'>Accommodations</Label>
                <MultiCombobox
                  id='tour-accommodations'
                  options={options.accommodations}
                  value={values.accommodationIds}
                  onChange={(next) => form.setFieldValue('accommodationIds', next)}
                  placeholder='Select lodges / camps'
                  searchPlaceholder='Search accommodations…'
                />
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='tour-fleet'>Fleet vehicles</Label>
                <MultiCombobox
                  id='tour-fleet'
                  options={options.fleet}
                  value={values.fleetIds}
                  onChange={(next) => form.setFieldValue('fleetIds', next)}
                  placeholder='Select vehicles'
                  searchPlaceholder='Search fleet…'
                />
              </div>
            </div>
            <form.AppField name='inclusions'>
              {(field) => (
                <HighlightsInput
                  label='What’s included'
                  value={field.state.value}
                  onChange={field.handleChange}
                  placeholder='e.g. Park fees — press Enter to add'
                />
              )}
            </form.AppField>
            <form.AppField name='exclusions'>
              {(field) => (
                <HighlightsInput
                  label='What’s excluded'
                  value={field.state.value}
                  onChange={field.handleChange}
                  placeholder='e.g. International flights — press Enter to add'
                />
              )}
            </form.AppField>
          </div>
        ) : null}

        {currentStep === 4 ? (
          <MediaGalleryField
            value={values.gallery}
            onChange={(ids) => form.setFieldValue('gallery', ids)}
            label='Tour gallery'
            description='The first image is the cover (also used as the card and social image).'
          />
        ) : null}

        {currentStep === 5 ? (
          <div className='grid gap-4'>
            <div className='grid gap-2'>
              <Label htmlFor='tour-overview'>Overview</Label>
              <RichTextEditor
                value={values.overview}
                onChange={(html) => form.setFieldValue('overview', html)}
                placeholder='The main body shown on the tour page.'
              />
            </div>
            <form.AppField name='importantNotice'>
              {(field) => (
                <field.TextareaField
                  label='Important notice (optional)'
                  placeholder='A collapsible notice shown above the itinerary.'
                  rows={3}
                />
              )}
            </form.AppField>
            <form.AppField name='faqs'>
              {(field) => (
                <FaqInput
                  label='Traveler FAQs'
                  value={field.state.value}
                  onChange={field.handleChange}
                  description='Shown on the public tour page as an accordion.'
                />
              )}
            </form.AppField>
          </div>
        ) : null}

        {currentStep === 6 ? (
          <ExperiencePricingSelector
            experienceIds={values.experienceIds}
            experienceOptions={options.experiences}
            priceFrom={values.priceFrom}
            pricingExperienceId={values.pricingExperienceId}
            pricingTableKeys={values.pricingTableKeys}
            pricingTiers={values.pricingTiers}
            onPricingExperienceIdChange={(next) => form.setFieldValue('pricingExperienceId', next)}
            onPricingTableKeysChange={(next) => form.setFieldValue('pricingTableKeys', next)}
            onPricingTiersChange={(next) => form.setFieldValue('pricingTiers', next)}
            onPriceFromChange={(next) => form.setFieldValue('priceFrom', next)}
          />
        ) : null}

        {currentStep === 7 ? (
          <div className='grid gap-4 lg:grid-cols-[1fr_320px]'>
            <div className='grid gap-4'>
              <form.AppField name='seoTitle'>
                {(field) => (
                  <field.TextField
                    label='SEO title'
                    placeholder={values.title || 'Defaults to the tour title'}
                    maxLength={70}
                  />
                )}
              </form.AppField>
              <form.AppField name='seoDescription'>
                {(field) => (
                  <field.TextareaField
                    label='Meta description'
                    placeholder='Shown in Google results and social shares.'
                    rows={3}
                    maxLength={SEO_LIMITS.metaMax}
                  />
                )}
              </form.AppField>

              <KeywordInput
                focusKeyword={values.focusKeyword}
                keywords={values.keywords}
                onFocusKeywordChange={(value) => form.setFieldValue('focusKeyword', value)}
                onKeywordsChange={(value) => form.setFieldValue('keywords', value)}
              />
            </div>

            <div className='lg:sticky lg:top-4 lg:self-start'>
              <SeoAnalyzer
                input={{
                  title: values.seoTitle || values.title,
                  metaDescription: values.seoDescription,
                  slug: values.slug,
                  focusKeyword: values.focusKeyword,
                  keywords: values.keywords,
                  body: `${values.excerpt} ${htmlToText(values.overview)}`,
                  imageCount: values.gallery.length,
                  imagesWithAlt
                }}
              />
            </div>
          </div>
        ) : null}

        {currentStep === 8 ? <ReviewSummary values={values} options={options} /> : null}
      </WizardShell>
    </form.AppForm>
  );
}

function parseDaysFromTitle(title: string): number | null {
  const match = title.match(/^(\d+)\s*[- ]?\s*days?\b/i);
  if (!match) return null;
  const days = Number.parseInt(match[1], 10);
  return days > 0 ? days : null;
}

function countLabels(ids: string[], options: RelationOption[]): string {
  if (!ids.length) return '';
  const byValue = new Map(options.map((option) => [option.value, option.label]));
  return ids.map((id) => byValue.get(id) ?? id).join(', ');
}

function buildWizardDirectionPoints(
  routeLegs: RouteLeg[],
  startLocation: string,
  endLocation: string
) {
  const legPoints = routeLegs
    .filter((leg) => leg.from.trim() && leg.to.trim())
    .flatMap((leg, index) => (index === 0 ? [leg.from.trim(), leg.to.trim()] : [leg.to.trim()]));

  if (legPoints.length >= 2) return legPoints;

  return [startLocation.trim(), endLocation.trim()].filter(Boolean);
}

function buildWizardMapSrc(routeLegs: RouteLeg[], startLocation: string, endLocation: string) {
  const points = buildWizardDirectionPoints(routeLegs, startLocation, endLocation);
  if (points.length < 2) return null;

  return `https://maps.google.com/maps?saddr=${encodeURIComponent(points[0])}&daddr=${encodeURIComponent(points.slice(1).join(' to '))}&output=embed`;
}

function buildWizardRouteStops(values: TourFormValues, destinations: RelationOption[]) {
  const stops: Array<{ key: string; label: string; value: string }> = [];
  const seen = new Set<string>();
  const destinationLabels = new Map(destinations.map((option) => [option.value, option.label]));

  function add(label: string, value: string | null | undefined) {
    const clean = value?.trim();
    if (!clean) return;
    const key = clean.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    stops.push({ key: `${label}-${key}`, label, value: clean });
  }

  const directionPoints = buildWizardDirectionPoints(
    values.routeLegs,
    values.startLocation,
    values.endLocation
  );

  if (directionPoints.length >= 2) {
    directionPoints.forEach((point, index) => {
      const label = index === 0 ? 'Start' : index === directionPoints.length - 1 ? 'End' : 'Stop';
      add(label, point);
    });
  } else {
    add('Start', values.startLocation);
    for (const destinationId of values.destinationIds) {
      add('Destination', destinationLabels.get(destinationId) ?? destinationId);
    }
  }

  if (stops.length <= 1) {
    for (const day of values.itineraryDays.slice(0, 4)) {
      add(`Day ${day.day}`, day.title);
    }
  }
  if (directionPoints.length < 2) add('End', values.endLocation);

  return stops;
}

function ReviewSummary({
  values,
  options
}: {
  values: TourFormValues;
  options: TourWizardProps['options'];
}) {
  const rows: Array<{ label: string; value: string }> = [
    { label: 'Title', value: values.title },
    { label: 'Slug', value: values.slug },
    {
      label: 'Duration',
      value: values.days
        ? `${values.days} days${values.nights ? ` / ${values.nights} nights` : ''}`
        : ''
    },
    { label: 'Price from', value: values.priceFrom ? `$${values.priceFrom}` : '' },
    {
      label: 'Route',
      value: [values.startLocation, values.endLocation].filter(Boolean).join(' → ')
    },
    {
      label: 'Itinerary',
      value: values.itineraryDays.length ? `${values.itineraryDays.length} day(s)` : ''
    },
    { label: 'National parks', value: countLabels(values.parkIds, options.parks) },
    { label: 'Destinations', value: countLabels(values.destinationIds, options.destinations) },
    { label: 'Experiences', value: countLabels(values.experienceIds, options.experiences) },
    {
      label: 'Accommodations',
      value: countLabels(values.accommodationIds, options.accommodations)
    },
    { label: 'Fleet', value: countLabels(values.fleetIds, options.fleet) },
    { label: 'Gallery', value: values.gallery.length ? `${values.gallery.length} image(s)` : '' },
    {
      label: 'Pricing source',
      value: values.pricingExperienceId
        ? `${countLabels([values.pricingExperienceId], options.experiences)} · ${values.pricingTableKeys.join(', ') || 'no tables'}`
        : values.pricingTiers.length
          ? `${values.pricingTiers.length} legacy tier(s)`
          : ''
    },
    { label: 'Inclusions', value: values.inclusions.join(', ') },
    { label: 'SEO title', value: values.seoTitle || values.title }
  ];

  return (
    <dl className='grid gap-3'>
      {rows.map((row) => (
        <div
          key={row.label}
          className='grid grid-cols-[160px_1fr] gap-3 border-b py-2 last:border-b-0'
        >
          <dt className='text-muted-foreground text-xs font-medium uppercase tracking-wide'>
            {row.label}
          </dt>
          <dd className='text-sm'>{row.value || '—'}</dd>
        </div>
      ))}
    </dl>
  );
}
