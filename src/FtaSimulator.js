import { styled } from "@mui/material/styles";
import { Box, Container, Typography, Chip, Button } from "@mui/material";
import PublicIcon from "@mui/icons-material/Public";
import {
  BASE_CALENDAR_YEAR,
  MAX_HORIZON_YEARS,
  calendarYear,
  euAgreementYear,
  ukAgreementYear,
} from "./fta";

const SimulatorCard = styled(Container)({
  padding: "24px",
  background: "linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%)",
  borderRadius: "16px",
  boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
  margin: "16px auto",
  maxWidth: "800px !important",
  border: "1px solid rgba(255,255,255,0.1)",
});

const YearButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== "selected",
})(({ selected }) => ({
  minWidth: 64,
  padding: "6px 10px",
  borderRadius: "10px",
  textTransform: "none",
  fontSize: "0.8rem",
  fontWeight: selected ? 700 : 500,
  color: selected ? "#ffffff" : "rgba(255,255,255,0.75)",
  backgroundColor: selected ? "#ff4081" : "rgba(255,255,255,0.05)",
  border: selected
    ? "1px solid #ff4081"
    : "1px solid rgba(255,255,255,0.15)",
  "&:hover": {
    backgroundColor: selected ? "#f50057" : "rgba(255,64,129,0.12)",
  },
}));

export default function FtaSimulator({ horizonYears, onHorizonChange }) {
  const year = calendarYear(horizonYears);
  const ukYear = ukAgreementYear(horizonYears);
  const euYear = euAgreementYear(horizonYears);
  const years = Array.from({ length: MAX_HORIZON_YEARS + 1 }, (_, value) => value);

  return (
    <SimulatorCard>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
        <PublicIcon sx={{ color: "#ff4081" }} />
        <Typography sx={{ color: "#fff", fontWeight: 600, fontSize: "1.15rem" }}>
          FTA Price Simulator
        </Typography>
      </Box>
      <Typography sx={{ color: "rgba(255,255,255,0.65)", fontSize: "0.85rem", mb: 2 }}>
        Replay Bangalore on-road prices through the real Indian import stack.
        Only the customs line moves with the FTA. GST, compensation cess (now
        nil), Karnataka RTO, TCS and insurance keep today&apos;s statutory rates.
      </Typography>

      <Box sx={{ display: "flex", alignItems: "baseline", gap: 1.5, mb: 1.5 }}>
        <Typography sx={{ color: "#ff4081", fontWeight: 700, fontSize: "1.8rem" }}>
          {horizonYears === 0 ? "Today" : year}
        </Typography>
        {horizonYears > 0 && (
          <Typography sx={{ color: "rgba(255,255,255,0.6)", fontSize: "0.9rem" }}>
            {`${horizonYears} year${horizonYears === 1 ? "" : "s"} from now`}
          </Typography>
        )}
      </Box>

      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
        {years.map((value) => (
          <YearButton
            key={value}
            selected={horizonYears === value}
            onClick={() => onHorizonChange(value)}
          >
            {value === 0 ? "Today" : `+${value}y`}
          </YearButton>
        ))}
      </Box>

      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
        <Chip
          size="small"
          label={
            ukYear === 0
              ? "UK CETA · showing listed prices"
              : `UK CETA · Year ${ukYear}`
          }
          sx={chipSx}
        />
        <Chip
          size="small"
          label={
            euYear === 0
              ? "EU FTA · not in force yet"
              : `EU FTA · Year ${euYear}`
          }
          sx={chipSx}
        />
        <Chip
          size="small"
          label={`Calendar ${horizonYears === 0 ? BASE_CALENDAR_YEAR : year}`}
          sx={chipSx}
        />
      </Box>

      <Typography sx={{ color: "rgba(255,255,255,0.45)", fontSize: "0.75rem", lineHeight: 1.5 }}>
        Method: listed on-road → peel KA RTO / TCS / insurance → peel 40% IGST
        (5% EV) → peel today&apos;s MFN customs (70% BCD + 40% AIDC, or 16.5% CKD)
        → implied CIF. Rebuild with the FTA customs % only. GST and RTO amounts
        fall only because their tax base fell — the rates do not change. ICE CBUs
        reach 10% in five FTA years; EVs/PHEVs start later (EU Year 5, UK Year 6).
        CKD kits move from 16.5% to 8.25% by EU Year 3. Indian-made and
        Japan/US/Korea cars are unchanged.
      </Typography>
    </SimulatorCard>
  );
}

const chipSx = {
  color: "#fff",
  backgroundColor: "rgba(255,64,129,0.12)",
  border: "1px solid rgba(255,64,129,0.3)",
};
