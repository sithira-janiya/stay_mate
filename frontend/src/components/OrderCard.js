// src/components/OrderCard.js
import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Collapse
} from "@mui/material";
import {
  ExpandMore,
  ExpandLess,
  LocalShipping,
  Restaurant,
  CheckCircle,
  Schedule
} from "@mui/icons-material";
import FeedbackForm from "./forms/FeedbackForm";

const statusSteps = [
  { label: 'Processing', icon: <Schedule /> },
  { label: 'Preparing', icon: <Restaurant /> },
  { label: 'Out for Delivery', icon: <LocalShipping /> },
  { label: 'Delivered', icon: <CheckCircle /> }
];

const getStatusIndex = (status) => {
  const statusMap = {
    'processing': 0,
    'preparing': 1,
    'out-for-delivery': 2,
    'delivered': 3,
    'cancelled': -1
  };
  return statusMap[status] || 0;
};

export default function OrderCard({ order, onStatusUpdate }) {
  const [showFeedback, setShowFeedback] = useState(false);
  const [expanded, setExpanded] = useState(false);
  
  const activeStep = getStatusIndex(order.status);
  const canGiveFeedback = order.status === 'delivered' && !order.feedbackGiven;

  const getStatusColor = (status) => {
    switch (status) {
      case 'processing': return 'default';
      case 'preparing': return 'primary';
      case 'out-for-delivery': return 'secondary';
      case 'delivered': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box flex={1}>
            <Typography variant="h6" gutterBottom>
              Order #{order.orderNumber}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {new Date(order.orderDate).toLocaleDateString()} at {formatTime(order.orderDate)}
            </Typography>
            
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <Chip 
                label={order.status} 
                color={getStatusColor(order.status)} 
                size="small" 
              />
              {order.acknowledgedAllergies && (
                <Chip 
                  label="Allergy Warning" 
                  color="warning" 
                  size="small" 
                  variant="outlined"
                />
              )}
            </Box>
          </Box>
          
          <Typography variant="h6" color="primary">
            ${order.totalAmount.toFixed(2)}
          </Typography>
        </Box>

        <Button
          size="small"
          onClick={() => setExpanded(!expanded)}
          endIcon={expanded ? <ExpandLess /> : <ExpandMore />}
        >
          {expanded ? 'Hide Details' : 'View Details'}
        </Button>

        <Collapse in={expanded}>
          <Box mt={2}>
            {/* Order Tracking Stepper */}
            <Stepper activeStep={activeStep} orientation="vertical" sx={{ mb: 3 }}>
              {statusSteps.map((step, index) => (
                <Step key={step.label}>
                  <StepLabel icon={step.icon}>
                    {step.label}
                    {index < activeStep && order.statusHistory?.[index] && (
                      <Typography variant="caption" display="block" color="text.secondary">
                        {formatTime(order.statusHistory[index].timestamp)}
                      </Typography>
                    )}
                  </StepLabel>
                  <StepContent>
                    {index === activeStep && (
                      <Typography variant="body2">
                        Your order is currently {step.label.toLowerCase()}.
                      </Typography>
                    )}
                  </StepContent>
                </Step>
              ))}
            </Stepper>

            {/* Order Items */}
            <Typography variant="subtitle2" gutterBottom>
              Order Items:
            </Typography>
            {order.meals.map((item, index) => (
              <Box key={index} display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2">
                  {item.quantity}x {item.meal.name}
                </Typography>
                <Typography variant="body2">
                  ${(item.priceAtTime * item.quantity).toFixed(2)}
                </Typography>
              </Box>
            ))}

            {order.specialInstructions && (
              <Box mt={1}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Special Instructions:</strong> {order.specialInstructions}
                </Typography>
              </Box>
            )}
          </Box>
        </Collapse>

        {/* Feedback Section */}
        {canGiveFeedback && (
          <Box mt={2}>
            {!showFeedback ? (
              <Button 
                variant="outlined" 
                size="small"
                onClick={() => setShowFeedback(true)}
                fullWidth
              >
                Rate Your Meal
              </Button>
            ) : (
              <FeedbackForm 
                orderId={order._id} 
                onSubmitted={() => {
                  setShowFeedback(false);
                  if (onStatusUpdate) onStatusUpdate();
                }} 
              />
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}