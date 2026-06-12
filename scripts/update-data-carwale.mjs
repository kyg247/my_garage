import fs from "fs/promises";
import https from "https";
import vm from "vm";
import path from "path";

const ROOT = process.cwd();
const DATA_PATH = path.join(ROOT, "src", "Data.js");
const OUT_CITY = "Bangalore";
const AS_OF = "2026-04-30";

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
};

// CarWale model SEO slugs sometimes don't match simple slugification.
// Key format: `${makeSeo}/${carName}` (carName exactly as in Data.js)
const MODEL_SEO_OVERRIDES = {
  "mercedes-benz/Mercedes Benz G Wagon": "g-class",
  "mercedes-benz/Mercedes Benz AMG G Wagon Invictus": "g-class",
};

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function modelCandidates({ maker, carName }) {
  // remove maker prefix if present in the name
  let model = carName.trim();
  if (model.toLowerCase().startsWith(maker.toLowerCase() + " ")) {
    model = model.slice(maker.length + 1).trim();
  }

  // normalize common “Brand - Model” patterns
  model = model.replace(/\s+/g, " ").trim();

  const hyphen = slugify(model);
  const noHyphen = hyphen.replace(/-/g, "");

  const candidates = new Set([hyphen, noHyphen]);

  // a few extra heuristics that help with CarWale SEO names
  candidates.add(hyphen.replace(/-\bclass\b/g, "-class")); // noop but stable
  candidates.add(hyphen.replace(/\bgran-limusine\b/g, "gran-limousine"));
  candidates.add(hyphen.replace(/\bglc\b/, "glc"));

  return Array.from(candidates).filter(Boolean);
}

function fetchUrl(url) {
  const attemptOnce = () =>
    new Promise((resolve, reject) => {
      https
        .get(
          url,
          {
            headers: {
              "User-Agent": "Mozilla/5.0",
              "Accept-Encoding": "identity",
            },
          },
          (res) => {
            let html = "";
            res.on("data", (c) => (html += c));
            res.on("end", () =>
              resolve({ status: res.statusCode ?? 0, html })
            );
          }
        )
        .on("error", reject);
    });

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  return (async () => {
    const maxAttempts = 4;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const res = await attemptOnce();
        if (res.status >= 500 && attempt < maxAttempts) {
          await sleep(350 * attempt);
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
        await sleep(350 * attempt);
      }
    }
    return { status: 0, html: "" };
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
      if (ch === "\\\\") {
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

function normalizeTransmission(s) {
  const v = String(s || "").toLowerCase();
  if (/(dct|dsg)/.test(v)) return "dct";
  if (/(cvt)/.test(v)) return "cvt";
  if (/(amt)/.test(v)) return "amt";
  if (/(automatic| at\\b)/.test(v)) return "at";
  if (/(manual| mt\\b)/.test(v)) return "mt";
  return "";
}

function tokenize(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(/\s+/g)
    .filter(Boolean);
}

function jaccard(aTokens, bTokens) {
  const a = new Set(aTokens);
  const b = new Set(bTokens);
  let inter = 0;
  for (const t of a) if (b.has(t)) inter++;
  const union = a.size + b.size - inter;
  return union ? inter / union : 0;
}

function bestMatchVersion(variant, versions) {
  const vSig = {
    fuel: normalizeFuel(variant.fuel_type || variant.name),
    dt: normalizeDrivetrain(variant.drivetrain || variant.name),
    tr: normalizeTransmission(variant.name),
  };
  const vTokens = tokenize(variant.name);

  let best = null;
  let bestScore = -1;

  for (const ver of versions) {
    const name = ver.versionName || ver.displayName || "";
    const sig = {
      fuel: normalizeFuel(name),
      dt: normalizeDrivetrain(name),
      tr: normalizeTransmission(name),
    };
    const penalty =
      (vSig.fuel && sig.fuel && vSig.fuel !== sig.fuel ? 0.4 : 0) +
      (vSig.dt && sig.dt && vSig.dt !== sig.dt ? 0.3 : 0) +
      (vSig.tr && sig.tr && vSig.tr !== sig.tr ? 0.2 : 0);
    const sim = jaccard(vTokens, tokenize(name));
    const score = sim - penalty;
    if (score > bestScore) {
      bestScore = score;
      best = ver;
    }
  }

  // Only accept if similarity is “good enough”
  if (!best) return null;
  const name = best.versionName || best.displayName || "";
  const sim = jaccard(vTokens, tokenize(name));
  if (sim < 0.2) return null;
  return best;
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
    fuel_type: fuel || undefined,
    drivetrain: dt || undefined,
  };
}

async function loadCarsFromDataJs() {
  const raw = await fs.readFile(DATA_PATH, "utf8");
  // Data.js is ESM for CRA; convert to something we can eval in Node VM.
  // Keep this intentionally simple and deterministic.
  const rewritten = raw
    .replace("export const cars =", "exports.cars =")
    .replace("export const cars=", "exports.cars =")
    .replace(/export\\s+default\\s+/g, "");

  const context = { exports: {} };
  vm.createContext(context);
  vm.runInContext(rewritten, context, { filename: "Data.js" });
  const cars = context.exports.cars;
  if (!Array.isArray(cars)) throw new Error("Failed to load cars from Data.js");
  return cars;
}

function formatDataJs(cars) {
  // Keep it as valid JS, even if formatting changes.
  const body = JSON.stringify(cars, null, 2);
  return `export const cars = ${body};\n`;
}

async function fetchCarwaleVersions({ maker, carName }) {
  const makeSeo = MAKE_SEO[maker];
  if (!makeSeo) return null;

  const overrideKey = `${makeSeo}/${carName}`;
  const overriddenModelSeo = MODEL_SEO_OVERRIDES[overrideKey];
  if (overriddenModelSeo) {
    const url = `https://www.carwale.com/${makeSeo}-cars/${overriddenModelSeo}/price-in-bangalore/`;
    const { status, html } = await fetchUrl(url);
    if (status === 200) {
      const state = extractInitialState(html);
      const versions = state?.priceInCityPage?.versions;
      if (Array.isArray(versions) && versions.length) {
        return { url, versions };
      }
    }
  }

  const candidates = modelCandidates({ maker, carName });
  for (const modelSeo of candidates) {
    const url = `https://www.carwale.com/${makeSeo}-cars/${modelSeo}/price-in-bangalore/`;
    const { status, html } = await fetchUrl(url);
    if (status !== 200) continue;
    const state = extractInitialState(html);
    const versions = state?.priceInCityPage?.versions;
    if (Array.isArray(versions) && versions.length) {
      return { url, versions };
    }
  }
  return null;
}

async function main() {
  const cars = await loadCarsFromDataJs();

  let updatedCars = 0;
  let updatedVariants = 0;
  let skippedCars = 0;

  for (const car of cars) {
    if (!car || typeof car !== "object") continue;
    if (!Array.isArray(car.variants) || car.variants.length === 0) continue;
    if (car.type === "Two Wheeler") continue; // CarWale only

    const maker = car.maker;
    const carName = car.car;

    const result = await fetchCarwaleVersions({ maker, carName });
    if (!result) {
      skippedCars++;
      continue;
    }

    const { versions, url } = result;

    const newVariants = versions
      .map(variantFromCarwaleVersion)
      .filter(Boolean)
      .map((v) => {
        updatedVariants++;
        return v;
      });

    if (!newVariants.length) {
      skippedCars++;
      continue;
    }

    car.variants = newVariants;
    const costs = newVariants.map((v) => v.cost).filter((n) => typeof n === "number" && n > 0);
    if (costs.length) car.cost = Math.min(...costs);
    car.price_meta = { source: "carwale", city: OUT_CITY, asOf: AS_OF, url };
    updatedCars++;
  }

  const out = formatDataJs(cars);
  await fs.writeFile(DATA_PATH, out, "utf8");

  console.log(JSON.stringify({ updatedCars, updatedVariants, skippedCars }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

