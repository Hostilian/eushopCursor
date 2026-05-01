export interface BrandSeed {
  slug: string;
  name: string;
  countryIso2: string;
  blurb?: string;
}

export const BRANDS: BrandSeed[] = [
  // PL
  { slug: 'wedel', name: 'E. Wedel', countryIso2: 'PL', blurb: 'Warsaw chocolate house since 1851.' },
  { slug: 'wawel', name: 'Wawel', countryIso2: 'PL' },
  { slug: 'tymbark', name: 'Tymbark', countryIso2: 'PL' },
  { slug: 'krakus', name: 'Krakus', countryIso2: 'PL' },
  { slug: 'milka-pl', name: 'Milka (PL)', countryIso2: 'PL' },

  // DE / AT
  { slug: 'haribo', name: 'Haribo', countryIso2: 'DE' },
  { slug: 'bahlsen', name: 'Bahlsen', countryIso2: 'DE' },
  { slug: 'ritter-sport', name: 'Ritter Sport', countryIso2: 'DE' },
  { slug: 'manner', name: 'Manner', countryIso2: 'AT' },
  { slug: 'mozartkugel', name: 'Mirabell Mozartkugel', countryIso2: 'AT' },
  { slug: 'almdudler', name: 'Almdudler', countryIso2: 'AT' },

  // BE
  { slug: 'neuhaus', name: 'Neuhaus', countryIso2: 'BE' },
  { slug: 'leonidas', name: 'Leonidas', countryIso2: 'BE' },
  { slug: 'lotus', name: 'Lotus Bakeries', countryIso2: 'BE' },
  { slug: 'cote-dor', name: 'Côte d\u2019Or', countryIso2: 'BE' },

  // NL
  { slug: 'verkade', name: 'Verkade', countryIso2: 'NL' },
  { slug: 'venz', name: 'Venz', countryIso2: 'NL' },
  { slug: 'douwe-egberts', name: 'Douwe Egberts', countryIso2: 'NL' },

  // FR
  { slug: 'maison-du-chocolat', name: 'La Maison du Chocolat', countryIso2: 'FR' },
  { slug: 'haribo-fr', name: 'Haribo France', countryIso2: 'FR' },
  { slug: 'bonne-maman', name: 'Bonne Maman', countryIso2: 'FR' },
  { slug: 'lu', name: 'LU', countryIso2: 'FR' },

  // IT
  { slug: 'perugina', name: 'Perugina', countryIso2: 'IT' },
  { slug: 'ferrero', name: 'Ferrero', countryIso2: 'IT' },
  { slug: 'mulino-bianco', name: 'Mulino Bianco', countryIso2: 'IT' },
  { slug: 'lavazza', name: 'Lavazza', countryIso2: 'IT' },
  { slug: 'illy', name: 'illy', countryIso2: 'IT' },

  // ES
  { slug: 'el-almendro', name: 'El Almendro', countryIso2: 'ES' },
  { slug: 'lacasa', name: 'Lacasa', countryIso2: 'ES' },
  { slug: 'cola-cao', name: 'Cola Cao', countryIso2: 'ES' },

  // PT
  { slug: 'compal', name: 'Compal', countryIso2: 'PT' },
  { slug: 'delta-cafes', name: 'Delta Cafés', countryIso2: 'PT' },

  // GR
  { slug: 'ion', name: 'ION', countryIso2: 'GR' },
  { slug: 'papadopoulos', name: 'Papadopoulos', countryIso2: 'GR' },
  { slug: 'mastiha-shop', name: 'Mastiha Shop', countryIso2: 'GR' },

  // CZ / SK
  { slug: 'opavia', name: 'Opavia', countryIso2: 'CZ' },
  { slug: 'orion', name: 'Orion', countryIso2: 'CZ' },
  { slug: 'kofola', name: 'Kofola', countryIso2: 'CZ' },
  { slug: 'sedita', name: 'Sedita', countryIso2: 'SK' },

  // HU / RO / BG
  { slug: 'pick', name: 'Pick Szeged', countryIso2: 'HU' },
  { slug: 'gyori-edes', name: 'Győri Édes', countryIso2: 'HU' },
  { slug: 'dorna', name: 'Dorna', countryIso2: 'RO' },
  { slug: 'kandia', name: 'Kandia Dulce', countryIso2: 'RO' },
  { slug: 'pobeda', name: 'Pobeda', countryIso2: 'BG' },

  // HR / SI
  { slug: 'kras', name: 'Kraš', countryIso2: 'HR' },
  { slug: 'podravka', name: 'Podravka', countryIso2: 'HR' },
  { slug: 'gorenjka', name: 'Gorenjka', countryIso2: 'SI' },

  // EE / LV / LT
  { slug: 'kalev', name: 'Kalev', countryIso2: 'EE' },
  { slug: 'laima', name: 'Laima', countryIso2: 'LV' },
  { slug: 'ruta', name: 'Rūta', countryIso2: 'LT' },

  // SE / DK / NO / FI / IS
  { slug: 'marabou', name: 'Marabou', countryIso2: 'SE' },
  { slug: 'fazer', name: 'Karl Fazer', countryIso2: 'FI' },
  { slug: 'anthon-berg', name: 'Anthon Berg', countryIso2: 'DK' },
  { slug: 'toms', name: 'Toms', countryIso2: 'DK' },
  { slug: 'freia', name: 'Freia', countryIso2: 'NO' },
  { slug: 'noi-sirius', name: 'Nói Síríus', countryIso2: 'IS' },

  // IE
  { slug: 'tayto', name: 'Tayto', countryIso2: 'IE' },
  { slug: 'barrys-tea', name: 'Barry\u2019s Tea', countryIso2: 'IE' },
  { slug: 'kerrygold', name: 'Kerrygold', countryIso2: 'IE' },
  { slug: 'cadbury-ie', name: 'Cadbury Ireland', countryIso2: 'IE' },

  // CY / MT / LU
  { slug: 'kinnie', name: 'Kinnie', countryIso2: 'MT' },
  { slug: 'twistees', name: 'Twistees', countryIso2: 'MT' },
];
