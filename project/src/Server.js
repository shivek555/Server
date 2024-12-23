const http = require('http');
const fs = require('fs');
const url = require('url');
const port = 3010;
const path = require('path');
const uuid = require('uuid');

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const filePath = path.join(__dirname, parsedUrl.pathname);

  if (req.url === '/register' && req.method === 'POST') {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
    });
    req.on('end', () => {
      try {
        const userData = JSON.parse(data);
        const jsonData = fs.readFileSync('data.json');
        const storedData = JSON.parse(jsonData);

        const existingUser = storedData.find(user => user.email === userData.email);
        if (existingUser) {
          res.writeHead(409, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Email already registered' }));
          return;
        }

        const id = uuid.v4();
        storedData.push({ id, ...userData });
        fs.writeFileSync('data.json', JSON.stringify(storedData));
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'User registered successfully', id }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Error registering user' }));
      }
    });
  } else if (req.url === '/find' && req.method === 'POST') {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
    });
    req.on('end', () => {
      try {
        const emailData = JSON.parse(data);
        const jsonData = fs.readFileSync('data.json');
        const storedData = JSON.parse(jsonData);
        const user = storedData.find((user) => user.email === emailData.email);
        if (user) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'User found', id: user.id }));
        } else {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'User not found' }));
        }
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Error finding user' }));
      }
    });
  } else if (req.url === '/' && req.method === 'GET') {
    fs.readFile('index.html', (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Error: File not found');
      } else {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
      }
    });
  } else if (req.url === '/data.json' && req.method === 'GET') {
    fs.readFile('data.json', (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Error: File not found');
      } else {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(data);
      }
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Error: Page not found');
  }
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

fs.writeFile('index.html', `
  <html>
    <head>
      <title>Registration Form</title>
      <style>
        body {
          font-family: Arial, sans-serif;
        }
        form {
          width: 50%;
          margin: 40px auto;
          padding: 20px;
          border: 1px solid #ccc;
          border-radius: 10px;
          box-shadow: 0 0 10px rgba(0, 0,  0, 0.1);
        }
        label {
          display: block;
          margin-bottom: 10px;
        }
        input[type="text"], input[type="email"], input[type="password"] {
          width: 100%;
          height: 40px;
          margin-bottom: 20px;
          padding: 10px;
          border: 1px solid #ccc;
        }
        input[type="submit"] {
          width: 100%;
          height: 40px;
          background-color: #4CAF50;
          color: #fff;
          padding: 10px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        }
        input[type="submit"]:hover {
          background-color: #3e8e41;
        }
      </style>
    </head>
    <body>
      <h1>Registration Form</h1>
      <form id="register-form">
        <label for="name">Name:</label>
        <input type="text" id="name" name="name"><br><br>
        <label for="email">Email:</label>
        <input type="email" id="email" name="email"><br><br>
        <label for="password">Password:</label>
        <input type="password" id="password" name="password"><br><br>
        <input type="submit" value="Register">
      </form>
      <form id="find-form">
        <label for="find-email">Email:</label>
        <input type="email" id="find-email" name="email"><br><br>
        <input type="submit" value="Find">
      </form>
      <script>
        const registerForm = document.getElementById('register-form');
        registerForm.addEventListener('submit', (e) => {
          e.preventDefault();
          const name = document.getElementById('name').value;
          const email = document.getElementById('email').value;
          const password = document.getElementById('password').value;
          const userData = { name, email, password };
          fetch('/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
          })
          .then((res) => res.json())
          .then((data) => alert(JSON.stringify(data)))
          .catch((err) => console.error(err));
        });

        const findForm = document.getElementById('find-form');
        findForm.addEventListener('submit', (e) => {
          e.preventDefault();
          const email = document.getElementById('find-email').value;
          const emailData = { email };
          fetch('/find', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(emailData)
          })
          .then((res) => res.json())
          .then((data) => alert(JSON.stringify(data)))
          .catch((err) => console.error(err));
        });
      </script>
    </body>
  </html>
`, (err) => {
  if (err) {
    console.error(err);
  }
});

fs.writeFile('data.json', '[]', (err) => {
  if (err) {
    console.error(err);
  }
});