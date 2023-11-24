import React, { useState } from "react";
import styles from "./Styles";

export default function Budget({ budgetAllocated, budgetLeft }) {


    return (
        <div style={styles.budgetContainerStyle}>
            <p style={styles.budgetTextStyles}>Budget: {budgetAllocated.toLocaleString("en-IN", { style: "currency", currency: "INR" })}</p>
            <p style={styles.budgetTextStyles}>Budget Left: {budgetLeft.toLocaleString("en-IN", { style: "currency", currency: "INR" })}</p>
        </div>
    );
}
