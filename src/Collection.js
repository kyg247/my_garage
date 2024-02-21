import { cars } from "./Data";
import CarItem from "./CarItem";
import styles from "./Styles";

function Collection({ selectCar }) {
  return (
    <div style={styles.collectionContainer}>
      {cars.map((car, index) => (
        <CarItem key={index} car={car} clickHandler={selectCar} />
      ))}
    </div>
  );
}

export default Collection;
