export function sensorIdsForCount(count) {
    const ids = [];
    for (let i = 0; i < count; i++) {
        const prefix = i % 2 === 0 ? 'PT' : 'TT';
        ids.push(`${prefix}-${String(i + 1).padStart(2, '0')}`);
    }
    return ids;
}