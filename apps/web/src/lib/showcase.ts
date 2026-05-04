import { COUNTRIES, FOOD_ITEMS } from '@eushop/catalog';
import { countryPalette } from '@eushop/tokens';

/**
 * Deterministic showcase rows derived from `@eushop/catalog` only when demo mode is on.
 * No synthetic user-generated IDs are mixed with production traffic except in this labelled path.
 */

export interface ShowcaseListing {
  id: string;
  itemSlug: string;
  itemName: string;
  itemDescription: string;
  countryIso2: string;
  city: string;
  finderFee: number;
  qty: number;
  hoursAgo: number;
  paletteHex: string;
}

export interface ShowcaseRequest {
  id: string;
  itemSlug?: string;
  title: string;
  description: string;
  countryIso2: string;
  city: string;
  radiusKm: number;
  maxFinderFee: number | null;
}

export interface ShowcaseTrip {
  id: string;
  originCountryIso2: string;
  originCity: string;
  destinationCountryIso2: string;
  destinationCity: string;
  departAt: Date;
  slotsAvailable: number;
  slotsTotal: number;
  defaultPerSlotFee: string;
  notes: string | null;
  spareWeightKg: number | null;
  spareVolumeLiters: number | null;
}

function cityForCountry(iso2: string): string {
  const map: Record<string, string> = {
    PL: 'Warsaw',
    DE: 'Munich',
    GR: 'Athens',
    IT: 'Milan',
    PT: 'Lisbon',
    ES: 'Barcelona',
    FR: 'Lyon',
    NL: 'Amsterdam',
    AT: 'Vienna',
  };
  return map[iso2] ?? COUNTRIES.find((c) => c.iso2 === iso2)?.name ?? iso2;
}

export function showcaseListings(): ShowcaseListing[] {
  const n = FOOD_ITEMS.length;
  const picks = [
    0,
    Math.floor(n / 5),
    Math.floor((2 * n) / 5),
    Math.floor((3 * n) / 5),
    Math.floor((4 * n) / 5),
    n - 1,
  ];
  return picks.map((idx, i) => {
    const it = FOOD_ITEMS[idx % n]!;
    const palette = countryPalette[it.originCountryIso2] ?? { primary: '#3B2F22' };
    return {
      id: `showcase-listing-${i}`,
      itemSlug: it.slug,
      itemName: it.name,
      itemDescription: it.description,
      countryIso2: it.originCountryIso2,
      city: cityForCountry(it.originCountryIso2),
      finderFee: 2.5 + i * 0.75,
      qty: 1 + (i % 3),
      hoursAgo: 2 + i * 7,
      paletteHex: palette.primary,
    };
  });
}

export function showcaseRequests(): ShowcaseRequest[] {
  const items = [
    FOOD_ITEMS[0]!,
    FOOD_ITEMS[Math.floor(FOOD_ITEMS.length / 3)]!,
    FOOD_ITEMS[Math.floor((2 * FOOD_ITEMS.length) / 3)]!,
  ];
  return items.map((it, i) => ({
    id: `showcase-request-${i}`,
    itemSlug: it.slug,
    title: `Looking for ${it.name}`,
    description: it.description.slice(0, 120) + (it.description.length > 120 ? '…' : ''),
    countryIso2: it.originCountryIso2,
    city: cityForCountry(it.originCountryIso2),
    radiusKm: 25,
    maxFinderFee: 8 + i * 2,
  }));
}

export function showcaseTrips(): ShowcaseTrip[] {
  const routes: Omit<ShowcaseTrip, 'id'>[] = [
    {
      originCountryIso2: 'PL',
      originCity: 'Warsaw',
      destinationCountryIso2: 'DE',
      destinationCity: 'Munich',
      departAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      slotsAvailable: 2,
      slotsTotal: 4,
      defaultPerSlotFee: '12.00',
      notes: 'Returning Sunday evening; can meet near Hauptbahnhof Mon–Wed.',
      spareWeightKg: 8,
      spareVolumeLiters: 12,
    },
    {
      originCountryIso2: 'GR',
      originCity: 'Athens',
      destinationCountryIso2: 'NL',
      destinationCity: 'Amsterdam',
      departAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      slotsAvailable: 1,
      slotsTotal: 3,
      defaultPerSlotFee: '18.50',
      notes: 'Carry-on only; fragile liquids OK if sealed.',
      spareWeightKg: 5,
      spareVolumeLiters: null,
    },
    {
      originCountryIso2: 'PT',
      originCity: 'Lisbon',
      destinationCountryIso2: 'DE',
      destinationCity: 'Berlin',
      departAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      slotsAvailable: 3,
      slotsTotal: 6,
      defaultPerSlotFee: '9.00',
      notes: null,
      spareWeightKg: null,
      spareVolumeLiters: 18,
    },
  ];
  return routes.map((r, i) => ({ ...r, id: `showcase-trip-${i + 1}` }));
}

export function showcaseStats() {
  return {
    liveListings: showcaseListings().length,
    openRequests: showcaseRequests().length,
    tripOffers: showcaseTrips().length,
  };
}
