// src/components/AllergyWarningModal.js
import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert
} from "@mui/material";
import { Warning, Restaurant } from "@mui/icons-material";

const AllergyWarningModal = ({ 
  open, 
  warnings, 
  totalAmount, 
  onConfirm, 
  onCancel 
}) => {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <Warning color="warning" />
          Allergy Warning
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Alert severity="warning" sx={{ mb: 2 }}>
          The following meals contain ingredients that match your allergy profile:
        </Alert>
        
        <List>
          {warnings.map((warning, index) => (
            <ListItem key={index}>
              <ListItemIcon>
                <Restaurant />
              </ListItemIcon>
              <ListItemText
                primary={warning.meal}
                secondary={`Contains: ${warning.ingredients}`}
              />
            </ListItem>
          ))}
        </List>
        
        <Box mt={2} p={2} bgcolor="grey.50" borderRadius={1}>
          <Typography variant="h6" gutterBottom>
            Order Total: ${totalAmount.toFixed(2)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            By confirming, you acknowledge that you're aware of the allergy risks.
          </Typography>
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onCancel} color="primary">
          Cancel Order
        </Button>
        <Button 
          onClick={onConfirm} 
          variant="contained" 
          color="warning"
          startIcon={<Warning />}
        >
          Confirm Anyway
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AllergyWarningModal;