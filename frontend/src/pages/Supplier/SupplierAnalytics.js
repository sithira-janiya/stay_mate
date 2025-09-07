// src/pages/Supplier/SupplierAnalytics.js
import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";
import { fetchSupplierAnalytics, fetchMonthlyIncome } from "../../api/api";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function SupplierAnalytics() {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [monthlyIncome, setMonthlyIncome] = useState(null);
  const [timeRange, setTimeRange] = useState('month');
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
    loadMonthlyIncome();
  }, [timeRange, year]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetchSupplierAnalytics();
      setAnalyticsData(response.data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMonthlyIncome = async () => {
    try {
      const response = await fetchMonthlyIncome(year);
      setMonthlyIncome(response.data);
    } catch (error) {
      console.error('Error loading monthly income:', error);
    }
  };

  if (loading) {
    return (
      <Container>
        <Typography>Loading analytics...</Typography>
      </Container>
    );
  }

  if (!analyticsData) {
    return (
      <Container>
        <Typography color="error">Failed to load analytics data</Typography>
      </Container>
    );
  }

  // Prepare data for charts
  const mealTypeData = Object.entries(analyticsData.mealTypeRevenue || {}).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value: parseFloat(value.toFixed(2))
  }));

  const bestSellingData = analyticsData.bestSellingMeals.slice(0, 5).map(item => ({
    name: item[0],
    sales: item[1]
  }));

  const monthlyIncomeData = monthlyIncome?.monthlyIncome.map((amount, index) => ({
    month: new Date(0, index).toLocaleString('default', { month: 'short' }),
    income: parseFloat(amount.toFixed(2))
  })) || [];

  return (
    <Container maxWidth="xl">
      <Box my={4}>
        <Typography variant="h4" gutterBottom>
          Analytics Dashboard
        </Typography>
        
        {/* Filters */}
        <Box display="flex" gap={2} mb={3}>
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
          
          <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Year</InputLabel>
            <Select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              label="Year"
            >
              {[2022, 2023, 2024, 2025].map(y => (
                <MenuItem key={y} value={y}>{y}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Summary Cards */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Revenue
                </Typography>
                <Typography variant="h5" color="primary">
                  ${analyticsData.totalRevenue?.toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Orders
                </Typography>
                <Typography variant="h5">
                  {analyticsData.totalOrders}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Average Rating
                </Typography>
                <Typography variant="h5" color="secondary">
                  {analyticsData.ratingSummary?.average?.toFixed(1) || '0.0'}/5
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Feedback Received
                </Typography>
                <Typography variant="h5">
                  {analyticsData.feedbackCount}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Charts */}
        <Grid container spacing={3}>
          {/* Revenue by Meal Type */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom align="center">
                Revenue by Meal Type
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={mealTypeData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: $${value}`}
                  >
                    {mealTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Best Selling Items */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom align="center">
                Best Selling Items
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={bestSellingData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="sales" fill="#8884d8" name="Units Sold" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Monthly Income Trend */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom align="center">
                Monthly Income Trend ({year})
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyIncomeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value}`, 'Income']} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="income" 
                    stroke="#ff7300" 
                    name="Monthly Income" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}