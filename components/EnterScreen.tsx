import React, { useState } from 'react';

interface EnterScreenProps {
  onEnter: () => void;
}

const EnterScreen: React.FC<EnterScreenProps> = ({ onEnter }) => {
  const [clicked, setClicked] = useState(false);
  const [visible, setVisible] = useState(true);

  const handleClick = () => {
    if (clicked) return;
    setClicked(true);
    setTimeout(() => {
        onEnter();
        setVisible(false);
    }, 500); // Wait for fade out animation
  };

  if (!visible) return null;

  return (
    <div 
      onClick={handleClick}
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black cursor-pointer transition-opacity duration-500 ease-in-out ${clicked ? 'opacity-0' : 'opacity-100'}`}
    >
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-white opacity-25 blur group-hover:opacity-50 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
        <h1 className="relative text-white font-mono text-xl sm:text-2xl tracking-[0.2em] font-bold select-none glitch-hover z-10">
          CLICK TO ENTER
        </h1>
      </div>
      
      {/* Background hint */}
      <div className="absolute bottom-10 text-white/20 text-xs font-mono">
        EST. 2024
      </div>
    </div>
  );
};

export default EnterScreen;