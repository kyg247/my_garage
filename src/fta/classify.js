/**
 * Per-model FTA profile for the catalogue.
 *
 * Import type is how the car is typically sold in India in 2026:
 *   LOCAL — Indian-made / non-EU-UK origin (no FTA path)
 *   CKD   — assembled in India from kits (EU CKD schedule if origin is EU)
 *   CBU   — fully built import (CBU schedule of the origin FTA)
 *
 * Volume Mercedes/BMW/Volvo models are Chakan/Chennai CKD.
 * Halo AMG, G-Class, Maybach, Porsche, Ferrari, etc. are CBU.
 * Virtus/Slavia are highly localised Indian production, not EU CKD kits.
 */

const MODEL_RULES = [
  {
    test: (c) => /^Triumph Rocket 3/.test(c.car),
    origin: "UK",
    importType: "CBU",
    category: "MOTORCYCLE",
    engineCc: 2458,
    reason: "Hinckley-built CBU; Thai-built Triumphs are excluded",
  },
  {
    test: (c) => c.maker === "Triumph",
    origin: "NONE",
    importType: "LOCAL",
    category: "MOTORCYCLE",
    reason: "Most Triumphs sold in India are Thailand-built (ASEAN FTA)",
  },
  {
    test: (c) => c.maker === "Ducati",
    origin: "EU",
    importType: "CBU",
    category: "MOTORCYCLE",
    engineCc: 1103,
    reason: "Italy-built CBU superbike",
  },
  {
    test: (c) => c.maker === "Aprilia",
    origin: "NONE",
    importType: "LOCAL",
    category: "MOTORCYCLE",
    engineCc: 457,
    reason: "RS 457 is assembled in India and is under 800 cc",
  },
  {
    test: (c) => /Defender/.test(c.car),
    origin: "EU",
    importType: "CBU",
    engineCc: 3000,
    reason: "Defender is built in Nitra, Slovakia",
  },
  {
    test: (c) => /Discovery Sport/.test(c.car),
    origin: "EU",
    importType: "CKD",
    engineCc: 2000,
    reason: "JLR Pune assembly from kits",
  },
  {
    test: (c) => /Range Rover|Jaguar /.test(c.car),
    origin: "UK",
    importType: "CBU",
    engineCc: 3000,
    reason: "Solihull / Halewood CBU",
  },
  {
    test: (c) =>
      /AMG|G Wagon|S 680 Guard|SL 63|EQS|GT 63/i.test(c.car),
    origin: "EU",
    importType: "CBU",
    reason: "Halo Mercedes is imported as CBU",
  },
  {
    test: (c) =>
      /7 Series Guard|Z4|XM|M4 CSL/.test(c.car),
    origin: "EU",
    importType: "CBU",
    reason: "Low-volume BMW CBU",
  },
];

const EU_CKD_MODELS = new Set([
  "Mercedes Benz GLC",
  "Mercedes Benz A Class",
  "Mercedes E Class",
  "Mercedes GLS",
  "Mercedes S Class",
  "Mercedes S Class Maybach",
  "Mercedes GLS 600 Maybach",
  "BMW 2 Series",
  "BMW X1",
  "BMW X7",
  "BMW 3 Series Gran Limusine",
  "BMW 5 Series",
  "BMW 7 Series",
  "BMW M340i",
  "Volvo XC60",
  "Volvo S90",
]);

const EU_CBU_MAKERS = new Set([
  "Porsche",
  "Ferrari",
  "Lamborghini",
  "Maserati",
  "Bugatti",
  "Audi",
]);

const UK_CBU_MAKERS = new Set([
  "Bentley",
  "Rolls Royce",
  "Aston Martin",
  "Lotus",
  "McLaren",
  "Mini",
  "Jaguar",
]);

export function parseEngineCc(text = "") {
  const liter = text.match(/(\d+(?:\.\d+)?)\s*L\b/i);
  if (liter) return Math.round(parseFloat(liter[1]) * 1000);
  const cc = text.match(/(\d{3,4})\s*cc/i);
  if (cc) return parseInt(cc[1], 10);
  return null;
}

export function resolveFuelClass(car, variant) {
  const name = `${car.car} ${variant?.name || ""}`;
  const fuel = variant?.fuel_type || car.fuel_type || "";
  if (/electric/i.test(fuel) && !/hybrid/i.test(fuel)) return "EV";
  if (
    /plug-?in/i.test(name) ||
    /E Performance/i.test(name) ||
    /SF90|Spectre|e-tron|Taycan|EQS|XM/.test(name)
  ) {
    return "PHEV";
  }
  if (/hybrid/i.test(fuel) || /mild hybrid/i.test(name)) return "HEV";
  return "ICE";
}

function defaultEngineFor(car) {
  const fromName = parseEngineCc(car.car);
  if (fromName) return fromName;
  if (car.maker === "Mini") return 1998;
  if (car.maker === "Jaguar") return 1997;
  if (/Ghost|Cullinan|Phantom|Spectre/.test(car.car)) return 6750;
  if (car.maker === "Bentley" || car.maker === "Aston Martin") return 4000;
  if (car.maker === "McLaren") return 3994;
  if (car.maker === "Lotus") return 2000;
  if (/AMG A 45/.test(car.car)) return 1991;
  if (/G Wagon|SL 63|GT 63|S 680|Maybach/.test(car.car)) return 3982;
  return 3000;
}

export function classifyVehicle(car) {
  const category = car.type === "Two Wheeler" ? "MOTORCYCLE" : "CAR";

  for (const rule of MODEL_RULES) {
    if (rule.test(car)) {
      return {
        origin: rule.origin,
        importType: rule.importType,
        category: rule.category || category,
        engineCc: rule.engineCc || defaultEngineFor(car),
        reason: rule.reason,
      };
    }
  }

  if (EU_CKD_MODELS.has(car.car)) {
    return {
      origin: "EU",
      importType: "CKD",
      category,
      engineCc: defaultEngineFor(car),
      reason: "Assembled in India (Chakan / Chennai / Pune)",
    };
  }

  if (EU_CBU_MAKERS.has(car.maker) || car.maker === "Mercedes" || car.maker === "BMW") {
    return {
      origin: "EU",
      importType: "CBU",
      category,
      engineCc: defaultEngineFor(car),
      reason: "EU-origin CBU",
    };
  }

  if (UK_CBU_MAKERS.has(car.maker) || car.maker === "Land Rover") {
    return {
      origin: "UK",
      importType: "CBU",
      category,
      engineCc: defaultEngineFor(car),
      reason: "UK-origin CBU",
    };
  }

  return {
    origin: "NONE",
    importType: "LOCAL",
    category,
    engineCc: parseEngineCc(car.car) || 0,
    reason: "Indian-made or non-UK/EU origin — FTAs do not change the duty",
  };
}

export function classifyQuote(car, variant) {
  const base = classifyVehicle(car);
  const engineCc =
    parseEngineCc(variant?.name) || parseEngineCc(car.car) || base.engineCc;
  const fuel = variant?.fuel_type || car.fuel_type;
  const fuelClass = resolveFuelClass(car, variant);
  return { ...base, engineCc, fuel, fuelClass };
}
