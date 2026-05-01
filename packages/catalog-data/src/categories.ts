export interface CategorySeed {
  slug: string;
  name: string;
  description: string;
  emoji: string;
  sortOrder: number;
}

export const CATEGORIES: CategorySeed[] = [
  { slug: 'chocolates', name: 'Chocolates', description: 'Bars, pralines, truffles, gianduja and the great regional houses.', emoji: '🍫', sortOrder: 10 },
  { slug: 'candies', name: 'Candies & sweets', description: 'Hard candies, gummies, fudge, salty licorice and childhood-favourite wrappers.', emoji: '🍬', sortOrder: 20 },
  { slug: 'biscuits', name: 'Biscuits & wafers', description: 'Speculaas, wafers, shortbread, butter cookies, holiday biscuits.', emoji: '🍪', sortOrder: 30 },
  { slug: 'baked', name: 'Bread & baked goods', description: 'Rye, sourdough, pastries, panettone, kremšnita and the famous regional cakes.', emoji: '🥐', sortOrder: 40 },
  { slug: 'cheese-dairy', name: 'Cheese & dairy', description: 'Hard, soft, blue, fresh, quark, kefir, brunost — the full counter.', emoji: '🧀', sortOrder: 50 },
  { slug: 'cured-meats', name: 'Cured meats & sausages', description: 'Salami, prosciutto, pršut, jamón, kabanos, salam de Sibiu, Téli szalámi.', emoji: '🥓', sortOrder: 60 },
  { slug: 'pate-aspic', name: 'Pâtés, terrines & aspic', description: 'Leberpostej, Verivorst, Sült, Foie gras, Smalec.', emoji: '🍖', sortOrder: 70 },
  { slug: 'pickles-preserves', name: 'Pickles & preserves', description: 'Lyutenitsa, Magiun, Lingonsylt, Membrillo, Ginja, jams.', emoji: '🥫', sortOrder: 80 },
  { slug: 'sauces-spices', name: 'Sauces, spices & condiments', description: 'Pimentón, Vegeta, Aromat, Édesnemes paprika, Currywurst-Gewürz, Kalles Kaviar.', emoji: '🌶️', sortOrder: 90 },
  { slug: 'soft-drinks', name: 'Soft drinks & juices', description: 'Kofola, Kinnie, Tymbark, Almdudler, Ovomaltine, Boza.', emoji: '🥤', sortOrder: 100 },
  { slug: 'tea-coffee', name: 'Tea & coffee', description: 'Barry\u2019s, Lyons, Tatranský čaj, Greek mountain tea, Italian roasts.', emoji: '☕', sortOrder: 110 },
  { slug: 'spirits-wine-beer', name: 'Spirits, wine & beer', description: 'Becherovka, Pálinka, Žubrówka, Ouzo, Aquavit, Riga Black Balsam, Vinho do Porto.', emoji: '🍷', sortOrder: 120 },
  { slug: 'frozen', name: 'Frozen specialties', description: 'Pierogi, Karjalanpiirakka, Bitterballen, Cepelinai mix, prepared meals.', emoji: '🧊', sortOrder: 130 },
  { slug: 'ready-meals', name: 'Ready meals & soup mixes', description: 'Bigos, Žurek, Sarmale, Bouneschlupp, Trahanas, Mustikkasoppa.', emoji: '🍲', sortOrder: 140 },
  { slug: 'fish-seafood', name: 'Fish & seafood', description: 'Surströmming, Rīgas Šprotes, Bacalhau, Lutefisk, Hákarl.', emoji: '🐟', sortOrder: 150 },
  { slug: 'pantry', name: 'Pantry staples', description: 'Mălai, Knäckebröd, dried legumes, regional flours and grains.', emoji: '🌾', sortOrder: 160 },
];
