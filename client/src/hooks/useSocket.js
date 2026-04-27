import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import useNotificationStore from '../store/notificationStore';
import useAuthStore from '../store/authStore';

export const useSocket = () => {
  const socketRef = useRef(null);
  const { user } = useAuthStore();
  const { addNotification } = useNotificationStore();

  useEffect(() => {
    if (!user) return;

    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    socketRef.current = io(socketUrl, {
      auth: { token: localStorage.getItem('token') },
      transports: ['websocket', 'polling'],
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      socket.emit('join-room', user.id || user._id);
    });

    socket.on('notification', (data) => {
      addNotification(data);
      toast(data.message, {
        icon: data.type === 'badge_earned' ? '🏆' : data.type === 'expiry_warning' ? '⚠️' : '🔔',
      });
    });

    socket.on('new-listing', (data) => {
      toast.success(`New food available nearby: ${data.title}`, { icon: '🍽️' });
    });

    socket.on('claim-received', (data) => {
      toast.success('Someone claimed your food listing!', { icon: '🎉' });
      addNotification({ type: 'claim_received', title: 'Claim Received', message: data.message, isRead: false });
    });

    socket.on('claim-accepted', () => {
      toast.success('Your claim was accepted!', { icon: '✅' });
    });

    socket.on('badge-earned', (data) => {
      toast.success(`Badge earned: ${data.name} ${data.icon}`, { duration: 5000 });
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  return socketRef.current;
};
