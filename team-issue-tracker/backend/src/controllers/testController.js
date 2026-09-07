const test500 = (req, res) => {
    if (process.env.ENABLE_DEV_TOOLS !== 'true') return res.status(404).json({ success: false, message: 'Not found' });
    res.status(500).json({ success: false, message: 'Simulated internal server error', simulation: true });
};

const testSlow = (req, res) => {
    if (process.env.ENABLE_DEV_TOOLS !== 'true') return res.status(404).json({ success: false, message: 'Not found' });
    setTimeout(() => {
        res.json({ success: true, message: 'Simulated slow API response', simulation: true });
    }, 5000);
};

const testDbError = (req, res) => {
    if (process.env.ENABLE_DEV_TOOLS !== 'true') return res.status(404).json({ success: false, message: 'Not found' });
    res.status(500).json({ success: false, message: 'SQLITE_ERROR: no such table: fake_table', simulation: true });
};

const testInvalidData = (req, res) => {
    if (process.env.ENABLE_DEV_TOOLS !== 'true') return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: { undefinedField: NaN, cyclic: "[Circular]" }, simulation: true });
};

module.exports = { test500, testSlow, testDbError, testInvalidData };
