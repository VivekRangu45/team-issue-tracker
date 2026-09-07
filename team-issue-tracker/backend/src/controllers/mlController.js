const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const predictIssue = (req, res) => {
    const { description } = req.body;
    
    if (!description) {
        return res.status(400).json({ success: false, message: 'Description is required' });
    }

    const scriptPath = path.resolve(__dirname, '../../../ml/prediction/predict.py');

    if (!fs.existsSync(scriptPath)) {
        console.error('ML prediction script not found at:', scriptPath);
        return res.status(500).json({ success: false, message: 'Error running ML prediction' });
    }

    const pythonProcess = spawn(process.env.PYTHON_PATH || 'python', [scriptPath, description]);

    let output = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
    });

    pythonProcess.on('close', (code) => {
        if (code !== 0) {
            console.error('Python Error:', errorOutput);
            return res.status(500).json({ success: false, message: 'Error running ML prediction' });
        }
        
        try {
            const result = JSON.parse(output);
            if (result.error) {
                return res.status(500).json({ success: false, message: result.error });
            }
            res.json({ success: true, data: result });
        } catch (e) {
            console.error('Parse Error:', e, 'Output:', output);
            res.status(500).json({ success: false, message: 'Error parsing ML response' });
        }
    });
};

module.exports = { predictIssue };
