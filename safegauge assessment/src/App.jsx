import { useState } from 'react'
import './App.css'
import { useAuth } from './AuthContext.jsx';
import { Login } from './components/Login.jsx';
import { DeviceList } from './components/DeviceList.jsx';
import { LiveDashboard } from './components/LiveDashboard.jsx';
import { RulesPanel } from './Util/RulesPanel.jsx';

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
          <div className="tab-bar">
            <button
              className={activeTab === 'live' ? 'active' : ''}
              onClick={() => setActiveTab('live')}
            >
              Live dashboard
            </button>

            <button 
              className={activeTab === 'rules' ? 'active' : ''}
              onClick={() => setActiveTab('rules')}
            >
              Alert rules
            </button>
          </div>
        
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



