const fs = require('fs');
const path = require('path');


const logFilePath = path.join(__dirname, 'logs.txt');

function setupLogger(app) {
  
  const writeLog = (eventText) => {
    const timestamp = new Date().toISOString();
    const logLine = `[${timestamp}] ${eventText}\n`;
    
    
    fs.appendFile(logFilePath, logLine, 'utf8', (err) => {
      if (err) console.error('Крутая ошибка записи лога в файл:', err);
    });
  };

  
  app.on('server:started', (port) => {
    writeLog(`SERVER:STARTED: Порт ${port}`);
  });

  app.on('request:received', (data) => {
    writeLog(`REQUEST:RECEIVED: ${data.method} ${data.url}`);
  });

  app.on('server:stopped', () => {
    writeLog(`SERVER:STOPPED`);
  });
}

module.exports = { setupLogger };
