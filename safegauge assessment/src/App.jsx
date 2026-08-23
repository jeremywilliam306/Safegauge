import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import { useAuth } from './AuthContext.jsx';

function App() {
  const [count, setCount] = useState(0)
  const { user, login } = useAuth();

  return (
    <div>
      <button onClick={() => login('admin', 'safegauge', true)}>Login</button>
      <p>{JSON.stringify(user)}</p>
    </div>
    
  )
}

export default App
