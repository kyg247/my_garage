const styles = {
//   garageContainer: {
//     backgroundColor: "rgb(82, 83, 84)",
//   },
  carItemContainer: {
    border: "1px solid #ccc",
    borderRadius: "8px",
    padding: "10px",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    maxWidth: "200px",
    margin: "10px",
    backgroundColor: "#f0f0f0",
  },
  image: {
    width: "100%",
    height: "auto",
    marginBottom: "5px",
  },
  name: {
    fontSize: "16px",
    fontWeight: "bold",
    marginBottom: "5px",
  },
  cost: {
    color: "green",
    fontSize: "14px",
  },
  collectionContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, 280px)",
    justifyContent: "center",
    alignItems: "stretch",
    gap: "24px",
    padding: "12px",
    backgroundColor: "rgb(107, 151, 156)",
  },
  carContainer: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    backgroundColor: "rgb(164, 181, 152)",
    // backgroundColor: '#FFFFFF'
  },
  horizontalList: {
    listStyle: "none",
    padding: 0,
    width: "100%",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, 280px)",
    justifyContent: "center",
    alignItems: "stretch",
    gap: "24px",
  },
  budgetContainerStyle: {
    backgroundColor: "#f2f2f2",
    padding: "2px",
    borderRadius: "1px",
    margin: "1px",
    position: "fixed", // Set position to fixed
    top: "2px", // Set top distance from the top
    right: "2px", // Set right distance from the right
  },

  budgetTextStyles: {
    color: "#333",
    fontSize: "10px",
    fontWeight: "bold",
  },

  textStyle: {
    textAlign: "center",
  },
};

export default styles;
