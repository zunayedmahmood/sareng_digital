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
      // Using compressed frames for high-performance retrieval
      const frames: string[] = Array.from({ length: frameCount }, (_, i) => 
        `/animated_logo_compressed/frame_${String(i + 1).padStart(2, '0')}.webp`
      );
      
      // Preload images for zero-latency switching
      frames.forEach(src => {
        const img = new Image();
        img.src = src;
      });

      let currentFrame = 0;

      const updateIcons = () => {
        if (document.hidden) return;
        
        // Find all potential icon links to tackle Next.js metadata overrides
        const links = document.querySelectorAll("link[rel*='icon']");
        const framePath = frames[currentFrame];
        
        if (links.length > 0) {
          links.forEach(l => {
            (l as HTMLLinkElement).href = framePath;
          });
        } else {
          // Fallback: spawn a new one if registry is empty
          const newLink = document.createElement('link');
          newLink.rel = 'icon';
          newLink.href = framePath;
          document.head.appendChild(newLink);
        }
        
        currentFrame = (currentFrame + 1) % frameCount;
      };

      faviconTimer = setInterval(updateIcons, 125); // 8 FPS
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
