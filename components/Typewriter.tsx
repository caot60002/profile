import React, { useState, useEffect, useRef } from 'react';

interface TypewriterProps {
  text: string;
  speed?: number;
  delay?: number;
  className?: string;
}

const Typewriter: React.FC<TypewriterProps> = ({ text, speed = 50, delay = 1000, className }) => {
  const [displayedText, setDisplayedText] = useState('');
  
  // Refs to handle timeouts clearing
  // Using ReturnType<typeof setTimeout> is environment-agnostic (works in Node and Browser)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // 1. Reset immediately when props change
    setDisplayedText('');
    
    // 2. Clear any existing timers
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);

    // 3. Start the delay timer
    timeoutRef.current = setTimeout(() => {
      let currentIndex = 0;
      
      // 4. Start the typing interval
      intervalRef.current = setInterval(() => {
        // Use slice logic for deterministic rendering.
        // This prevents the "wandeeer" / "4044" bug caused by 
        // state concatenation race conditions.
        if (currentIndex < text.length) {
          currentIndex++;
          setDisplayedText(text.slice(0, currentIndex));
        } else {
          if (intervalRef.current) clearInterval(intervalRef.current);
        }
      }, speed);

    }, delay);

    // Cleanup function
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [text, speed, delay]);

  return (
    <span 
      className={`typing-cursor ${className || ''}`}
      style={{ 
        whiteSpace: 'pre-wrap', 
        wordBreak: 'break-word',
        overflowWrap: 'break-word',
      }}
    >
      {displayedText}
    </span>
  );
};

export default Typewriter;