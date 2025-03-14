import { cars } from "./Data";
import CarItem from "./CarItem";
import styles from "./Styles";

function Collection({ selectCar, filters }) {
  const filterCars = () => {
    let filteredCars = [...cars];

    if (filters) {
      if (filters.type === "budget") {
        const budgetRanges = {
          "Under ₹5 Lakh": { min: 0, max: 500000 },
          "₹5-10 Lakh": { min: 500000, max: 1000000 },
          "₹10-15 Lakh": { min: 1000000, max: 1500000 },
          "₹15-20 Lakh": { min: 1500000, max: 2000000 },
          "Above ₹20 Lakh": { min: 2000000, max: Infinity },
        };

        if (filters.budget) {
          const range = budgetRanges[filters.budget];
          filteredCars = filteredCars.filter(
            (car) => car.cost >= range.min && car.cost <= range.max
          );
        }

        if (
          filters.vehicleType &&
          filters.vehicleType !== "All Vehicle Types"
        ) {
          filteredCars = filteredCars.filter(
            (car) => car.type === filters.vehicleType
          );
        }
      } else if (
        filters.type === "maker" &&
        filters.maker &&
        filters.maker !== "All Makers"
      ) {
        filteredCars = filteredCars.filter(
          (car) => car.maker === filters.maker
        );
      }
    }

    return filteredCars;
  };

  return (
    <div style={styles.collectionContainer}>
      {filterCars().map((car, index) => (
        <CarItem key={index} car={car} clickHandler={selectCar} />
      ))}
    </div>
  );
}

export default Collection;
