import { styled } from "@mui/material/styles";
import { Paper, Typography, Box } from "@mui/material";
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

export default function CarItem({ car, clickHandler }) {
  return (
    <StyledCarItem onClick={() => clickHandler(car)} elevation={0}>
      <CarImage src={car.img} alt={car.car} />
      <CarName>{car.car}</CarName>
      <CarType>{car.type}</CarType>
      <CarPrice>
        {car.cost.toLocaleString("en-IN", {
          style: "currency",
          currency: "INR",
        })}
      </CarPrice>
      <CarInfo>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <LocalGasStationIcon />
          <span>{car.fuel_type}</span>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <AllWheelDriveIcon />
          <span>{car.drivetrain}</span>
        </Box>
      </CarInfo>
    </StyledCarItem>
  );
}
