import fs from "fs/promises";
import https from "https";
import vm from "vm";
import path from "path";

const ROOT = process.cwd();
const DATA_PATH = path.join(ROOT, "src", "Data.js");
const OUT_CITY = "Bangalore";
const AS_OF = "2026-08-15";

const MAKE_SEO = {
  Mahindra: "mahindra",
  Hyundai: "hyundai",
  Volkswagen: "volkswagen",
  Skoda: "skoda",
  Toyota: "toyota",
  Jeep: "jeep",
  Isuzu: "isuzu",
  Volvo: "volvo",
  BMW: "bmw",
  Porsche: "porsche",
  Ferrari: "ferrari",
  Lamborghini: "lamborghini",
  Bentley: "bentley",
  Maserati: "maserati",
  Jaguar: "jaguar",
  "Land Rover": "land-rover",
  Mercedes: "mercedes-benz",
  Mini: "mini",
  Rolls: "rolls-royce",
  "Rolls Royce": "rolls-royce",
  "Rolls-Royce": "rolls-royce",
  Lexus: "lexus",
  Ford: "ford",
  Tesla: "tesla",
  Aston: "aston-martin",
  "Aston Martin": "aston-martin",
  Bugatti: "bugatti",
  Lotus: "lotus",
  Audi: "audi",
  McLaren: "mclaren",
  Maruti: "maruti-suzuki",
};

const BIKE_MAKE_SEO = {
  Triumph: "triumph",
  "Harley Davidson": "harley-davidson",
  Ducati: "ducati",
  TVS: "tvs",
  "Royal Enfield": "royal-enfield",
  Vespa: "vespa",
  Suzuki: "suzuki",
  Yamaha: "yamaha",
  Aprilia: "aprilia",
  Ather: "ather",
};

// CarWale model SEO slugs that don't match simple slugification.
// Key format: `${makeSeo}/${carName}` (carName exactly as in Data.js)
const MODEL_SEO_OVERRIDES = {
  "mercedes-benz/Mercedes Benz G Wagon": "g-class",
  "mercedes-benz/Mercedes Benz AMG G Wagon Invictus": "g-class",
  "mercedes-benz/Mercedes Benz GLC": "glc",
  "mercedes-benz/Mercedes Benz A Class": "a-class",
  "mercedes-benz/Mercedes S Class": "s-class",
  "mercedes-benz/Mercedes S Class Maybach": "maybach-s-class",
  "mercedes-benz/Mercedes GLS": "gls",
  "mercedes-benz/Mercedes GLS 600 Maybach": "maybach-gls",
  "mercedes-benz/Mercedes-Benz AMG A 45 S": "amg-a-45-s",
  "mercedes-benz/Mercedes-Benz AMG E 53 Cabriolet": "amg-e-class-cabriolet",
  "mercedes-benz/Mercedes-AMG SL 63": "amg-sl",
  "mercedes-benz/Mercedes-AMG EQS 53 4MATIC+": "eqs",
  "mercedes-benz/Mercedes-AMG GT 63 S E Performance": "amg-gt",
  "mercedes-benz/Mercedes E Class": "e-class",
  "mahindra/Mahindra XUV 700": "xuv700",
  "mahindra/Scorpio N": "scorpio-n",
  "hyundai/Hyundai I20": "i20",
  "jeep/Jeep Compas 4x4": "compass",
  "jeep/Jeep Wrangler Rubicon": "wrangler",
  "porsche/Porsche 911 Carrera Cabriolet S": "911",
  "porsche/Porsche 911 GT3 (992)": "911",
  "porsche/Porsche Macan S": "macan-electric",
  "porsche/Porsche Taycan Turbo S": "taycan",
  "porsche/Porsche 718 Boxster": "718",
  "porsche/Porsche 718 Cayman GT4 RS": "718",
  "bmw/BMW 3 Series Gran Limusine": "3-series-gran-limousine",
  "bmw/BMW M340i": "3-series",
  "bmw/BMW M4 CSL": "m4",
  "bmw/BMW 2 Series": "2-series-gran-coupe",
  "bmw/BMW 5 Series": "5-series",
  "bmw/BMW 7 Series": "7-series",
  "land-rover/Range Rover Sport": "range-rover-sport",
  "land-rover/Range Rover": "range-rover",
  "land-rover/Range Rover Velar": "range-rover-velar",
  "land-rover/Land Rover Defender": "defender",
  "land-rover/Land Rover Defender Octa": "defender",
  "land-rover/Land Rover Discovery Sport": "discovery-sport",
  "ferrari/Ferrari SF90 Stradale": "sf90-stradale",
  "ferrari/Ferrari 812 Superfast": "812",
  "lamborghini/Lamborghini Urus Performante": "urus",
  "lamborghini/Lamborghini Revuelto": "revuelto",
  "isuzu/Isuzu Dmax": "d-max",
  "maruti-suzuki/Maruti Eeco Cargo": "eeco",
  "bentley/Bentley Continental GTC S": "continental",
  "bentley/Bentley Flying Spur": "flying-spur",
  "bentley/Bentley Bentayga Azure": "bentayga",
  "aston-martin/Aston Martin Vantage (2024)": "vantage",
  "rolls-royce/Rolls-Royce Spectre": "spectre",
  "rolls-royce/Rolls-Royce Cullinan": "cullinan",
  "rolls-royce/Rolls Royce Cullinan": "cullinan",
  "rolls-royce/Rolls Royce Ghost": "ghost",
  "audi/Audi RS e-tron GT": "rs-e-tron-gt",
  "mclaren/McLaren 720S": "750s",
  "tesla/Tesla Model 3": "model-3",
  "tesla/Tesla Model S": "model-s",
  "mini/Mini Cooper": "cooper",
};

const BIKE_MODEL_OVERRIDES = {
  "triumph/Triumph Bonneville T120": "bonneville-t120",
  "triumph/Triumph Rocket 3": "rocket-3",
  "triumph/Triumph Bonneville T100": "bonneville-t100",
  "harley-davidson/Harley Davidson Fat Bob": "fat-bob",
  "harley-davidson/Harley Davidson Nightster": "nightster",
  "harley-davidson/Harley Davidson Sportster S": "sportster-s",
  "ducati/Ducati Panigale V4": "panigale-v4",
  "ducati/Ducati Panigale V2": "panigale-v2",
  "tvs/TVS Iqube": "iqube",
  "royal-enfield/Royal Enfield Classic 350": "classic-350",
  "royal-enfield/Royal Enfield Interceptor 650": "interceptor-650",
  "royal-enfield/Royal Enfield Shotgun 650": "shotgun-650",
  "royal-enfield/Royal Enfield Himalayan 450": "himalayan-450",
  "vespa/Vespa SXL 150": "sxl-150",
  "vespa/Vespa ZX 125": "zx-125",
  "suzuki/Suzuki Burgman": "burgman-street",
  "yamaha/Yamaha R3": "r3",
  "aprilia/Aprilia RS 457": "rs-457",
  "ather/Ather 450 Apex": "rizta",
};

const ATHER_FALLBACKS = ["450-apex", "450x", "450-s", "450"];

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function stripBrandPrefixes(carName, maker) {
  let model = carName.trim();
  const prefixes = [
    maker,
    "Mercedes-Benz",
    "Mercedes Benz",
    "Mercedes-AMG",
    "Mercedes AMG",
    "Mercedes",
    "Rolls-Royce",
    "Rolls Royce",
    "Land Rover",
    "Range Rover",
    "Aston Martin",
    "Harley Davidson",
    "Royal Enfield",
    "Maruti Suzuki",
    "Maruti",
  ];
  for (const p of prefixes) {
    const re = new RegExp(`^${p}\\s+`, "i");
    if (re.test(model)) model = model.replace(re, "").trim();
  }
  return model.replace(/\s+/g, " ").trim();
}

function modelCandidates({ maker, carName }) {
  const stripped = stripBrandPrefixes(carName, maker);
  const hyphen = slugify(stripped);
  const full = slugify(carName);
  const noHyphen = hyphen.replace(/-/g, "");

  const candidates = new Set([hyphen, noHyphen, full]);

  candidates.add(hyphen.replace(/gran-limusine/g, "gran-limousine"));
  candidates.add(hyphen.replace(/compas/g, "compass"));
  candidates.add(hyphen.replace(/dmax/g, "d-max"));
  candidates.add(hyphen.replace(/xuv-700/g, "xuv700"));
  candidates.add(hyphen.replace(/iqube/g, "iqube"));

  // Drop common marketing suffixes that aren't in CarWale slugs
  const trimmed = hyphen
    .replace(/-cabriolet-s$/, "")
    .replace(/-cabriolet$/, "")
    .replace(/-turbo-s$/, "")
    .replace(/-rubicon$/, "")
    .replace(/-4x4$/, "")
    .replace(/-gt500$/, "")
    .replace(/-shelby.*$/, "")
    .replace(/-\d{4}$/, "")
    .replace(/-\(\d+\)$/, "")
    .replace(/-992$/, "")
    .replace(/-azure$/, "")
    .replace(/-performante$/, "")
    .replace(/-cargo$/, "")
    .replace(/-octa$/, "");
  if (trimmed) candidates.add(trimmed);

  return Array.from(candidates).filter(Boolean);
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function fetchUrl(url, redirectsLeft = 5) {
  const attemptOnce = () =>
    new Promise((resolve, reject) => {
      https
        .get(
          url,
          {
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
              Accept: "text/html,application/xhtml+xml",
              "Accept-Language": "en-IN,en;q=0.9",
              "Accept-Encoding": "identity",
            },
          },
          (res) => {
            const status = res.statusCode ?? 0;
            if ([301, 302, 303, 307, 308].includes(status) && res.headers.location) {
              res.resume();
              if (redirectsLeft <= 0) {
                resolve({ status, html: "", url });
                return;
              }
              const next = new URL(res.headers.location, url).toString();
              fetchUrl(next, redirectsLeft - 1).then(resolve, reject);
              return;
            }
            let html = "";
            res.on("data", (c) => (html += c));
            res.on("end", () => resolve({ status, html, url }));
          }
        )
        .on("error", reject);
    });

  return (async () => {
    const maxAttempts = 4;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const res = await attemptOnce();
        if (res.status >= 500 && attempt < maxAttempts) {
          await sleep(400 * attempt);
          continue;
        }
        return res;
      } catch (e) {
        const code = e?.code;
        const retryable =
          code === "ECONNRESET" ||
          code === "ETIMEDOUT" ||
          code === "EAI_AGAIN";
        if (!retryable || attempt === maxAttempts) throw e;
        await sleep(400 * attempt);
      }
    }
    return { status: 0, html: "", url };
  })();
}

function extractInitialState(html) {
  const a = html.indexOf("window.__INITIAL_STATE__");
  if (a < 0) return null;
  const eq = html.indexOf("=", a);
  const start = html.indexOf("{", eq);
  if (start < 0) return null;

  let i = start;
  let depth = 0;
  let inStr = false;
  let esc = false;

  for (; i < html.length; i++) {
    const ch = html[i];
    if (inStr) {
      if (esc) {
        esc = false;
        continue;
      }
      if (ch === "\\") {
        esc = true;
        continue;
      }
      if (ch === '"') {
        inStr = false;
      }
      continue;
    }
    if (ch === '"') {
      inStr = true;
      continue;
    }
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) {
        i++;
        break;
      }
    }
  }

  try {
    return JSON.parse(html.slice(start, i));
  } catch {
    return null;
  }
}

function normalizeFuel(s) {
  const v = String(s || "").toLowerCase();
  if (v.includes("diesel")) return "diesel";
  if (v.includes("petrol") || v.includes("gasoline")) return "petrol";
  if (v.includes("electric") || v.includes("ev")) return "electric";
  if (v.includes("hybrid") || v.includes("phev")) return "hybrid";
  return "";
}

function normalizeDrivetrain(s) {
  const v = String(s || "").toLowerCase();
  if (v.includes("4x4") || v.includes("4wd")) return "4x4";
  if (v.includes("awd") || v.includes("4matic") || v.includes("xdrive"))
    return "awd";
  if (v.includes("rwd")) return "rwd";
  if (v.includes("fwd") || v.includes("2wd")) return "2wd";
  return "";
}

function variantFromCarwaleVersion(v) {
  const name = v.versionName || v.displayName || "";
  const price = v.priceOverview?.price;
  if (typeof price !== "number" || !Number.isFinite(price) || price <= 0)
    return null;

  const fuel = (() => {
    const f = normalizeFuel(name);
    if (f === "petrol") return "Petrol";
    if (f === "diesel") return "Diesel";
    if (f === "electric") return "Electric";
    if (f === "hybrid") return "Hybrid";
    return "";
  })();

  const dt = (() => {
    const d = normalizeDrivetrain(name);
    if (d === "4x4") return "4x4";
    if (d === "awd") return "AWD";
    if (d === "rwd") return "RWD";
    if (d === "2wd") return "2WD";
    return "";
  })();

  return {
    name,
    cost: Math.round(price),
    ...(fuel ? { fuel_type: fuel } : {}),
    ...(dt ? { drivetrain: dt } : {}),
  };
}

function variantFromBikedekho(v) {
  const name = v.variantShortName || v.name || v.displayName || "";
  const price = v.onRoadPriceOfVariant || v.onRoadPrice || v.newOrpPrice;
  if (typeof price !== "number" || !Number.isFinite(price) || price <= 0)
    return null;
  const fuel = v.fuelType || "";
  return {
    name,
    cost: Math.round(price),
    ...(fuel ? { fuel_type: fuel } : {}),
    drivetrain: "2WD",
  };
}

async function loadCarsFromDataJs() {
  const raw = await fs.readFile(DATA_PATH, "utf8");
  const rewritten = raw
    .replace("export const cars =", "exports.cars =")
    .replace("export const cars=", "exports.cars =")
    .replace(/export\s+default\s+/g, "");

  const context = { exports: {} };
  vm.createContext(context);
  vm.runInContext(rewritten, context, { filename: "Data.js" });
  const cars = context.exports.cars;
  if (!Array.isArray(cars)) throw new Error("Failed to load cars from Data.js");
  return cars;
}

function formatDataJs(cars) {
  const body = JSON.stringify(cars, null, 2);
  return `export const cars = ${body};\n`;
}

function isArmouredOrCustom(car) {
  const n = `${car.car} ${car.type || ""}`.toLowerCase();
  return (
    n.includes("armoured") ||
    n.includes("guard") ||
    n.includes("sentinel") ||
    n.includes("invictus")
  );
}

async function versionsFromCarwaleUrl(url) {
  const { status, html, url: finalUrl } = await fetchUrl(url);
  if (status !== 200) return null;
  const state = extractInitialState(html);
  const versions = state?.priceInCityPage?.versions;
  if (Array.isArray(versions) && versions.length) {
    return { url: finalUrl || url, versions, source: "carwale" };
  }
  return null;
}

async function fetchCarwaleVersions({ maker, carName, existingUrl }) {
  if (existingUrl && /carwale\.com/.test(existingUrl)) {
    const hit = await versionsFromCarwaleUrl(existingUrl);
    if (hit) return hit;
  }

  const makeSeo = MAKE_SEO[maker];
  if (!makeSeo) return null;

  const overrideKey = `${makeSeo}/${carName}`;
  const overriddenModelSeo = MODEL_SEO_OVERRIDES[overrideKey];
  const tried = new Set();

  const tryModel = async (modelSeo) => {
    if (!modelSeo || tried.has(modelSeo)) return null;
    tried.add(modelSeo);
    const url = `https://www.carwale.com/${makeSeo}-cars/${modelSeo}/price-in-bangalore/`;
    return versionsFromCarwaleUrl(url);
  };

  if (overriddenModelSeo) {
    const hit = await tryModel(overriddenModelSeo);
    if (hit) return hit;
  }

  for (const modelSeo of modelCandidates({ maker, carName })) {
    const hit = await tryModel(modelSeo);
    if (hit) return hit;
  }
  return null;
}

async function fetchBikedekhoVersions({ maker, carName }) {
  const makeSeo = BIKE_MAKE_SEO[maker];
  if (!makeSeo) return null;

  const overrideKey = `${makeSeo}/${carName}`;
  const candidates = [];
  if (BIKE_MODEL_OVERRIDES[overrideKey]) {
    candidates.push(BIKE_MODEL_OVERRIDES[overrideKey]);
  }
  if (makeSeo === "ather") candidates.push(...ATHER_FALLBACKS);
  candidates.push(...modelCandidates({ maker, carName }));

  const tried = new Set();
  for (const modelSeo of candidates) {
    if (!modelSeo || tried.has(modelSeo)) continue;
    tried.add(modelSeo);
    const url = `https://www.bikedekho.com/${makeSeo}/${modelSeo}/price-in-bangalore`;
    const { status, html, url: finalUrl } = await fetchUrl(url);
    if (status !== 200) continue;
    const state = extractInitialState(html);
    const list =
      state?.priceDetailSection?.[0]?.variantDetailByFuelV2?.variantList ||
      state?.dataQnA?.variantDetailByFuelV2?.variantList;
    if (Array.isArray(list) && list.length) {
      return { url: finalUrl || url, versions: list, source: "bikedekho" };
    }
  }
  return null;
}

function applyResult(car, result) {
  const mapper =
    result.source === "bikedekho"
      ? variantFromBikedekho
      : variantFromCarwaleVersion;
  const newVariants = result.versions.map(mapper).filter(Boolean);
  if (!newVariants.length) return 0;

  car.variants = newVariants;
  const costs = newVariants
    .map((v) => v.cost)
    .filter((n) => typeof n === "number" && n > 0);
  if (costs.length) car.cost = Math.min(...costs);

  const defaultFuel = newVariants.find((v) => v.fuel_type)?.fuel_type;
  const defaultDt = newVariants.find((v) => v.drivetrain)?.drivetrain;
  if (defaultFuel) car.fuel_type = defaultFuel;
  if (defaultDt) car.drivetrain = defaultDt;

  car.price_meta = {
    source: result.source,
    city: OUT_CITY,
    asOf: AS_OF,
    url: result.url,
  };
  return newVariants.length;
}

async function main() {
  const cars = await loadCarsFromDataJs();

  let updatedCars = 0;
  let updatedVariants = 0;
  const skipped = [];

  for (const car of cars) {
    if (!car || typeof car !== "object") continue;
    const maker = car.maker;
    const carName = car.car;

    if (isArmouredOrCustom(car)) {
      skipped.push({ car: carName, reason: "armoured/custom" });
      continue;
    }

    let result = null;
    try {
      if (car.type === "Two Wheeler") {
        result = await fetchBikedekhoVersions({ maker, carName });
      } else {
        result = await fetchCarwaleVersions({
          maker,
          carName,
          existingUrl: car.price_meta?.url,
        });
      }
    } catch (e) {
      skipped.push({ car: carName, reason: `error: ${e.message}` });
      await sleep(200);
      continue;
    }

    if (!result) {
      skipped.push({ car: carName, reason: "no listing" });
      await sleep(150);
      continue;
    }

    const n = applyResult(car, result);
    if (!n) {
      skipped.push({ car: carName, reason: "no priced variants" });
      await sleep(150);
      continue;
    }

    updatedCars++;
    updatedVariants += n;
    console.log(`updated ${carName} (${n} variants) via ${result.source}`);
    await sleep(150);
  }

  const out = formatDataJs(cars);
  await fs.writeFile(DATA_PATH, out, "utf8");

  console.log(
    JSON.stringify(
      { updatedCars, updatedVariants, skippedCount: skipped.length, skipped },
      null,
      2
    )
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
