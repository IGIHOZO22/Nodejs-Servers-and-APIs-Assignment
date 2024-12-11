const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
    let filePath = path.join(__dirname, 'Public', req.url === '/' ? 'index.html' : req.url);

    // Get file extension to handle the content type
    const extname = path.extname(filePath);
    let contentType = 'text/html';

    // Serve only .html files
    if (extname && extname !== '.html') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
        return;
    }

    // Serve the file
    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                // File not found, serve 404.html
                fs.readFile(path.join(__dirname, 'Public', '404.html'), (error, data) => {
                    res.writeHead(404, { 'Content-Type': 'text/html' });
                    res.end(data, 'utf-8');
                });
            } else {
                // Server error
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('500 Internal Server Error');
            }
        } else {
            // Success, serve the content
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

const PORT = 5000;
server.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
