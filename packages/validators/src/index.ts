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

/** Row id / UUID primary keys shared across tRPC inputs. */
export const uuidString = z.string().uuid();

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

export const blockUserInput = z.object({ userId: uuidString });
export type BlockUserInput = z.infer<typeof blockUserInput>;

/** tRPC: any row addressed by a UUID primary key in the URL/body. */
export const uuidIdParam = z.object({ id: uuidString });
export type UuidIdParam = z.infer<typeof uuidIdParam>;

/** tRPC: optional limit for `trips.recent`. */
export const tripsRecentInput = z
  .object({ limit: z.number().int().min(1).max(40).default(12) })
  .optional();
export type TripsRecentInput = z.infer<typeof tripsRecentInput>;

/** tRPC: traction weekly growth window. */
export const tractionWeeklyGrowthInput = z
  .object({ weeks: z.number().int().min(1).max(52).default(12) })
  .optional();
export type TractionWeeklyGrowthInput = z.infer<typeof tractionWeeklyGrowthInput>;

/** tRPC: listing detail by public id (UUID or legacy slug fragment). */
export const listingByPublicIdInput = z.object({ id: z.string().min(1) });
export type ListingByPublicIdInput = z.infer<typeof listingByPublicIdInput>;

/** tRPC: optional limit for listing feeds. */
export const listingFeedLimitInput = z
  .object({ limit: z.number().int().min(1).max(40).default(12) })
  .optional();
export type ListingFeedLimitInput = z.infer<typeof listingFeedLimitInput>;

/** tRPC: conversation row by UUID. */
export const conversationUuidInput = z.object({ id: uuidString });
export type ConversationUuidInput = z.infer<typeof conversationUuidInput>;

/** tRPC: paginate messages inside a conversation. */
export const conversationMessagesInput = z.object({ conversationId: uuidString });
export type ConversationMessagesInput = z.infer<typeof conversationMessagesInput>;

/** tRPC: request by opaque id (may be non-UUID in older rows). */
export const requestByPublicIdInput = z.object({ id: z.string().min(1) });
export type RequestByPublicIdInput = z.infer<typeof requestByPublicIdInput>;

export const requestIdFieldInput = z.object({ requestId: uuidString });
export type RequestIdFieldInput = z.infer<typeof requestIdFieldInput>;

export const listingByCountryFeedInput = z.object({
  iso2: z
    .string()
    .length(2)
    .transform((s) => s.toUpperCase())
    .pipe(isoCountry),
  limit: z.number().int().min(1).max(40).default(12),
});
export type ListingByCountryFeedInput = z.infer<typeof listingByCountryFeedInput>;

export const requestsFeedInput = z.object({
  countryIso2: z
    .string()
    .length(2)
    .transform((s) => s.toUpperCase())
    .pipe(isoCountry)
    .optional(),
  limit: z.number().int().min(1).max(40).default(20),
});
export type RequestsFeedInput = z.infer<typeof requestsFeedInput>;

export const requestsNearInput = latLng.extend({
  radiusKm: z.number().min(1).max(500).default(50),
  limit: z.number().int().min(1).max(40).default(20),
});
export type RequestsNearInput = z.infer<typeof requestsNearInput>;

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
  foodItemId: uuidString.optional(),
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
  id: uuidString,
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
  foodItemId: uuidString.optional(),
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
  conversationId: uuidString,
  body: z.string().min(1).max(2000),
  attachments: z.array(listingPhoto).max(4).optional(),
});
export type SendMessageInput = z.infer<typeof sendMessageInput>;

export const startConversationInput = z.object({
  recipientId: uuidString,
  listingId: uuidString.optional(),
  requestId: uuidString.optional(),
  body: z.string().min(1).max(2000),
});
export type StartConversationInput = z.infer<typeof startConversationInput>;

/** Safe starter lines for chat UIs (shared with web, mobile, and API docs). */
export const MESSAGING_SAFE_TEMPLATES = [
  'Hi! Is your stash still available?',
  'Could we meet near a metro stop you like? Privacy first.',
  'What freshness window works for the handoff?',
  'Happy with the agreed fee — do you accept Revolut/cash on pickup?',
] as const;

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
  conversationId: uuidString,
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
  targetId: uuidString,
  reason: reportReason,
  details: z.string().max(600).optional(),
});
export type SubmitReportInput = z.infer<typeof submitReportInput>;

// ---------- Media upload ----------------------------------------------------

export const presignUploadInput = z.object({
  filename: z.string().min(1).max(120),
  contentType: z.enum(['image/jpeg', 'image/png', 'image/webp', 'image/avif']),
  byteLength: z
    .number()
    .int()
    .min(1)
    .max(15 * 1024 * 1024),
  purpose: z.enum(['listing', 'avatar', 'food-item']),
});
export type PresignUploadInput = z.infer<typeof presignUploadInput>;

/**
 * Server-side image fetch. Lets a user paste a Google image URL, then the
 * server downloads, validates, strips EXIF and re-hosts on R2 so we never
 * hotlink a third party. Body limits + content-type allow-list match
 * `presignUploadInput` for parity.
 */
export const fetchRemoteImageInput = z.object({
  url: z.string().url().max(2048),
  purpose: z.enum(['listing', 'food-item', 'food-item-proposal']).default('food-item-proposal'),
});
export type FetchRemoteImageInput = z.infer<typeof fetchRemoteImageInput>;

// ---------- Catalog UGC ------------------------------------------------------

/** Submit a brand new product to the curated catalog. */
export const proposeFoodItemInput = z.object({
  name: z.string().min(2).max(120),
  aka: z.array(z.string().min(1).max(60)).max(8).optional(),
  categorySlug: slug,
  originCountryIso2: isoCountry,
  description: z.string().max(600).optional(),
  /** GTIN-13 or GTIN-8 the submitter scanned (pure digits). Optional. */
  barcode: z
    .string()
    .regex(/^\d{8,14}$/, 'Barcode must be 8–14 digits')
    .optional(),
  proposedImages: z
    .array(
      z.object({
        url: z.string().url(),
        source: z.string().max(40).optional(),
      }),
    )
    .max(6)
    .optional(),
});
export type ProposeFoodItemInput = z.infer<typeof proposeFoodItemInput>;

/** Suggest an additional image for an existing canonical product. */
export const proposeFoodItemImageInput = z.object({
  foodItemId: uuidString,
  url: z.string().url(),
  source: z.enum(['r2', 'user-url', 'off']).default('r2'),
});
export type ProposeFoodItemImageInput = z.infer<typeof proposeFoodItemImageInput>;

export const upvoteFoodItemImageInput = z.object({
  proposalId: uuidString,
});
export type UpvoteFoodItemImageInput = z.infer<typeof upvoteFoodItemImageInput>;

export const catalogSearchWithSuggestionsInput = z.object({
  q: z.string().min(1).max(120),
  limit: z.number().int().min(1).max(20).default(8),
  /** When true the server also asks Open Food Facts for matches not yet in
   *  our index, so the picker can offer to "pull this in". */
  includeRemote: z.boolean().default(true),
});
export type CatalogSearchWithSuggestionsInput = z.infer<typeof catalogSearchWithSuggestionsInput>;

/** Admin catalog UGC queues (candidates + pending image proposals). */
export const foodItemCandidateStatusEnum = z.enum(['pending', 'approved', 'rejected', 'duplicate']);
export const foodItemImageProposalStatusEnum = z.enum(['pending', 'approved', 'rejected']);

export const adminCatalogUgcQueueInput = z.object({
  candidateLimit: z.number().int().min(1).max(100).default(40),
  imageProposalLimit: z.number().int().min(1).max(100).default(40),
  candidateStatus: foodItemCandidateStatusEnum.default('pending'),
  imageProposalStatus: foodItemImageProposalStatusEnum.default('pending'),
  countryIso2: isoCountry.optional(),
  categorySlug: slug.optional(),
  submitterId: uuidString.optional(),
});
export type AdminCatalogUgcQueueInput = z.infer<typeof adminCatalogUgcQueueInput>;

export const adminBulkReviewFoodItemImageProposalInput = z.object({
  ids: z.array(uuidString).min(1).max(50),
  status: z.enum(['approved', 'rejected']),
  moderatorNote: z.string().max(500).optional(),
});
export type AdminBulkReviewFoodItemImageProposalInput = z.infer<
  typeof adminBulkReviewFoodItemImageProposalInput
>;

export const adminBulkReviewFoodItemCandidateInput = z.object({
  ids: z.array(uuidString).min(1).max(50),
  /** Bulk path supports approve/reject only; duplicate needs a single merge target. */
  status: z.enum(['approved', 'rejected']),
  moderatorNote: z.string().max(500).optional(),
});
export type AdminBulkReviewFoodItemCandidateInput = z.infer<
  typeof adminBulkReviewFoodItemCandidateInput
>;

export const adminReviewFoodItemCandidateInput = z
  .object({
    id: uuidString,
    status: z.enum(['approved', 'rejected', 'duplicate']),
    mergedIntoItemId: uuidString.optional(),
    moderatorNote: z.string().max(500).optional(),
  })
  .superRefine((val, ctx) => {
    if (val.status === 'duplicate' && !val.mergedIntoItemId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'mergedIntoItemId is required when marking duplicate',
        path: ['mergedIntoItemId'],
      });
    }
  });
export type AdminReviewFoodItemCandidateInput = z.infer<typeof adminReviewFoodItemCandidateInput>;

export const adminReviewFoodItemImageProposalInput = z.object({
  id: uuidString,
  status: z.enum(['approved', 'rejected']),
  moderatorNote: z.string().max(500).optional(),
});
export type AdminReviewFoodItemImageProposalInput = z.infer<
  typeof adminReviewFoodItemImageProposalInput
>;

// ---------- Payments / Connect -----------------------------------------------

export const connectOnboardingInput = z.object({
  /** ISO-3166-1 alpha-2 country code Stripe should anchor the account to. */
  countryIso2: isoCountry,
  returnUrl: z.string().url(),
  refreshUrl: z.string().url(),
});
export type ConnectOnboardingInput = z.infer<typeof connectOnboardingInput>;

export const refundReservationInput = z.object({
  reservationId: uuidString,
  reason: z.enum(['duplicate', 'fraudulent', 'requested_by_customer']).optional(),
  /** Optional partial-refund amount in major units (EUR). Defaults to full. */
  amount: z.number().nonnegative().optional(),
});
export type RefundReservationInput = z.infer<typeof refundReservationInput>;

// ---------- Trip marketplace -------------------------------------------------

export const createTripOfferInput = z.object({
  originCountryIso2: isoCountry,
  originCity: z.string().min(1).max(80),
  originLocation: latLng,
  destinationCountryIso2: isoCountry,
  destinationCity: z.string().min(1).max(80),
  destinationLocation: latLng,
  departAt: z.coerce.date().refine((d) => d.getTime() > Date.now() - 60_000, {
    message: 'Departure must be in the future',
  }),
  returnAt: z.coerce.date().optional(),
  slotsTotal: z.number().int().min(1).max(40),
  defaultPerSlotFee: z.number().min(0).max(999),
  currency: currencyCode.default('EUR'),
  notes: z.string().max(600).optional(),
  /** Optional buyer-facing capacity hints (not enforced). */
  spareWeightKg: z.number().int().min(1).max(500).optional(),
  spareVolumeLiters: z.number().int().min(1).max(500).optional(),
  intendedItemIds: z.array(uuidString).max(20).optional(),
});
export type CreateTripOfferInput = z.infer<typeof createTripOfferInput>;

export const tripSearchInput = z.object({
  fromIso: isoCountry.optional(),
  toIso: isoCountry.optional(),
  fromCity: z.string().max(80).optional(),
  toCity: z.string().max(80).optional(),
  /** Date range as ms epoch — keeps the wire format JSON-safe. */
  departFromMs: z.number().int().optional(),
  departToMs: z.number().int().optional(),
  /** Only show trips with available slots when true. */
  onlyOpen: z.boolean().default(true),
  limit: z.number().int().min(1).max(60).default(24),
});
export type TripSearchInput = z.infer<typeof tripSearchInput>;

export const tripFeedNearInput = z.object({
  near: latLng,
  radiusKm: z.number().min(1).max(500).default(100),
  /** Origin or destination side of the trip near the user. Buyers usually
   *  search from their *destination* (where they want the items delivered),
   *  but power users can flip this to discover sellers in their origin city. */
  side: z.enum(['origin', 'destination']).default('destination'),
  limit: z.number().int().min(1).max(60).default(20),
});
export type TripFeedNearInput = z.infer<typeof tripFeedNearInput>;

export const reserveSlotInput = z.object({
  tripOfferId: uuidString,
  foodItemId: uuidString.optional(),
  freeformText: z.string().min(2).max(160),
  qty: z.number().int().min(1).max(20).default(1),
  /** Buyer's offered fee. Server validates that it meets or exceeds the trip
   *  default unless the offer says otherwise. */
  agreedFinderFee: z.number().min(0).max(999),
});
export type ReserveSlotInput = z.infer<typeof reserveSlotInput>;

/** Shared UUID param for trip reservation lifecycle procedures. */
export const tripReservationIdInput = z.object({
  reservationId: uuidString,
});
export type TripReservationIdInput = z.infer<typeof tripReservationIdInput>;

export const confirmReservationInput = tripReservationIdInput;
export type ConfirmReservationInput = z.infer<typeof confirmReservationInput>;

export const completeReservationInput = tripReservationIdInput;
export type CompleteReservationInput = z.infer<typeof completeReservationInput>;

export const cancelReservationInput = tripReservationIdInput.extend({
  reason: z.string().max(280).optional(),
});
export type CancelReservationInput = z.infer<typeof cancelReservationInput>;

/**
 * Eushop's take rate. Single source of truth — clients display this and the
 * server enforces it.
 *
 *   platformFee = min(€1.50, 12% × finderFee)
 *
 * Implemented in cents to avoid float drift; callers convert back to euros
 * for display. The cap keeps small reservation amounts investor-friendly; the
 * proportional slice applies on larger fees.
 */
export const PLATFORM_FEE_CAP_CENTS = 150;
/** @deprecated Use PLATFORM_FEE_CAP_CENTS — fee is a ceiling, not a floor. */
export const PLATFORM_FEE_FLOOR_CENTS = PLATFORM_FEE_CAP_CENTS;
export const PLATFORM_FEE_RATE = 0.12;

export function calculatePlatformFeeCents(finderFeeCents: number): number {
  const proportional = Math.round(finderFeeCents * PLATFORM_FEE_RATE);
  return Math.min(PLATFORM_FEE_CAP_CENTS, proportional);
}

/**
 * Converts the buyer's agreed slot fee (euros) into cent amounts and fixed-decimal
 * strings for `trip_reservations` rows — keeps reserve + display math aligned.
 */
export function reservationMonetaryFieldsFromAgreedEuros(agreedFinderFeeEuros: number): {
  finderFeeCents: number;
  platformFeeCents: number;
  agreedFinderFee: string;
  platformFee: string;
} {
  const finderFeeCents = Math.round(agreedFinderFeeEuros * 100);
  const platformFeeCents = calculatePlatformFeeCents(finderFeeCents);
  return {
    finderFeeCents,
    platformFeeCents,
    agreedFinderFee: (finderFeeCents / 100).toFixed(2),
    platformFee: (platformFeeCents / 100).toFixed(2),
  };
}
