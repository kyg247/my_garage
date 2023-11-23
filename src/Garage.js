import React, { useState, useEffect } from "react";
import Cars from "./Cars";
import Budget from "./Budget";
import Collection from "./Collection";
import View from "./Image";

function Garage() {
    const [garage, setGarage] = useState([]);
    const [budgetLeft, setBudgetLeft] = useState(250000000);


    function selectCar(event) {
        const target = event.target;
        const carData = JSON.parse(target.getAttribute('data-car'));

        if (carData.cost <= budgetLeft) {
            setBudgetLeft(prev => prev - carData.cost);
            setGarage((prev) => [carData, ...prev]);
        } else {
            alert("Insufficient Budget!");
        }
    }

    function deSelectCar(targetIndex) {
        setGarage((prev) => {
            return prev.filter((car, index) => {
                return index !== targetIndex;
            });
        });
    };


    return (
        <>
            <Budget budgetLeft={budgetLeft}/>
            <h1>My Garage</h1>
            <Cars budgetLeft={budgetLeft} garage={garage} deSelectCar={deSelectCar} />
            <h2>Available Cars</h2>
            <Collection clickHandler={selectCar} />
        </>
    );
}
export default Garage;