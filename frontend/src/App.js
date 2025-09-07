// App.js
import React, { useState } from 'react';
import RoomAccess from './pages/RoomAccess';
import Login from './pages/login';
import './App.css';

function App() {
  const [user, setUser] = useState(null);

  const handleLogin = (role, userData) => {
    const userInfo = { ...userData, role };
    setUser(userInfo);
    localStorage.setItem('user', JSON.stringify(userInfo));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="App">
      <div className="header">
        <h1>StayMate - Room Access Control</h1>
        <div className="user-info">
          <span>Welcome, {user.name} ({user.role})</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </div>
      <RoomAccess />
    </div>
  );
}

export default App;