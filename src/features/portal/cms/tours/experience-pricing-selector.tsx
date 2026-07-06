'use client';

import * as React from 'react';

import { useQuery } from '@tanstack/react-query';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Icons } from '@/components/icons';
import { TourPricingTable } from '@/components/public/tours/tour-pricing-table';
import {
  mapExperienceKeyToTourTier,
  minPriceFromTourTiers,
  type ExperiencePricingTableKey
} from '@/lib/pricing/experience-to-tour-pricing';
import { cn } from '@/lib/utils';
import { Combobox } from '../shared/combobox';
import type { PricingTier } from './schema';
import {
  getExperiencePricingPreview,
  getExperiencePricingTablesForWizard,
  type RelationOption
} from './service';

type ExperiencePricingSelectorProps = {
  experienceIds: string[];
  experienceOptions: RelationOption[];
  priceFrom: string;
  pricingExperienceId: string;
  pricingTableKeys: ExperiencePricingTableKey[];
  pricingTiers: PricingTier[];
  onPricingExperienceIdChange: (value: string) => void;
  onPricingTableKeysChange: (value: ExperiencePricingTableKey[]) => void;
  onPricingTiersChange: (value: PricingTier[]) => void;
  onPriceFromChange: (value: string) => void;
};

async function fetchPreviewTiers(experienceId: string, keys: ExperiencePricingTableKey[]) {
  return getExperiencePricingPreview(experienceId, keys);
}

function tierBadgeVariant(tier: ReturnType<typeof mapExperienceKeyToTourTier>) {
  if (tier === 'budget') return 'secondary';
  if (tier === 'luxury') return 'default';
  return 'outline';
}

export function ExperiencePricingSelector({
  experienceIds,
  experienceOptions,
  priceFrom,
  pricingExperienceId,
  pricingTableKeys,
  pricingTiers,
  onPricingExperienceIdChange,
  onPricingTableKeysChange,
  onPricingTiersChange,
  onPriceFromChange
}: ExperiencePricingSelectorProps) {
  const [showLegacy, setShowLegacy] = React.useState(
    !pricingExperienceId && pricingTiers.length > 0
  );

  const linkedExperienceOptions = experienceOptions.filter((option) =>
    experienceIds.includes(option.value)
  );

  const autoSelectedExperienceRef = React.useRef(false);
  const onPricingExperienceIdChangeRef = React.useRef(onPricingExperienceIdChange);
  const onPriceFromChangeRef = React.useRef(onPriceFromChange);

  onPricingExperienceIdChangeRef.current = onPricingExperienceIdChange;
  onPriceFromChangeRef.current = onPriceFromChange;

  React.useEffect(() => {
    if (pricingExperienceId || linkedExperienceOptions.length !== 1) return;
    if (autoSelectedExperienceRef.current) return;
    autoSelectedExperienceRef.current = true;
    onPricingExperienceIdChangeRef.current(linkedExperienceOptions[0].value);
  }, [linkedExperienceOptions, pricingExperienceId]);

  const { data: tableOptions = [], isLoading } = useQuery({
    queryKey: ['experience-pricing-tables', pricingExperienceId],
    queryFn: () => getExperiencePricingTablesForWizard(pricingExperienceId),
    enabled: Boolean(pricingExperienceId)
  });

  const { data: previewTiers = [] } = useQuery({
    queryKey: ['experience-pricing-preview', pricingExperienceId, pricingTableKeys],
    queryFn: () => fetchPreviewTiers(pricingExperienceId, pricingTableKeys),
    enabled: Boolean(pricingExperienceId) && pricingTableKeys.length > 0
  });

  React.useEffect(() => {
    const minPrice = minPriceFromTourTiers(previewTiers);
    if (minPrice == null || !pricingTableKeys.length) return;

    const nextPrice = String(minPrice);
    if (nextPrice === priceFrom) return;

    onPriceFromChangeRef.current(nextPrice);
  }, [previewTiers, priceFrom, pricingTableKeys.length]);

  function toggleTableKey(key: ExperiencePricingTableKey, checked: boolean) {
    if (checked) {
      if (pricingTableKeys.length >= 3) return;
      const tourTier = mapExperienceKeyToTourTier(key);
      const conflicting = pricingTableKeys.some(
        (selectedKey) => mapExperienceKeyToTourTier(selectedKey) === tourTier
      );
      if (conflicting) return;
      onPricingTableKeysChange([...pricingTableKeys, key]);
      onPricingTiersChange([]);
      setShowLegacy(false);
      return;
    }

    onPricingTableKeysChange(pricingTableKeys.filter((item) => item !== key));
  }

  if (!experienceIds.length) {
    return (
      <div className='rounded-lg border border-dashed p-6 text-sm text-muted-foreground'>
        Link at least one experience under Parks &amp; Links — pricing tables come from that
        experience and update automatically when you edit the experience.
      </div>
    );
  }

  return (
    <div className='grid gap-5'>
      <div className='grid gap-2'>
        <Label htmlFor='pricing-experience'>Pricing experience</Label>
        <Combobox
          id='pricing-experience'
          options={linkedExperienceOptions}
          value={pricingExperienceId}
          onChange={(next) => {
            onPricingExperienceIdChange(next);
            onPricingTableKeysChange([]);
          }}
          placeholder='Select experience'
          searchPlaceholder='Search linked experiences…'
        />
      </div>

      {pricingExperienceId ? (
        <div className='grid gap-3'>
          <div className='flex items-center justify-between gap-3'>
            <Label>Package pricing tables</Label>
            <span className='text-muted-foreground text-xs'>Select up to 3</span>
          </div>

          {isLoading ? (
            <div className='text-muted-foreground flex items-center gap-2 text-sm'>
              <Icons.spinner className='size-4 animate-spin' />
              Loading tables…
            </div>
          ) : null}

          {!isLoading && !tableOptions.length ? (
            <div className='rounded-lg border border-dashed p-4 text-sm text-muted-foreground'>
              No filled pricing tables on this experience yet. Add them in the Experience wizard
              under Package Tables.
            </div>
          ) : null}

          <div className='grid gap-2'>
            {tableOptions.map((table) => {
              const checked = pricingTableKeys.includes(table.key);
              const tourTier = mapExperienceKeyToTourTier(table.key);
              const tierTaken =
                !checked &&
                pricingTableKeys.some(
                  (selectedKey) => mapExperienceKeyToTourTier(selectedKey) === tourTier
                );
              const maxReached = !checked && pricingTableKeys.length >= 3;

              return (
                <label
                  key={table.key}
                  className={cn(
                    'flex cursor-pointer items-start gap-3 rounded-lg border p-3',
                    checked && 'border-primary bg-primary/5',
                    (tierTaken || maxReached) && 'cursor-not-allowed opacity-50'
                  )}
                >
                  <Checkbox
                    checked={checked}
                    disabled={tierTaken || maxReached}
                    onCheckedChange={(value) => toggleTableKey(table.key, value === true)}
                  />
                  <div className='grid flex-1 gap-1'>
                    <div className='flex flex-wrap items-center gap-2'>
                      <span className='text-sm font-medium'>{table.label}</span>
                      <Badge variant={tierBadgeVariant(table.tourTier)}>{table.key}</Badge>
                    </div>
                    {table.blurb ? (
                      <p className='text-muted-foreground text-xs'>{table.blurb}</p>
                    ) : null}
                    <p className='text-muted-foreground text-xs'>
                      {table.seasonCount} season(s)
                      {table.priceFrom != null ? ` · from $${table.priceFrom}` : ''}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      ) : null}

      {previewTiers.length ? (
        <div className='grid gap-2'>
          <Label>Preview</Label>
          <TourPricingTable tiers={previewTiers} />
        </div>
      ) : null}

      <div className='border-t pt-4'>
        <Button
          type='button'
          variant='ghost'
          size='sm'
          onClick={() => {
            setShowLegacy((current) => !current);
            if (!showLegacy) {
              onPricingExperienceIdChange('');
              onPricingTableKeysChange([]);
            }
          }}
        >
          {showLegacy ? 'Hide legacy manual pricing' : 'Use legacy manual pricing instead'}
        </Button>
      </div>

      {showLegacy ? (
        <LegacyPricingInput value={pricingTiers} onChange={onPricingTiersChange} />
      ) : null}
    </div>
  );
}

const PRICING_TIER_OPTIONS = [
  { value: 'budget', label: 'Budget' },
  { value: 'mid_range', label: 'Mid-range' },
  { value: 'luxury', label: 'Luxury' }
] as const;

function emptyPricingTier(): PricingTier {
  return {
    tier: 'mid_range',
    label: '',
    blurb: '',
    notes: '',
    currency: 'USD',
    seasons: []
  };
}

function LegacyPricingInput({
  value,
  onChange
}: {
  value: PricingTier[];
  onChange: (next: PricingTier[]) => void;
}) {
  function updateTier(index: number, patch: Partial<PricingTier>) {
    onChange(value.map((tier, i) => (i === index ? { ...tier, ...patch } : tier)));
  }

  function removeTier(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function addSeason(tierIndex: number) {
    updateTier(tierIndex, {
      seasons: [
        ...value[tierIndex].seasons,
        {
          label: '',
          dateStart: '',
          dateEnd: '',
          cells: [
            { groupBand: '1', price: '' },
            { groupBand: '2-3', price: '' },
            { groupBand: '4-5', price: '' },
            { groupBand: '6+', price: '' }
          ]
        }
      ]
    });
  }

  return (
    <div className='grid gap-4'>
      <p className='text-muted-foreground text-sm'>
        Legacy mode stores pricing on this trip only. Prefer experience-linked tables above.
      </p>
      {value.map((tier, tierIndex) => (
        <div className='rounded-lg border p-4' key={`${tier.tier}-${tierIndex}`}>
          <div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
            <div className='grid gap-2 sm:grid-cols-[160px_minmax(0,1fr)]'>
              <select
                className='border-input bg-background rounded-md border px-3 py-2 text-sm'
                onChange={(event) =>
                  updateTier(tierIndex, { tier: event.target.value as PricingTier['tier'] })
                }
                value={tier.tier}
              >
                {PRICING_TIER_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <Input
                value={tier.label}
                onChange={(event) => updateTier(tierIndex, { label: event.target.value })}
                placeholder='Tier heading'
              />
            </div>
            <Button type='button' size='sm' variant='ghost' onClick={() => removeTier(tierIndex)}>
              <Icons.trash className='size-4' />
            </Button>
          </div>
          <Textarea
            value={tier.blurb}
            onChange={(event) => updateTier(tierIndex, { blurb: event.target.value })}
            placeholder='Short tier description…'
            rows={2}
          />
          {tier.seasons.map((season, seasonIndex) => (
            <div className='mt-3 rounded-md border p-3' key={seasonIndex}>
              <Input
                value={season.label}
                onChange={(event) => {
                  const seasons = tier.seasons.map((item, i) =>
                    i === seasonIndex ? { ...item, label: event.target.value } : item
                  );
                  updateTier(tierIndex, { seasons });
                }}
                placeholder='Season label'
                className='mb-3'
              />
              <div className='grid gap-2 sm:grid-cols-2 lg:grid-cols-4'>
                {season.cells.map((cell, cellIndex) => (
                  <Input
                    key={cellIndex}
                    inputMode='numeric'
                    value={cell.price}
                    onChange={(event) => {
                      const seasons = tier.seasons.map((item, i) =>
                        i === seasonIndex
                          ? {
                              ...item,
                              cells: item.cells.map((nextCell, nextCellIndex) =>
                                nextCellIndex === cellIndex
                                  ? { ...nextCell, price: event.target.value }
                                  : nextCell
                              )
                            }
                          : item
                      );
                      updateTier(tierIndex, { seasons });
                    }}
                    placeholder={`${cell.groupBand} price`}
                  />
                ))}
              </div>
            </div>
          ))}
          <Button type='button' size='sm' variant='outline' onClick={() => addSeason(tierIndex)}>
            Add season
          </Button>
        </div>
      ))}
      <Button
        type='button'
        variant='outline'
        size='sm'
        onClick={() => onChange([...value, emptyPricingTier()])}
      >
        Add pricing tier
      </Button>
    </div>
  );
}
