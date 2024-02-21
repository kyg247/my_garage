import React, { useState } from "react";
import Cars from "./Cars";
import Budget from "./Budget";
import Collection from "./Collection";
import styles from "./Styles";

function Garage() {
  const defaultBudget = 250000000;
  const [garage, setGarage] = useState([]);
  const [budgetLeft, setBudgetLeft] = useState(defaultBudget);

  function selectCar(car) {
    if (car.cost <= budgetLeft) {
      setBudgetLeft((prev) => prev - car.cost);
      setGarage((prev) => [...prev, { id: Date.now(), ...car }]);
    } else {
      alert("Insufficient Budget!");
    }
  }

  function deSelectCar(carId) {
    const deselectedCar = garage.find((car) => car.id === carId);
    setGarage((prev) => {
      return prev.filter((car) => {
        return car.id !== carId;
      });
    });
    setBudgetLeft((prev) => prev + deselectedCar.cost);
  }

  return (
    <div style={styles.garageContainer}>
      <Budget budgetAllocated={defaultBudget} budgetLeft={budgetLeft} />
      <h1 text style={styles.textStyle}>
        My Garage
      </h1>
      <Cars budgetLeft={budgetLeft} garage={garage} deSelectCar={deSelectCar} />
      <h2 text style={styles.textStyle}>
        Available Cars
      </h2>
      <Collection selectCar={selectCar} />
    </div>
  );
}
export default Garage;
