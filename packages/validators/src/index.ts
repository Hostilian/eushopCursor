import { z } from 'zod';

// ---------- Primitives -------------------------------------------------------

export const isoCountry = z
  .string()
  .length(2)
  .regex(/^[A-Z]{2}$/, 'Use ISO 3166-1 alpha-2');

export const localeCode = z
  .string()
  .min(2)
  .max(10)
  .regex(/^[a-z]{2}(-[A-Z]{2})?$/, 'Use a BCP-47 locale code (e.g. en, en-GB, pl)');

export const currencyCode = z
  .string()
  .length(3)
  .regex(/^[A-Z]{3}$/, 'Use ISO 4217');

export const slug = z
  .string()
  .min(2)
  .max(96)
  .regex(/^[a-z0-9-]+$/, 'lowercase letters, digits and dashes only');

export const latLng = z.object({
  lat: z.number().gte(-90).lte(90),
  lng: z.number().gte(-180).lte(180),
});

// ---------- Auth -------------------------------------------------------------

export const signUpInput = z.object({
  email: z.string().email(),
  password: z.string().min(10).max(128),
  displayName: z.string().min(2).max(60),
  homeCountry: isoCountry.optional(),
  currentCountry: isoCountry.optional(),
  preferredLocale: localeCode.optional(),
  acceptTerms: z.literal(true),
});
export type SignUpInput = z.infer<typeof signUpInput>;

export const signInInput = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
export type SignInInput = z.infer<typeof signInInput>;

export const profileUpdateInput = z.object({
  displayName: z.string().min(2).max(60).optional(),
  bio: z.string().max(280).optional(),
  homeCountry: isoCountry.optional(),
  currentCountry: isoCountry.optional(),
  currentCity: z.string().min(1).max(80).optional(),
  preferredLocale: localeCode.optional(),
  languagesSpoken: z.array(localeCode).max(8).optional(),
});
export type ProfileUpdateInput = z.infer<typeof profileUpdateInput>;

// ---------- Catalog ----------------------------------------------------------

export const catalogQuery = z.object({
  q: z.string().max(120).optional(),
  countryIso2: isoCountry.optional(),
  categorySlug: slug.optional(),
  brandSlug: slug.optional(),
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(60).default(24),
});
export type CatalogQuery = z.infer<typeof catalogQuery>;

// ---------- Listings ---------------------------------------------------------

export const freshnessWindow = z.enum(['today', '3-days', 'week', 'month', 'shelf-stable']);
export type FreshnessWindow = z.infer<typeof freshnessWindow>;

export const listingPhoto = z.object({
  url: z.string().url(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  blurhash: z.string().max(64).optional(),
});
export type ListingPhoto = z.infer<typeof listingPhoto>;

export const createListingInput = z.object({
  foodItemId: z.string().uuid().optional(),
  freeformName: z.string().min(2).max(80).optional(),
  brandName: z.string().max(80).optional(),
  notes: z.string().max(600).optional(),
  qty: z.number().int().min(1).max(99),
  unit: z.string().max(24).default('item'),
  finderFee: z.number().min(0).max(999),
  currency: currencyCode.default('EUR'),
  freshness: freshnessWindow.default('week'),
  expiresAt: z.coerce.date().optional(),
  photos: z.array(listingPhoto).min(1).max(8),
  location: latLng,
  approximateCity: z.string().min(1).max(80),
});
export type CreateListingInput = z.infer<typeof createListingInput>;

export const updateListingInput = createListingInput.partial().extend({
  id: z.string().uuid(),
});
export type UpdateListingInput = z.infer<typeof updateListingInput>;

export const listingSearchInput = z.object({
  q: z.string().max(120).optional(),
  near: latLng.optional(),
  radiusKm: z.number().min(1).max(500).default(25),
  /** Accept lowercase from clients; normalize to ISO2 uppercase. */
  countryIso2: z
    .string()
    .length(2)
    .transform((s) => s.toUpperCase())
    .pipe(isoCountry)
    .optional(),
  categorySlug: slug.optional(),
  brandSlug: slug.optional(),
  freshness: freshnessWindow.optional(),
  hasPhoto: z.boolean().optional(),
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(60).default(24),
});
export type ListingSearchInput = z.infer<typeof listingSearchInput>;

// ---------- Requests ---------------------------------------------------------

export const createRequestInput = z.object({
  foodItemId: z.string().uuid().optional(),
  freeformText: z.string().min(2).max(160),
  notes: z.string().max(600).optional(),
  maxFinderFee: z.number().min(0).max(999).optional(),
  currency: currencyCode.default('EUR'),
  location: latLng,
  approximateCity: z.string().min(1).max(80),
  radiusKm: z.number().min(1).max(500).default(25),
  notifyOnMatch: z.boolean().default(true),
  expiresAt: z.coerce.date().optional(),
});
export type CreateRequestInput = z.infer<typeof createRequestInput>;

// ---------- Messaging -------------------------------------------------------

export const sendMessageInput = z.object({
  conversationId: z.string().uuid(),
  body: z.string().min(1).max(2000),
  attachments: z.array(listingPhoto).max(4).optional(),
});
export type SendMessageInput = z.infer<typeof sendMessageInput>;

export const startConversationInput = z.object({
  recipientId: z.string().uuid(),
  listingId: z.string().uuid().optional(),
  requestId: z.string().uuid().optional(),
  body: z.string().min(1).max(2000),
});
export type StartConversationInput = z.infer<typeof startConversationInput>;

// ---------- Reviews ---------------------------------------------------------

export const reviewTags = z.enum([
  'fresh',
  'on-time',
  'friendly',
  'great-quality',
  'true-to-photo',
  'fair-fee',
  'easy-pickup',
]);
export type ReviewTag = z.infer<typeof reviewTags>;

export const submitReviewInput = z.object({
  conversationId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(600).optional(),
  tags: z.array(reviewTags).max(7).optional(),
});
export type SubmitReviewInput = z.infer<typeof submitReviewInput>;

// ---------- Reports ---------------------------------------------------------

export const reportReason = z.enum([
  'spam',
  'commercial',
  'unsafe-food',
  'scam',
  'inappropriate',
  'duplicate',
  'other',
]);
export type ReportReason = z.infer<typeof reportReason>;

export const submitReportInput = z.object({
  targetType: z.enum(['listing', 'request', 'user', 'message']),
  targetId: z.string().uuid(),
  reason: reportReason,
  details: z.string().max(600).optional(),
});
export type SubmitReportInput = z.infer<typeof submitReportInput>;

// ---------- Media upload ----------------------------------------------------

export const presignUploadInput = z.object({
  filename: z.string().min(1).max(120),
  contentType: z.enum(['image/jpeg', 'image/png', 'image/webp', 'image/avif']),
  byteLength: z.number().int().min(1).max(15 * 1024 * 1024),
  purpose: z.enum(['listing', 'avatar', 'food-item']),
});
export type PresignUploadInput = z.infer<typeof presignUploadInput>;
