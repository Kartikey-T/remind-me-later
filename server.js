const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const remindersFile = path.join(__dirname, 'reminders.json');

// Ensure reminders.json exists
if (!fs.existsSync(remindersFile)) {
  fs.writeFileSync(remindersFile, JSON.stringify([]));
}

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/api/reminders') {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const { date, time, message, method } = JSON.parse(body);

        if (!date || !time || !message || !method) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'All fields are required' }));
        }

        const dateTime = new Date(`${date}T${time}`);
        const newReminder = { id: Date.now(), dateTime, message, method };

        const existing = JSON.parse(fs.readFileSync(remindersFile, 'utf-8'));
        existing.push(newReminder);
        fs.writeFileSync(remindersFile, JSON.stringify(existing, null, 2));

        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Reminder saved', reminder: newReminder }));

      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid request or server error' }));
      }
    });

  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not Found' }));
  }
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
