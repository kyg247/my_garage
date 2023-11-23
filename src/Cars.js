import React, { useState } from "react";
import CarItem from "./CarItem";
export default function Cars({ garage, deSelectCar }) {

    return (
        <div>
            <ul>
                {
                    garage.map((car, index) => {
                        return (
                            <CarItem car={car} deSelectCar={deSelectCar}/>
                        );
                    }
                    )
                }
            </ul>

        </div>
    );
}