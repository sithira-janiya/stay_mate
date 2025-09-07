// src/components/RoleSwitcher.js
import React, { useContext } from "react";
import { Button, Box, Paper, Typography } from "@mui/material";
import { AuthContext } from "../contexts/AuthContext";

const RoleSwitcher = () => {
  const { user, updateUser } = useContext(AuthContext);

  const switchToSupplier = () => {
    updateUser({
      ...user,
      role: "supplier"
    });
    window.location.href = "/supplier/dashboard";
  };

  const switchToTenant = () => {
    updateUser({
      ...user,
      role: "tenant"
    });
    window.location.href = "/tenant/menu";
  };

  return (
    <Paper sx={{ 
      position: 'fixed', 
      bottom: 16, 
      right: 16, 
      zIndex: 1000, 
      p: 2,
      backgroundColor: 'rgba(255, 255, 255, 0.9)'
    }}>
      <Typography variant="subtitle2" gutterBottom>
        Developer Tools
      </Typography>
      <Box display="flex" gap={1} flexDirection="column">
        <Typography variant="caption">
          Current: <strong>{user?.role}</strong>
        </Typography>
        <Button 
          variant="outlined" 
          size="small" 
          onClick={switchToSupplier}
          disabled={user?.role === "supplier"}
        >
          Switch to Supplier
        </Button>
        <Button 
          variant="outlined" 
          size="small" 
          onClick={switchToTenant}
          disabled={user?.role === "tenant"}
        >
          Switch to Tenant
        </Button>
      </Box>
    </Paper>
  );
};

export default RoleSwitcher;