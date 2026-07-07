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
  createDefaultLegacyPricingTier,
  createLegacyPricingSeason,
  LEGACY_PAX_BANDS
} from './legacy-pricing';
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
              if (!pricingTiers.length) {
                onPricingTiersChange([createDefaultLegacyPricingTier()]);
              }
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

function LegacyPricingInput({
  value,
  onChange
}: {
  value: PricingTier[];
  onChange: (next: PricingTier[]) => void;
}) {
  const tiers = value.length ? value : [createDefaultLegacyPricingTier()];

  function updateTier(index: number, patch: Partial<PricingTier>) {
    onChange(tiers.map((tier, i) => (i === index ? { ...tier, ...patch } : tier)));
  }

  function removeTier(index: number) {
    onChange(tiers.filter((_, i) => i !== index));
  }

  function updateSeasonLabel(tierIndex: number, seasonIndex: number, label: string) {
    updateTier(tierIndex, {
      seasons: tiers[tierIndex].seasons.map((season, i) =>
        i === seasonIndex ? { ...season, label } : season
      )
    });
  }

  function updatePrice(tierIndex: number, seasonIndex: number, cellIndex: number, price: string) {
    updateTier(tierIndex, {
      seasons: tiers[tierIndex].seasons.map((season, i) =>
        i === seasonIndex
          ? {
              ...season,
              cells: season.cells.map((cell, nextCellIndex) =>
                nextCellIndex === cellIndex ? { ...cell, price } : cell
              )
            }
          : season
      )
    });
  }

  function addSeason(tierIndex: number) {
    updateTier(tierIndex, {
      seasons: [...tiers[tierIndex].seasons, createLegacyPricingSeason('')]
    });
  }

  return (
    <div className='grid gap-4'>
      <div className='rounded-lg border bg-muted/25 p-4'>
        <h3 className='text-sm font-semibold'>Legacy trip pricing table</h3>
        <p className='mt-1 text-sm text-muted-foreground'>
          Enter per-person prices by season and group size. The right-hand column stays empty here;
          the public page shows enquiry buttons in that space.
        </p>
      </div>

      {tiers.map((tier, tierIndex) => (
        <div
          className='overflow-hidden rounded-lg border border-[#3C5142]/30 bg-background shadow-sm'
          key={`${tier.tier}-${tierIndex}`}
        >
          <div className='mb-0 flex flex-wrap items-center justify-between gap-3 border-b bg-muted/30 p-4'>
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

          <div className='grid gap-4 p-4'>
            <Textarea
              value={tier.blurb}
              onChange={(event) => updateTier(tierIndex, { blurb: event.target.value })}
              placeholder='Short tier description…'
              rows={2}
            />

            <div className='overflow-x-auto rounded-md border border-[#3C5142]/20'>
              <table className='w-full min-w-[860px] text-sm'>
                <thead>
                  <tr className='border-b border-[#C8A84E] bg-[#3C5142] text-left text-xs font-semibold uppercase tracking-wide text-white'>
                    <th className='w-52 px-3 py-3'>Season</th>
                    {LEGACY_PAX_BANDS.map((band) => (
                      <th className='px-3 py-3' key={band}>
                        {band}
                      </th>
                    ))}
                    <th className='px-3 py-3 text-center'>Enquiry</th>
                  </tr>
                </thead>
                <tbody>
                  {tier.seasons.map((season, seasonIndex) => (
                    <tr className='border-b last:border-b-0 even:bg-muted/20' key={seasonIndex}>
                      <th className='px-3 py-3 align-top'>
                        <Input
                          aria-label={`Season ${seasonIndex + 1}`}
                          value={season.label}
                          onChange={(event) =>
                            updateSeasonLabel(tierIndex, seasonIndex, event.target.value)
                          }
                          placeholder='Season dates'
                        />
                      </th>
                      {season.cells.map((cell, cellIndex) => (
                        <td className='px-3 py-3 align-top' key={cell.groupBand}>
                          <Input
                            aria-label={`${season.label || `Season ${seasonIndex + 1}`} ${cell.groupBand} price`}
                            inputMode='numeric'
                            value={cell.price}
                            onChange={(event) =>
                              updatePrice(tierIndex, seasonIndex, cellIndex, event.target.value)
                            }
                            placeholder='Price'
                          />
                        </td>
                      ))}
                      <td className='px-3 py-3 text-center align-middle'>
                        <span className='text-muted-foreground inline-flex rounded-md border border-dashed px-3 py-2 text-[11px] font-semibold uppercase tracking-wide'>
                          Book CTA
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Button type='button' size='sm' variant='outline' onClick={() => addSeason(tierIndex)}>
              <Icons.add className='mr-2 size-4' />
              Add season row
            </Button>
          </div>
        </div>
      ))}

      <Button
        type='button'
        variant='outline'
        size='sm'
        onClick={() => onChange([...tiers, createDefaultLegacyPricingTier()])}
      >
        <Icons.add className='mr-2 size-4' />
        Add pricing tier
      </Button>
    </div>
  );
}
