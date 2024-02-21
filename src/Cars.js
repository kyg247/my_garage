import CarItem from "./CarItem";
import styles from "./Styles";
export default function Cars({ garage, deSelectCar }) {
  return (
    <div style={styles.carContainer}>
      <ul style={styles.horizontalList}>
        {garage.map((car) => {
          return <CarItem car={car} clickHandler={() => deSelectCar(car.id)} />;
        })}
      </ul>
    </div>
  );
}
