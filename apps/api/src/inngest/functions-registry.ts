import {
  importOpenFoodFactsBatch,
  importOpenFoodFactsDaily,
} from './functions/import-openfoodfacts-batch.js';
import { matchListingToOpenRequests } from './functions/match-listing.js';
import { notifyMessage } from './functions/notify-message.js';
import { reindexCatalog } from './functions/reindex-catalog.js';
import {
  autoCloseStaleTrips,
  notifyReservationCreated,
  notifyTripDepartureFanout,
  notifyTripDepartureSoon,
} from './functions/trip-workflows.js';

export const inngestFunctions = [
  matchListingToOpenRequests,
  notifyMessage,
  reindexCatalog,
  importOpenFoodFactsBatch,
  importOpenFoodFactsDaily,
  notifyReservationCreated,
  notifyTripDepartureFanout,
  notifyTripDepartureSoon,
  autoCloseStaleTrips,
];
