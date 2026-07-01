'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';

import { revalidateLogic, useStore } from '@tanstack/react-form';
import { toast } from 'sonner';

import { useAppForm } from '@/components/ui/tanstack-form';
import { Label } from '@/components/ui/label';
import { useFormStepper } from '@/hooks/use-stepper';
import { slugify } from '@/lib/utils';
import { MediaGalleryField } from '../media/components/media-picker';
import { Combobox } from '../shared/combobox';
import { htmlToText, RichTextEditor } from '../shared/rich-text-editor';
import { SeoAnalyzer } from '../seo/components/seo-analyzer';
import { WizardShell, type WizardPendingAction } from '../shared/wizard-shell';
import {
  emptyPackageValues,
  packageFormSchema,
  packageStepSchemas,
  packageWizardSteps,
  type PackageFormValues
} from './schema';
import { savePackage, type RelationOption, type SaveStatus } from './service';

type PackageWizardProps = {
  id?: string;
  initialValues?: PackageFormValues;
  tourOptions: RelationOption[];
};

const tierOptions = [
  { value: 'budget', label: 'Budget Package' },
  { value: 'mid_range', label: 'Mid-Range Package' },
  { value: 'luxury', label: 'Luxury Package' }
];

export function PackageWizard({ id, initialValues, tourOptions }: PackageWizardProps) {
  const router = useRouter();
  const [pendingAction, setPendingAction] = React.useState<WizardPendingAction>(null);
  const autoSlugRef = React.useRef(!id);
  const autoTitleRef = React.useRef(!id);

  const {
    currentStep,
    isFirstStep,
    step,
    currentValidator,
    handleNextStepOrSubmit,
    handleCancelOrBack
  } = useFormStepper(packageStepSchemas);

  const form = useAppForm({
    defaultValues: initialValues ?? emptyPackageValues,
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: currentValidator as typeof packageFormSchema
    },
    onSubmit: () => {}
  });

  const values = useStore(form.store, (state) => state.values);

  async function persist(status: SaveStatus) {
    const schema = status === 'published' ? packageFormSchema : packageStepSchemas[0];
    const parsed = schema.safeParse(values);

    if (!parsed.success) {
      await form.handleSubmit();
      toast.error(
        status === 'published'
          ? 'Fix the highlighted fields before publishing.'
          : 'Add a title, slug, source tour, and tier to save a draft.'
      );
      return;
    }

    setPendingAction(status === 'published' ? 'publish' : 'draft');
    try {
      await savePackage({ id, values, status });
      toast.success(status === 'published' ? 'Package published.' : 'Draft saved.');
      router.push('/portal/packages');
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
        steps={packageWizardSteps}
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
                }
              }}
            >
              {(field) => (
                <field.TextField
                  label='Package title'
                  required
                  placeholder='e.g. 7-Day Masai Mara Mid-Range Package'
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
              {(field) => <field.TextField label='URL slug' required />}
            </form.AppField>
            <div className='grid gap-2'>
              <Label htmlFor='package-tour'>Source trip route</Label>
              <Combobox
                id='package-tour'
                options={tourOptions}
                value={values.tourId}
                onChange={(next) => form.setFieldValue('tourId', next)}
                placeholder='Select the itinerary this package reuses'
                searchPlaceholder='Search tours…'
              />
            </div>
            <form.AppField name='comfortTier'>
              {(field) => (
                <field.SelectField
                  label='Comfort tier'
                  options={tierOptions}
                  placeholder='Select tier'
                />
              )}
            </form.AppField>
          </div>
        ) : null}

        {currentStep === 2 ? (
          <div className='grid gap-4'>
            <form.AppField name='packageGroup'>
              {(field) => (
                <field.TextField
                  label='Package group / campaign'
                  placeholder='e.g. East Africa Safari Deals'
                />
              )}
            </form.AppField>
            <form.AppField name='excerpt'>
              {(field) => (
                <field.TextareaField
                  label='Excerpt'
                  rows={2}
                  maxLength={280}
                  placeholder='Short listing copy for this package…'
                />
              )}
            </form.AppField>
            <div className='grid gap-2'>
              <Label htmlFor='package-content'>Package intro</Label>
              <RichTextEditor
                value={values.content}
                onChange={(html) => form.setFieldValue('content', html)}
                placeholder='What makes this package variant useful for clients?'
              />
            </div>
            <MediaGalleryField
              value={values.ogImageId ? [values.ogImageId] : []}
              onChange={(ids) => form.setFieldValue('ogImageId', ids[0] ?? '')}
              label='Package cover image'
              description='Optional. If empty, the linked trip cover image is used.'
            />
          </div>
        ) : null}

        {currentStep === 3 ? (
          <div className='grid gap-4 lg:grid-cols-[1fr_320px]'>
            <div className='grid gap-4'>
              <form.AppField name='seoTitle'>
                {(field) => <field.TextField label='SEO title' maxLength={70} />}
              </form.AppField>
              <form.AppField name='seoDescription'>
                {(field) => (
                  <field.TextareaField label='Meta description' rows={3} maxLength={160} />
                )}
              </form.AppField>
            </div>
            <SeoAnalyzer
              input={{
                title: values.seoTitle || values.title,
                metaDescription: values.seoDescription,
                slug: values.slug,
                focusKeyword: '',
                keywords: [],
                body: `${values.excerpt} ${htmlToText(values.content)}`,
                imageCount: values.ogImageId ? 1 : 0,
                imagesWithAlt: values.ogImageId ? 1 : 0
              }}
            />
          </div>
        ) : null}

        {currentStep === 4 ? <PackageReview values={values} tourOptions={tourOptions} /> : null}
      </WizardShell>
    </form.AppForm>
  );
}

function PackageReview({
  values,
  tourOptions
}: {
  values: PackageFormValues;
  tourOptions: RelationOption[];
}) {
  const tourLabel = tourOptions.find((option) => option.value === values.tourId)?.label ?? '';
  const rows = [
    { label: 'Title', value: values.title },
    { label: 'Slug', value: values.slug },
    { label: 'Source trip', value: tourLabel },
    { label: 'Tier', value: values.comfortTier },
    { label: 'Group', value: values.packageGroup },
    { label: 'Cover image', value: values.ogImageId ? 'Selected' : '' },
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
