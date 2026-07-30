import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

let io = null;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE']
    }
  });

  // Socket Authentication Middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) {
        socket.userId = null;
        socket.userRole = 'guest';
        return next();
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'ecoreward_secret_key_123');
      const user = await User.findById(decoded.id).select('_id name email role');

      if (user) {
        socket.userId = user._id.toString();
        socket.userRole = user.role;
        socket.userName = user.name;
      }
      next();
    } catch (err) {
      console.log('[Socket Auth Note]: Token unverified or expired for socket', socket.id);
      next();
    }
  });

  io.on('connection', (socket) => {
    const userTag = socket.userId ? `${socket.userName} (${socket.userRole} ID: ${socket.userId})` : 'Guest User';
    console.log(`⚡ [Socket Connected] ID: ${socket.id} | ${userTag}`);

    // Join room channels if authenticated
    if (socket.userId) {
      // Personal user room
      socket.join(`user_${socket.userId}`);

      // Role rooms
      if (socket.userRole === 'driver') {
        socket.join('drivers');
        socket.join(`driver_${socket.userId}`);
      } else if (socket.userRole === 'admin') {
        socket.join('admin');
      } else {
        socket.join('users');
      }

      // Notify user socket connection initialized
      socket.emit('socket:ready', {
        status: 'connected',
        userId: socket.userId,
        role: socket.userRole
      });
    }

    // Custom Room Handlers
    socket.on('join_room', (roomName) => {
      if (roomName) {
        socket.join(roomName);
      }
    });

    socket.on('leave_room', (roomName) => {
      if (roomName) {
        socket.leave(roomName);
      }
    });

    // Real-Time Driver GPS Tracking stream
    socket.on('driver:location_stream', (data) => {
      // data: { pickupId, userId, lat, lng, speed, timestamp }
      if (data && data.userId) {
        io.to(`user_${data.userId.toString()}`).emit('driver:location_update', data);
      }
      io.to('admin').emit('driver:location_update', data);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 [Socket Disconnected] ID: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  return io;
};

export const emitToUser = (userId, event, data) => {
  if (io && userId) {
    io.to(`user_${userId.toString()}`).emit(event, data);
  }
};

export const emitToRole = (role, event, data) => {
  if (io && role) {
    io.to(role).emit(event, data);
  }
};

export const broadcastEvent = (event, data) => {
  if (io) {
    io.emit(event, data);
  }
};
