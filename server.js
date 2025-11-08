// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(express.json());

let scoreData = { teamA: 0, teamB: 0 };

// Receive POST from ESP32
app.post('/api/score', (req, res) => {
  const { team, score } = req.body;
  if (team === 'A') scoreData.teamA = score;
  if (team === 'B') scoreData.teamB = score;

  io.emit('scoreUpdate', scoreData); // broadcast to all web clients
  res.json({ status: 'ok', scoreData });
});

// Serve a simple test webpage
app.get('/', (req, res) => {
  res.send(`
    <h1>Live Scoreboard</h1>
    <div>Team A: <span id="a">0</span></div>
    <div>Team B: <span id="b">0</span></div>
    <script src="https://cdn.socket.io/4.6.1/socket.io.min.js"></script>
    <script>
      const socket = io();
      socket.on('scoreUpdate', s => {
        document.getElementById('a').textContent = s.teamA;
        document.getElementById('b').textContent = s.teamB;
      });
    </script>
  `);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log('Server running on port ' + PORT));
