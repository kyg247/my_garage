import React from "react";
import { cars } from "./Data";


export default function Collection({ clickHandler }) {
    return (
        <div>
            {
                cars.map((car, index) => {
                    // console.log(JSON.stringify(car));
                    return (
                        <button key={index} data-car={JSON.stringify(car)} onClick={clickHandler}>
                            {car.car}
                        </button>
                    );

                })
            }
        </div>
    );
}