import React, { useEffect, useState } from "react";
import { fetchExpenseAnalytics } from "../../api/api";
import { Doughnut, Bar } from "react-chartjs-2";
import { 
  Chart as ChartJS, 
  ArcElement, 
  BarElement, 
  CategoryScale, 
  LinearScale, 
  Tooltip, 
  Legend 
} from "chart.js";
import {
  Box,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid
} from "@mui/material";

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function TenantExpenses() {
  const [data, setData] = useState(null);
  const [timeRange, setTimeRange] = useState('month');

  useEffect(() => { 
    fetchExpenseAnalytics(timeRange).then(r => setData(r.data)).catch(console.error); 
  }, [timeRange]);

  const doughnutData = {
    labels: ["breakfast", "lunch", "dinner", "dessert"],
    datasets: [{
      data: [
        data?.byMealType?.breakfast || 0,
        data?.byMealType?.lunch || 0,
        data?.byMealType?.dinner || 0,
        data?.byMealType?.dessert || 0
      ],
      backgroundColor: ["#FFCE56", "#36A2EB", "#FF6384", "#9CCC65"]
    }]
  };

  const barData = {
    labels: data?.byDate?.map(item => {
      const date = new Date(item.date);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }) || [],
    datasets: [{
      label: 'Daily Expenses',
      data: data?.byDate?.map(item => item.amount) || [],
      backgroundColor: '#1976d2'
    }]
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Expense Analytics</Typography>
        <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Time Range</InputLabel>
          <Select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            label="Time Range"
          >
            <MenuItem value="week">Last Week</MenuItem>
            <MenuItem value="month">Last Month</MenuItem>
            <MenuItem value="quarter">Last Quarter</MenuItem>
            <MenuItem value="year">Last Year</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {data ? (
        <Grid container spacing={3}>
          {/* Summary Cards */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6" color="primary" gutterBottom>
                Total Spent
              </Typography>
              <Typography variant="h4">
                ${(data.totalSpent || 0).toFixed(2)}
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6" color="primary" gutterBottom>
                Total Orders
              </Typography>
              <Typography variant="h4">
                {data.orderCount || 0}
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6" color="primary" gutterBottom>
                Average per Order
              </Typography>
              <Typography variant="h4">
                ${data.orderCount > 0 
                  ? (data.totalSpent / data.orderCount).toFixed(2) 
                  : '0.00'}
              </Typography>
            </Paper>
          </Grid>

          {/* Doughnut Chart */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom align="center">
                Expense by Meal Type
              </Typography>
              <Box height={300}>
                <Doughnut 
                  data={doughnutData} 
                  options={{
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom'
                      },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            return `${context.label}: $${context.raw.toFixed(2)}`;
                          }
                        }
                      }
                    }
                  }}
                />
              </Box>
            </Paper>
          </Grid>

          {/* Bar Chart */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom align="center">
                Daily Expenses
              </Typography>
              <Box height={300}>
                <Bar 
                  data={barData} 
                  options={{
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: function(value) {
                            return '$' + value;
                          }
                        }
                      }
                    },
                    plugins: {
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            return `$${context.raw.toFixed(2)}`;
                          }
                        }
                      }
                    }
                  }}
                />
              </Box>
            </Paper>
          </Grid>
        </Grid>
      ) : (
        <Typography>Loading expense data...</Typography>
      )}
    </Box>
  );
}