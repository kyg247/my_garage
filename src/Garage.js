import React, { useState } from "react";
import Cars from "./Cars";
import Budget from "./Budget";
import Collection from "./Collection";
import styles from "./Styles";

function Garage() {
  const [budget, setBudget] = useState(250000000);
  const [budgetInput, setBudgetInput] = useState();
  const [garage, setGarage] = useState([]);
  const [budgetLeft, setBudgetLeft] = useState(budget);

  function handleSubmit(event) {
    event.preventDefault();
    console.log(event.target.value);
    setBudget(parseInt(budgetInput));
    setBudgetLeft(parseInt(budgetInput));
    setBudgetInput(0);
    setGarage([]);
  }

  const handleChange = (event) => {
    // Update inputValue as the user types
    setBudgetInput(event.target.value);
    console.log(event.target.value);
  };

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
      <Budget budgetAllocated={budget} budgetLeft={budgetLeft} budgetInput={budgetInput} handleChange={handleChange} handleSubmit={handleSubmit}/>
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
