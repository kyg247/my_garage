import { useState } from "react";
import { styled } from "@mui/material/styles";
import {
  Paper,
  Typography,
  Box,
  Select,
  MenuItem,
  FormControl,
  Button,
} from "@mui/material";
import LocalGasStationIcon from "@mui/icons-material/LocalGasStation";
import AllWheelDriveIcon from "@mui/icons-material/AllInclusiveOutlined";
import { formatInrCompact } from "./fta";

const StyledCarItem = styled(Paper)({
  borderRadius: "16px",
  padding: "16px",
  cursor: "pointer",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  width: "100%",
  height: "100%",
  boxSizing: "border-box",
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
  minHeight: "2.6em",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

const CarPrice = styled(Typography)({
  color: "#ff4081",
  fontSize: "1.1rem",
  fontWeight: 500,
  marginBottom: "4px",
});

const ListedPrice = styled(Typography)({
  color: "rgba(255,255,255,0.4)",
  fontSize: "0.8rem",
  textDecoration: "line-through",
  marginBottom: "4px",
});

const FtaBadge = styled(Typography)({
  color: "#69f0ae",
  fontSize: "0.7rem",
  marginBottom: "10px",
  textAlign: "center",
  fontWeight: 500,
  padding: "2px 8px",
  backgroundColor: "rgba(105,240,174,0.1)",
  borderRadius: "4px",
  border: "1px solid rgba(105,240,174,0.25)",
});

const FtaNote = styled(Typography)({
  color: "rgba(255,255,255,0.45)",
  fontSize: "0.68rem",
  textAlign: "center",
  marginBottom: "10px",
  lineHeight: 1.35,
});

const StackBox = styled(Box)({
  width: "100%",
  marginBottom: "10px",
  padding: "8px 10px",
  borderRadius: "8px",
  backgroundColor: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
});

const StackRow = styled(Box)({
  display: "flex",
  justifyContent: "space-between",
  gap: "8px",
  color: "rgba(255,255,255,0.55)",
  fontSize: "0.64rem",
  lineHeight: 1.55,
});

const StackValue = styled("span")({
  color: "rgba(255,255,255,0.82)",
  fontVariantNumeric: "tabular-nums",
  textAlign: "right",
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

const ActionButton = styled(Button)({
  width: "100%",
  marginTop: "auto",
  textTransform: "none",
  fontWeight: 600,
  borderRadius: "10px",
  color: "#ffffff",
  backgroundColor: "#ff4081",
  "&:hover": {
    backgroundColor: "#f50057",
  },
});

const MetaSlot = styled(Box)({
  width: "100%",
  minHeight: "44px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "flex-start",
});

const StackToggle = styled("summary")({
  cursor: "pointer",
  color: "rgba(255,255,255,0.5)",
  fontSize: "0.68rem",
  textAlign: "center",
  listStyle: "none",
  "&::-webkit-details-marker": { display: "none" },
  "&::before": {
    content: "'▸ '",
  },
  "details[open] > &::before": {
    content: "'▾ '",
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
  const listedCost = activeVariant
    ? activeVariant.listedCost ?? car.listedCost
    : car.listedCost;
  const fta = activeVariant?.fta || car.fta;
  const displayFuel = activeVariant ? activeVariant.fuel_type : car.fuel_type;
  const displayDrivetrain = activeVariant
    ? activeVariant.drivetrain
    : car.drivetrain;
  const showFtaSaving = listedCost && displayCost < listedCost;

  const handleCardClick = () => {
    if (hasVariants) {
      clickHandler({
        ...car,
        cost: activeVariant.cost,
        listedCost: activeVariant.listedCost ?? listedCost,
        fta: activeVariant.fta || car.fta,
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

      <Box sx={{ width: "100%", minHeight: "48px", mb: 0.5 }}>
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
      </Box>

      <Box
        sx={{
          minHeight: "52px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-end",
        }}
      >
        {showFtaSaving && (
          <ListedPrice>
            {listedCost.toLocaleString("en-IN", {
              style: "currency",
              currency: "INR",
            })}
          </ListedPrice>
        )}
        <CarPrice>
          {displayCost.toLocaleString("en-IN", {
            style: "currency",
            currency: "INR",
          })}
        </CarPrice>
      </Box>
      <MetaSlot>
        {showFtaSaving && (
          <FtaBadge>
            {fta?.savingPct}% lower · {Number(fta?.nextDuty).toFixed(2)}% duty
            {fta?.meta?.origin ? ` · ${fta.meta.origin}` : ""}
            {fta?.meta?.importType ? ` ${fta.meta.importType}` : ""}
          </FtaBadge>
        )}
        {showFtaSaving && fta?.stack?.today && fta?.stack?.next && (
          <Box
            component="details"
            onClick={(e) => e.stopPropagation()}
            sx={{ width: "100%", mb: 1 }}
          >
            <StackToggle>Duty stack</StackToggle>
            <StackBox>
              <StackRow>
                <span>CIF (held)</span>
                <StackValue>{formatInrCompact(fta.stack.next.cif)}</StackValue>
              </StackRow>
              <StackRow>
                <span>Customs {fta.currentDuty}% → {Number(fta.nextDuty).toFixed(2)}%</span>
                <StackValue>
                  {formatInrCompact(fta.stack.today.customs)} → {formatInrCompact(fta.stack.next.customs)}
                </StackValue>
              </StackRow>
              <StackRow>
                <span>IGST {(fta.stack.next.gstRate * 100).toFixed(0)}%</span>
                <StackValue>
                  {formatInrCompact(fta.stack.today.igst)} → {formatInrCompact(fta.stack.next.igst)}
                </StackValue>
              </StackRow>
              <StackRow>
                <span>KA RTO {(fta.stack.next.rtoRate * 100).toFixed(2)}%</span>
                <StackValue>
                  {formatInrCompact(fta.stack.today.rto)} → {formatInrCompact(fta.stack.next.rto)}
                </StackValue>
              </StackRow>
              <StackRow>
                <span>TCS + insurance</span>
                <StackValue>
                  {formatInrCompact(fta.stack.today.tcs + fta.stack.today.insurance)} →{" "}
                  {formatInrCompact(fta.stack.next.tcs + fta.stack.next.insurance)}
                </StackValue>
              </StackRow>
            </StackBox>
          </Box>
        )}
        {!showFtaSaving && fta?.meta?.origin && fta.meta.origin !== "NONE" && (
          <FtaNote>
            {fta.meta.origin} · {fta.meta.importType}
            {fta.meta.horizonYears > 0 && fta.meta.note
              ? ` · ${fta.meta.note}`
              : ""}
          </FtaNote>
        )}
      </MetaSlot>
      <CarInfo sx={{ mb: 1.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <LocalGasStationIcon />
          <span>{displayFuel}</span>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <AllWheelDriveIcon />
          <span>{displayDrivetrain}</span>
        </Box>
      </CarInfo>
      <ActionButton
        onClick={(e) => {
          e.stopPropagation();
          handleCardClick();
        }}
      >
        {isGarage ? "Remove" : "Add to garage"}
      </ActionButton>
    </StyledCarItem>
  );
}
