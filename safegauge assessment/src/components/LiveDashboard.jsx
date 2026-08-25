import { useState, useEffect } from 'react';
import '../Util/sensor-sdk.min.js';

export function LiveDashboard({ device }) {
    const [readings, setReadings] = useState({});
    const [status, setStatus] = useState('disconnected');

    useEffect(() => {
        setReadings({});
        setStatus('disconnected');

        const hub = window.SensorHub.connect({
            sensors: device.sensorCount,
            channelKey: 'demo',
        });

        const offReading = hub.onReading((r) => {
            setReadings((prev) => ({ ...prev, [r.sensorId]: r}));
        });

        const offStatus = hub.onStatus((s) => setStatus(s));

        return () => {
            offReading();
            offStatus();
            hub.disconnect();
    };
}, [device.id, device.sensorCount]);

    return (
        <div>
            <p>Status: {status}</p>
            {Object.values(readings).map((r) => (
                <p key={r.sensorId}>
                    {r.sensorId} ({r.type}): {r.value} {r.unit}
                </p>
            ))}
        </div>
    );
}
