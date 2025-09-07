// src/components/MenuList.js
import React, { useState } from "react";
import {
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
  Chip,
  Alert,
  Card,
  CardContent,
  Grid
} from "@mui/material";
import { Warning, Restaurant, LocalFlorist } from "@mui/icons-material";

const MealCard = ({ meal, isSelected, onSelect, hasAllergy }) => {
  return (
    <Card 
      variant="outlined" 
      sx={{ 
        mb: 2, 
        borderColor: hasAllergy ? 'error.main' : 'divider',
        backgroundColor: hasAllergy ? 'error.light' : 'background.paper'
      }}
    >
      <CardContent>
        <Box display="flex" alignItems="flex-start" justifyContent="space-between">
          <Box flex={1}>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <Typography variant="h6" component="div">
                {meal.name}
              </Typography>
              {meal.category === 'veg' && (
                <Chip 
                  icon={<LocalFlorist />} 
                  label="Vegetarian" 
                  size="small" 
                  color="success" 
                  variant="outlined" 
                />
              )}
            </Box>
            
            <Typography variant="body2" color="text.secondary" paragraph>
              {meal.description}
            </Typography>
            
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Ingredients:</strong> {meal.ingredients}
            </Typography>
            
            {hasAllergy && (
              <Alert severity="warning" icon={<Warning />} sx={{ mb: 1 }}>
                Contains ingredients that match your allergy profile
              </Alert>
            )}
            
            <Typography variant="body2" color="text.secondary">
              Order before: {new Date(meal.orderDeadline).toLocaleTimeString()}
            </Typography>
          </Box>
          
          <Box ml={2} textAlign="right">
            <Typography variant="h6" color="primary" gutterBottom>
              ${meal.price.toFixed(2)}
            </Typography>
            <FormControlLabel
              control={
                <Checkbox
                  checked={isSelected}
                  onChange={() => onSelect(meal._id)}
                  color={hasAllergy ? "warning" : "primary"}
                />
              }
              label="Select"
            />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default function MenuList({ meals = [], selected = [], setSelected = () => {}, userAllergies = [] }) {
  const [expandedCategory, setExpandedCategory] = useState(null);

  const toggleSelection = (mealId) => {
    setSelected(prev => 
      prev.includes(mealId) 
        ? prev.filter(id => id !== mealId) 
        : [...prev, mealId]
    );
  };

  const checkForAllergies = (ingredients) => {
    if (!userAllergies || userAllergies.length === 0) return false;
    
    const ingredientList = ingredients.toLowerCase().split(',').map(i => i.trim());
    return userAllergies.some(allergy => 
      ingredientList.some(ingredient => 
        ingredient.includes(allergy.toLowerCase())
      )
    );
  };

  // Group meals by type
  const groupedMeals = meals.reduce((acc, meal) => {
    if (!acc[meal.mealType]) acc[meal.mealType] = [];
    acc[meal.mealType].push(meal);
    return acc;
  }, {});

  const mealTypes = ['breakfast', 'lunch', 'dinner', 'dessert'];

  return (
    <Box>
      {mealTypes.map(mealType => (
        <Box key={mealType} mb={4}>
          <Box 
            display="flex" 
            alignItems="center" 
            justifyContent="space-between" 
            mb={2}
            onClick={() => setExpandedCategory(expandedCategory === mealType ? null : mealType)}
            sx={{ cursor: 'pointer' }}
          >
            <Typography variant="h5" textTransform="capitalize">
              {mealType}
            </Typography>
            <Chip 
              label={`${groupedMeals[mealType]?.length || 0} options`} 
              variant="outlined" 
            />
          </Box>
          
          {(expandedCategory === mealType || expandedCategory === null) && (
            <Grid container spacing={2}>
              {(groupedMeals[mealType] || []).map(meal => {
                const hasAllergy = checkForAllergies(meal.ingredients);
                return (
                  <Grid item xs={12} md={6} key={meal._id}>
                    <MealCard
                      meal={meal}
                      isSelected={selected.includes(meal._id)}
                      onSelect={toggleSelection}
                      hasAllergy={hasAllergy}
                    />
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Box>
      ))}
    </Box>
  );
}