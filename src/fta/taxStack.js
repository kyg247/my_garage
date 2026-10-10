/**
 * Indian import-car price stack (in force Oct 2026).
 *
 * Customs (Budget 2025; Budget 2026 Chapter 87: no change):
 *   CBU, CIF > USD 40,000 or petrol >3000cc / diesel >2500cc
 *     BCD 70% + AIDC 40% + SWS nil = 110% of CIF
 *   CBU, CIF ≤ USD 40,000 and within those engine limits
 *     BCD 70% + SWS 10% of BCD (7%) = 77% of CIF
 *   CKD kit (no pre-assembled engine/gearbox)
 *     BCD 15% + SWS 10% of BCD (1.5%) = 16.5% of CIF
 *
 * GST 2.0 (56th Council, 22 Sep 2025): compensation cess abolished.
 *   EV 5% · small car 18% · everything else 40%
 *   IGST base = CIF + all customs (BCD + AIDC + SWS)
 *
 * Bangalore on-road (Karnataka MV Tax Act, incl. Act 29 of 2026 from 1 May 2026):
 *   Lifetime road tax on ex-showroom, plus 11% cess on that tax
 *   TCS 1% on ex-showroom above ₹10 lakh (Income-tax Act 2025 s.394)
 *   First-year comprehensive insurance estimated at 3.25% of ex-showroom
 *
 * FTA simulation changes only the customs percentage. GST / RTO / TCS /
 * insurance *rates* stay exactly as above; rupee amounts move only because
 * their statutory base (CIF+customs, or ex-showroom) moved.
 *
 * Listed catalogue prices are Bangalore on-road. We back out an implied CIF
 * from today's MFN stack, then rebuild the same stack with the FTA customs
 * rate. Dealer / PDI / listing-source residuals are absorbed into CIF —
 * there is no separate published margin to peel.
 */

export const MFN_CUSTOMS_PCT = {
  CBU_LARGE: 110,
  CBU_MID: 77,
  CKD: 16.5,
  MOTORCYCLE_CBU: 55,
};

export const USD_INR = 90; // $40,000 CIF ≈ ₹36 lakh
export const TCS_THRESHOLD = 10_00_000;
export const TCS_RATE = 0.01;
export const INSURANCE_RATE = 0.0325;
export const KA_RTO_CESS = 0.11;
export const KA_RTO_BASE = [
  { above: 20_00_000, rate: 0.18 },
  { above: 10_00_000, rate: 0.17 },
  { above: 5_00_000, rate: 0.14 },
  { above: 0, rate: 0.13 },
];
export const KA_RTO_EV = 0.04;

const rupee = (n) => Math.round(Number.isFinite(n) ? n : 0);

export function isLargeDisplacement(engineCc, fuel) {
  const cc = engineCc || 0;
  if (/diesel/i.test(fuel || "")) return cc > 2500;
  return cc > 3000;
}

export function resolveGstRate({ fuelClass, fuel, engineCc, category } = {}) {
  if (fuelClass === "EV" || (/electric/i.test(fuel || "") && !/hybrid/i.test(fuel || ""))) {
    return 0.05;
  }
  if (category === "MOTORCYCLE") {
    return (engineCc || 0) > 350 ? 0.4 : 0.18;
  }
  const cc = engineCc || 0;
  const diesel = /diesel/i.test(fuel || "");
  // Length is not in the catalogue. FTA cars are all mid/large, so 40%.
  // 18% is only for ≤4 m AND petrol/CNG ≤1200cc or diesel ≤1500cc.
  if (cc > 0 && ((diesel && cc <= 1500) || (!diesel && cc <= 1200))) {
    return 0.18;
  }
  return 0.4;
}

export function resolveRtoRate(exShowroom, { fuelClass } = {}) {
  if (fuelClass === "EV") return KA_RTO_EV;
  const base = KA_RTO_BASE.find((slab) => exShowroom > slab.above)?.rate ?? 0.13;
  return base * (1 + KA_RTO_CESS);
}

export function resolveTcsRate(exShowroom) {
  return exShowroom > TCS_THRESHOLD ? TCS_RATE : 0;
}

function postExShowroomRates(exShowroom, profile) {
  return {
    rtoRate: resolveRtoRate(exShowroom, profile),
    tcsRate: resolveTcsRate(exShowroom),
    insuranceRate: INSURANCE_RATE,
  };
}

/** Peel Bangalore on-road back to ex-showroom using statutory add-ons. */
export function impliedExShowroom(onRoad, profile = {}) {
  let exShowroom = onRoad / 1.25;
  for (let i = 0; i < 6; i += 1) {
    const { rtoRate, tcsRate, insuranceRate } = postExShowroomRates(exShowroom, profile);
    const next = onRoad / (1 + rtoRate + tcsRate + insuranceRate);
    if (Math.abs(next - exShowroom) < 1) {
      exShowroom = next;
      break;
    }
    exShowroom = next;
  }
  return exShowroom;
}

export function impliedCifFromOnRoad(onRoad, customsPct, profile = {}) {
  const exShowroom = impliedExShowroom(onRoad, profile);
  const gstRate = resolveGstRate(profile);
  const factor = (1 + customsPct / 100) * (1 + gstRate);
  if (factor <= 0) return 0;
  return exShowroom / factor;
}

export function resolveMfnCustomsPct({
  importType,
  category,
  engineCc,
  fuel,
  listedCost,
  fuelClass,
} = {}) {
  if (importType === "CKD") return MFN_CUSTOMS_PCT.CKD;
  if (category === "MOTORCYCLE") return MFN_CUSTOMS_PCT.MOTORCYCLE_CBU;
  if (isLargeDisplacement(engineCc, fuel)) return MFN_CUSTOMS_PCT.CBU_LARGE;

  const profile = { fuelClass, engineCc, fuel, category };
  const cifIfLarge = impliedCifFromOnRoad(listedCost, MFN_CUSTOMS_PCT.CBU_LARGE, profile);
  if (cifIfLarge / USD_INR > 40000) return MFN_CUSTOMS_PCT.CBU_LARGE;

  const cifIfMid = impliedCifFromOnRoad(listedCost, MFN_CUSTOMS_PCT.CBU_MID, profile);
  if (cifIfMid / USD_INR > 40000) return MFN_CUSTOMS_PCT.CBU_LARGE;
  return MFN_CUSTOMS_PCT.CBU_MID;
}

export function splitCustoms(cif, effectivePct) {
  if (Math.abs(effectivePct - 110) < 0.001) {
    return { bcd: cif * 0.7, aidc: cif * 0.4, sws: 0, total: cif * 1.1 };
  }
  if (Math.abs(effectivePct - 77) < 0.001) {
    return { bcd: cif * 0.7, aidc: 0, sws: cif * 0.07, total: cif * 0.77 };
  }
  if (Math.abs(effectivePct - 16.5) < 0.001) {
    return { bcd: cif * 0.15, aidc: 0, sws: cif * 0.015, total: cif * 0.165 };
  }
  const total = cif * (effectivePct / 100);
  return { bcd: total, aidc: 0, sws: 0, total };
}

/**
 * Forward Indian waterfall from a known CIF and a single customs %.
 * Preferential FTA rates are applied as all-in BCD (AIDC/SWS nil).
 */
export function buildStackFromCif(cif, customsPct, profile = {}) {
  const gstRate = resolveGstRate(profile);
  const customs = splitCustoms(cif, customsPct);
  const igstBase = cif + customs.total;
  const igst = igstBase * gstRate;
  const exShowroom = igstBase + igst;
  const { rtoRate, tcsRate, insuranceRate } = postExShowroomRates(exShowroom, profile);
  const rto = exShowroom * rtoRate;
  const tcs = exShowroom * tcsRate;
  const insurance = exShowroom * insuranceRate;
  const onRoad = exShowroom + rto + tcs + insurance;

  return {
    cif: rupee(cif),
    customsPct,
    bcd: rupee(customs.bcd),
    aidc: rupee(customs.aidc),
    sws: rupee(customs.sws),
    customs: rupee(customs.total),
    igstBase: rupee(igstBase),
    gstRate,
    igst: rupee(igst),
    exShowroom: rupee(exShowroom),
    rtoRate,
    rto: rupee(rto),
    tcsRate,
    tcs: rupee(tcs),
    insuranceRate,
    insurance: rupee(insurance),
    onRoad: rupee(onRoad),
  };
}

/**
 * Hold CIF constant (backed out of today's listed on-road) and rebuild
 * with a new customs %. Downstream rates do not change.
 */
export function restackOnRoad(listedOnRoad, currentDutyPct, nextDutyPct, profile = {}) {
  if (
    listedOnRoad == null ||
    currentDutyPct == null ||
    nextDutyPct == null ||
    currentDutyPct === nextDutyPct
  ) {
    return {
      onRoad: listedOnRoad,
      cif: impliedCifFromOnRoad(listedOnRoad, currentDutyPct ?? 0, profile),
      today: null,
      next: null,
    };
  }

  const cif = impliedCifFromOnRoad(listedOnRoad, currentDutyPct, profile);
  const today = buildStackFromCif(cif, currentDutyPct, profile);
  const next = buildStackFromCif(cif, nextDutyPct, profile);
  return { onRoad: next.onRoad, cif: rupee(cif), today, next };
}

export function formatInrCompact(n) {
  if (n == null || !Number.isFinite(n)) return "—";
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1_00_00_000) return `${sign}₹${(abs / 1_00_00_000).toFixed(2)} Cr`;
  if (abs >= 1_00_000) return `${sign}₹${(abs / 1_00_000).toFixed(2)} L`;
  return `${sign}₹${Math.round(abs).toLocaleString("en-IN")}`;
}
