import React, { useState } from "react";
import Cars from "./Cars";
import Budget from "./Budget";
import Collection from "./Collection";
import SearchBar from "./SearchBar";
import { Container, Typography, Box, Paper } from "@mui/material";
import { styled } from "@mui/material/styles";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import StorefrontIcon from "@mui/icons-material/Storefront";
import GarageIcon from "@mui/icons-material/Garage";

const MainContainer = styled(Container)({
  maxWidth: "1200px !important",
  padding: "24px",
  background: "linear-gradient(135deg, #121212 0%, #1a1a1a 100%)",
  minHeight: "100vh",
});

const PageTitle = styled(Typography)({
  color: "#ffffff",
  textAlign: "center",
  fontSize: "2.5rem",
  fontWeight: 600,
  margin: "24px 0",
  textTransform: "uppercase",
  letterSpacing: "2px",
  textShadow: "0 2px 4px rgba(0,0,0,0.3)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "16px",
});

const SectionTitle = styled(Typography)({
  textAlign: "center",
  color: "#ffffff",
  margin: "16px 0 24px 0",
  fontWeight: 600,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "12px",
  "& .MuiSvgIcon-root": {
    color: "#ff4081",
  },
});

const StyledSection = styled(Paper)({
  borderRadius: "16px",
  padding: "24px",
  boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
  background:
    "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.1) 100%)",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(255,255,255,0.1)",
});

function Garage() {
  const [budget, setBudget] = useState(60000000);
  const [budgetInput, setBudgetInput] = useState();
  const [garage, setGarage] = useState([]);
  const [budgetLeft, setBudgetLeft] = useState(budget);
  const [searchFilters, setSearchFilters] = useState(null);

  function handleSubmit(event) {
    event.preventDefault();
    setBudget(parseInt(budgetInput));
    setBudgetLeft(parseInt(budgetInput));
    setBudgetInput(0);
    setGarage([]);
  }

  const handleChange = (event) => {
    setBudgetInput(event.target.value);
  };

  function selectCar(car) {
    if (car.cost <= budgetLeft) {
      setBudgetLeft((prev) => prev - car.cost);
      setGarage((prev) => [...prev, { id: Date.now(), ...car }]);
    } else {
      alert("Insufficient Budget!");
    }
  }

  function deSelectCar(carId) {
    const deselectedCar = garage.find((car) => car.id === carId);
    setGarage((prev) => prev.filter((car) => car.id !== carId));
    setBudgetLeft((prev) => prev + deselectedCar.cost);
  }

  const handleSearch = (filters) => {
    setSearchFilters(filters);
  };

  return (
    <MainContainer>
      <PageTitle>
        <GarageIcon sx={{ fontSize: 40, color: "#ff4081" }} />
        Dream Garage
      </PageTitle>

      <Budget
        budgetAllocated={budget}
        budgetLeft={budgetLeft}
        budgetInput={budgetInput}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
      />

      <Box sx={{ my: 4 }}>
        <SearchBar onSearch={handleSearch} />
      </Box>

      <StyledSection sx={{ mb: 4 }}>
        <SectionTitle variant="h4">
          <DirectionsCarIcon sx={{ fontSize: 32 }} />
          My Collection
        </SectionTitle>
        <Cars
          budgetLeft={budgetLeft}
          garage={garage}
          deSelectCar={deSelectCar}
        />
      </StyledSection>

      <StyledSection>
        <SectionTitle variant="h4">
          <StorefrontIcon sx={{ fontSize: 32 }} />
          Available Cars
        </SectionTitle>
        <Collection selectCar={selectCar} filters={searchFilters} />
      </StyledSection>
    </MainContainer>
  );
}

export default Garage;
