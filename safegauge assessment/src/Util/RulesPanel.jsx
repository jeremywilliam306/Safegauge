import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext.jsx';
import { api } from '../Util/apiClient.js';
import { sensorIdsForCount } from '../Util/sensors.js';

export function RulesPanel({ device }) {
    const { token } = useAuth();
    const [rules, setRules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [sensorId, setSensorId] = useState('');
    const [op, setOp] = useState('>');
    const [threshold, setThreshold] = useState('');
    const [severity, setSeverity] = useState('warn');
    const [fieldErrors, setFieldErrors] = useState({});
    const [formError, setFormError] = useState(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setLoading(true);
        api.rules.list(token, device.id)
            .then(setRules)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [token, device.id]);

    const handleDelete = async (id) => {
        try {
            await api.rules.remove(token, id);
            setRules((prev) => prev.filter((r) => r.id !== id));
        } catch (err) {
            setError(err.message);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setFormError(null);
        setFieldErrors({});

        try {
            const newRule = await api.rules.create(token, {
                deviceId: device.id,
                sensorId,
                op,
                threshold: Number(threshold),
                severity,
            });

            setRules((prev) => [...prev, newRule]);
            setSensorId('');
            setThreshold('');
        } catch (err) {
            if (err.status === 422) {
                setFieldErrors(err.body);
            } else {
                setFormError(err.message);
            }
        } finally {
            setSaving(false);
        }
    };

    const sensorOptions = sensorIdsForCount(device.sensorCount);

    if (loading) return <p>Loading rules...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return(
        <div>
            <h3>Alert rules for {device.name}</h3>

            {rules.length === 0 ? (
                <p>No rules yet.</p>
            ):(
                <ul className="rules-list"> 
                    {rules.map((rule) => (
                        <li key={rule.id}>
                            {rule.sensorId} {rule.op} {rule.threshold} ({rule.severity})
                            <button onClick={() => handleDelete(rule.id)}>Delete</button>
                        </li>
                    ))}
                </ul>
            )}

            <form onSubmit={handleSubmit}>
                <select value={sensorId} onChange={(e) => setSensorId(e.target.value)} required>
                    <option value="">Select a sensor...</option>
                    {sensorOptions.map((id) => (
                        <option key={id} value={id}>{id}</option>
                    ))}
                </select>
                {fieldErrors.sensorId && <p style={{ color: 'red'}}>{fieldErrors.sensorId}</p>}

                <select value={op} onChange={(e) => setOp(e.target.value)}>
                    <option value=">">&gt;</option>
                    <option value="<">&lt;</option>
                </select>

                <input
                    type="number"
                    placeholder="Threshold"
                    value={threshold}
                    onChange={(e) => setThreshold(e.target.value)}
                />
                {fieldErrors.threshold && <p style={{ color: 'red' }}>{fieldErrors.threshold}</p>}

                <select value={severity} onChange={(e) => setSeverity(e.target.value)}>
                    <option value="warn">Warn</option>
                    <option value="critical">Critical</option>
                </select>

                {formError && <p style={{ color: 'red' }}>{formError}</p>}
                
                <button type="submit" disabled={saving}>
                    {saving ? 'Adding...' : 'Add rule'}
                </button>
            </form>
        </div>
    );
}