import React from 'react';
import RoomAvailability from './RoomAvailability';
import RoomManagement from './RoomManagement';
import '../../css/RoomDashboard.css';

const RoomDashboard = () => {
  return (
    <div className="room-dashboard">
      <div className="dashboard-header">
        <h1>Room Management Dashboard</h1>
        <p>Manage room availability, assignments, and configurations</p>
      </div>
      
      <div className="dashboard-content">
        <div className="dashboard-section">
          <RoomAvailability />
        </div>
        
        <div className="dashboard-section">
          <RoomManagement />
        </div>
      </div>
    </div>
  );
};

export default RoomDashboard;