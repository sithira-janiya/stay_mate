import React from "react";
import { Routes, Route } from "react-router-dom";
import "./css/App.css";
import Dashboard from "./pages/Dashboard.jsx";
import RoomDashboard from "./components/RoomDashboard/RoomDashboard.jsx";
import PropertyManagement from "./pages/PropertyManagement.jsx";


function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/rooms" element={<RoomDashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/property" element={<PropertyManagement />} />
      </Routes>
    </div>
  );
}

export default App;