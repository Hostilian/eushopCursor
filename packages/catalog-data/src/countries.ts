export interface CountrySeed {
  iso2: string;
  name: string;
  flagEmoji: string;
  defaultLocale: string;
  currency: string;
  region: 'central' | 'western' | 'southern' | 'northern' | 'eastern' | 'eea';
  blurb: string;
}

export const COUNTRIES: CountrySeed[] = [
  // Central / German-speaking
  { iso2: 'DE', name: 'Germany', flagEmoji: '🇩🇪', defaultLocale: 'de', currency: 'EUR', region: 'central', blurb: 'Liverwurst, Brezel, Lebkuchen, Bahlsen, Haribo regionals, Quark and proper Brot.' },
  { iso2: 'AT', name: 'Austria', flagEmoji: '🇦🇹', defaultLocale: 'de', currency: 'EUR', region: 'central', blurb: 'Manner wafers, Mozartkugel, Sachertorte, Almdudler and Kaiserschmarrn fixings.' },
  { iso2: 'CH', name: 'Switzerland', flagEmoji: '🇨🇭', defaultLocale: 'de', currency: 'CHF', region: 'central', blurb: 'Lindt, Toblerone, Ovomaltine, Aromat, Älplermagronen and raclette wheels.' },

  // Western
  { iso2: 'NL', name: 'Netherlands', flagEmoji: '🇳🇱', defaultLocale: 'en', currency: 'EUR', region: 'western', blurb: 'Stroopwafels, Hagelslag, Drop, Speculaas, Gouda and Rookworst.' },
  { iso2: 'BE', name: 'Belgium', flagEmoji: '🇧🇪', defaultLocale: 'fr', currency: 'EUR', region: 'western', blurb: 'Neuhaus, Leonidas, Speculoos, Cuberdon and Liège waffles done properly.' },
  { iso2: 'FR', name: 'France', flagEmoji: '🇫🇷', defaultLocale: 'fr', currency: 'EUR', region: 'western', blurb: 'Macarons, Calissons, Roquefort, Saucisson, Carambar and Confit de canard.' },
  { iso2: 'LU', name: 'Luxembourg', flagEmoji: '🇱🇺', defaultLocale: 'fr', currency: 'EUR', region: 'western', blurb: 'Quetschentaart, Kachkéis, Bouneschlupp and Riesling-pâté.' },
  { iso2: 'IE', name: 'Ireland', flagEmoji: '🇮🇪', defaultLocale: 'en', currency: 'EUR', region: 'western', blurb: 'Tayto, Barry\u2019s Tea, Kerrygold, Clonakilty pudding, Cadbury Irish and Brennan\u2019s.' },

  // Southern
  { iso2: 'IT', name: 'Italy', flagEmoji: '🇮🇹', defaultLocale: 'it', currency: 'EUR', region: 'southern', blurb: 'Panettone, Baci, Mortadella, Lardo di Colonnata, Limoncello, Burrata.' },
  { iso2: 'ES', name: 'Spain', flagEmoji: '🇪🇸', defaultLocale: 'es', currency: 'EUR', region: 'southern', blurb: 'Turrón, Polvorones, Jamón ibérico, Pimentón de la Vera, Manchego, Horchata.' },
  { iso2: 'PT', name: 'Portugal', flagEmoji: '🇵🇹', defaultLocale: 'en', currency: 'EUR', region: 'southern', blurb: 'Pastéis de nata, Bolo Rei, Bacalhau, Alheira, Ginja and Vinho do Porto.' },
  { iso2: 'GR', name: 'Greece', flagEmoji: '🇬🇷', defaultLocale: 'en', currency: 'EUR', region: 'southern', blurb: 'Mastiha, Loukoumi, Halva, Feta, Graviera, Trahanas, Ouzo and Tsipouro.' },
  { iso2: 'CY', name: 'Cyprus', flagEmoji: '🇨🇾', defaultLocale: 'en', currency: 'EUR', region: 'southern', blurb: 'Halloumi, Soutzoukos, Commandaria, Zivania and Loukoumi.' },
  { iso2: 'MT', name: 'Malta', flagEmoji: '🇲🇹', defaultLocale: 'en', currency: 'EUR', region: 'southern', blurb: 'Pastizzi, Kinnie, Twistees, Imqaret and Helwa tat-Tork.' },

  // Eastern / Central-East
  { iso2: 'PL', name: 'Poland', flagEmoji: '🇵🇱', defaultLocale: 'pl', currency: 'PLN', region: 'eastern', blurb: 'Krówki, Ptasie Mleczko, Wedel, Kabanos, Oscypek, Pierogi and Tymbark.' },
  { iso2: 'CZ', name: 'Czechia', flagEmoji: '🇨🇿', defaultLocale: 'en', currency: 'CZK', region: 'eastern', blurb: 'Becherovka, Kofola, Tatranky, Studentská pečeť and the unmistakable Olomoucké tvarůžky.' },
  { iso2: 'SK', name: 'Slovakia', flagEmoji: '🇸🇰', defaultLocale: 'en', currency: 'EUR', region: 'eastern', blurb: 'Bryndza, Žinčica, Tatranský čaj, Horalky and the great Mila wafer.' },
  { iso2: 'HU', name: 'Hungary', flagEmoji: '🇭🇺', defaultLocale: 'en', currency: 'HUF', region: 'eastern', blurb: 'Pálinka, Tokaji, Unicum, Édesnemes paprika, Mangalica and Túró Rudi.' },
  { iso2: 'RO', name: 'Romania', flagEmoji: '🇷🇴', defaultLocale: 'en', currency: 'RON', region: 'eastern', blurb: 'Cozonac, Sarmale, Salam de Sibiu, Telemea, Pălincă and Magiun de prune.' },
  { iso2: 'BG', name: 'Bulgaria', flagEmoji: '🇧🇬', defaultLocale: 'en', currency: 'BGN', region: 'eastern', blurb: 'Sirene, Kashkaval, Lukanka, Sudzhuk, Banitsa, Lyutenitsa and rose loukum.' },
  { iso2: 'HR', name: 'Croatia', flagEmoji: '🇭🇷', defaultLocale: 'en', currency: 'EUR', region: 'eastern', blurb: 'Pršut, Paški sir, Kulen, Bajadera, Vegeta and Maraschino.' },
  { iso2: 'SI', name: 'Slovenia', flagEmoji: '🇸🇮', defaultLocale: 'en', currency: 'EUR', region: 'eastern', blurb: 'Kranjska klobasa, Karst pršut, Idrijski žlikrofi and Bled\u2019s Kremšnita.' },

  // Baltic
  { iso2: 'EE', name: 'Estonia', flagEmoji: '🇪🇪', defaultLocale: 'en', currency: 'EUR', region: 'eastern', blurb: 'Kama, Kohuke, Vana Tallinn, Kalev, Verivorst and the famous Sült aspic.' },
  { iso2: 'LV', name: 'Latvia', flagEmoji: '🇱🇻', defaultLocale: 'en', currency: 'EUR', region: 'eastern', blurb: 'Sklandrausis, Riga Black Balsam, Laima, Karums and Rīgas Šprotes.' },
  { iso2: 'LT', name: 'Lithuania', flagEmoji: '🇱🇹', defaultLocale: 'en', currency: 'EUR', region: 'eastern', blurb: 'Šakotis, Skilandis, Cepelinai mix, Šaltibarščiai and Rūta chocolate.' },

  // Northern
  { iso2: 'SE', name: 'Sweden', flagEmoji: '🇸🇪', defaultLocale: 'en', currency: 'SEK', region: 'northern', blurb: 'Marabou, Daim, Salmiak, Knäckebröd, Kalles Kaviar and Lingonsylt.' },
  { iso2: 'DK', name: 'Denmark', flagEmoji: '🇩🇰', defaultLocale: 'en', currency: 'DKK', region: 'northern', blurb: 'Rugbrød, Leverpostej, Anthon Berg, Toms Skildpadde, Aquavit and Æbleskiver.' },
  { iso2: 'FI', name: 'Finland', flagEmoji: '🇫🇮', defaultLocale: 'en', currency: 'EUR', region: 'northern', blurb: 'Karl Fazer, Geisha, Salmiakki, Mämmi, Karjalanpiirakka, Lakka and Leipäjuusto.' },

  // EEA (non-EU but treated as fellow neighbours)
  { iso2: 'NO', name: 'Norway', flagEmoji: '🇳🇴', defaultLocale: 'en', currency: 'NOK', region: 'eea', blurb: 'Brunost, Geitost, Freia, Smash, Kvikk Lunsj, Akvavit and salt licorice.' },
  { iso2: 'IS', name: 'Iceland', flagEmoji: '🇮🇸', defaultLocale: 'en', currency: 'ISK', region: 'eea', blurb: 'Skyr, Hákarl, Lakkris, Brennivín and Harðfiskur.' },
];
