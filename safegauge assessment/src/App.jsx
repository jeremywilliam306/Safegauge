import { useState } from 'react'
import './App.css'
import { useAuth } from './AuthContext.jsx';
import { Login } from './components/Login.jsx';
import { DeviceList } from './components/DeviceList.jsx';
import { LiveDashboard } from './components/LiveDashboard.jsx';

function App() {
  const { isAuthenticated, user, logout } = useAuth();
  const [ selectedDevice, setSelectedDevice ] = useState(null);

  return isAuthenticated ? (
    <div>
      <p>Welcome, {user.username} ({user.role})</p>
      <button onClick={logout}>Logout</button>
      <DeviceList onSelect={setSelectedDevice} />
      {selectedDevice && <LiveDashboard device={selectedDevice} />}
    </div>
  ) : (
    <Login />
  );
}

export default App;



