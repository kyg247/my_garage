import {
  buildStackFromCif,
  impliedCifFromOnRoad,
  restackOnRoad,
  resolveGstRate,
  resolveMfnCustomsPct,
} from "./taxStack";

const luxuryIce = {
  fuelClass: "ICE",
  fuel: "Petrol",
  engineCc: 4000,
  category: "CAR",
  importType: "CBU",
};

test("official CBU example: CIF ₹40 lakh above $40k lands at ₹1.176 Cr before RTO", () => {
  const stack = buildStackFromCif(40_00_000, 110, luxuryIce);
  expect(stack.bcd).toBe(28_00_000);
  expect(stack.aidc).toBe(16_00_000);
  expect(stack.sws).toBe(0);
  expect(stack.igstBase).toBe(84_00_000);
  expect(stack.igst).toBe(33_60_000);
  expect(stack.exShowroom).toBe(1_17_60_000);
});

test("GST rate is 5% for EVs and 40% for large ICE", () => {
  expect(resolveGstRate({ fuelClass: "EV", fuel: "Electric" })).toBe(0.05);
  expect(resolveGstRate(luxuryIce)).toBe(0.4);
});

test("only the customs line changes; GST and RTO rates stay put", () => {
  const listed = 2_60_41_248;
  const priced = restackOnRoad(listed, 110, 10, luxuryIce);
  expect(priced.today.gstRate).toBe(priced.next.gstRate);
  expect(priced.today.rtoRate).toBe(priced.next.rtoRate);
  expect(priced.today.tcsRate).toBe(priced.next.tcsRate);
  expect(priced.today.insuranceRate).toBe(priced.next.insuranceRate);
  expect(priced.next.customsPct).toBe(10);
  expect(priced.today.customsPct).toBe(110);
  expect(priced.next.customs).toBeLessThan(priced.today.customs);
  expect(priced.next.igst).toBeLessThan(priced.today.igst);
  expect(priced.next.rto).toBeLessThan(priced.today.rto);
  expect(priced.onRoad).toBeLessThan(listed);
});

test("CIF reverse-engineer then rebuild reproduces today's customs-inclusive value", () => {
  const cif = 80_00_000;
  const today = buildStackFromCif(cif, 110, luxuryIce);
  const implied = impliedCifFromOnRoad(today.onRoad, 110, luxuryIce);
  expect(Math.abs(implied - cif)).toBeLessThan(5);
});

test("high-CIF 3.0L CBU still pays 110% MFN because AIDC keys off $40,000", () => {
  const pct = resolveMfnCustomsPct({
    importType: "CBU",
    category: "CAR",
    engineCc: 3000,
    fuel: "Petrol",
    listedCost: 1_76_51_395,
    fuelClass: "ICE",
  });
  expect(pct).toBe(110);
});
