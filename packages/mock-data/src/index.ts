/**
 * Showcase / mock data for Eushop.
 *
 * Used by:
 *   - tRPC routers as a graceful fallback when the DB has no rows or is down,
 *     so the demo always renders something investor-credible.
 *   - The marketing site (LiveDiscover) and admin overview, where we want a
 *     deterministic preview that doesn't depend on infra.
 *
 * Everything here is *fictional*. IDs are stable v4-shaped strings so client
 * caches stay coherent across requests.
 */

import { COUNTRIES, FOOD_ITEMS } from '@eushop/catalog-data';

export type SampleFreshness = 'today' | '3-days' | 'week' | 'month' | 'shelf-stable';
export type SampleListingStatus = 'live' | 'reserved' | 'completed' | 'expired' | 'removed';
export type SampleRequestStatus = 'open' | 'matched' | 'fulfilled' | 'expired' | 'closed';

export interface SamplePersona {
  id: string;
  name: string;
  city: string;
  countryIso2: string;
  origin: string;
  bio: string;
  avatar: string;
  trustScore: number;
}

export const SAMPLE_USERS: SamplePersona[] = [
  {
    id: 'usr-1f1b2a3c-4d5e-6f70-8190-aaaaaaaaaaaa',
    name: 'Marta K.',
    city: 'Munich',
    countryIso2: 'DE',
    origin: 'PL',
    bio: 'Polish nurse, two flights home a year, always a half-suitcase of Wedel.',
    avatar: 'https://placehold.co/160x160/F2ECE1/3B2F22?text=MK',
    trustScore: 92,
  },
  {
    id: 'usr-2a2b2c3d-4e5f-6a70-8190-bbbbbbbbbbbb',
    name: 'Yannis P.',
    city: 'Lisbon',
    countryIso2: 'PT',
    origin: 'GR',
    bio: 'Bartender from Thessaloniki. Mastiha, ouzo, the right halva.',
    avatar: 'https://placehold.co/160x160/F2ECE1/274D3A?text=YP',
    trustScore: 88,
  },
  {
    id: 'usr-3b3c3d4e-5f6a-7b80-9190-cccccccccccc',
    name: 'Liisa T.',
    city: 'Stockholm',
    countryIso2: 'SE',
    origin: 'EE',
    bio: 'Estonian designer. Brings back Kalev, Sült and proper rye.',
    avatar: 'https://placehold.co/160x160/F2ECE1/1F4FA0?text=LT',
    trustScore: 95,
  },
  {
    id: 'usr-4c4d4e5f-6a7b-8c90-a190-dddddddddddd',
    name: 'Joana R.',
    city: 'Berlin',
    countryIso2: 'DE',
    origin: 'PT',
    bio: 'Lisboeta in Kreuzberg. Pastéis de nata twice a month, ginja for the holidays.',
    avatar: 'https://placehold.co/160x160/F2ECE1/B0302C?text=JR',
    trustScore: 90,
  },
  {
    id: 'usr-5d5e5f60-7a8b-9ca0-b190-eeeeeeeeeeee',
    name: 'Tomáš H.',
    city: 'Vienna',
    countryIso2: 'AT',
    origin: 'CZ',
    bio: 'Prague-born sound engineer. Kofola, Tatranky, Hořická trubička.',
    avatar: 'https://placehold.co/160x160/F2ECE1/9C5C03?text=TH',
    trustScore: 87,
  },
  {
    id: 'usr-6e6f7081-9a0b-acb0-c190-ffffffffffff',
    name: 'Aoife N.',
    city: 'Amsterdam',
    countryIso2: 'NL',
    origin: 'IE',
    bio: "Dubliner abroad. Tayto, Barry's, Kerrygold for visiting parents.",
    avatar: 'https://placehold.co/160x160/F2ECE1/274D3A?text=AN',
    trustScore: 93,
  },
];

const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1485921325833-c519f76c4927?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1473093226795-af9932fe5856?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1459789028334-3a9a164bcdb1?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1499942233440-f51b2c1b89c1?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=1200&q=80',
];

interface ListingSeed {
  itemSlug: string;
  city: string;
  countryIso2: string;
  cellGeohash: string;
  approxLat: number;
  approxLng: number;
  fee: number;
  qty: number;
  freshness: SampleFreshness;
  notes?: string;
  hoursAgo: number;
  sellerIdx: number;
  imageIdx: number;
}

const LISTING_SEEDS: ListingSeed[] = [
  {
    itemSlug: 'krowki-mleczne',
    city: 'Munich',
    countryIso2: 'DE',
    cellGeohash: 'u281z',
    approxLat: 48.137,
    approxLng: 11.575,
    fee: 4,
    qty: 3,
    freshness: 'shelf-stable',
    notes: '3 packets back from Warsaw last weekend. Happy to drop near U-Bahn Sendlinger Tor.',
    hoursAgo: 6,
    sellerIdx: 0,
    imageIdx: 0,
  },
  {
    itemSlug: 'mastiha-chios',
    city: 'Lisbon',
    countryIso2: 'PT',
    cellGeohash: 'eyckx',
    approxLat: 38.722,
    approxLng: -9.139,
    fee: 6,
    qty: 1,
    freshness: 'shelf-stable',
    notes: 'Genuine Chios mastiha tears, 50g jar. Brought back two, keeping one.',
    hoursAgo: 14,
    sellerIdx: 1,
    imageIdx: 1,
  },
  {
    itemSlug: 'kalev-chocolate',
    city: 'Stockholm',
    countryIso2: 'SE',
    cellGeohash: 'u6scu',
    approxLat: 59.331,
    approxLng: 18.071,
    fee: 3,
    qty: 5,
    freshness: 'shelf-stable',
    notes: '5 bags of Kalev Kommi. Söder area, evening pickup works best.',
    hoursAgo: 22,
    sellerIdx: 2,
    imageIdx: 2,
  },
  {
    itemSlug: 'pasteis-de-nata',
    city: 'Berlin',
    countryIso2: 'DE',
    cellGeohash: 'u33dc',
    approxLat: 52.499,
    approxLng: 13.418,
    fee: 5,
    qty: 6,
    freshness: 'today',
    notes: 'Just out of the oven, 6 fresh nata from Belém recipe. Today only.',
    hoursAgo: 2,
    sellerIdx: 3,
    imageIdx: 3,
  },
  {
    itemSlug: 'kofola',
    city: 'Vienna',
    countryIso2: 'AT',
    cellGeohash: 'u2edk',
    approxLat: 48.21,
    approxLng: 16.37,
    fee: 4,
    qty: 2,
    freshness: 'month',
    notes: 'Two 1.5L bottles. Original Kofola, the Czech original.',
    hoursAgo: 30,
    sellerIdx: 4,
    imageIdx: 4,
  },
  {
    itemSlug: 'tayto-cheese-onion',
    city: 'Amsterdam',
    countryIso2: 'NL',
    cellGeohash: 'u173z',
    approxLat: 52.367,
    approxLng: 4.904,
    fee: 4,
    qty: 4,
    freshness: 'week',
    notes: 'Cheese & Onion 4-pack. Crisps for any homesick Dub.',
    hoursAgo: 9,
    sellerIdx: 5,
    imageIdx: 5,
  },
  {
    itemSlug: 'wedel-mieszanka',
    city: 'Munich',
    countryIso2: 'DE',
    cellGeohash: 'u281z',
    approxLat: 48.137,
    approxLng: 11.575,
    fee: 7,
    qty: 1,
    freshness: 'shelf-stable',
    notes: 'Boxed Wedel Mieszanka tin, 300g. Christmas-special edition.',
    hoursAgo: 50,
    sellerIdx: 0,
    imageIdx: 6,
  },
  {
    itemSlug: 'ginja',
    city: 'Berlin',
    countryIso2: 'DE',
    cellGeohash: 'u33dc',
    approxLat: 52.499,
    approxLng: 13.418,
    fee: 8,
    qty: 1,
    freshness: 'shelf-stable',
    notes: 'Ginjinha from Óbidos, half-bottle. Drink in a chocolate cup if you can.',
    hoursAgo: 26,
    sellerIdx: 3,
    imageIdx: 7,
  },
  {
    itemSlug: 'kerrygold-butter',
    city: 'Amsterdam',
    countryIso2: 'NL',
    cellGeohash: 'u173z',
    approxLat: 52.367,
    approxLng: 4.904,
    fee: 2,
    qty: 4,
    freshness: 'week',
    notes: '4 blocks Kerrygold (the Irish-printed packs). Salted.',
    hoursAgo: 4,
    sellerIdx: 5,
    imageIdx: 8,
  },
  {
    itemSlug: 'turron-jijona',
    city: 'Lisbon',
    countryIso2: 'PT',
    cellGeohash: 'eyckx',
    approxLat: 38.722,
    approxLng: -9.139,
    fee: 5,
    qty: 2,
    freshness: 'month',
    notes: '2 bars Turrón de Jijona. Sealed.',
    hoursAgo: 19,
    sellerIdx: 1,
    imageIdx: 9,
  },
  {
    itemSlug: 'mannerschnitten',
    city: 'Vienna',
    countryIso2: 'AT',
    cellGeohash: 'u2edk',
    approxLat: 48.21,
    approxLng: 16.37,
    fee: 3,
    qty: 6,
    freshness: 'shelf-stable',
    notes: 'Manner Schnitten, original hazelnut, 6 packs.',
    hoursAgo: 38,
    sellerIdx: 4,
    imageIdx: 10,
  },
  {
    itemSlug: 'sult',
    city: 'Stockholm',
    countryIso2: 'SE',
    cellGeohash: 'u6scu',
    approxLat: 59.331,
    approxLng: 18.071,
    fee: 6,
    qty: 1,
    freshness: '3-days',
    notes: 'Homemade Estonian sült, fresh batch. Cold chain only — courier handoff.',
    hoursAgo: 12,
    sellerIdx: 2,
    imageIdx: 11,
  },
];

export interface SampleListing {
  id: string;
  sellerId: string;
  foodItemId: string | null;
  freeformName: string | null;
  brandName: string | null;
  notes: string | null;
  qty: number;
  unit: string;
  finderFee: string;
  currency: string;
  freshness: SampleFreshness;
  status: SampleListingStatus;
  indexGeohash: string;
  cellGeohash: string;
  approximateCity: string;
  countryIso2: string;
  photos: { url: string; width?: number; height?: number }[];
  location: { lat: number; lng: number };
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

function pad2(id: number): string {
  return id.toString(16).padStart(2, '0');
}

function listingId(idx: number): string {
  return `lst-${pad2(idx)}000000-0000-4000-8000-000000000000`;
}

function itemIdFromSlug(slug: string): string {
  const i = FOOD_ITEMS.findIndex((x) => x.slug === slug);
  return `itm-${pad2(i + 1)}000000-0000-4000-8000-000000000000`;
}

const NOW = Date.UTC(2026, 4, 1, 12, 0, 0);

export const SAMPLE_LISTINGS: SampleListing[] = LISTING_SEEDS.map((s, i) => {
  const seller = SAMPLE_USERS[s.sellerIdx]!;
  const item = FOOD_ITEMS.find((x) => x.slug === s.itemSlug);
  const created = new Date(NOW - s.hoursAgo * 3600_000);
  return {
    id: listingId(i + 1),
    sellerId: seller.id,
    foodItemId: item ? itemIdFromSlug(item.slug) : null,
    freeformName: item?.name ?? s.itemSlug,
    brandName: null,
    notes: s.notes ?? null,
    qty: s.qty,
    unit: 'item',
    finderFee: s.fee.toFixed(2),
    currency: 'EUR',
    freshness: s.freshness,
    status: 'live',
    indexGeohash: `${s.cellGeohash}idx`,
    cellGeohash: s.cellGeohash,
    approximateCity: s.city,
    countryIso2: s.countryIso2,
    photos: [{ url: HERO_IMAGES[s.imageIdx % HERO_IMAGES.length]! }],
    location: { lat: s.approxLat, lng: s.approxLng },
    expiresAt: new Date(NOW + 14 * 86_400_000),
    createdAt: created,
    updatedAt: created,
  };
});

export interface SampleRequest {
  id: string;
  buyerId: string;
  foodItemId: string | null;
  freeformText: string;
  notes: string | null;
  maxFinderFee: string | null;
  currency: string;
  location: { lat: number; lng: number };
  cellGeohash: string;
  approximateCity: string;
  countryIso2: string;
  radiusKm: number;
  notifyOnMatch: boolean;
  status: SampleRequestStatus;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const REQUEST_SEEDS: Array<{
  text: string;
  notes?: string;
  itemSlug?: string;
  city: string;
  iso: string;
  cell: string;
  lat: number;
  lng: number;
  fee: number;
  hoursAgo: number;
  buyerIdx: number;
  radiusKm: number;
}> = [
  {
    text: 'Looking for genuine Mastiha (the resin, not the liqueur).',
    itemSlug: 'mastiha-chios',
    city: 'Berlin',
    iso: 'DE',
    cell: 'u33dc',
    lat: 52.52,
    lng: 13.405,
    fee: 12,
    hoursAgo: 8,
    buyerIdx: 3,
    radiusKm: 25,
  },
  {
    text: 'Anyone bringing Wedel Ptasie Mleczko?',
    itemSlug: 'ptasie-mleczko',
    city: 'Vienna',
    iso: 'AT',
    cell: 'u2edk',
    lat: 48.208,
    lng: 16.373,
    fee: 8,
    hoursAgo: 18,
    buyerIdx: 4,
    radiusKm: 30,
  },
  {
    text: 'Need Tayto cheese & onion for a homesick birthday gift.',
    itemSlug: 'tayto-cheese-onion',
    city: 'Amsterdam',
    iso: 'NL',
    cell: 'u173z',
    lat: 52.367,
    lng: 4.904,
    fee: 6,
    hoursAgo: 4,
    buyerIdx: 5,
    radiusKm: 15,
  },
  {
    text: 'Halloumi block, the proper Cypriot one (not Greek-pack).',
    city: 'Munich',
    iso: 'DE',
    cell: 'u281z',
    lat: 48.137,
    lng: 11.575,
    fee: 7,
    hoursAgo: 30,
    buyerIdx: 0,
    radiusKm: 20,
  },
  {
    text: 'Pastéis de nata, fresh, for a Saturday brunch (4–6 needed).',
    itemSlug: 'pasteis-de-nata',
    city: 'Stockholm',
    iso: 'SE',
    cell: 'u6scu',
    lat: 59.329,
    lng: 18.068,
    fee: 10,
    hoursAgo: 12,
    buyerIdx: 2,
    radiusKm: 25,
  },
  {
    text: 'Krówki Mleczne — a small bag for a daughter\u2019s birthday.',
    itemSlug: 'krowki-mleczne',
    city: 'Lisbon',
    iso: 'PT',
    cell: 'eyckx',
    lat: 38.722,
    lng: -9.139,
    fee: 5,
    hoursAgo: 25,
    buyerIdx: 1,
    radiusKm: 30,
  },
  {
    text: 'Estonian Vana Tallinn (the proper bottle).',
    itemSlug: 'vana-tallinn',
    city: 'Berlin',
    iso: 'DE',
    cell: 'u33dc',
    lat: 52.52,
    lng: 13.405,
    fee: 9,
    hoursAgo: 50,
    buyerIdx: 3,
    radiusKm: 50,
  },
  {
    text: 'Kerrygold salted, 4 blocks if anyone has a brick to spare.',
    itemSlug: 'kerrygold-butter',
    city: 'Vienna',
    iso: 'AT',
    cell: 'u2edk',
    lat: 48.208,
    lng: 16.373,
    fee: 6,
    hoursAgo: 7,
    buyerIdx: 4,
    radiusKm: 20,
  },
];

function requestId(idx: number): string {
  return `req-${pad2(idx)}000000-0000-4000-8000-000000000000`;
}

export const SAMPLE_REQUESTS: SampleRequest[] = REQUEST_SEEDS.map((r, i) => {
  const buyer = SAMPLE_USERS[r.buyerIdx]!;
  const created = new Date(NOW - r.hoursAgo * 3600_000);
  return {
    id: requestId(i + 1),
    buyerId: buyer.id,
    foodItemId: r.itemSlug ? itemIdFromSlug(r.itemSlug) : null,
    freeformText: r.text,
    notes: r.notes ?? null,
    maxFinderFee: r.fee.toFixed(2),
    currency: 'EUR',
    location: { lat: r.lat, lng: r.lng },
    cellGeohash: r.cell,
    approximateCity: r.city,
    countryIso2: r.iso,
    radiusKm: r.radiusKm,
    notifyOnMatch: true,
    status: 'open',
    expiresAt: new Date(NOW + 21 * 86_400_000),
    createdAt: created,
    updatedAt: created,
  };
});

export interface SampleConversation {
  id: string;
  initiatorId: string;
  recipientId: string;
  listingId: string | null;
  requestId: string | null;
  lastMessageAt: Date;
  createdAt: Date;
}

export interface SampleMessage {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  attachments: { url: string }[];
  readAt: Date | null;
  createdAt: Date;
}

const conv = (idx: number) => `cnv-${pad2(idx)}000000-0000-4000-8000-000000000000`;
const msg = (idx: number) => `msg-${pad2(idx)}000000-0000-4000-8000-000000000000`;

export const SAMPLE_CONVERSATIONS: SampleConversation[] = [
  {
    id: conv(1),
    initiatorId: SAMPLE_USERS[3]!.id,
    recipientId: SAMPLE_USERS[1]!.id,
    listingId: SAMPLE_LISTINGS[1]!.id,
    requestId: null,
    lastMessageAt: new Date(NOW - 30 * 60_000),
    createdAt: new Date(NOW - 6 * 3600_000),
  },
  {
    id: conv(2),
    initiatorId: SAMPLE_USERS[4]!.id,
    recipientId: SAMPLE_USERS[0]!.id,
    listingId: SAMPLE_LISTINGS[0]!.id,
    requestId: null,
    lastMessageAt: new Date(NOW - 4 * 3600_000),
    createdAt: new Date(NOW - 26 * 3600_000),
  },
  {
    id: conv(3),
    initiatorId: SAMPLE_USERS[5]!.id,
    recipientId: SAMPLE_USERS[2]!.id,
    listingId: null,
    requestId: SAMPLE_REQUESTS[4]!.id,
    lastMessageAt: new Date(NOW - 12 * 3600_000),
    createdAt: new Date(NOW - 13 * 3600_000),
  },
];

export const SAMPLE_MESSAGES: SampleMessage[] = [
  {
    id: msg(1),
    conversationId: conv(1),
    senderId: SAMPLE_USERS[3]!.id,
    body: 'Hi! Still have the Mastiha jar? I can come to Lisbon centre tomorrow.',
    attachments: [],
    readAt: new Date(NOW - 5 * 3600_000),
    createdAt: new Date(NOW - 6 * 3600_000),
  },
  {
    id: msg(2),
    conversationId: conv(1),
    senderId: SAMPLE_USERS[1]!.id,
    body: 'Yes, still here. Café A Brasileira at 16:30?',
    attachments: [],
    readAt: new Date(NOW - 4 * 3600_000),
    createdAt: new Date(NOW - 5 * 3600_000),
  },
  {
    id: msg(3),
    conversationId: conv(1),
    senderId: SAMPLE_USERS[3]!.id,
    body: 'Perfect, I\u2019ll bring exact change.',
    attachments: [],
    readAt: null,
    createdAt: new Date(NOW - 30 * 60_000),
  },
  {
    id: msg(4),
    conversationId: conv(2),
    senderId: SAMPLE_USERS[4]!.id,
    body: 'Are the Krówki the cream-fudge ones?',
    attachments: [],
    readAt: new Date(NOW - 24 * 3600_000),
    createdAt: new Date(NOW - 26 * 3600_000),
  },
  {
    id: msg(5),
    conversationId: conv(2),
    senderId: SAMPLE_USERS[0]!.id,
    body: 'Yes, classic milk. 3 packets, 4€ for the lot.',
    attachments: [],
    readAt: null,
    createdAt: new Date(NOW - 4 * 3600_000),
  },
  {
    id: msg(6),
    conversationId: conv(3),
    senderId: SAMPLE_USERS[5]!.id,
    body: 'Saw your request for nata. I have a friend baking on Saturday.',
    attachments: [],
    readAt: new Date(NOW - 12 * 3600_000),
    createdAt: new Date(NOW - 13 * 3600_000),
  },
];

/**
 * Aggregate KPIs derived from the seed catalog. Used on home and admin overview
 * so the numbers always feel real and consistent across surfaces.
 */
export const SHOWCASE_STATS = {
  countries: COUNTRIES.length,
  cities: Array.from(new Set(SAMPLE_LISTINGS.map((l) => l.approximateCity))).length,
  liveListings: SAMPLE_LISTINGS.length,
  openRequests: SAMPLE_REQUESTS.length,
  conversations: SAMPLE_CONVERSATIONS.length,
  trustScoreAvg: Math.round(
    SAMPLE_USERS.reduce((sum, u) => sum + u.trustScore, 0) / SAMPLE_USERS.length,
  ),
};

/**
 * 12 weekly buckets (oldest first) showing fictional growth in listings
 * created per week. Used by the admin sparkline.
 */
export const SHOWCASE_WEEKLY_LISTINGS: number[] = [4, 7, 6, 11, 14, 19, 22, 31, 38, 47, 61, 78];

export const SHOWCASE_WEEKLY_REQUESTS: number[] = [3, 5, 8, 10, 12, 17, 21, 26, 31, 39, 50, 64];

export const SHOWCASE_AUDIT_LOG: Array<{
  id: string;
  ts: Date;
  actor: string;
  action: string;
  target: string;
}> = [
  {
    id: 'aud-1',
    ts: new Date(NOW - 30 * 60_000),
    actor: 'system',
    action: 'listing.created',
    target: SAMPLE_LISTINGS[3]!.id,
  },
  {
    id: 'aud-2',
    ts: new Date(NOW - 2 * 3600_000),
    actor: SAMPLE_USERS[2]!.name,
    action: 'profile.updated',
    target: SAMPLE_USERS[2]!.id,
  },
  {
    id: 'aud-3',
    ts: new Date(NOW - 4 * 3600_000),
    actor: SAMPLE_USERS[0]!.name,
    action: 'message.sent',
    target: conv(2),
  },
  {
    id: 'aud-4',
    ts: new Date(NOW - 6 * 3600_000),
    actor: 'moderator',
    action: 'listing.flagged',
    target: SAMPLE_LISTINGS[7]!.id,
  },
  {
    id: 'aud-5',
    ts: new Date(NOW - 9 * 3600_000),
    actor: 'system',
    action: 'request.matched',
    target: SAMPLE_REQUESTS[2]!.id,
  },
  {
    id: 'aud-6',
    ts: new Date(NOW - 24 * 3600_000),
    actor: 'moderator',
    action: 'user.verified',
    target: SAMPLE_USERS[5]!.id,
  },
];
