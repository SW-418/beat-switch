"use client";

import { useEffect, useState } from 'react';

declare global {
  interface Window {
    MusicKit: any;
  }
}

export function useMusicKit() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if already loaded
    if (window.MusicKit) {
      setIsLoaded(true);
      return;
    }

    // Poll for MusicKit availability
    const checkMusicKit = () => {
      if (window.MusicKit) {
        setIsLoaded(true);
        return true;
      }
      return false;
    };

    // Check immediately
    if (checkMusicKit()) return;

    // Poll every 100ms for up to 10 seconds
    const pollInterval = setInterval(() => {
      if (checkMusicKit()) {
        clearInterval(pollInterval);
      }
    }, 100);

    // Timeout after 10 seconds
    const timeout = setTimeout(() => {
      clearInterval(pollInterval);
      if (!window.MusicKit) {
        setError('MusicKit failed to load');
      }
    }, 10000);

    return () => {
      clearInterval(pollInterval);
      clearTimeout(timeout);
    };
  }, []);

  return { isLoaded, error, musicKit: window.MusicKit };
}