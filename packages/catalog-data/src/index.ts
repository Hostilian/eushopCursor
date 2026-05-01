export * from './countries.js';
export * from './categories.js';
export * from './brands.js';
export * from './items.js';

import { COUNTRIES } from './countries.js';
import { CATEGORIES } from './categories.js';
import { BRANDS } from './brands.js';
import { FOOD_ITEMS } from './items.js';

export const STATS = {
  countries: COUNTRIES.length,
  categories: CATEGORIES.length,
  brands: BRANDS.length,
  items: FOOD_ITEMS.length,
} as const;
