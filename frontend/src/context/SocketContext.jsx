import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [realtimeData, setRealtimeData] = useState({
    latestPickup: null,
    driverLocation: null,
    lastPointsAwarded: null
  });

  const { user, updateUserPoints } = useAuth();
  const { addToast } = useToast();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const SOCKET_URL = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '/';

    const newSocket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    });

    newSocket.on('connect', () => {
      console.log('⚡ [Realtime Socket Connected]:', newSocket.id);
      setIsConnected(true);
    });

    newSocket.on('socket:ready', (data) => {
      console.log('⚡ [Socket Authenticated Channel Joined]:', data);
    });

    // Real-Time In-App Push Notifications
    newSocket.on('notification:new', (notif) => {
      console.log('🔔 [Realtime Notification Received]:', notif);
      if (addToast) {
        const toastType = notif.type === 'points_earned' ? 'reward' : 'success';
        addToast(notif.message, toastType, notif.title);
      }
    });

    // Real-Time User Points Sync
    newSocket.on('points:updated', (data) => {
      console.log('💰 [Realtime Points Updated]:', data);
      if (data.points !== undefined && updateUserPoints) {
        updateUserPoints(data.points);
      }
      if (data.addedPoints) {
        setRealtimeData(prev => ({ ...prev, lastPointsAwarded: data.addedPoints }));
      }
    });

    // Real-Time Pickup Status Updates
    newSocket.on('pickup:updated', (pickup) => {
      console.log('📦 [Realtime Pickup Status Update]:', pickup);
      setRealtimeData(prev => ({ ...prev, latestPickup: pickup }));
    });

    newSocket.on('pickup:created', (pickup) => {
      console.log('✨ [Realtime Pickup Created]:', pickup);
      setRealtimeData(prev => ({ ...prev, latestPickup: pickup }));
    });

    newSocket.on('pickup:new', (pickup) => {
      console.log('🚨 [Realtime Task Broadcast for Driver/Admin]:', pickup);
      setRealtimeData(prev => ({ ...prev, latestPickup: pickup }));
      if (addToast && (user.role === 'driver' || user.role === 'admin')) {
        addToast(`New waste pickup request scheduled for ${pickup.wasteCategory}!`, 'info', 'New Task Available');
      }
    });

    // Real-Time Driver Live GPS Stream
    newSocket.on('driver:location_update', (loc) => {
      setRealtimeData(prev => ({ ...prev, driverLocation: loc }));
    });

    newSocket.on('disconnect', () => {
      console.log('🔌 [Realtime Socket Disconnected]');
      setIsConnected(false);
    });

    window.socket = newSocket;
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
      window.socket = null;
    };
  }, [user?._id]);

  return (
    <SocketContext.Provider value={{ socket, isConnected, realtimeData }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
