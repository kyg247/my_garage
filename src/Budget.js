import React, { useState } from "react";

export default function Budget({ budgetLeft }) {
    // You can define styles as objects
    const containerStyle = {
        backgroundColor: "#f2f2f2",
        padding: "10px",
        borderRadius: "5px",
        margin: "10px",
    };

    const textStyles = {
        color: "#333",
        fontSize: "18px",
        fontWeight: "bold",
    };

    return (
        <div style={containerStyle}>
            <p style={textStyles}>Budget Left: {budgetLeft}</p>
        </div>
    );
}
