import React, { useEffect } from 'react';

interface NotificationProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

const Notification: React.FC<NotificationProps> = ({ 
  message, 
  isVisible, 
  onClose, 
  duration = 4000 
}) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose, duration]);

  return (
    <div
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] transition-all duration-300 ${
        isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform -translate-y-full'
      }`}
    >
      <div className="bg-white/80 backdrop-blur-sm px-6 py-3 rounded-lg shadow-lg border border-gray-200 relative overflow-hidden">
        <p className="text-gray-700 font-medium">{message}</p>
        <div 
          className="absolute bottom-0 left-0 h-1 bg-blue-500 transition-all duration-300"
          style={{ 
            width: isVisible ? '100%' : '0%',
            transition: `width ${duration}ms linear`,
            borderBottomRightRadius: '0.5rem',
            borderBottomLeftRadius: '0.5rem'
          }}
        />
      </div>
    </div>
  );
};

export default Notification;
