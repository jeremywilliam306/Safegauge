import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext.jsx';
import { api } from '../Util/apiClient.js';

export function DeviceForm ({onSaved, editingDevice, onCancelEdit}) {
    const { token } = useAuth();
    const [name, setName] = useState ('');
    const [site, setSite] = useState ('');
    const [sensorCount, setSensorCount] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (editingDevice) {
            setName(editingDevice.name);
            setSite(editingDevice.site);
            setSensorCount(String(editingDevice.sensorCount));
        } else {
            setName('');
            setSite('');
            setSensorCount('');
        }
        setFieldErrors({});
        setError(null);
    }, [editingDevice]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setFieldErrors({});

        const body = { name, site, sensorCount: Number(sensorCount) };
       
       try {
        const saved = editingDevice
            ? await api.devices.update(token, editingDevice.id, body)
            : await api.devices.create(token, body);

        onSaved(saved);

        if (!editingDevice) {
            setName('');
            setSite('');
            setSensorCount('');
            }
        }   catch (err) {
            if (err.status === 422) {
                setFieldErrors(err.body);
            } else {
                setError(err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
        />
        {fieldErrors.name && <p style={{ color: 'red' }}>{fieldErrors.name}</p>}

            <input
                placeholder="Site"
                value={site}
                onChange={(e) => setSite(e.target.value)}
        />
        {fieldErrors.site && <p style={{ color: 'red' }}>{fieldErrors.site}</p>}

            <input
                type="number"
                placeholder="Sensor count"
                value={sensorCount}
                onChange={(e) => setSensorCount(e.target.value)}
        />
        {fieldErrors.sensorCount && <p style={{ color: 'red' }}>{fieldErrors.sensorCount}</p>}

        {error && <p style= {{color: 'red'}}>{error}</p>}       
        

        <button type="submit" disabled={loading}>
            {loading ? 'Saving...' : editingDevice ? 'Save changes' : 'Add device'}
        </button>
        {editingDevice && (
            <button type="button" onClick={onCancelEdit}>Cancel</button>
        )}
        </form>
    );
}