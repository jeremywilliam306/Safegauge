import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext.jsx';
import { api } from '../Util/apiClient.js';
import { DeviceForm } from './DeviceForm.jsx';


export function DeviceList({ onSelect }){
    const {token} = useAuth();
    const [devices, setDevice] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingDevice, setEditingDevice] = useState(null);

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

    const handleSaved = (saved) => {
        setDevice((prev) => {
            const exists = prev.some((d) => d.id === saved.id);
            return exists
                ? prev.map((d) => (d.id === saved.id ? saved : d))
                : [...prev, saved];
        });
        setEditingDevice(null);
    };

    if (loading) return <p>Loading devices...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>

    return (
        <div>
            <DeviceForm 
                onSaved={handleSaved} 
                editingDevice={editingDevice}
                onCancelEdit={() => setEditingDevice(null)}
            />

            {devices.length === 0 ? (
                <p>No devices yet.</p>
            ): (
    
        <ul className="device-list">
            {devices.map((device) => (
            <li key={device.id} className="device-card" onClick={() => onSelect(device)}>
            {device.name} - {device.site} ({device.sensorCount} sensors)
            <button onClick={(e) => { e.stopPropagation(); setEditingDevice(device); }}>Edit</button>
            <button onClick={(e) => { e.stopPropagation(); handleDelete(device.id); }}>Delete</button>
            </li>
            ))}
        </ul>
            )}
        </div>
    );

}