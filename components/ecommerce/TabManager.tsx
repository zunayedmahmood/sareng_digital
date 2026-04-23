'use client';

import { useEffect } from 'react';

export default function TabManager() {
  useEffect(() => {
    const defaultTitle = "Sareng Digital";
    const awayTitle = "Sareng: Just For You";
    const playIcons = ["✨", "🏛️", "⚜️", "📦", "🕊️"];
    let iconIndex = 0;
    let timer: NodeJS.Timeout;
    let faviconTimer: NodeJS.Timeout;

    const updateTitle = () => {
      if (document.hidden) {
        document.title = awayTitle;
        clearInterval(timer);
      } else {
        timer = setInterval(() => {
          if (!document.hidden) {
            document.title = `${defaultTitle} ${playIcons[iconIndex]}`;
            iconIndex = (iconIndex + 1) % playIcons.length;
          }
        }, 2500);
        document.title = `${defaultTitle} ${playIcons[iconIndex]}`;
      }
    };

    // --- Playful Favicon Animation ---
    const animateFavicon = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = new Image();
      img.src = '/logo.png';
      
      let angle = 0;
      faviconTimer = setInterval(() => {
        if (document.hidden) return;
        
        ctx.clearRect(0, 0, 32, 32);
        
        // Draw the original logo
        ctx.drawImage(img, 2, 2, 28, 28);
        
        // Add a playful rotating "sparkle" or dot
        ctx.save();
        ctx.translate(16, 16);
        ctx.rotate((angle * Math.PI) / 180);
        ctx.fillStyle = '#C5A059'; // Gold
        ctx.beginPath();
        ctx.arc(14, 0, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        
        // Update favicon
        const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
        if (link) {
          link.href = canvas.toDataURL('image/png');
        }
        
        angle = (angle + 10) % 360;
      }, 100);
    };

    const handleVisibility = () => {
      clearInterval(timer);
      updateTitle();
    };

    document.addEventListener("visibilitychange", handleVisibility);
    updateTitle();
    animateFavicon();

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      clearInterval(timer);
      clearInterval(faviconTimer);
    };
  }, []);

  return null;
}
