import { cars } from "./Data";
import CarItem from "./CarItem";
import styles from "./Styles";

function Collection({ selectCar, filters }) {
  const filterCars = () => {
    let filteredCars = [...cars];

    if (filters) {
      // Apply name search filter first if there's a search query
      if (filters.searchQuery) {
        const searchTerm = filters.searchQuery.toLowerCase();
        filteredCars = filteredCars.filter((car) =>
          car.car.toLowerCase().includes(searchTerm)
        );
      }

      if (filters.type === "budget") {
        const budgetRanges = {
          "Any Budget": { min: 0, max: Infinity },
          "₹1-10 Lakh": { min: 100000, max: 1000000 },
          "₹10-20 Lakh": { min: 1000000, max: 2000000 },
          "₹20-50 Lakh": { min: 2000000, max: 5000000 },
          "₹50-1 Crore": { min: 5000000, max: 10000000 },
          "Above ₹1 Crore": { min: 10000000, max: Infinity },
        };

        if (filters.budget && filters.budget !== "Any Budget") {
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
