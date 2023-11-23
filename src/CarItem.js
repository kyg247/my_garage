import React from 'react';

const CarItem = ({ car, deSelectCar }) => {
    return (
        <div style={styles.container} onClick={deSelectCar}>
            <div style={styles.name}>{car.car}</div>
            <img src={car.img} alt={car.car} style={styles.image} />
            <div style={styles.cost}>{car.cost}</div>
        </div>
    );
};

const styles = {
    container: {
        border: '1px solid #ccc',
        borderRadius: '8px',
        padding: '10px',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        maxWidth: '200px', // Set a maximum width for each CarItem
        margin: '10px', // Add margin
        backgroundColor: '#f0f0f0'
    },
    image: {
        width: '100%', // Make the image take 100% width of its container
        height: 'auto', // Maintain aspect ratio
        marginBottom: '5px', // Adjusted margin
    },
    name: {
        fontSize: '16px',
        fontWeight: 'bold',
        marginBottom: '5px',
    },
    cost: {
        color: 'green',
        fontSize: '14px',
    },
};

export default CarItem;
