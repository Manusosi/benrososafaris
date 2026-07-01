'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';

import { revalidateLogic, useStore } from '@tanstack/react-form';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Label } from '@/components/ui/label';
import { useAppForm } from '@/components/ui/tanstack-form';
import { useFormStepper } from '@/hooks/use-stepper';
import { slugify } from '@/lib/utils';
import { getMediaByIds } from '../media/api/client';
import { mediaKeys } from '../media/api/queries';
import { MediaGalleryField } from '../media/components/media-picker';
import { SEO_LIMITS } from '../seo/analyze';
import { KeywordInput } from '../seo/components/keyword-input';
import { SeoAnalyzer } from '../seo/components/seo-analyzer';
import { Combobox, type ComboboxOption } from '../shared/combobox';
import { FaqInput } from '../shared/faq-input';
import { HighlightsInput } from '../shared/highlights-input';
import { htmlToText, RichTextEditor } from '../shared/rich-text-editor';
import { WizardShell, type WizardPendingAction } from '../shared/wizard-shell';
import {
  emptyNationalParkValues,
  nationalParkFormSchema,
  nationalParkStepSchemas,
  nationalParkWizardSteps,
  type NationalParkFormValues
} from './schema';
import { saveNationalPark, type SaveStatus } from './service';

interface NationalParkWizardProps {
  id?: string;
  initialValues?: NationalParkFormValues;
  countryOptions?: string[];
  regionOptions?: string[];
  /** Existing destinations (id + name) for the optional parent selector. */
  destinationOptions?: Array<{ value: string; label: string }>;
}

const BEST_TIME_OPTIONS: ComboboxOption[] = [
  { value: 'All year round', label: 'All year round' },
  { value: 'January to March', label: 'January to March' },
  { value: 'June to September', label: 'June to September (dry season)' },
  { value: 'July to October', label: 'July to October (Great Migration)' },
  { value: 'October to December', label: 'October to December (short rains)' },
  { value: 'December to March', label: 'December to March' },
  { value: 'June to October', label: 'June to October (peak safari)' }
];

const COUNTRY_PRESETS: ComboboxOption[] = [
  { value: 'Kenya', label: 'Kenya', icon: '🇰🇪' },
  { value: 'Tanzania', label: 'Tanzania', icon: '🇹🇿' },
  { value: 'Uganda', label: 'Uganda', icon: '🇺🇬' },
  { value: 'Rwanda', label: 'Rwanda', icon: '🇷🇼' },
  { value: 'South Africa', label: 'South Africa', icon: '🇿🇦' }
];

function buildOptions(presets: ComboboxOption[], fromDb: string[]): ComboboxOption[] {
  const byValue = new Map<string, ComboboxOption>();
  for (const option of presets) byValue.set(option.value.toLowerCase(), option);
  for (const value of fromDb) {
    const key = value.toLowerCase();
    if (!byValue.has(key)) byValue.set(key, { value, label: value, icon: '🌍' });
  }
  return [...byValue.values()].toSorted((a, b) => a.label.localeCompare(b.label));
}

export function NationalParkWizard({
  id,
  initialValues,
  countryOptions = [],
  regionOptions = [],
  destinationOptions = []
}: NationalParkWizardProps) {
  const router = useRouter();
  const [pendingAction, setPendingAction] = React.useState<WizardPendingAction>(null);

  const countryItems = React.useMemo(
    () => buildOptions(COUNTRY_PRESETS, countryOptions),
    [countryOptions]
  );
  const regionItems = React.useMemo<ComboboxOption[]>(
    () => regionOptions.map((value) => ({ value, label: value })),
    [regionOptions]
  );
  const parentItems = React.useMemo<ComboboxOption[]>(
    () => destinationOptions.map((option) => ({ value: option.value, label: option.label })),
    [destinationOptions]
  );

  const autoSlugRef = React.useRef(!id);
  const autoTitleRef = React.useRef(!id);

  const {
    currentStep,
    isFirstStep,
    step,
    currentValidator,
    handleNextStepOrSubmit,
    handleCancelOrBack
  } = useFormStepper(nationalParkStepSchemas);

  const form = useAppForm({
    defaultValues: initialValues ?? emptyNationalParkValues,
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: currentValidator as typeof nationalParkFormSchema
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
    const schema = status === 'published' ? nationalParkFormSchema : nationalParkStepSchemas[0];
    const parsed = schema.safeParse(values);

    if (!parsed.success) {
      await form.handleSubmit();
      toast.error(
        status === 'published'
          ? 'Fix the highlighted fields before publishing.'
          : 'Add a name, slug, and country to save a draft.'
      );
      return;
    }

    setPendingAction(status === 'published' ? 'publish' : 'draft');
    try {
      await saveNationalPark({ id, values, status });
      toast.success(status === 'published' ? 'National park published.' : 'Draft saved.');
      router.push('/portal/national-parks');
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
        steps={nationalParkWizardSteps}
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
              name='name'
              listeners={{
                onChange: ({ value }) => {
                  if (autoSlugRef.current) form.setFieldValue('slug', slugify(value));
                  if (autoTitleRef.current) form.setFieldValue('seoTitle', value);
                }
              }}
            >
              {(field) => (
                <field.TextField
                  label='Park name'
                  required
                  placeholder='e.g. Masai Mara National Reserve'
                />
              )}
            </form.AppField>
            <form.AppField
              name='slug'
              listeners={{
                onChange: ({ value }) => {
                  if (value !== slugify(form.getFieldValue('name'))) autoSlugRef.current = false;
                }
              }}
            >
              {(field) => (
                <field.TextField
                  label='URL slug'
                  required
                  placeholder='auto-generated-from-name'
                  description='Auto-generated from the name. Edit only if you need a custom URL.'
                />
              )}
            </form.AppField>
            <div className='grid gap-4 sm:grid-cols-2'>
              <form.AppField name='country'>
                {(field) => (
                  <div className='grid gap-2'>
                    <Label htmlFor='park-country'>
                      Country <span className='text-destructive'>*</span>
                    </Label>
                    <Combobox
                      id='park-country'
                      options={countryItems}
                      value={field.state.value}
                      onChange={field.handleChange}
                      placeholder='Select a country'
                      searchPlaceholder='Search or add a country…'
                      emptyText='No countries yet.'
                      creatable
                      createLabel='Add country'
                    />
                  </div>
                )}
              </form.AppField>
              <form.AppField name='region'>
                {(field) => (
                  <div className='grid gap-2'>
                    <Label htmlFor='park-region'>Region / circuit</Label>
                    <Combobox
                      id='park-region'
                      options={regionItems}
                      value={field.state.value}
                      onChange={field.handleChange}
                      placeholder='Select a region'
                      searchPlaceholder='Search or add a region…'
                      emptyText='No regions yet.'
                      creatable
                      createLabel='Add region'
                    />
                  </div>
                )}
              </form.AppField>
            </div>
          </div>
        ) : null}

        {currentStep === 2 ? (
          <MediaGalleryField
            value={values.gallery}
            onChange={(ids) => form.setFieldValue('gallery', ids)}
            label='Park gallery'
            description='The first image is used as the cover. Pick from the library or upload new ones.'
          />
        ) : null}

        {currentStep === 3 ? (
          <div className='grid gap-4'>
            <div className='grid gap-4 sm:grid-cols-2'>
              <form.AppField name='parkSizeKm2'>
                {(field) => (
                  <field.TextField
                    label='Park size (km²)'
                    placeholder='e.g. 1510'
                    inputMode='numeric'
                  />
                )}
              </form.AppField>
              <form.AppField name='establishedYear'>
                {(field) => (
                  <field.TextField
                    label='Established year'
                    placeholder='e.g. 1961'
                    inputMode='numeric'
                  />
                )}
              </form.AppField>
              <form.AppField name='latitude'>
                {(field) => (
                  <field.TextField
                    label='Latitude'
                    placeholder='e.g. -1.4061'
                    inputMode='numeric'
                  />
                )}
              </form.AppField>
              <form.AppField name='longitude'>
                {(field) => (
                  <field.TextField
                    label='Longitude'
                    placeholder='e.g. 35.0117'
                    inputMode='numeric'
                  />
                )}
              </form.AppField>
            </div>
            <form.AppField name='bestTimeSummary'>
              {(field) => (
                <div className='grid gap-2'>
                  <Label htmlFor='park-best-time'>Best time to visit</Label>
                  <Combobox
                    id='park-best-time'
                    options={BEST_TIME_OPTIONS}
                    value={field.state.value}
                    onChange={field.handleChange}
                    placeholder='Select a season'
                    searchPlaceholder='Search seasons…'
                  />
                </div>
              )}
            </form.AppField>
            <form.AppField name='wildlife'>
              {(field) => (
                <HighlightsInput
                  label='Wildlife highlights'
                  value={field.state.value}
                  onChange={field.handleChange}
                  placeholder='e.g. Lion — press Enter to add'
                  description='Add one species at a time. Press Enter or comma to add each.'
                />
              )}
            </form.AppField>
            <form.AppField name='activities'>
              {(field) => (
                <HighlightsInput
                  label='Activities'
                  value={field.state.value}
                  onChange={field.handleChange}
                  placeholder='e.g. Game drives — press Enter to add'
                  description='Things to do in the park (game drives, balloon safaris, walking safaris…).'
                />
              )}
            </form.AppField>
            {parentItems.length ? (
              <form.AppField name='destinationId'>
                {(field) => (
                  <div className='grid gap-2'>
                    <Label htmlFor='park-parent'>Parent destination (optional)</Label>
                    <Combobox
                      id='park-parent'
                      options={parentItems}
                      value={field.state.value}
                      onChange={field.handleChange}
                      placeholder='Group under a destination hub'
                      searchPlaceholder='Search destinations…'
                      emptyText='No destinations yet.'
                    />
                    <p className='text-muted-foreground text-xs'>
                      Link this park to a country/region hub (e.g. “Kenya”) for grouping.
                    </p>
                  </div>
                )}
              </form.AppField>
            ) : null}
          </div>
        ) : null}

        {currentStep === 4 ? (
          <div className='grid gap-4'>
            <form.AppField name='summary'>
              {(field) => (
                <field.TextareaField
                  label='Summary'
                  placeholder='One or two sentences shown on listing cards.'
                  rows={3}
                  maxLength={280}
                />
              )}
            </form.AppField>
            <form.AppField name='description'>
              {(field) => (
                <div className='grid gap-2'>
                  <Label htmlFor='park-description'>Full description</Label>
                  <RichTextEditor
                    value={field.state.value}
                    onChange={field.handleChange}
                    placeholder='The main body shown on the park page.'
                  />
                </div>
              )}
            </form.AppField>
            <form.AppField name='faqs'>
              {(field) => (
                <FaqInput
                  label='Traveler FAQs'
                  value={field.state.value}
                  onChange={field.handleChange}
                  description='Shown on the public park page as an accordion. Leave blank pairs out when saving.'
                />
              )}
            </form.AppField>
          </div>
        ) : null}

        {currentStep === 5 ? (
          <div className='grid gap-4 lg:grid-cols-[1fr_320px]'>
            <div className='grid gap-4'>
              <form.AppField name='seoTitle'>
                {(field) => (
                  <field.TextField
                    label='SEO title'
                    placeholder={values.name || 'Defaults to the park name'}
                    maxLength={70}
                    description='Pre-filled from the park name. Override for a custom search title.'
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
                  title: values.seoTitle || values.name,
                  metaDescription: values.seoDescription,
                  slug: values.slug,
                  focusKeyword: values.focusKeyword,
                  keywords: values.keywords,
                  body: `${values.summary} ${htmlToText(values.description)}`,
                  imageCount: values.gallery.length,
                  imagesWithAlt
                }}
              />
            </div>
          </div>
        ) : null}

        {currentStep === 6 ? <ReviewSummary values={values} /> : null}
      </WizardShell>
    </form.AppForm>
  );
}

function ReviewSummary({ values }: { values: NationalParkFormValues }) {
  const rows: Array<{ label: string; value: string }> = [
    { label: 'Name', value: values.name },
    { label: 'Slug', value: values.slug },
    { label: 'Country', value: values.country },
    { label: 'Region', value: values.region },
    { label: 'Park size', value: values.parkSizeKm2 ? `${values.parkSizeKm2} km²` : '' },
    { label: 'Established', value: values.establishedYear },
    { label: 'Gallery', value: values.gallery.length ? `${values.gallery.length} image(s)` : '' },
    { label: 'Best time to visit', value: values.bestTimeSummary },
    { label: 'Wildlife', value: values.wildlife.join(', ') },
    { label: 'Activities', value: values.activities.join(', ') },
    { label: 'Summary', value: values.summary },
    {
      label: 'FAQs',
      value: values.faqs.length
        ? `${values.faqs.filter((faq) => faq.question.trim() && faq.answer.trim()).length} question(s)`
        : ''
    },
    { label: 'SEO title', value: values.seoTitle || values.name },
    { label: 'Keywords', value: values.keywords.join(', ') }
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
