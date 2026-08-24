import { useState } from 'react';
import { useAuth } from '../AuthContext.jsx';
import { api } from '../Util/apiClient.js';

export function DeviceForm ({onCreated}) {
    const { token } = useAuth();
    const [name, setName] = useState ('');
    const [site, setSite] = useState ('');
    const [sensorCount, setSensorCount] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setFieldErrors({});

        try {
            const newDevice = await api.devices.create (token, {
                name,
                site,
                sensorCount: Number(sensorCount),
            });

            onCreated (newDevice);

            setName('');
            setSite('');
            setSensorCount('');
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
            {loading ? 'Adding...' : 'Add device'}
        </button>
        </form>
    );
}