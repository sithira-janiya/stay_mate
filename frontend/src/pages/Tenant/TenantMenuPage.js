// src/pages/Tenant/TenantMenuPage.js
import React, { useEffect, useState, useContext } from "react";
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Alert,
  Grid
} from "@mui/material";
import {
  ShoppingCart,
  Warning
} from "@mui/icons-material";

import { fetchMenu, placeOrder, confirmOrderWithAllergies } from "../../api/api";
import { AuthContext } from "../../contexts/AuthContext";
import { useNotifications } from "../../contexts/NotificationContext";
import MenuList from "../../components/MenuList";
import AllergyWarningModal from "../../components/AllergyWarningModal";
import OrderSummary from "../../components/OrderSummary";

export default function TenantMenuPage() {
  const { user } = useContext(AuthContext);
  const { push } = useNotifications();
  const [menu, setMenu] = useState([]);
  const [selectedMeals, setSelectedMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allergyWarnings, setAllergyWarnings] = useState([]);
  const [showAllergyWarning, setShowAllergyWarning] = useState(false);
  const [orderTotal, setOrderTotal] = useState(0);

  useEffect(() => {
    loadMenu();
  }, []);

  useEffect(() => {
    calculateTotal();
    checkForAllergies();
  }, [selectedMeals, menu]);

  const loadMenu = async () => {
    try {
      setLoading(true);
      const response = await fetchMenu();
      setMenu(response.data || []);
    } catch (error) {
      console.error('Error loading menu:', error);
      push('Failed to load menu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    const total = selectedMeals.reduce((sum, mealId) => {
      const meal = menu.find(m => m._id === mealId);
      return sum + (meal ? meal.price : 0);
    }, 0);
    setOrderTotal(total);
  };

  const checkForAllergies = () => {
    if (!user?.allergies || user.allergies.length === 0) {
      setAllergyWarnings([]);
      return;
    }

    const warnings = selectedMeals
      .map(mealId => {
        const meal = menu.find(m => m._id === mealId);
        if (!meal) return null;
        
        const hasAllergy = meal.ingredients.toLowerCase().split(',').some(ingredient =>
          user.allergies.some(allergy => 
            ingredient.includes(allergy.toLowerCase())
          )
        );
        
        return hasAllergy ? {
          meal: meal.name,
          ingredients: meal.ingredients
        } : null;
      })
      .filter(Boolean);

    setAllergyWarnings(warnings);
  };

  const handlePlaceOrder = async () => {
    if (selectedMeals.length === 0) {
      push('Please select at least one meal', 'warning');
      return;
    }

    // Check if any selected meal is past deadline
    const now = new Date();
    const overdueMeals = selectedMeals
      .map(mealId => menu.find(m => m._id === mealId))
      .filter(meal => new Date(meal.orderDeadline) < now);

    if (overdueMeals.length > 0) {
      push('Some selected meals are past their order deadline', 'error');
      return;
    }

    // Show allergy warning if needed
    if (allergyWarnings.length > 0) {
      setShowAllergyWarning(true);
      return;
    }

    await submitOrder();
  };

  const submitOrder = async (acknowledgeAllergies = false) => {
    try {
      const orderData = {
        meals: selectedMeals.map(mealId => ({ meal: mealId, quantity: 1 })),
        specialInstructions: ''
      };

      let response;
      if (acknowledgeAllergies) {
        response = await confirmOrderWithAllergies(orderData);
      } else {
        response = await placeOrder(orderData);
      }

      push('Order placed successfully!', 'success');
      setSelectedMeals([]);
      setShowAllergyWarning(false);
    } catch (error) {
      console.error('Error placing order:', error);
      push('Failed to place order', 'error');
    }
  };

  const selectedMealDetails = selectedMeals.map(mealId => 
    menu.find(m => m._id === mealId)
  ).filter(Boolean);

  if (loading) {
    return (
      <Container>
        <Typography>Loading menu...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box my={4}>
        <Typography variant="h4" gutterBottom>
          Today's Menu
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <MenuList
                meals={menu}
                selected={selectedMeals}
                setSelected={setSelectedMeals}
                userAllergies={user?.allergies || []}
              />
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, position: 'sticky', top: 20 }}>
              <Typography variant="h6" gutterBottom>
                Order Summary
              </Typography>
              
              {allergyWarnings.length > 0 && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  <Warning sx={{ mr: 1 }} />
                  {allergyWarnings.length} meal(s) may contain allergens
                </Alert>
              )}
              
              <OrderSummary 
                meals={selectedMealDetails} 
                total={orderTotal}
                allergyWarnings={allergyWarnings}
              />
              
              <Button
                variant="contained"
                fullWidth
                size="large"
                startIcon={<ShoppingCart />}
                onClick={handlePlaceOrder}
                disabled={selectedMeals.length === 0}
                sx={{ mt: 2 }}
              >
                Place Order (${orderTotal.toFixed(2)})
              </Button>
            </Paper>
          </Grid>
        </Grid>

        <AllergyWarningModal
          open={showAllergyWarning}
          warnings={allergyWarnings}
          totalAmount={orderTotal}
          onConfirm={() => submitOrder(true)}
          onCancel={() => setShowAllergyWarning(false)}
        />
      </Box>
    </Container>
  );
}