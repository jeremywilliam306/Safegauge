import { useState } from 'react'
import './App.css'
import { useAuth } from './AuthContext.jsx';
import { Login } from './components/Login.jsx';

function App() {
  const { isAuthenticated, user, logout } = useAuth();

  return isAuthenticated ? (
    <div>
      <p>Welcome, {user.username} ({user.role})</p>
      <button onClick={logout}>Logout</button>
      <DeviceList />
    </div>
  ) : (
    <Login />
  );
}

export default App;



