import { COUNTRIES, FOOD_ITEMS } from '@eushop/catalog-data';
import { countryPalette } from '@eushop/design-tokens';

/**
 * Showcase data shown ONLY when `?demo=1` cookie is set. Never reached on a
 * normal production page load. The intent is to give Y Combinator partners
 * and seed investors a credible first impression while the live database is
 * still warming up — all of it is clearly labelled in the UI by the
 * <DemoModeBanner /> component so nobody mistakes it for traffic.
 *
 * The dataset is deterministically derived from the real curated catalog
 * (`@eushop/catalog-data`), so we never invent fictional product names.
 * Personas are intentionally generic ("A diaspora seller in Munich") rather
 * than fake names, and there are no fake photos: every card uses a tinted
 * country-palette swatch as its image.
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
  itemName: string;
  countryIso2: string;
  city: string;
  maxFee: number;
  radiusKm: number;
  hoursAgo: number;
}

export interface ShowcaseTrip {
  id: string;
  fromIso: string;
  fromCity: string;
  toIso: string;
  toCity: string;
  departIn: string;
  slotsTotal: number;
  slotsAvailable: number;
  defaultPerSlotFee: number;
}

const featuredSlugs = [
  'krowki-mleczne',
  'mastiha-chios',
  'kalev-chocolate',
  'pasteis-de-nata',
  'kofola',
  'taytos',
  'turron-jijona',
  'manner-original',
  'sult',
  'kerrygold-butter',
  'wedel-mieszanka',
  'ginja',
];

const cities: Array<{ iso: string; city: string }> = [
  { iso: 'DE', city: 'Munich Glockenbach' },
  { iso: 'PT', city: 'Lisbon Alfama' },
  { iso: 'SE', city: 'Stockholm Södermalm' },
  { iso: 'DE', city: 'Berlin Kreuzberg' },
  { iso: 'AT', city: 'Vienna Neubau' },
  { iso: 'NL', city: 'Amsterdam Oost' },
  { iso: 'DE', city: 'Munich Maxvorstadt' },
  { iso: 'AT', city: 'Vienna Leopoldstadt' },
  { iso: 'SE', city: 'Stockholm Vasastan' },
  { iso: 'NL', city: 'Amsterdam Jordaan' },
  { iso: 'PT', city: 'Lisbon Príncipe Real' },
  { iso: 'DE', city: 'Berlin Mitte' },
];

export function showcaseListings(): ShowcaseListing[] {
  return featuredSlugs.map((slug, idx) => {
    const item = FOOD_ITEMS.find((i) => i.slug === slug);
    const where = cities[idx % cities.length]!;
    const palette = countryPalette[item?.originCountryIso2 ?? 'EU'] ?? {
      primary: '#3B2F22',
    };
    return {
      id: `showcase-listing-${idx}`,
      itemSlug: slug,
      itemName: item?.name ?? slug,
      itemDescription: item?.description ?? '',
      countryIso2: where.iso,
      city: where.city,
      finderFee: [3, 4, 5, 6, 7, 8, 10][idx % 7]!,
      qty: 1 + (idx % 3),
      hoursAgo: 2 + idx * 4,
      paletteHex: palette.primary,
    };
  });
}

export function showcaseRequests(): ShowcaseRequest[] {
  const seeds: Array<{
    slug?: string;
    itemName: string;
    iso: string;
    city: string;
    fee: number;
    radius: number;
  }> = [
    {
      slug: 'krowki-mleczne',
      itemName: 'Krówki Mleczne',
      iso: 'DE',
      city: 'Munich',
      fee: 7,
      radius: 30,
    },
    {
      slug: 'mastiha-chios',
      itemName: 'Mastiha of Chios',
      iso: 'PT',
      city: 'Lisbon',
      fee: 12,
      radius: 50,
    },
    { slug: 'sult', itemName: 'Sült', iso: 'SE', city: 'Stockholm', fee: 8, radius: 40 },
    {
      slug: 'ptasie-mleczko',
      itemName: 'Ptasie Mleczko',
      iso: 'DE',
      city: 'Berlin',
      fee: 6,
      radius: 20,
    },
    {
      slug: 'halloumi-pdo',
      itemName: 'Halloumi PDO',
      iso: 'AT',
      city: 'Vienna',
      fee: 10,
      radius: 25,
    },
    { slug: 'cuberdon', itemName: 'Cuberdon', iso: 'ES', city: 'Madrid', fee: 5, radius: 30 },
    { itemName: 'Manner Original Neapolitaner', iso: 'FR', city: 'Paris', fee: 4, radius: 15 },
    {
      slug: 'becherovka',
      itemName: 'Becherovka',
      iso: 'FI',
      city: 'Helsinki',
      fee: 15,
      radius: 80,
    },
    {
      slug: 'taytos',
      itemName: 'Tayto Cheese & Onion',
      iso: 'NL',
      city: 'Amsterdam',
      fee: 6,
      radius: 35,
    },
    {
      slug: 'kalles-kaviar',
      itemName: 'Kalles Kaviar',
      iso: 'IT',
      city: 'Rome',
      fee: 7,
      radius: 40,
    },
  ];
  return seeds.map((s, idx) => ({
    id: `showcase-request-${idx}`,
    itemSlug: s.slug,
    itemName: s.itemName,
    countryIso2: s.iso,
    city: s.city,
    maxFee: s.fee,
    radiusKm: s.radius,
    hoursAgo: 4 + idx * 3,
  }));
}

export function showcaseTrips(): ShowcaseTrip[] {
  return [
    {
      id: 'showcase-trip-1',
      fromIso: 'PL',
      fromCity: 'Warsaw',
      toIso: 'DE',
      toCity: 'Munich',
      departIn: 'in 6 days',
      slotsTotal: 8,
      slotsAvailable: 5,
      defaultPerSlotFee: 6,
    },
    {
      id: 'showcase-trip-2',
      fromIso: 'GR',
      fromCity: 'Thessaloniki',
      toIso: 'PT',
      toCity: 'Lisbon',
      departIn: 'in 12 days',
      slotsTotal: 6,
      slotsAvailable: 4,
      defaultPerSlotFee: 8,
    },
    {
      id: 'showcase-trip-3',
      fromIso: 'EE',
      fromCity: 'Tallinn',
      toIso: 'SE',
      toCity: 'Stockholm',
      departIn: 'in 4 days',
      slotsTotal: 10,
      slotsAvailable: 7,
      defaultPerSlotFee: 5,
    },
    {
      id: 'showcase-trip-4',
      fromIso: 'CZ',
      fromCity: 'Prague',
      toIso: 'AT',
      toCity: 'Vienna',
      departIn: 'in 2 days',
      slotsTotal: 5,
      slotsAvailable: 2,
      defaultPerSlotFee: 4,
    },
    {
      id: 'showcase-trip-5',
      fromIso: 'IE',
      fromCity: 'Dublin',
      toIso: 'NL',
      toCity: 'Amsterdam',
      departIn: 'in 9 days',
      slotsTotal: 6,
      slotsAvailable: 6,
      defaultPerSlotFee: 5,
    },
    {
      id: 'showcase-trip-6',
      fromIso: 'PT',
      fromCity: 'Lisbon',
      toIso: 'DE',
      toCity: 'Berlin',
      departIn: 'in 14 days',
      slotsTotal: 8,
      slotsAvailable: 8,
      defaultPerSlotFee: 7,
    },
  ];
}

/** Aggregate counts shown only in demo mode on the homepage KPI strip. */
export function showcaseStats() {
  const listings = showcaseListings();
  const requests = showcaseRequests();
  const trips = showcaseTrips();
  return {
    countries: COUNTRIES.length,
    cities: new Set(listings.map((l) => l.city.split(' ')[0])).size,
    liveListings: listings.length,
    openRequests: requests.length,
    upcomingTrips: trips.length,
    catalogItems: FOOD_ITEMS.length,
  };
}
