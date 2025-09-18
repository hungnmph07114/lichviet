import React, { useState, useEffect } from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface LoadingViewProps {
  messages: readonly string[];
}

export const LoadingView: React.FC<LoadingViewProps> = ({ messages }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (messages.length <= 1) return;

    const intervalId = setInterval(() => {
      setIsVisible(false); // Start fade out
      setTimeout(() => {
        setCurrentIndex(prevIndex => (prevIndex + 1) % messages.length);
        setIsVisible(true); // Start fade in
      }, 500); // Corresponds to transition duration
    }, 4000); // 3.5s display time + 0.5s fade out animation

    return () => clearInterval(intervalId);
  }, [messages.length]);

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <LoadingSpinner />
      <p 
        className={`mt-4 text-slate-300 transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        aria-live="polite"
      >
        {messages[currentIndex]}
      </p>
    </div>
  );
};
