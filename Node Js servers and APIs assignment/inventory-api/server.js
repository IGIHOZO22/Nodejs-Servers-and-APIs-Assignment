const http = require('http');
const fs = require('fs');
const url = require('url');

const PORT = 3000;
const DATA_FILE = 'items.json';

// Ensure items.json exists
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const method = req.method;

    // Set the response header
    res.setHeader('Content-Type', 'application/json');

    // Route handling
    if (parsedUrl.pathname === '/items' && method === 'GET') {
        getAllItems(req, res);
    } else if (parsedUrl.pathname === '/items' && method === 'POST') {
        createItem(req, res);
    } else if (parsedUrl.pathname.startsWith('/items/') && method === 'GET') {
        const id = parsedUrl.pathname.split('/')[2];
        getOneItem(req, res, id);
    } else if (parsedUrl.pathname.startsWith('/items/') && method === 'PUT') {
        const id = parsedUrl.pathname.split('/')[2];
        updateItem(req, res, id);
    } else if (parsedUrl.pathname.startsWith('/items/') && method === 'DELETE') {
        const id = parsedUrl.pathname.split('/')[2];
        deleteItem(req, res, id);
    } else {
        res.writeHead(404);
        res.end(JSON.stringify({ message: 'Not Found' }));
    }
});

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
function getAllItems(req, res) {
    const items = JSON.parse(fs.readFileSync(DATA_FILE));
    res.writeHead(200);
    res.end(JSON.stringify(items));
}
function createItem(req, res) {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString(); // Convert buffer to string
    });

    req.on('end', () => {
        const newItem = JSON.parse(body);
        const items = JSON.parse(fs.readFileSync(DATA_FILE));

        // Assign an ID
        newItem.id = items.length ? items[items.length - 1].id + 1 : 1;
        items.push(newItem);

        fs.writeFileSync(DATA_FILE, JSON.stringify(items));
        res.writeHead(201);
        res.end(JSON.stringify(newItem));
    });
}
function getOneItem(req, res, id) {
    const items = JSON.parse(fs.readFileSync(DATA_FILE));
    const item = items.find(i => i.id == id);

    if (item) {
        res.writeHead(200);
        res.end(JSON.stringify(item));
    } else {
        res.writeHead(404);
        res.end(JSON.stringify({ message: 'Item Not Found' }));
    }
}
function updateItem(req, res, id) {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString(); // Convert buffer to string
    });

    req.on('end', () => {
        const updatedItem = JSON.parse(body);
        const items = JSON.parse(fs.readFileSync(DATA_FILE));
        const index = items.findIndex(i => i.id == id);

        if (index !== -1) {
            updatedItem.id = id; // Ensure the ID remains the same
            items[index] = updatedItem;
            fs.writeFileSync(DATA_FILE, JSON.stringify(items));
            res.writeHead(200);
            res.end(JSON.stringify(updatedItem));
        } else {
            res.writeHead(404);
            res.end(JSON.stringify({ message: 'Item Not Found' }));
        }
    });
}
function deleteItem(req, res, id) {
    // Parse items.json file
    const items = JSON.parse(fs.readFileSync(DATA_FILE)); 

    // Find the index of the item to delete
    const index = items.findIndex((i) => i.id == id);

    // If the item exists, delete it
    if (index !== -1) {
        items.splice(index, 1); // Remove item from array
        if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([])); // Only reset if the file doesn't exist
}

        res.writeHead(204); // No Content
        res.end();
    } else {
        res.writeHead(404); // Not Found
        res.end(JSON.stringify({ message: 'Item not Found' }));
    }
}