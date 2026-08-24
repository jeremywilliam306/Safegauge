import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext.jsx';
import { api } from '../Util/apiClient.js';

export function DeviceList(){
    const {token} = useAuth();
    const [devices, setDevice] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        api.devices.list(token)
        .then(setDevice)
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }, [token]);

    const handleDelete = async (id) =>{
        try {
            await api.devices.remove(token, id);
            setDevice((prev) => prev.filter((d) => d.id !== id));
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) return <p>Loading devices...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>
    if (devices.length === 0) return <p>No devices yet.</p>;

    return (
        <ul>
            {devices.map((device) => (
            <li key={device.id}> 
            {device.name} - {device.site} ({device.sensorCount} sensors)
            <button onClick={() => handleDelete(device.id)}>Delete</button>
            </li>
            ))}
        </ul>
    );

}