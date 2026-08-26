import { useState } from 'react'
import './App.css'
import { useAuth } from './AuthContext.jsx';
import { Login } from './components/Login.jsx';
import { DeviceList } from './components/DeviceList.jsx';
import { LiveDashboard } from './components/LiveDashboard.jsx';
import { RulesPanel } from './components/RulesPanel.jsx';

function App() {
  const { isAuthenticated, user, logout } = useAuth();
  const [ selectedDevice, setSelectedDevice ] = useState(null);
  const [ activeTab, setActiveTab ] = useState('live');

  return isAuthenticated ? (
    <div>
      <p>Welcome, {user.username} ({user.role})</p>
      <button onClick={logout}>Logout</button>
      <DeviceList onSelect={setSelectedDevice} />

      {selectedDevice && (
        <div>
          <button onClick={() => setActiveTab('live')}>Live dashboard</button>
          <button onClick={() => setActiveTab('rules')}>Alert rules</button>
        
          {activeTab === 'live' && <LiveDashboard device={selectedDevice} />}
          {activeTab === 'rules' && <RulesPanel device={selectedDevice} />}
        </div>
      )}
    </div>
  ) : (
    <Login />
  );
}

export default App;



