// components/Login.js
import React, { useState } from 'react';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Simple authentication logic
    // In a real app, this would call your backend API
    if (username === 'tenant' && password === 'password') {
      onLogin('tenant', { id: 'T001', name: 'John Doe' });
    } else if (username === 'admin' && password === 'password') {
      onLogin('admin', { id: 'A001', name: 'System Admin' });
    } else if (username === 'supplier' && password === 'password') {
      onLogin('supplier', { id: 'S001', name: 'Meal Supplier' });
    } else {
      alert('Invalid credentials');
    }
  };

  return (
    <div className="login-container">
      <h2>Login to StayMate</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username: </label>
          <input 
            type="text" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            required 
          />
        </div>
        <div>
          <label>Password: </label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
        </div>
        <button type="submit">Login</button>
      </form>
      <div className="demo-credentials">
        <p>Demo credentials:</p>
        <p>Tenant: tenant / password</p>
        <p>Admin: admin / password</p>
        <p>Supplier: supplier / password</p>
      </div>
    </div>
  );
};

export default Login;