import { classifyQuote, classifyVehicle } from "./classify";
import {
  calendarYear,
  euAgreementYear,
  resolveDuty,
  ukAgreementYear,
} from "./schedules";
import { restackOnRoad } from "./taxStack";

export function scalePrice(listedCost, currentDuty, nextDuty, profile = {}) {
  return restackOnRoad(listedCost, currentDuty, nextDuty, profile).onRoad;
}

export function quoteFtaPrice(car, variant, { horizonYears = 0, forceCbu = false } = {}) {
  const listedCost = variant?.listedCost ?? variant?.cost ?? car.listedCost ?? car.cost;
  const profile = classifyQuote(car, variant);
  const importType =
    forceCbu && profile.importType === "CKD" ? "CBU" : profile.importType;

  if (importType === "LOCAL" || profile.origin === "NONE") {
    return {
      listedCost,
      adjustedCost: listedCost,
      affected: false,
      currentDuty: null,
      nextDuty: null,
      savingPct: 0,
      meta: {
        ...profile,
        importType,
        horizonYears,
        calendarYear: calendarYear(horizonYears),
        ukYear: ukAgreementYear(horizonYears),
        euYear: euAgreementYear(horizonYears),
        note: profile.reason,
      },
    };
  }

  const duty = resolveDuty({
    ...profile,
    importType,
    listedCost,
    horizonYears,
  });

  const stack = restackOnRoad(listedCost, duty.current, duty.next, {
    ...profile,
    importType,
  });
  const adjustedCost = stack.onRoad;
  const savingPct =
    listedCost > 0 ? Math.round(((listedCost - adjustedCost) / listedCost) * 1000) / 10 : 0;

  return {
    listedCost,
    adjustedCost,
    affected: adjustedCost !== listedCost,
    currentDuty: duty.current,
    nextDuty: duty.next,
    savingPct,
    stack,
    meta: {
      ...profile,
      importType,
      horizonYears,
      calendarYear: calendarYear(horizonYears),
      ukYear: ukAgreementYear(horizonYears),
      euYear: euAgreementYear(horizonYears),
      cifInr: stack.cif ?? duty.cifInr,
      band: duty.band,
      note: duty.note,
      reason: profile.reason,
    },
  };
}

export function applyFtaToCatalogCar(car, options) {
  const baseQuote = quoteFtaPrice(car, null, options);
  return {
    ...car,
    listedCost: car.cost,
    cost: baseQuote.adjustedCost,
    fta: baseQuote,
    variants: (car.variants || []).map((variant) => {
      const quote = quoteFtaPrice(car, variant, options);
      return {
        ...variant,
        listedCost: variant.cost,
        cost: quote.adjustedCost,
        fta: quote,
      };
    }),
  };
}

export function applyFtaToGarageCar(car, options) {
  const variant = car.selectedVariant
    ? {
        name: car.selectedVariant,
        cost: car.listedCost ?? car.cost,
        listedCost: car.listedCost ?? car.cost,
        fuel_type: car.fuel_type,
      }
    : null;
  const quote = quoteFtaPrice(car, variant, options);
  return {
    ...car,
    listedCost: quote.listedCost,
    cost: quote.adjustedCost,
    fta: quote,
  };
}

export function isFtaEligible(car) {
  const profile = classifyVehicle(car);
  return profile.origin === "EU" || profile.origin === "UK";
}
