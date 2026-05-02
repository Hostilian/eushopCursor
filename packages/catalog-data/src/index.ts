export * from './countries';
export * from './categories';
export * from './brands';
export * from './items';

import { COUNTRIES } from './countries';
import { CATEGORIES } from './categories';
import { BRANDS } from './brands';
import { FOOD_ITEMS } from './items';

export const STATS = {
  countries: COUNTRIES.length,
  categories: CATEGORIES.length,
  brands: BRANDS.length,
  items: FOOD_ITEMS.length,
} as const;
