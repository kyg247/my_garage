import { impliedCifFromOnRoad, MFN_CUSTOMS_PCT, resolveMfnCustomsPct } from "./taxStack";

/**
 * India–UK CETA (in force 15 Jul 2026) and draft India–EU FTA auto schedules.
 *
 * Sources:
 * - UK: CETA Annex 2A / DGFT TRQ tables / EY Policy Alert Jul 2026
 * - EU: draft FTA coverage (TOI, Autocar India, Reuters, Hindu Business Line, Sep 2026)
 *
 * Horizon 0 = today (Oct 2026): show listed catalogue prices.
 * UK Year 1 is already underway; we do not restack Y1 onto listed prices.
 * Horizon N (calendar 2026+N): UK agreement year = N+1, EU year = N
 * (EU expected EIF 2027).
 */

export const BASE_CALENDAR_YEAR = 2026;
export const MAX_HORIZON_YEARS = 10;

export const CURRENT_DUTY = {
  ...MFN_CUSTOMS_PCT,
  EV_CBU: MFN_CUSTOMS_PCT.CBU_LARGE,
};

export const EUR_INR = 110.67; // €15,000 ≈ ₹16.6 lakh in official briefings
export const GBP_INR = 106;

export function ukAgreementYear(horizonYears) {
  if (horizonYears <= 0) return 0;
  return horizonYears + 1;
}

export function euAgreementYear(horizonYears) {
  return Math.max(0, horizonYears);
}

export function calendarYear(horizonYears) {
  return BASE_CALENDAR_YEAR + horizonYears;
}

/** UK ICE CBU in-quota: exact published table. Year 5+ stays at 10%. */
const UK_ICE_CBU = {
  large: { 1: 30, 2: 25, 3: 20, 4: 15, 5: 10 },
  mid: { 1: 50, 2: 40, 3: 30, 4: 20, 5: 10 },
  small: { 1: 50, 2: 40, 3: 30, 4: 20, 5: 10 },
};

/** UK EV/PHEV/H2 CBU, CIF £40k–£80k only. Years 1–5: no concession. */
const UK_EV_CBU = { 6: 50, 7: 40, 8: 30, 9: 20, 10: 10 };

function lookupOrFloor(table, year, floor = 10) {
  if (year <= 0) return null;
  if (table[year] != null) return table[year];
  const keys = Object.keys(table)
    .map(Number)
    .sort((a, b) => a - b);
  const last = keys[keys.length - 1];
  if (year > last) return table[last] ?? floor;
  return null;
}

function linearStage(year, startYear, startRate, endYear, endRate) {
  if (year < startYear) return null;
  if (year >= endYear) return endRate;
  const t = (year - startYear) / (endYear - startYear);
  return startRate + (endRate - startRate) * t;
}

export function ukEngineBand(engineCc, fuel) {
  const cc = engineCc || 0;
  const isDiesel = /diesel/i.test(fuel || "");
  if (isDiesel) {
    if (cc > 2500) return "large";
    if (cc > 1500) return "mid";
    return "small";
  }
  if (cc > 3000) return "large";
  if (cc > 1500) return "mid";
  return "small";
}

export function estimateCifInr(listedCost, currentDutyPct, profile = {}) {
  return impliedCifFromOnRoad(listedCost, currentDutyPct, profile);
}

export function euIceCifBand(cifInr) {
  const eur = cifInr / EUR_INR;
  if (eur < 15000) return "excluded";
  if (eur <= 35000) return "mid";
  return "high";
}

export function ukEvCifEligible(cifInr) {
  const gbp = cifInr / GBP_INR;
  return gbp >= 40000 && gbp <= 80000;
}

export function euEvCifEligible(cifInr) {
  return cifInr / EUR_INR >= 20000;
}

/**
 * Returns the customs % that should apply in the chosen FTA year,
 * plus the MFN % embedded in today's listed price.
 */
export function resolveDuty({
  origin,
  importType,
  category,
  fuelClass,
  engineCc,
  fuel,
  listedCost,
  horizonYears,
}) {
  const isMotorcycle = category === "MOTORCYCLE";
  const isEvLike = fuelClass === "EV" || fuelClass === "PHEV";
  const profile = { importType, category, fuelClass, engineCc, fuel, listedCost };

  const current = resolveMfnCustomsPct(profile);
  const cifInr = estimateCifInr(listedCost, current, profile);

  if (origin === "UK") {
    const year = ukAgreementYear(horizonYears);
    if (year <= 0) {
      return { current, next: current, cifInr, note: "Listed price (UK CETA Year 1 already underway)" };
    }

    if (importType === "CKD") {
      return {
        current,
        next: current,
        cifInr,
        note: "UK CETA has no CKD concession — kits stay at the MFN CKD rate",
      };
    }

    if (isMotorcycle) {
      // Official car TRQ is HS 8703; UK superbike path is not published in the
      // same table. Stage large-ICE style from 55% → 10% over five UK years.
      const staged = linearStage(year, 1, 30, 5, 10);
      return {
        current,
        next: staged ?? current,
        cifInr,
        note: "UK motorcycle staging estimated in line with large ICE CBU",
      };
    }

    if (isEvLike) {
      if (!ukEvCifEligible(cifInr)) {
        return {
          current,
          next: current,
          cifInr,
          note: "UK EV/PHEV relief is only for CIF £40k–£80k",
        };
      }
      const staged = lookupOrFloor(UK_EV_CBU, year);
      return {
        current,
        next: staged ?? current,
        cifInr,
        note:
          year < 6
            ? "UK EV/PHEV concessions start in CETA Year 6"
            : "UK EV/PHEV in-quota CBU",
      };
    }

    const band = ukEngineBand(engineCc, fuel);
    const staged = lookupOrFloor(UK_ICE_CBU[band], year);
    return {
      current,
      next: staged ?? current,
      cifInr,
      band,
      note: `UK ICE CBU in-quota · ${band} engine`,
    };
  }

  if (origin === "EU") {
    const year = euAgreementYear(horizonYears);
    if (year <= 0) {
      return { current, next: current, cifInr, note: "EU FTA not yet in force (expected 2027)" };
    }

    if (isMotorcycle) {
      if ((engineCc || 0) <= 800) {
        return {
          current,
          next: current,
          cifInr,
          note: "EU motorcycle concession is only above 800 cc",
        };
      }
      const next = year >= 2 ? 10 : 32.5;
      return {
        current,
        next,
        cifInr,
        note: "EU motorcycle CBU >800 cc (no quota)",
      };
    }

    if (importType === "CKD") {
      // Draft CKD TRQ covers ICE and hybrids, including plug-in hybrids
      // assembled in India (e.g. S 450e). Pure EVs stay on the EV path.
      if (fuelClass === "EV") {
        return {
          current,
          next: current,
          cifInr,
          note: "EU CKD quota is for ICE and hybrids, not pure EVs",
        };
      }
      const next = year === 1 ? 13.75 : year === 2 ? 11 : 8.25;
      return {
        current,
        next,
        cifInr,
        note: "EU ICE/hybrid CKD in-quota",
      };
    }

    if (isEvLike) {
      if (!euEvCifEligible(cifInr)) {
        return {
          current,
          next: current,
          cifInr,
          note: "EU EV/PHEV relief starts Year 5 and only at CIF ≥ €20,000",
        };
      }
      const staged = linearStage(year, 5, 30, 10, 10);
      return {
        current,
        next: staged ?? current,
        cifInr,
        note:
          year < 5
            ? "EU EV/PHEV CBU relief starts in FTA Year 5"
            : "EU EV/PHEV CBU in-quota",
      };
    }

    const band = euIceCifBand(cifInr);
    if (band === "excluded") {
      return {
        current,
        next: current,
        cifInr,
        band,
        note: "EU ICE/HEV cars below CIF €15,000 get no concession",
      };
    }
    const y1 = band === "mid" ? 35 : 30;
    const staged = linearStage(year, 1, y1, 5, 10);
    return {
      current,
      next: staged ?? current,
      cifInr,
      band,
      note: `EU ICE/HEV CBU in-quota · CIF ${band === "mid" ? "€15–35k" : "> €35k"}`,
    };
  }

  return { current, next: current, cifInr, note: "Outside UK/EU origin rules" };
}
