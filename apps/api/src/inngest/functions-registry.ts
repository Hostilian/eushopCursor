import {
  importOpenFoodFactsBatch,
  importOpenFoodFactsDaily,
} from './functions/import-openfoodfacts-batch.js';
import { matchListingToOpenRequests } from './functions/match-listing.js';
import { matchTripsForOpenRequest } from './functions/match-trips-for-request.js';
import { notifyMessage } from './functions/notify-message.js';
import { reindexCatalog } from './functions/reindex-catalog.js';
import {
  autoCloseStaleTrips,
  matchRequestToTrip,
  notifyReservationCreated,
  notifyTripDepartureFanout,
  notifyTripDepartureSoon,
} from './functions/trip-workflows.js';

export const inngestFunctions = [
  matchListingToOpenRequests,
  matchTripsForOpenRequest,
  notifyMessage,
  reindexCatalog,
  importOpenFoodFactsBatch,
  importOpenFoodFactsDaily,
  notifyReservationCreated,
  matchRequestToTrip,
  notifyTripDepartureFanout,
  notifyTripDepartureSoon,
  autoCloseStaleTrips,
];
