import { cars } from "../Data";
import { applyFtaToCatalogCar, quoteFtaPrice } from "./calculate";
import { classifyVehicle } from "./classify";

function findCar(name) {
  return cars.find((car) => car.car === name);
}

test("local Indian cars stay at the listed price", () => {
  const thar = findCar("Mahindra Thar");
  const quote = quoteFtaPrice(thar, null, { horizonYears: 5 });
  expect(quote.adjustedCost).toBe(thar.cost);
  expect(quote.affected).toBe(false);
});

test("EU CBU ICE drops from 110% to 10% by EU year 5", () => {
  const porsche = findCar("Porsche 911 Carrera Cabriolet S");
  expect(classifyVehicle(porsche).importType).toBe("CBU");
  const quote = quoteFtaPrice(porsche, null, { horizonYears: 5 });
  expect(quote.nextDuty).toBe(10);
  expect(quote.currentDuty).toBe(110);
  expect(quote.stack.next.customsPct).toBe(10);
  expect(quote.stack.next.gstRate).toBe(quote.stack.today.gstRate);
  expect(quote.stack.next.rtoRate).toBe(quote.stack.today.rtoRate);
  expect(quote.adjustedCost).toBeLessThan(porsche.cost);
  expect(quote.adjustedCost).toBe(quote.stack.next.onRoad);
});

test("EU CKD ICE follows 13.75 / 11 / 8.25 and barely moves vs CBU", () => {
  const five = findCar("BMW 5 Series");
  expect(classifyVehicle(five).importType).toBe("CKD");
  const y1 = quoteFtaPrice(five, null, { horizonYears: 1 });
  const y2 = quoteFtaPrice(five, null, { horizonYears: 2 });
  const y3 = quoteFtaPrice(five, null, { horizonYears: 3 });
  expect(y1.nextDuty).toBe(13.75);
  expect(y2.nextDuty).toBe(11);
  expect(y3.nextDuty).toBe(8.25);
  expect(y3.currentDuty).toBe(16.5);
  expect(y3.adjustedCost).toBeLessThan(five.cost);
  expect(y3.stack.next.gstRate).toBe(y3.stack.today.gstRate);
});

test("UK large vs mid engine bands differ on the same model", () => {
  const sport = findCar("Range Rover Sport");
  const petrol30 = sport.variants.find((v) => /Petrol/.test(v.fuel_type) && /3\.0L/.test(v.name));
  const petrol44 = sport.variants.find((v) => /4\.4L/.test(v.name));
  // Horizon 1 = UK Year 2: mid 40%, large 25%
  const mid = quoteFtaPrice(sport, petrol30, { horizonYears: 1 });
  const large = quoteFtaPrice(sport, petrol44, { horizonYears: 1 });
  expect(mid.meta.engineCc).toBe(3000);
  expect(large.meta.engineCc).toBe(4400);
  expect(mid.nextDuty).toBe(40);
  expect(large.nextDuty).toBe(25);
});

test("EU EVs do not move until year 5", () => {
  const taycan = findCar("Porsche Taycan Turbo S");
  const y3 = quoteFtaPrice(taycan, null, { horizonYears: 3 });
  const y5 = quoteFtaPrice(taycan, null, { horizonYears: 5 });
  expect(y3.affected).toBe(false);
  expect(y5.nextDuty).toBe(30);
  expect(y5.affected).toBe(true);
});

test("Mercedes S-Class PHEV CKD follows the EU kit schedule", () => {
  const sClass = findCar("Mercedes S Class");
  expect(classifyVehicle(sClass)).toMatchObject({
    origin: "EU",
    importType: "CKD",
  });
  const y1 = quoteFtaPrice(sClass, sClass.variants[0], { horizonYears: 1 });
  const y3 = quoteFtaPrice(sClass, sClass.variants[0], { horizonYears: 3 });
  expect(y1.nextDuty).toBe(13.75);
  expect(y3.nextDuty).toBe(8.25);
  expect(y1.affected).toBe(true);
  expect(y3.adjustedCost).toBeLessThan(sClass.cost);
});

test("Maybach S 580 is Chakan CKD, not a CBU", () => {
  const maybach = findCar("Mercedes S Class Maybach");
  expect(classifyVehicle(maybach).importType).toBe("CKD");
  const y5 = quoteFtaPrice(maybach, null, { horizonYears: 5 });
  expect(y5.nextDuty).toBe(8.25);
});

test("today (horizon 0) never restacks duty", () => {
  const ghost = findCar("Rolls Royce Ghost");
  const quote = quoteFtaPrice(ghost, null, { horizonYears: 0 });
  expect(quote.adjustedCost).toBe(ghost.cost);
});

test("Ghost Year 5 keeps GST 40% and KA RTO rates, only customs falls to 10%", () => {
  const ghost = findCar("Rolls Royce Ghost");
  const quote = quoteFtaPrice(ghost, null, { horizonYears: 5 });
  expect(quote.nextDuty).toBe(10);
  expect(quote.stack.today.gstRate).toBe(0.4);
  expect(quote.stack.next.gstRate).toBe(0.4);
  expect(quote.stack.next.rtoRate).toBe(quote.stack.today.rtoRate);
  expect(quote.stack.next.customs).toBeLessThan(quote.stack.today.customs);
  expect(quote.adjustedCost).toBeGreaterThan(4_00_00_000);
  expect(quote.adjustedCost).toBeLessThan(ghost.cost);
});

test("applying FTA to a catalog car reprices every variant", () => {
  const sport = findCar("Range Rover Sport");
  const priced = applyFtaToCatalogCar(sport, { horizonYears: 4 });
  expect(priced.listedCost).toBe(sport.cost);
  expect(priced.variants[0].listedCost).toBe(sport.variants[0].cost);
  expect(priced.variants.some((v) => v.cost < v.listedCost)).toBe(true);
});
