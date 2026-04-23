'use client';

import { useEffect } from 'react';

export default function TabManager() {
  useEffect(() => {
    const defaultTitle = "Sareng Digital";
    const awayTitle = "Sareng: Just For You";
    const playIcons = ["💾", "🖱️", "🎧", "⌨️", "🖥️"];
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

    // --- Efficient Frame-based Favicon Animation ---
    const animateFavicon = () => {
      const frameCount = 16;
      const frames: string[] = Array.from({ length: frameCount }, (_, i) => 
        `/animated_logo/frame_${String(i + 1).padStart(2, '0')}.webp`
      );
      
      // Preload images for zero-latency switching
      frames.forEach(src => {
        const img = new Image();
        img.src = src;
      });

      let currentFrame = 0;
      const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!link) return;

      const runLoop = () => {
        faviconTimer = setInterval(() => {
          if (document.hidden) return;
          
          link.href = frames[currentFrame];
          currentFrame = (currentFrame + 1) % frameCount;
        }, 125); // 8 FPS
      };

      runLoop();
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
