import React from "react";
import { styled } from "@mui/material/styles";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Divider,
} from "@mui/material";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import UpdateIcon from "@mui/icons-material/Update";

const BudgetContainer = styled(Container)(({ theme }) => ({
  padding: "24px",
  backgroundColor: "#1a237e",
  borderRadius: "12px",
  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
  margin: "16px auto",
  maxWidth: "800px !important",
  color: "white",
}));

const StyledPaper = styled(Paper)({
  padding: "24px",
  borderRadius: "8px",
  backgroundColor: "rgba(255, 255, 255, 0.1)",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(255, 255, 255, 0.2)",
});

const BudgetValue = styled(Typography)({
  fontWeight: 600,
  color: "#7fff7f",
  marginLeft: "12px",
  fontSize: "1.1rem",
  textShadow: "0 1px 2px rgba(0,0,0,0.2)",
});

const StyledButton = styled(Button)({
  marginLeft: "8px",
  backgroundColor: "#ff5722",
  "&:hover": {
    backgroundColor: "#f4511e",
  },
  textTransform: "none",
  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
});

const BudgetLabel = styled(Typography)({
  color: "#ffffff",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  fontSize: "1rem",
  fontWeight: 500,
});

const StyledTextField = styled(TextField)({
  "& .MuiOutlinedInput-root": {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: "8px",
    "& fieldset": {
      borderColor: "rgba(255, 255, 255, 0.3)",
    },
    "&:hover fieldset": {
      borderColor: "rgba(255, 255, 255, 0.5)",
    },
    "& input": {
      color: "#1a237e",
    },
  },
  "& .MuiInputLabel-root": {
    color: "#ffffff",
    "&.Mui-focused": {
      color: "#ffffff",
    },
  },
});

export default function Budget({
  budgetAllocated,
  budgetLeft,
  budgetInput,
  handleChange,
  handleSubmit,
}) {
  const formatCurrency = (value) => {
    return value.toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
    });
  };

  return (
    <BudgetContainer>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3, gap: 1 }}>
        <AccountBalanceWalletIcon sx={{ fontSize: 28 }} />
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Budget Manager
        </Typography>
      </Box>
      <StyledPaper elevation={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box>
                <BudgetLabel variant="subtitle1">
                  <span>Total Budget</span>
                </BudgetLabel>
                <BudgetValue>{formatCurrency(budgetAllocated)}</BudgetValue>
              </Box>
              <Divider sx={{ backgroundColor: "rgba(255,255,255,0.1)" }} />
              <Box>
                <BudgetLabel variant="subtitle1">
                  <span>Budget Left</span>
                </BudgetLabel>
                <BudgetValue>{formatCurrency(budgetLeft)}</BudgetValue>
              </Box>
              <Divider sx={{ backgroundColor: "rgba(255,255,255,0.1)" }} />
              <Box>
                <BudgetLabel variant="subtitle1">
                  <span>Collection Cost</span>
                </BudgetLabel>
                <BudgetValue>
                  {formatCurrency(budgetAllocated - budgetLeft)}
                </BudgetValue>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <form onSubmit={handleSubmit}>
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                <StyledTextField
                  type="number"
                  value={budgetInput || ""}
                  onChange={handleChange}
                  label="Set New Budget"
                  variant="outlined"
                  size="small"
                  fullWidth
                />
                <StyledButton
                  variant="contained"
                  type="submit"
                  size="medium"
                  startIcon={<UpdateIcon />}
                >
                  Update
                </StyledButton>
              </Box>
            </form>
          </Grid>
        </Grid>
      </StyledPaper>
    </BudgetContainer>
  );
}
