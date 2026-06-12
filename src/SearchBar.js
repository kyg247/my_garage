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
  Container,
  TextField,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import SpeedIcon from "@mui/icons-material/Speed";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";

const SearchContainer = styled(Container)(({ theme }) => ({
  padding: "24px",
  background: "linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%)",
  borderRadius: "16px",
  boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
  margin: "16px auto",
  maxWidth: "800px !important",
  border: "1px solid rgba(255,255,255,0.1)",
}));

const StyledTabs = styled(Tabs)({
  marginBottom: "20px",
  "& .MuiTab-root": {
    minHeight: "48px",
    color: "#ffffff",
    fontSize: "15px",
    textTransform: "none",
    fontWeight: 500,
    opacity: 0.7,
    "&.Mui-selected": {
      color: "#ff4081",
      opacity: 1,
    },
  },
  "& .MuiTabs-indicator": {
    backgroundColor: "#ff4081",
    height: "3px",
    borderRadius: "2px",
  },
});

const StyledFormControl = styled(FormControl)({
  "& .MuiOutlinedInput-root": {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: "12px",
    color: "#ffffff",
    transition: "all 0.3s ease",
    "&:hover": {
      backgroundColor: "rgba(255,255,255,0.1)",
    },
    "& fieldset": {
      borderColor: "rgba(255,255,255,0.2)",
    },
    "&:hover fieldset": {
      borderColor: "rgba(255,255,255,0.3)",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#ff4081",
    },
  },
  "& .MuiSelect-icon": {
    color: "#ff4081",
  },
});

const StyledMenuItem = styled(MenuItem)({
  "&:hover": {
    backgroundColor: "rgba(255,64,129,0.08)",
  },
  "&.Mui-selected": {
    backgroundColor: "rgba(255,64,129,0.16) !important",
  },
});

const SearchButton = styled(Button)({
  marginTop: "20px",
  padding: "10px 24px",
  backgroundColor: "#ff4081",
  color: "#ffffff",
  borderRadius: "12px",
  textTransform: "none",
  fontSize: "15px",
  fontWeight: 500,
  boxShadow: "0 4px 12px rgba(255,64,129,0.3)",
  "&:hover": {
    backgroundColor: "#f50057",
    boxShadow: "0 6px 16px rgba(255,64,129,0.4)",
  },
});

const StyledTextField = styled(TextField)({
  "& .MuiOutlinedInput-root": {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: "12px",
    color: "#ffffff",
    transition: "all 0.3s ease",
    "&:hover": {
      backgroundColor: "rgba(255,255,255,0.1)",
    },
    "& fieldset": {
      borderColor: "rgba(255,255,255,0.2)",
    },
    "&:hover fieldset": {
      borderColor: "rgba(255,255,255,0.3)",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#ff4081",
    },
  },
  "& .MuiInputBase-input": {
    color: "#ffffff",
  },
});

const budgetRanges = [
  "Any Budget",
  "₹1-10 Lakh",
  "₹10-20 Lakh",
  "₹20-50 Lakh",
  "₹50-1 Crore",
  "Above ₹1 Crore",
];

const vehicleTypes = [
  "All Vehicle Types",
  "Hatchback",
  "Sedan",
  "SUV",
  "Compact SUV",
  "MUV/MPV",
  "Sports",
  "Pickup",
  "Minivan",
  "Convertible",
  "Coupe",
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
  "Audi",
  "Lotus",
  "McLaren",
];

const SearchBar = ({ onSearch }) => {
  const [searchType, setSearchType] = useState(0);
  const [selectedBudget, setSelectedBudget] = useState("");
  const [selectedVehicleType, setSelectedVehicleType] =
    useState("All Vehicle Types");
  const [selectedMaker, setSelectedMaker] = useState("All Makers");
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    if (searchType === 0) {
      onSearch({
        type: "budget",
        budget: selectedBudget,
        vehicleType: selectedVehicleType,
        searchQuery: searchQuery,
      });
    } else {
      onSearch({
        type: "maker",
        maker: selectedMaker,
        searchQuery: searchQuery,
      });
    }
    // Reset search query after search
    setSearchQuery("");
  };

  return (
    <SearchContainer>
      <StyledTabs
        value={searchType}
        onChange={(e, newValue) => setSearchType(newValue)}
      >
        <Tab icon={<SpeedIcon />} iconPosition="start" label="By Budget" />
        <Tab
          icon={<DirectionsCarIcon />}
          iconPosition="start"
          label="By Maker"
        />
      </StyledTabs>

      {searchType === 0 ? (
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <StyledFormControl sx={{ flex: 1, minWidth: "200px" }}>
            <Select
              value={selectedBudget}
              onChange={(e) => setSelectedBudget(e.target.value)}
              displayEmpty
              renderValue={(value) => value || "Select Budget"}
            >
              {budgetRanges.map((range) => (
                <StyledMenuItem key={range} value={range}>
                  {range}
                </StyledMenuItem>
              ))}
            </Select>
          </StyledFormControl>

          <StyledFormControl sx={{ flex: 1, minWidth: "200px" }}>
            <Select
              value={selectedVehicleType}
              onChange={(e) => setSelectedVehicleType(e.target.value)}
              renderValue={(value) => value || "Select Vehicle Type"}
            >
              {vehicleTypes.map((type) => (
                <StyledMenuItem key={type} value={type}>
                  {type}
                </StyledMenuItem>
              ))}
            </Select>
          </StyledFormControl>
        </Box>
      ) : (
        <Box sx={{ display: "flex", gap: 2 }}>
          <StyledFormControl sx={{ flex: 1, minWidth: "200px" }}>
            <Select
              value={selectedMaker}
              onChange={(e) => setSelectedMaker(e.target.value)}
              renderValue={(value) => value || "Select Maker"}
            >
              {carMakers.map((maker) => (
                <StyledMenuItem key={maker} value={maker}>
                  {maker}
                </StyledMenuItem>
              ))}
            </Select>
          </StyledFormControl>
        </Box>
      )}

      <Box sx={{ mt: 2, mb: 2 }}>
        <StyledTextField
          fullWidth
          placeholder="Search by vehicle name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="small"
        />
      </Box>

      <SearchButton
        variant="contained"
        onClick={handleSearch}
        fullWidth
        startIcon={<SearchIcon />}
      >
        Find Your Dream Car
      </SearchButton>
    </SearchContainer>
  );
};

export default SearchBar;
