// src/components/OrderSummary.js

import React from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Chip
} from "@mui/material";
import { Warning, Restaurant } from "@mui/icons-material";

const OrderSummary = ({ meals, total, allergyWarnings = [] }) => {
  if (meals.length === 0) {
    return (
      <Box textAlign="center" py={3}>
        <Typography variant="body2" color="text.secondary">
          No meals selected yet
        </Typography>
      </Box>
    );
  }

  const hasAllergyWarnings = allergyWarnings.length > 0;

  return (
    <Box>
      <List dense>
        {meals.map((meal, index) => {
          const hasAllergy = allergyWarnings.some(w => w.meal === meal.name);
          return (
            <ListItem key={index}>
              <ListItemIcon>
                <Restaurant />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center" gap={1}>
                    {meal.name}
                    {hasAllergy && (
                      <Chip
                        icon={<Warning />}
                        label="Allergy"
                        size="small"
                        color="warning"
                        variant="outlined"
                      />
                    )}
                  </Box>
                }
                secondary={`$${meal.price.toFixed(2)} • ${meal.mealType}`}
              />
            </ListItem>
          );
        })}
      </List>
      
      <Divider sx={{ my: 2 }} />
      
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6">Total:</Typography>
        <Typography variant="h6" color="primary">
          ${total.toFixed(2)}
        </Typography>
      </Box>
      
      {hasAllergyWarnings && (
        <Box mt={2} p={1} bgcolor="warning.light" borderRadius={1}>
          <Typography variant="body2" color="warning.dark">
            ⚠️ {allergyWarnings.length} meal(s) contain allergens from your profile
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default OrderSummary;