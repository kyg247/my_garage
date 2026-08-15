import fs from "fs/promises";
import https from "https";
import vm from "vm";
import path from "path";

const ROOT = process.cwd();
const DATA_PATH = path.join(ROOT, "src", "Data.js");
const AS_OF = "2026-08-15";

const DIRECT = {
  "Mercedes-Benz AMG A 45 S": {
    url: "https://www.carwale.com/mercedes-benz-cars/amg-a45-s/price-in-bangalore/",
    source: "carwale",
  },
  "Mercedes Benz A Class": {
    url: "https://www.carwale.com/mercedes-benz-cars/a-class-limousine/price-in-bangalore/",
    source: "carwale",
  },
  "Porsche Macan S": {
    url: "https://www.carwale.com/porsche-cars/macan/price-in-bangalore/",
    source: "carwale",
  },
  "BMW M340i": {
    url: "https://www.carwale.com/bmw-cars/m340i/price-in-bangalore/",
    source: "carwale",
  },
  "Isuzu Dmax": {
    url: "https://www.carwale.com/isuzu-cars/v-cross/price-in-bangalore/",
    source: "carwale",
  },
  "Lamborghini Urus": {
    url: "https://www.carwale.com/lamborghini-cars/urus-se/price-in-bangalore/",
    source: "carwale",
  },
  "Audi RS e-tron GT": {
    url: "https://www.carwale.com/audi-cars/e-tron-gt/price-in-bangalore/",
    source: "carwale",
  },
  "Ather 450 Apex": {
    url: "https://www.bikedekho.com/ather-energy/450-apex/price-in-bangalore",
    source: "bikedekho",
  },
  "TVS Iqube": {
    url: "https://www.bikedekho.com/tvs/iqube-electric/price-in-bangalore",
    source: "bikedekho",
  },
};

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
    for (let attempt = 1; attempt <= 4; attempt++) {
      try {
        const res = await attemptOnce();
        if (res.status >= 500 && attempt < 4) {
          await sleep(400 * attempt);
          continue;
        }
        return res;
      } catch (e) {
        const retryable = ["ECONNRESET", "ETIMEDOUT", "EAI_AGAIN"].includes(e?.code);
        if (!retryable || attempt === 4) throw e;
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
      if (ch === '"') inStr = false;
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
  if (v.includes("diesel")) return "Diesel";
  if (v.includes("petrol") || v.includes("gasoline")) return "Petrol";
  if (v.includes("electric") || v.includes("ev")) return "Electric";
  if (v.includes("hybrid") || v.includes("phev")) return "Hybrid";
  return "";
}

function normalizeDrivetrain(s) {
  const v = String(s || "").toLowerCase();
  if (v.includes("4x4") || v.includes("4wd")) return "4x4";
  if (v.includes("awd") || v.includes("4matic") || v.includes("xdrive")) return "AWD";
  if (v.includes("rwd")) return "RWD";
  if (v.includes("fwd") || v.includes("2wd")) return "2WD";
  return "";
}

function fromCarwale(v) {
  const name = v.versionName || v.displayName || "";
  const price = v.priceOverview?.price;
  if (typeof price !== "number" || price <= 0) return null;
  const fuel = normalizeFuel(name);
  const dt = normalizeDrivetrain(name);
  return {
    name,
    cost: Math.round(price),
    ...(fuel ? { fuel_type: fuel } : {}),
    ...(dt ? { drivetrain: dt } : {}),
  };
}

function fromBikedekho(v) {
  const name = v.variantShortName || v.name || "";
  const price = v.onRoadPriceOfVariant || v.onRoadPrice || v.newOrpPrice;
  if (typeof price !== "number" || price <= 0) return null;
  return {
    name,
    cost: Math.round(price),
    fuel_type: v.fuelType || "Electric",
    drivetrain: "2WD",
  };
}

async function loadCars() {
  const raw = await fs.readFile(DATA_PATH, "utf8");
  const rewritten = raw
    .replace("export const cars =", "exports.cars =")
    .replace("export const cars=", "exports.cars =");
  const context = { exports: {} };
  vm.createContext(context);
  vm.runInContext(rewritten, context, { filename: "Data.js" });
  return context.exports.cars;
}

async function main() {
  const cars = await loadCars();
  const report = [];

  for (const car of cars) {
    const spec = DIRECT[car.car];
    if (!spec) continue;
    const { status, html, url } = await fetchUrl(spec.url);
    if (status !== 200) {
      report.push({ car: car.car, ok: false, status, url });
      continue;
    }
    const state = extractInitialState(html);
    let variants = [];
    if (spec.source === "carwale") {
      variants = (state?.priceInCityPage?.versions || []).map(fromCarwale).filter(Boolean);
    } else {
      const list =
        state?.priceDetailSection?.[0]?.variantDetailByFuelV2?.variantList ||
        state?.dataQnA?.variantDetailByFuelV2?.variantList ||
        [];
      variants = list.map(fromBikedekho).filter(Boolean);
    }
    if (!variants.length) {
      report.push({ car: car.car, ok: false, reason: "empty", url });
      continue;
    }
    car.variants = variants;
    car.cost = Math.min(...variants.map((v) => v.cost));
    const fuel = variants.find((v) => v.fuel_type)?.fuel_type;
    const dt = variants.find((v) => v.drivetrain)?.drivetrain;
    if (fuel) car.fuel_type = fuel;
    if (dt) car.drivetrain = dt;
    car.price_meta = { source: spec.source, city: "Bangalore", asOf: AS_OF, url: url || spec.url };
    report.push({ car: car.car, ok: true, n: variants.length, min: car.cost, url: car.price_meta.url });
    await sleep(150);
  }

  // Defender Octa: keep only Octa-named trims from the Defender list if present
  const octa = cars.find((c) => c.car === "Land Rover Defender Octa");
  const defender = cars.find((c) => c.car === "Land Rover Defender");
  if (octa && defender?.variants) {
    const octaVars = defender.variants.filter((v) => /octa/i.test(v.name));
    if (octaVars.length) {
      octa.variants = octaVars;
      octa.cost = Math.min(...octaVars.map((v) => v.cost));
      octa.price_meta = {
        ...(defender.price_meta || {}),
        note: "Octa trims from Defender Bangalore listing",
      };
      report.push({ car: octa.car, ok: true, n: octaVars.length, min: octa.cost, filtered: true });
    } else {
      report.push({ car: octa.car, ok: false, reason: "no octa trims on defender page" });
    }
  }

  await fs.writeFile(DATA_PATH, `export const cars = ${JSON.stringify(cars, null, 2)};\n`);
  console.log(JSON.stringify(report, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
