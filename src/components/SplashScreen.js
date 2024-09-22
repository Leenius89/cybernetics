import React, { useState, useEffect } from 'react';
import './SplashScreen.css';

const SplashScreen = ({ imageUrl, onFinish }) => {
  const [isFullScreen, setIsFullScreen] = useState(true);

  useEffect(() => {
    const shrinkTimer = setTimeout(() => {
      setIsFullScreen(false);
    }, 2000);

    const finishTimer = setTimeout(() => {
      onFinish();
    }, 3000);

    return () => {
      clearTimeout(shrinkTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div className={`splash-container ${isFullScreen ? 'full-screen' : ''}`}>
      <img 
        src={imageUrl} 
        alt="Splash Screen"
        className={`splash-image ${isFullScreen ? 'full-screen' : ''}`}
      />
    </div>
  );
};

export default SplashScreen;