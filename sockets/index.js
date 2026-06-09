const { Server } = require('socket.io');

module.exports = function initSockets(httpServer) {
  const io = new Server(httpServer, { cors: { origin: '*' } });

  io.on('connection', (socket) => {
    // Clients join a room scoped to their userId for private updates.
    socket.on('join', (userId) => {
      if (userId) socket.join(`user:${userId}`);
    });
  });

  return io;
};

// Helper to emit note updates from controllers:
//   req.app.get('io').to(`user:${userId}`).emit('note:updated', note);
