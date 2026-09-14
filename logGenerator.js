const fs = require('fs');

// Possible log levels and messages
const logLevels = ['INFO', 'WARN', 'ERROR'];
const messages = [
    'User logged in',
    'User logged out',
    'Error fetching data',
    'Data saved successfully',
    'Connection lost',
    'Reconnected to server',
    'Unexpected error occurred'
];

// Function to generate a random log entry
function generateRandomLog() {
    const timestamp = new Date().toISOString();
    const level = logLevels[Math.floor(Math.random() * logLevels.length)];
    const message = messages[Math.floor(Math.random() * messages.length)];
    return `${timestamp} [${level}] ${message}`;
}

// Function to write log to console and file
function logToFile() {
    const logEntry = generateRandomLog();
    console.log(logEntry);
    fs.appendFile('randomLogs.txt', logEntry + '\n', (err) => {
        if (err) throw err;
    });
}

// Generate a log entry every 5 seconds
setInterval(logToFile, 5000);
