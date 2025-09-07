import React from 'react';
import { Link } from 'react-router-dom';
import '../css/App.css';

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      <h1>StayMate Boarding Management System</h1>
      
      <div className="dashboard-grid">
        <Link to="/rooms" className="dashboard-card">
          <div className="card-icon">🏠</div>
          <h3>Room Management</h3>
          <p>Manage room availability, assignments, and configurations</p>
        </Link>
        
        <div className="dashboard-card">
          <div className="card-icon">👥</div>
          <h3>Tenant Management</h3>
          <p>Manage tenant registrations and profiles</p>
        </div>
        
        <div className="dashboard-card">
          <div className="card-icon">💼</div>
          <h3>Property Management</h3>
          <p>Manage properties and settings</p>
        </div>
        
        <div className="dashboard-card">
          <div className="card-icon">💰</div>
          <h3>Financial Management</h3>
          <p>Handle payments, invoices, and financial reports</p>
        </div>
      </div>
    </div>
  );
};

// Add this at the very end of the file:
export default Dashboard;