'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';

import { revalidateLogic, useStore } from '@tanstack/react-form';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useAppForm } from '@/components/ui/tanstack-form';
import {
  ACCOMMODATION_AVAILABILITY_OPTIONS,
  ACCOMMODATION_COMFORT_LEVELS,
  ACCOMMODATION_PROPERTY_TYPES,
  SAFARI_COUNTRY_OPTIONS,
  formatAvailabilityLabel,
  formatComfortLevelLabel,
  formatCountryLabel
} from '@/features/accommodations/public/constants';
import { useFormStepper } from '@/hooks/use-stepper';
import { slugify } from '@/lib/utils';
import { getMediaByIds } from '../media/api/client';
import { mediaKeys } from '../media/api/queries';
import { MediaGalleryField } from '../media/components/media-picker';
import { SEO_LIMITS } from '../seo/analyze';
import { KeywordInput } from '../seo/components/keyword-input';
import { SeoAnalyzer } from '../seo/components/seo-analyzer';
import { Combobox, type ComboboxOption } from '../shared/combobox';
import { HighlightsInput } from '../shared/highlights-input';
import { LocationMapField } from '../shared/location-map-field';
import { htmlToText, RichTextEditor } from '../shared/rich-text-editor';
import { WizardShell, type WizardPendingAction } from '../shared/wizard-shell';
import {
  accommodationFormSchema,
  accommodationStepSchemas,
  accommodationWizardSteps,
  emptyAccommodationValues,
  type AccommodationFormValues
} from './schema';
import { saveAccommodation, type SaveStatus } from './service';

interface AccommodationWizardProps {
  id?: string;
  initialValues?: AccommodationFormValues;
  countryOptions?: string[];
  propertyTypeOptions?: string[];
  regionOptions?: string[];
}

const COUNTRY_PRESETS: ComboboxOption[] = SAFARI_COUNTRY_OPTIONS.map((country) => ({
  value: country.value,
  label: country.label,
  icon: country.icon
}));

const PROPERTY_TYPE_PRESETS: ComboboxOption[] = ACCOMMODATION_PROPERTY_TYPES.map((type) => ({
  value: type,
  label: type
}));

function buildOptions(presets: ComboboxOption[], fromDb: string[]): ComboboxOption[] {
  const byValue = new Map<string, ComboboxOption>();
  for (const option of presets) byValue.set(option.value.toLowerCase(), option);
  for (const value of fromDb) {
    const key = value.toLowerCase();
    if (!byValue.has(key)) byValue.set(key, { value, label: value });
  }
  return [...byValue.values()].toSorted((a, b) => a.label.localeCompare(b.label));
}

export function AccommodationWizard({
  id,
  initialValues,
  countryOptions = [],
  propertyTypeOptions = [],
  regionOptions = []
}: AccommodationWizardProps) {
  const router = useRouter();
  const [pendingAction, setPendingAction] = React.useState<WizardPendingAction>(null);

  const countryItems = React.useMemo(
    () => buildOptions(COUNTRY_PRESETS, countryOptions),
    [countryOptions]
  );
  const propertyTypeItems = React.useMemo(
    () => buildOptions(PROPERTY_TYPE_PRESETS, propertyTypeOptions),
    [propertyTypeOptions]
  );
  const regionItems = React.useMemo<ComboboxOption[]>(
    () => regionOptions.map((value) => ({ value, label: value })),
    [regionOptions]
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
  } = useFormStepper(accommodationStepSchemas);

  const form = useAppForm({
    defaultValues: initialValues ?? emptyAccommodationValues,
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: currentValidator as typeof accommodationFormSchema
    },
    onSubmit: () => {}
  });

  const values = useStore(form.store, (state) => state.values);

  const { data: galleryAssets = [] } = useQuery({
    queryKey: [...mediaKeys.all, 'byIds', values.gallery],
    queryFn: () => getMediaByIds(values.gallery),
    enabled: values.gallery.length > 0
  });
  const imagesWithAlt = galleryAssets.filter((asset) => (asset.alt ?? '').trim().length > 0).length;

  async function persist(status: SaveStatus) {
    const schema = status === 'published' ? accommodationFormSchema : accommodationStepSchemas[0];
    const parsed = schema.safeParse(values);

    if (!parsed.success) {
      await form.handleSubmit();
      toast.error(
        status === 'published'
          ? 'Fix the highlighted fields before publishing.'
          : 'Add a name and slug to save a draft.'
      );
      return;
    }

    setPendingAction(status === 'published' ? 'publish' : 'draft');
    try {
      await saveAccommodation({ id, values, status });
      toast.success(status === 'published' ? 'Accommodation published.' : 'Draft saved.');
      router.push('/portal/accommodations');
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
        steps={accommodationWizardSteps}
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
                  label='Property name'
                  required
                  placeholder='e.g. Aberdare Country Club'
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
            <form.AppField name='propertyType'>
              {(field) => (
                <div className='grid gap-2'>
                  <Label htmlFor='accommodation-property-type'>
                    Property type <span className='text-destructive'>*</span>
                  </Label>
                  <Combobox
                    id='accommodation-property-type'
                    options={propertyTypeItems}
                    value={field.state.value}
                    onChange={field.handleChange}
                    placeholder='Select a property type'
                    searchPlaceholder='Search or add a type…'
                    emptyText='No types yet.'
                    creatable
                    createLabel='Add type'
                  />
                </div>
              )}
            </form.AppField>
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
          </div>
        ) : null}

        {currentStep === 2 ? (
          <div className='grid gap-4'>
            <div className='grid gap-4 sm:grid-cols-2'>
              <form.AppField name='country'>
                {(field) => (
                  <div className='grid gap-2'>
                    <Label htmlFor='accommodation-country'>
                      Country <span className='text-destructive'>*</span>
                    </Label>
                    <Combobox
                      id='accommodation-country'
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
                    <Label htmlFor='accommodation-region'>
                      Location <span className='text-destructive'>*</span>
                    </Label>
                    <Combobox
                      id='accommodation-region'
                      options={regionItems}
                      value={field.state.value}
                      onChange={field.handleChange}
                      placeholder='e.g. Masai Mara National Reserve'
                      searchPlaceholder='Search or add a location…'
                      emptyText='No locations yet.'
                      creatable
                      createLabel='Add location'
                    />
                    <p className='text-muted-foreground text-xs'>
                      Park, reserve, or city shown on the public listing card.
                    </p>
                  </div>
                )}
              </form.AppField>
            </div>
            <form.AppField name='mapQuery'>
              {(field) => (
                <LocationMapField
                  value={field.state.value}
                  onChange={field.handleChange}
                  placeholder={
                    values.region && values.country
                      ? `${values.region}, ${values.country}`
                      : 'Search for this property on the map'
                  }
                />
              )}
            </form.AppField>
          </div>
        ) : null}

        {currentStep === 3 ? (
          <MediaGalleryField
            value={values.gallery}
            onChange={(ids) => form.setFieldValue('gallery', ids)}
            label='Property gallery'
            description='The first image is used as the cover. Pick from the library or upload new ones.'
          />
        ) : null}

        {currentStep === 4 ? (
          <div className='grid gap-4'>
            <form.AppField name='description'>
              {(field) => (
                <div className='grid gap-2'>
                  <Label htmlFor='accommodation-description'>About this property</Label>
                  <RichTextEditor
                    value={field.state.value}
                    onChange={field.handleChange}
                    placeholder='The main body shown on the accommodation detail page.'
                  />
                </div>
              )}
            </form.AppField>
            <form.AppField name='amenities'>
              {(field) => (
                <HighlightsInput
                  label='Amenities'
                  value={field.state.value}
                  onChange={field.handleChange}
                  placeholder='e.g. Outdoor swimming pool — press Enter to add'
                  description='Add one amenity at a time. Press Enter or comma to add each.'
                />
              )}
            </form.AppField>
          </div>
        ) : null}

        {currentStep === 5 ? (
          <div className='grid gap-4 sm:grid-cols-2'>
            <form.AppField name='pricePerNight'>
              {(field) => (
                <field.TextField
                  label='Price per night (USD)'
                  placeholder='e.g. 350'
                  description='Leave blank to show “Price on request”.'
                  inputMode='decimal'
                />
              )}
            </form.AppField>
            <form.AppField name='comfortLevel'>
              {(field) => (
                <div className='grid gap-2'>
                  <Label htmlFor='accommodation-comfort-level'>Comfort level</Label>
                  <Select
                    value={field.state.value}
                    onValueChange={(value) => field.handleChange(value as typeof field.state.value)}
                  >
                    <SelectTrigger id='accommodation-comfort-level'>
                      <SelectValue placeholder='Select comfort level' />
                    </SelectTrigger>
                    <SelectContent>
                      {ACCOMMODATION_COMFORT_LEVELS.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </form.AppField>
            <form.AppField name='availability'>
              {(field) => (
                <div className='grid gap-2 sm:col-span-2'>
                  <Label htmlFor='accommodation-availability'>Availability</Label>
                  <Select
                    value={field.state.value}
                    onValueChange={(value) => field.handleChange(value as typeof field.state.value)}
                  >
                    <SelectTrigger id='accommodation-availability'>
                      <SelectValue placeholder='Select availability' />
                    </SelectTrigger>
                    <SelectContent>
                      {ACCOMMODATION_AVAILABILITY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </form.AppField>
          </div>
        ) : null}

        {currentStep === 6 ? (
          <div className='grid gap-4 lg:grid-cols-[1fr_320px]'>
            <div className='grid gap-4'>
              <form.AppField name='seoTitle'>
                {(field) => (
                  <field.TextField
                    label='SEO title'
                    placeholder={values.name || 'Defaults to the property name'}
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

        {currentStep === 7 ? <ReviewSummary values={values} /> : null}
      </WizardShell>
    </form.AppForm>
  );
}

function ReviewSummary({ values }: { values: AccommodationFormValues }) {
  const rows: Array<{ label: string; value: string }> = [
    { label: 'Name', value: values.name },
    { label: 'Slug', value: values.slug },
    { label: 'Property type', value: values.propertyType },
    { label: 'Country', value: formatCountryLabel(values.country) ?? values.country },
    { label: 'Location', value: values.region },
    { label: 'Map pin', value: values.mapQuery },
    { label: 'Gallery', value: values.gallery.length ? `${values.gallery.length} image(s)` : '' },
    { label: 'Amenities', value: values.amenities.join(', ') },
    {
      label: 'Price / night',
      value: values.pricePerNight ? `$${values.pricePerNight}` : 'On request'
    },
    {
      label: 'Comfort level',
      value: formatComfortLevelLabel(values.comfortLevel) ?? values.comfortLevel
    },
    {
      label: 'Availability',
      value: formatAvailabilityLabel(values.availability)
    },
    { label: 'SEO title', value: values.seoTitle || values.name }
  ];

  return (
    <dl className='grid gap-3 rounded-md border p-4'>
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
