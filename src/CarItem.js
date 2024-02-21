import styles from "./Styles";

export default function CarItem({ car, clickHandler }) {
  return (
    <div style={styles.carItemContainer} onClick={() => clickHandler(car)}>
      <div style={styles.name}>{car.car}</div>
      <img src={car.img} alt={car.car} style={styles.image} />
      <div style={styles.cost}>
        {car.cost.toLocaleString("en-IN", {
          style: "currency",
          currency: "INR",
        })}
      </div>
    </div>
  );
}
