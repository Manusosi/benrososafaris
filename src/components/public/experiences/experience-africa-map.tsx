'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { geoNaturalEarth1, geoPath, type GeoPermissibleObjects } from 'd3-geo';

import { Icons } from '@/components/icons';
import {
  BENROSO_OPERATING_COUNTRIES,
  DEFAULT_BENROSO_COUNTRY_ID,
  getCountryById,
  OPERATING_ISO_TO_ID,
  type BenrosoCountryId
} from '@/features/experiences/public/country-map-copy';
import { cn } from '@/lib/utils';

gsap.registerPlugin(ScrollTrigger, useGSAP);

type GeoJsonFeature = GeoJSON.Feature<
  GeoJSON.Polygon | GeoJSON.MultiPolygon,
  {
    ISO_A3: string;
    NAME: string;
    LABEL_X: number;
    LABEL_Y: number;
  }
>;

type GeoJsonCollection = GeoJSON.FeatureCollection<
  GeoJSON.Polygon | GeoJSON.MultiPolygon,
  GeoJsonFeature['properties']
>;

type CountryLabel = {
  id: BenrosoCountryId;
  name: string;
  x: number;
  y: number;
};

type RenderFeature = {
  d: string;
  isoA3: string;
  operatingId: BenrosoCountryId | null;
};

type MapSize = {
  width: number;
  height: number;
};

const MAP_PADDING = 2;
const MAP_PADDING_RIGHT = 0;
const CARD_LEFT_INSET_SM = 24; // minimal padding — card overlays map, no left margin reserved
const CARD_LEFT_INSET_MD = 32;
const MAP_HORIZONTAL_SCALE = 1.07;
const FIT_WEST_BUFFER_ISOS = ['COD', 'AGO', 'NAM', 'BWA', 'MOZ'];
const MAP_SURFACE = '#f5f4f0';
const MUTED_FILL = '#dcdcd8';
const MUTED_STROKE = '#ffffff';
const ACTIVE_STROKE = '#3c5142';

function getCardLeftInset(width: number): number {
  return width >= 768 ? CARD_LEFT_INSET_MD : CARD_LEFT_INSET_SM;
}

function buildMapGeometry(
  data: GeoJsonCollection,
  width: number,
  height: number
): { features: RenderFeature[]; labels: CountryLabel[] } {
  const projection = geoNaturalEarth1();

  const operatingFeatures = data.features.filter(
    (feature) => OPERATING_ISO_TO_ID[feature.properties.ISO_A3] !== undefined
  );

  const westBufferFeatures = data.features.filter((feature) =>
    FIT_WEST_BUFFER_ISOS.includes(feature.properties.ISO_A3)
  );

  const fitCollection: GeoJsonCollection = {
    type: 'FeatureCollection',
    features: [...operatingFeatures, ...westBufferFeatures]
  };

  const cardLeftInset = getCardLeftInset(width);

  projection.fitExtent(
    [
      [cardLeftInset, MAP_PADDING],
      [width - MAP_PADDING_RIGHT, height - MAP_PADDING]
    ],
    fitCollection as GeoPermissibleObjects
  );

  const scale = projection.scale();
  const translate = projection.translate();
  projection.scale(scale * MAP_HORIZONTAL_SCALE);
  projection.translate([translate[0] + (width - cardLeftInset) * 0.03, translate[1]]);

  const pathGenerator = geoPath(projection);
  const features: RenderFeature[] = data.features
    .map((feature) => ({
      d: pathGenerator(feature as GeoPermissibleObjects) ?? '',
      isoA3: feature.properties.ISO_A3,
      operatingId: OPERATING_ISO_TO_ID[feature.properties.ISO_A3] ?? null
    }))
    .filter((feature) => feature.d.length > 0);

  const labels: CountryLabel[] = BENROSO_OPERATING_COUNTRIES.map((country) => {
    const feature = data.features.find((item) => item.properties.ISO_A3 === country.isoA3);
    const labelLon = feature?.properties.LABEL_X ?? 0;
    const labelLat = feature?.properties.LABEL_Y ?? 0;
    const projected = projection([labelLon, labelLat]);

    return {
      id: country.id,
      name: country.name,
      x: projected?.[0] ?? 0,
      y: projected?.[1] ?? 0
    };
  });

  return { features, labels };
}

function CountryInfoCard({
  countryId,
  onClose,
  cardRef
}: {
  countryId: BenrosoCountryId;
  onClose: () => void;
  cardRef: React.RefObject<HTMLDivElement | null>;
}) {
  const country = getCountryById(countryId);
  const contentRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduced || !contentRef.current) return;

      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }
      );
    },
    { dependencies: [countryId], scope: contentRef, revertOnUpdate: true }
  );

  return (
    <div
      className='relative overflow-hidden rounded-[3px] border border-[var(--benroso-line)] bg-white'
      ref={cardRef}
    >
      <button
        aria-label='Close country details'
        className='absolute right-3 top-3 z-20 inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--benroso-line)] bg-white text-[var(--benroso-muted)] transition-colors hover:border-[var(--benroso-primary)] hover:text-[var(--benroso-primary)]'
        onClick={onClose}
        type='button'
      >
        <Icons.close className='h-4 w-4' />
      </button>

      <div ref={contentRef}>
        <div className='relative h-40 w-full bg-[var(--benroso-ivory)] md:h-44'>
          <Image
            alt={country.name}
            className='object-cover'
            fill
            sizes='360px'
            src={country.image}
          />
        </div>

        <div className='p-4 md:p-5'>
          <p className='font-display text-[1.5rem] leading-tight text-[#3c5142] md:text-[1.625rem]'>
            {country.name}
          </p>
          <span aria-hidden className='benroso-gold-line benroso-gold-line--left mt-3' />
          <p className='mt-3 line-clamp-4 text-[14px] leading-6 text-[var(--benroso-ink)] md:text-[15px] md:leading-[1.65]'>
            {country.blurb}
          </p>
        </div>
      </div>
    </div>
  );
}

export function ExperienceAfricaMap() {
  const sectionRef = useRef<HTMLElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [geoData, setGeoData] = useState<GeoJsonCollection | null>(null);
  const [mapSize, setMapSize] = useState<MapSize | null>(null);
  const [renderFeatures, setRenderFeatures] = useState<RenderFeature[]>([]);
  const [labels, setLabels] = useState<CountryLabel[]>([]);
  const [activeCountryId, setActiveCountryId] = useState<BenrosoCountryId>(
    DEFAULT_BENROSO_COUNTRY_ID
  );
  const [cardVisible, setCardVisible] = useState(true);
  const [hoveredCountryId, setHoveredCountryId] = useState<BenrosoCountryId | null>(null);

  const highlightedCountryId = hoveredCountryId ?? activeCountryId;

  const operatingById = useMemo(
    () => Object.fromEntries(BENROSO_OPERATING_COUNTRIES.map((country) => [country.id, country])),
    []
  );

  useLayoutEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    const updateSize = () => {
      const width = container.offsetWidth;
      const height = container.offsetHeight;
      if (width < 1 || height < 1) return;

      setMapSize((current) => {
        const next = { width: Math.round(width), height: Math.round(height) };
        if (current?.width === next.width && current?.height === next.height) {
          return current;
        }
        return next;
      });
    };

    updateSize();

    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadGeoJson() {
      const response = await fetch('/geo/africa-admin0.geojson');
      if (!response.ok) return;

      const data = (await response.json()) as GeoJsonCollection;
      if (cancelled) return;

      setGeoData(data);
    }

    void loadGeoJson();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!geoData || !mapSize || mapSize.width < 1 || mapSize.height < 1) return;

    const { features, labels: nextLabels } = buildMapGeometry(
      geoData,
      mapSize.width,
      mapSize.height
    );
    setRenderFeatures(features);
    setLabels(nextLabels);
    ScrollTrigger.refresh();
  }, [geoData, mapSize]);

  useGSAP(
    () => {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduced || !sectionRef.current) return;

      gsap.from(sectionRef.current.querySelectorAll('[data-map-reveal]'), {
        y: 28,
        duration: 0.85,
        ease: 'power2.out',
        stagger: 0.12,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 82%',
          once: true
        }
      });
    },
    { scope: sectionRef }
  );

  function handleCountrySelect(id: BenrosoCountryId) {
    setActiveCountryId(id);
    setCardVisible(true);
  }

  function getFeatureFill(feature: RenderFeature) {
    if (!feature.operatingId) return MUTED_FILL;

    const country = operatingById[feature.operatingId];
    const isHighlighted = feature.operatingId === highlightedCountryId;

    if (isHighlighted) return country.fill;

    return `${country.fill}99`;
  }

  const mapReady = Boolean(geoData && mapSize && mapSize.width > 0 && mapSize.height > 0);

  return (
    <section
      className='border-b border-[var(--benroso-line)] bg-[var(--benroso-warm-gray)]'
      ref={sectionRef}
    >
      <div className='benroso-container pb-16 md:pb-20 lg:pb-24'>
        <div aria-hidden className='h-px w-full bg-[var(--benroso-line)]' data-map-reveal />

        <div
          className='relative mt-8 w-full overflow-hidden md:mt-10'
          data-map-reveal
          ref={mapContainerRef}
          style={{ height: 'min(70vh, 720px)', minHeight: '480px' }}
        >
          {mapReady ? (
            <svg
              aria-label='Map of Benroso Safaris operating countries in East and Southern Africa'
              className='absolute inset-0 block h-full w-full'
              height={mapSize!.height}
              preserveAspectRatio='none'
              role='img'
              viewBox={`0 0 ${mapSize!.width} ${mapSize!.height}`}
              width={mapSize!.width}
            >
              <rect
                fill={MAP_SURFACE}
                height={mapSize!.height}
                width={mapSize!.width}
                x='0'
                y='0'
              />

              {renderFeatures.map((feature) => {
                const isOperating = Boolean(feature.operatingId);
                const isHighlighted = isOperating && feature.operatingId === highlightedCountryId;

                return (
                  <path
                    className={cn(
                      'transition-[fill,stroke,stroke-width] duration-200',
                      isOperating ? 'cursor-pointer' : 'pointer-events-none'
                    )}
                    d={feature.d}
                    fill={getFeatureFill(feature)}
                    key={feature.isoA3}
                    onClick={() => {
                      if (feature.operatingId) handleCountrySelect(feature.operatingId);
                    }}
                    onMouseEnter={() => {
                      if (feature.operatingId) setHoveredCountryId(feature.operatingId);
                    }}
                    onMouseLeave={() => setHoveredCountryId(null)}
                    stroke={isHighlighted ? ACTIVE_STROKE : MUTED_STROKE}
                    strokeWidth={isHighlighted ? 1.75 : 0.75}
                  />
                );
              })}

              {labels.map((label) => {
                const isHighlighted = label.id === highlightedCountryId;

                return (
                  <g
                    className={cn('pointer-events-none transition-opacity duration-200', {
                      'opacity-100': isHighlighted,
                      'opacity-85': !isHighlighted
                    })}
                    key={label.id}
                  >
                    <circle
                      cx={label.x}
                      cy={label.y - 10}
                      fill={operatingById[label.id].dotFill}
                      r={4}
                      stroke='#ffffff'
                      strokeWidth={1.5}
                    />
                    <text
                      fill='#f0f0ee'
                      fontSize='11'
                      fontWeight='300'
                      paintOrder='stroke fill'
                      stroke='#3a3a38'
                      strokeWidth={0.75}
                      textAnchor='middle'
                      x={label.x}
                      y={label.y + 8}
                    >
                      {label.name}
                    </text>
                  </g>
                );
              })}
            </svg>
          ) : null}

          {cardVisible ? (
            <div className='absolute left-[20%] top-6 z-10 w-[min(100%,320px)] md:left-[22%] md:w-[min(100%,360px)] lg:left-[24%]'>
              <CountryInfoCard
                cardRef={cardRef}
                countryId={highlightedCountryId}
                onClose={() => setCardVisible(false)}
              />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
