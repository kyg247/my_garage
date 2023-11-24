import React, { useState } from "react";
import Cars from "./Cars";
import Budget from "./Budget";
import Collection from "./Collection";
import styles from "./Styles";


function Garage() {
    const budget = 250000000;
    const [garage, setGarage] = useState([]);
    const [budgetLeft, setBudgetLeft] = useState(budget);


    function selectCar(carData) {
        if (carData.cost <= budgetLeft) {
            setBudgetLeft((prev) => prev - carData.cost);
            setGarage((prev) => [{ id: Date.now(), ...carData }, ...prev]);
        } else {
            alert("Insufficient Budget!");
        }
    }

    function deSelectCar(targetId) {
        setGarage((prev) => {
            return prev.filter((car) => {
                return car.id !== targetId;
            });
        });
        const deselectedCar = garage.find((car) => car.id === targetId);
        setBudgetLeft((prev) => prev + deselectedCar.cost);
    };


    return (
        <div style={styles.garageContainer}>
            <Budget budgetAllocated={budget} budgetLeft={budgetLeft} />
            <h1 text style={styles.textStyle}>My Garage</h1>
            <Cars budgetLeft={budgetLeft} garage={garage} deSelectCar={deSelectCar} />
            <h2 text style={styles.textStyle}>Available Cars</h2>
            <Collection selectCar={selectCar} />
        </div>
    );
}
export default Garage;