/**
 * server.js — HTTP + Socket.io bootstrap.
 * Keeping this separate from app.js makes testing easier.
 */
require('dotenv').config();
const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const initSockets = require('./sockets');

const PORT = process.env.PORT || 3000;

(async () => {
  await connectDB();

  const server = http.createServer(app);
  const io = initSockets(server);
  app.set('io', io); // controllers can emit via req.app.get('io')

  server.listen(PORT, () => {
    console.log(`🚀  Smart Notes running on http://localhost:${PORT}`);
  });

  // Graceful shutdown
  process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION:', err);
    server.close(() => process.exit(1));
  });
})();
