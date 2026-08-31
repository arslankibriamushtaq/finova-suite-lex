import { getCurrentLanguage } from "../../utils/acceptLanguage";

/**
 * Countries for the billing address, as ISO 3166-1 **alpha-2** codes.
 *
 * Owned here rather than fetched, for two reasons:
 *
 *  1. customer-service's `/country-config/countries` — the obvious candidate,
 *     and what this screen used first — answers in **alpha-3** (`SAU`), which
 *     tenant-provisioning rejects with
 *     `COMMON.VALIDATION.FAILED / countryCode`. The two services disagree, and
 *     silently translating between them in the browser is a bug waiting to
 *     come back.
 *  2. That endpoint lists the countries whose *KYC stack* is supported, which
 *     is a different question from where a paying company may be registered.
 *
 * Only the codes are stored. Names come from `Intl.DisplayNames` at render
 * time, so every language the app supports gets correct, native country names
 * with no translation table to maintain and no third list to fall out of date.
 */

// ISO 3166-1 alpha-2, current as of the 2024 list. Codes are stable; this
// changes only when a country does.
const ISO_ALPHA_2 =
  "AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW".split(
    " "
  );

/**
 * Markets whose companies are the realistic buyers, floated to the top of the
 * list so the common case is one scroll away rather than 240.
 */
const PRIORITY = ["SA", "AE", "BH", "KW", "OM", "QA", "EG", "JO"];

export interface CountryOption {
  code: string;
  name: string;
  /** True for the pinned GCC block, so the UI can rule a line under it. */
  priority: boolean;
}

/**
 * The select's options, named in `language` and sorted by that name.
 *
 * The language is a parameter rather than read from i18n inside, so callers can
 * memoize on it honestly — the returned names change when it does.
 *
 * `Intl.DisplayNames` is baseline in every browser this app targets, but it
 * throws on unsupported locales rather than falling back, so an unusable
 * formatter degrades to bare codes instead of an empty dropdown.
 */
export const getCountryOptions = (
  language: string = getCurrentLanguage()
): CountryOption[] => {
  let display: Intl.DisplayNames | null = null;

  try {
    display = new Intl.DisplayNames([language], { type: "region" });
  } catch {
    display = null;
  }

  const nameFor = (code: string): string => {
    try {
      return display?.of(code) || code;
    } catch {
      return code;
    }
  };

  const collator = new Intl.Collator(language);

  const rest = ISO_ALPHA_2.filter((code) => !PRIORITY.includes(code))
    .map((code) => ({ code, name: nameFor(code), priority: false }))
    .sort((a, b) => collator.compare(a.name, b.name));

  return [
    ...PRIORITY.map((code) => ({ code, name: nameFor(code), priority: true })),
    ...rest,
  ];
};

/** The default. Saudi Arabia is where the CR-number rule applies. */
export const DEFAULT_COUNTRY_CODE = "SA";
