import React, { useState } from "react";
import Cars from "./Cars";
import Budget from "./Budget";
import Collection from "./Collection";
import SearchBar from "./SearchBar";
import FtaSimulator from "./FtaSimulator";
import { applyFtaToGarageCar } from "./fta";
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
  const [searchFilters, setSearchFilters] = useState(null);
  const [ftaHorizon, setFtaHorizon] = useState(0);

  function handleSubmit(event) {
    event.preventDefault();
    setBudget(parseInt(budgetInput));
    setBudgetInput(0);
    setGarage([]);
  }

  const handleChange = (event) => {
    setBudgetInput(event.target.value);
  };

  const pricedGarage = garage.map((car) =>
    applyFtaToGarageCar(car, { horizonYears: ftaHorizon })
  );
  const collectionCost = pricedGarage.reduce(
    (sum, car) => sum + (car.cost || 0),
    0
  );
  const remainingBudget = budget - collectionCost;

  function selectCar(car) {
    const listedCost = car.listedCost ?? car.cost;
    const priced = applyFtaToGarageCar(
      { ...car, listedCost, cost: listedCost },
      { horizonYears: ftaHorizon }
    );
    if (priced.cost <= remainingBudget) {
      setGarage((prev) => [
        ...prev,
        {
          id: Date.now(),
          ...car,
          cost: listedCost,
          listedCost,
        },
      ]);
    } else {
      alert("Insufficient Budget!");
    }
  }

  function deSelectCar(carId) {
    setGarage((prev) => prev.filter((car) => car.id !== carId));
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
        budgetLeft={remainingBudget}
        budgetInput={budgetInput}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
      />

      <Box sx={{ my: 4 }}>
        <FtaSimulator horizonYears={ftaHorizon} onHorizonChange={setFtaHorizon} />
      </Box>

      <Box sx={{ my: 4 }}>
        <SearchBar onSearch={handleSearch} />
      </Box>

      <StyledSection sx={{ mb: 4 }}>
        <SectionTitle variant="h4">
          <DirectionsCarIcon sx={{ fontSize: 32 }} />
          My Collection
        </SectionTitle>
        <Cars
          budgetLeft={remainingBudget}
          garage={pricedGarage}
          deSelectCar={deSelectCar}
        />
      </StyledSection>

      <StyledSection>
        <SectionTitle variant="h4">
          <StorefrontIcon sx={{ fontSize: 32 }} />
          Available Cars
        </SectionTitle>
        <Collection
          selectCar={selectCar}
          filters={searchFilters}
          ftaHorizon={ftaHorizon}
        />
      </StyledSection>
    </MainContainer>
  );
}

export default Garage;
