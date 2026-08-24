import { useState } from 'react';
import { useAuth } from '../AuthContext.jsx';


export function Login() {
    const { login } = useAuth();
    const [username, setUsername] = useState ('');
    const [password, setPassword] = useState ('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    
    const handleSubmit = async(e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        
        try {
            await login(username, password, true);
        } catch (err) {
            setError('Invalid username or password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h1>Safegauge Portal </h1>
            <input
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
        <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
        </button>
    </form>
);
}