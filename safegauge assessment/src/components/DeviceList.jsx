import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext.jsx';
import { api } from '../Util/apiClient.js';
import { DeviceForm } from './DeviceForm.jsx';


export function DeviceList({ onSelect }){
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

    const handleCreated = (newDevice) => {
        setDevice((prev) => [...prev, newDevice]);
    };

    if (loading) return <p>Loading devices...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>

    return (
        <div>
            <DeviceForm onCreated={handleCreated} />

            {devices.length === 0 ? (
                <p>No devices yet.</p>
            ): (
    
        <ul>
            {devices.map((device) => (
            <li key={device.id} onClick={() => onSelect(device)}>
            {device.name} - {device.site} ({device.sensorCount} sensors)
            <button onClick={(e) => { e.stopPropagation(); handleDelete(device.id); }}>Delete</button>
            </li>
            ))}
        </ul>
            )}
        </div>
    );

}