import React from "react";
import styles from "./Styles";

export default function Budget({
  budgetAllocated,
  budgetLeft,
  budgetInput,
  handleChange,
  handleSubmit,
}) {
  return (
    <div style={styles.budgetContainerStyle}>
      <p style={styles.budgetTextStyles}>
        Budget:{" "}
        {budgetAllocated.toLocaleString("en-IN", {
          style: "currency",
          currency: "INR",
        })}
      </p>
      <form onSubmit={handleSubmit} style={styles.budgetTextStyles}>
        <label>
          Set Budget:
          <input
            type="number"
            value={budgetInput} // Reflects changes as you type
            onChange={handleChange} // Updates inputValue as you type
          />
        </label>
        <button type="submit">Submit</button>
      </form>
      <p style={styles.budgetTextStyles}>
        Budget Left:{" "}
        {budgetLeft.toLocaleString("en-IN", {
          style: "currency",
          currency: "INR",
        })}
      </p>
      <p style={styles.budgetTextStyles}>
        Collection Cost:{" "}
        {(budgetAllocated - budgetLeft).toLocaleString("en-IN", {
          style: "currency",
          currency: "INR",
        })}
      </p>
    </div>
  );
}
