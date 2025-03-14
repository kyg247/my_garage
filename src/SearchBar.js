import React, { useState } from "react";
import { styled } from "@mui/material/styles";
import {
  Box,
  FormControl,
  Select,
  MenuItem,
  Button,
  Tabs,
  Tab,
} from "@mui/material";

const SearchContainer = styled(Box)(({ theme }) => ({
  padding: "20px",
  backgroundColor: "white",
  borderRadius: "8px",
  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  margin: "20px 0",
}));

const budgetRanges = [
  "Under ₹5 Lakh",
  "₹5-10 Lakh",
  "₹10-15 Lakh",
  "₹15-20 Lakh",
  "Above ₹20 Lakh",
];

const vehicleTypes = [
  "All Vehicle Types",
  "Hatchback",
  "Sedan",
  "SUV",
  "MUV",
  "Two Wheeler",
];

const carMakers = [
  "All Makers",
  "Toyota",
  "Mercedes",
  "BMW",
  "Honda",
  "Hyundai",
  "Tata",
  "Mahindra",
];

const SearchBar = ({ onSearch }) => {
  const [searchType, setSearchType] = useState(0); // 0 for Budget, 1 for Model
  const [selectedBudget, setSelectedBudget] = useState("");
  const [selectedVehicleType, setSelectedVehicleType] =
    useState("All Vehicle Types");
  const [selectedMaker, setSelectedMaker] = useState("All Makers");

  const handleSearch = () => {
    if (searchType === 0) {
      onSearch({
        type: "budget",
        budget: selectedBudget,
        vehicleType: selectedVehicleType,
      });
    } else {
      onSearch({
        type: "maker",
        maker: selectedMaker,
      });
    }
  };

  return (
    <SearchContainer>
      <Tabs
        value={searchType}
        onChange={(e, newValue) => setSearchType(newValue)}
        sx={{ marginBottom: 2 }}
      >
        <Tab label="BY BUDGET" />
        <Tab label="BY MODEL" />
      </Tabs>

      {searchType === 0 ? (
        <Box sx={{ display: "flex", gap: 2 }}>
          <FormControl fullWidth>
            <Select
              value={selectedBudget}
              onChange={(e) => setSelectedBudget(e.target.value)}
              displayEmpty
              placeholder="Select Budget"
            >
              <MenuItem value="" disabled>
                Select Budget
              </MenuItem>
              {budgetRanges.map((range) => (
                <MenuItem key={range} value={range}>
                  {range}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <Select
              value={selectedVehicleType}
              onChange={(e) => setSelectedVehicleType(e.target.value)}
            >
              {vehicleTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      ) : (
        <Box sx={{ display: "flex", gap: 2 }}>
          <FormControl fullWidth>
            <Select
              value={selectedMaker}
              onChange={(e) => setSelectedMaker(e.target.value)}
            >
              {carMakers.map((maker) => (
                <MenuItem key={maker} value={maker}>
                  {maker}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      )}

      <Button
        variant="contained"
        onClick={handleSearch}
        sx={{
          mt: 2,
          backgroundColor: "#ff5722",
          "&:hover": {
            backgroundColor: "#f4511e",
          },
        }}
        fullWidth
      >
        Search
      </Button>
    </SearchContainer>
  );
};

export default SearchBar;
