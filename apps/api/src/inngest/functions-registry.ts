import { matchListingToOpenRequests } from './functions/match-listing.js';
import { notifyMessage } from './functions/notify-message.js';
import { reindexCatalog } from './functions/reindex-catalog.js';

export const inngestFunctions = [matchListingToOpenRequests, notifyMessage, reindexCatalog];
