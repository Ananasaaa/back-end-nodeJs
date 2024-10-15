const http = require('http');
const fs = require('fs');
const path = './data.txt';
let items = [];

if (!fs.existsSync(path)) {
    fs.writeFileSync(path, JSON.stringify(items), 'utf8'); 
}

function readData() {
    const data = fs.readFileSync(path, 'utf8');
    return JSON.parse(data || '[]'); 
}
function writeData(data) {
    fs.writeFileSync(path, JSON.stringify(data), 'utf8'); 
}

const server = http.createServer((req, res) => {
    const { method, url } = req;
    res.setHeader('Content-Type', 'application/json');

    if (method === 'GET' && url === '/items') {
        items = readData(); 
        res.writeHead(200);
        res.end(JSON.stringify(items));

    } else if (method === 'POST' && url === '/items') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const { name } = JSON.parse(body); 
            items = readData(); 
            const newItem = {
                id: items.length ? items[items.length - 1].id + 1 : 1, 
                name
            };
            items.push(newItem); 
            writeData(items); 
            res.writeHead(201);
            res.end(JSON.stringify(items)); 
        });

    } else if (method === 'PUT' && url.startsWith('/items/')) {
        const id = parseInt(url.split('/')[2], 10); 
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const { name } = JSON.parse(body); 
            items = readData(); 
            const item = items.find(i => i.id === id); 
            if (item) {
                item.name = name; 
                writeData(items); 
                res.writeHead(200);
                res.end(JSON.stringify(item)); 
            } else {
                res.writeHead(404);
                res.end(JSON.stringify({ message: 'Item not found' }));
            }
        });

    } else if (method === 'DELETE' && url.startsWith('/items/')) {
        const id = parseInt(url.split('/')[2], 10); 
        items = readData(); 
        const index = items.findIndex(i => i.id === id);
        if (index !== -1) {
            items.splice(index, 1); 
            writeData(items);
            res.writeHead(204); 
            res.end();
        } else {
            res.writeHead(404);
            res.end(JSON.stringify({ message: 'Item not found' }));
        }
    
    } else {
        res.writeHead(404);
        res.end(JSON.stringify({ message: 'Not found' }));
    }
});

server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
