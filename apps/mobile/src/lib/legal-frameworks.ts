import { COUNTRIES } from '@eushop/catalog';

type LegalFamily = 'eu' | 'eea' | 'ch';

export type CountryLegalFramework = {
  iso2: string;
  countryName: string;
  legalFamily: LegalFamily;
  privacyFramework: string;
  commerceFramework: string;
  foodSafetyFramework: string;
  authorityName: string;
  authorityUrl: string;
  note: string;
};

const EEA_NON_EU_ISO2 = new Set(['NO', 'IS']);

function legalFamilyForCountry(iso2: string): LegalFamily {
  const upperIso2 = iso2.toUpperCase();
  if (upperIso2 === 'CH') return 'ch';
  if (EEA_NON_EU_ISO2.has(upperIso2)) return 'eea';
  return 'eu';
}

export function getCountryLegalFramework(iso2: string): CountryLegalFramework | null {
  const upperIso2 = iso2.toUpperCase();
  const country = COUNTRIES.find((entry) => entry.iso2 === upperIso2);
  if (!country) return null;
  const family = legalFamilyForCountry(upperIso2);

  if (family === 'ch') {
    return {
      iso2: upperIso2,
      countryName: country.name,
      legalFamily: family,
      privacyFramework: 'Swiss FADP (nFADP), with GDPR-adjacent controls for EU transfers.',
      commerceFramework:
        'Swiss consumer and unfair-competition rules apply to local handoffs, plus payment-network rules when trip checkout is used.',
      foodSafetyFramework:
        'Swiss food law and customs/import controls apply to products entering Switzerland.',
      authorityName: 'Swiss FDPIC',
      authorityUrl: 'https://www.edoeb.admin.ch/edoeb/en/home.html',
      note: 'When an EU resident is involved, GDPR rights may still apply to that processing context.',
    };
  }

  if (family === 'eea') {
    return {
      iso2: upperIso2,
      countryName: country.name,
      legalFamily: family,
      privacyFramework:
        'EEA GDPR implementation (via the EEA Agreement) and local privacy statutes.',
      commerceFramework:
        'National consumer rules and e-commerce statutes in your country, plus card-network dispute rules for trip checkout.',
      foodSafetyFramework:
        'National food and customs restrictions for personal cross-border carriage of food products.',
      authorityName: `${country.name} data protection authority`,
      authorityUrl: 'https://edpb.europa.eu/about-edpb/about-edpb/members_en',
      note: 'Local implementing acts can add country-specific obligations on top of GDPR baseline rights.',
    };
  }

  return {
    iso2: upperIso2,
    countryName: country.name,
    legalFamily: 'eu',
    privacyFramework: 'EU GDPR + ePrivacy implementation in your member state.',
    commerceFramework:
      'EU consumer acquis (including Omnibus/UCPD baseline) and local contract law, plus payment-network rules for trip checkout.',
    foodSafetyFramework:
      'EU food safety and labeling baseline, with national import/carriage restrictions for specific goods.',
    authorityName: `${country.name} supervisory authority`,
    authorityUrl: 'https://edpb.europa.eu/about-edpb/about-edpb/members_en',
    note: 'Digital Services Act notice-and-action duties are handled by Eushop; users remain responsible for lawful handoffs.',
  };
}
