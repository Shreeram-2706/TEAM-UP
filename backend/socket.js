const { Server } = require('socket.io');
let io;

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
    },
  });
  return io;
};

const getIo = () => io;

const emitPostEvent = (event, data) => {
  if (io) io.emit(event, data);
};

module.exports = { initializeSocket, getIo, emitPostEvent };
