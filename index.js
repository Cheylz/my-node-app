const http = require('http'); 
const { EventEmitter } = require('events');
const logger = require('./logger');

class AppServer extends EventEmitter{
    constructor() {
        super()
        this.server = null;
    }

    start(port)
    {
        this.server = http.createServer((req, res) => {
            this.emit('request:received', {url: req.url, method: req.method});

            res.writeHead(200, {'Content-type' : 'text/plain; charset=utf-8'});
            res.end('Привет, мир!');
        });

        this.server.listen(port,() =>
        {
            this.emit('server:started', port);
        });
    }

    stop()
    {
        if(this.server)
        {
            this.server.close(() =>
            {
                this.emit('server:stopped');
            });
        }
    }
}


const app = new AppServer();

logger.setupLogger(app);

app.on('server:started', (port) => {
    console.log(`Сервер запущен на http://localhost:${port}`); 
    
});

app.on('request:received', (data) => {
  console.log(` Получен запрос: ${data.method} ${data.url}`);
});

app.on('server:stopped', () => {
  console.log('Сервер остановлен');
});


app.start(3000);

