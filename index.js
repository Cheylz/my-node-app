const http = require('http'); 

const server = http.createServer((req, res) => { 
res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }); 
res.write('<h1>Мандрыкин Никита Александрович</h1>');
res.write('<h1>Группа 478</h1>');

const pi = Math.PI.toFixed(11);
res.write(`<h1>${pi}</h1>`);

res.end();
}); 
const PORT = 3000; 
server.listen(PORT, () => { 
console.log(`Сервер запущен на http://localhost:${PORT}`); 
});