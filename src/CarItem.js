import { useState } from "react";
import { styled } from "@mui/material/styles";
import {
  Paper,
  Typography,
  Box,
  Select,
  MenuItem,
  FormControl,
} from "@mui/material";
import LocalGasStationIcon from "@mui/icons-material/LocalGasStation";
import AllWheelDriveIcon from "@mui/icons-material/AllInclusiveOutlined";

const StyledCarItem = styled(Paper)({
  borderRadius: "16px",
  padding: "16px",
  cursor: "pointer",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  width: "280px",
  margin: "12px",
  background:
    "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.1) 100%)",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(255,255,255,0.1)",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-5px)",
    boxShadow: "0 8px 32px rgba(255,64,129,0.2)",
    border: "1px solid rgba(255,64,129,0.3)",
  },
});

const CarImage = styled("img")({
  width: "100%",
  height: "180px",
  objectFit: "cover",
  borderRadius: "12px",
  marginBottom: "16px",
});

const CarName = styled(Typography)({
  fontSize: "1.2rem",
  fontWeight: 600,
  color: "#ffffff",
  marginBottom: "8px",
  textAlign: "center",
});

const CarPrice = styled(Typography)({
  color: "#ff4081",
  fontSize: "1.1rem",
  fontWeight: 500,
  marginBottom: "12px",
});

const CarInfo = styled(Box)({
  display: "flex",
  gap: "16px",
  alignItems: "center",
  color: "rgba(255,255,255,0.7)",
  fontSize: "0.9rem",
  "& .MuiSvgIcon-root": {
    fontSize: "1.1rem",
  },
});

const CarType = styled(Typography)({
  color: "rgba(255,255,255,0.6)",
  fontSize: "0.9rem",
  marginBottom: "8px",
});

const VariantBadge = styled(Typography)({
  color: "#ff4081",
  fontSize: "0.75rem",
  marginBottom: "8px",
  textAlign: "center",
  fontWeight: 500,
  padding: "3px 10px",
  backgroundColor: "rgba(255,64,129,0.1)",
  borderRadius: "4px",
  border: "1px solid rgba(255,64,129,0.25)",
  width: "100%",
});

const VariantFormControl = styled(FormControl)({
  width: "100%",
  marginBottom: "10px",
  "& .MuiOutlinedInput-root": {
    color: "#ffffff",
    fontSize: "0.8rem",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: "8px",
    "& fieldset": {
      borderColor: "rgba(255,255,255,0.2)",
    },
    "&:hover fieldset": {
      borderColor: "rgba(255,64,129,0.5)",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#ff4081",
    },
  },
  "& .MuiSelect-icon": {
    color: "#ff4081",
  },
});

const variantMenuProps = {
  PaperProps: {
    sx: {
      backgroundColor: "#1e1e1e",
      border: "1px solid rgba(255,255,255,0.1)",
      "& .MuiMenuItem-root": {
        color: "#ffffff",
        fontSize: "0.8rem",
        "&:hover": { backgroundColor: "rgba(255,64,129,0.08)" },
        "&.Mui-selected": {
          backgroundColor: "rgba(255,64,129,0.16) !important",
        },
      },
    },
  },
};

export default function CarItem({ car, clickHandler, isGarage }) {
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);

  const hasVariants = !isGarage && car.variants && car.variants.length > 0;
  const activeVariant = hasVariants ? car.variants[selectedVariantIdx] : null;

  const displayCost = activeVariant ? activeVariant.cost : car.cost;
  const displayFuel = activeVariant ? activeVariant.fuel_type : car.fuel_type;
  const displayDrivetrain = activeVariant
    ? activeVariant.drivetrain
    : car.drivetrain;

  const handleCardClick = () => {
    if (hasVariants) {
      clickHandler({
        ...car,
        cost: activeVariant.cost,
        fuel_type: activeVariant.fuel_type,
        drivetrain: activeVariant.drivetrain,
        selectedVariant: activeVariant.name,
      });
    } else {
      clickHandler(car);
    }
  };

  const handleVariantChange = (e) => {
    setSelectedVariantIdx(e.target.value);
  };

  return (
    <StyledCarItem onClick={handleCardClick} elevation={0}>
      <CarImage src={car.img} alt={car.car} />
      <CarName>{car.car}</CarName>
      <CarType>{car.type}</CarType>

      {isGarage && car.selectedVariant && (
        <VariantBadge>{car.selectedVariant}</VariantBadge>
      )}

      {hasVariants && (
        <VariantFormControl
          size="small"
          onClick={(e) => e.stopPropagation()}
        >
          <Select
            value={selectedVariantIdx}
            onChange={handleVariantChange}
            MenuProps={variantMenuProps}
          >
            {car.variants.map((v, i) => (
              <MenuItem key={i} value={i}>
                {v.name}
              </MenuItem>
            ))}
          </Select>
        </VariantFormControl>
      )}

      <CarPrice>
        {displayCost.toLocaleString("en-IN", {
          style: "currency",
          currency: "INR",
        })}
      </CarPrice>
      <CarInfo>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <LocalGasStationIcon />
          <span>{displayFuel}</span>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <AllWheelDriveIcon />
          <span>{displayDrivetrain}</span>
        </Box>
      </CarInfo>
    </StyledCarItem>
  );
}
