'use client';

import { useState, useEffect } from 'react';

const AUTO_PLAY_NEXT_KEY = 'movie-app-auto-play-next';

export function useAutoPlayNext() {
  const [autoPlayNext, setAutoPlayNext] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTO_PLAY_NEXT_KEY);
      if (stored !== null) {
        setAutoPlayNext(JSON.parse(stored));
      }
    } catch (error) {
      console.warn('Failed to load auto play next setting from localStorage:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage when value changes
  const setAutoPlayNextWithStorage = (value: boolean) => {
    setAutoPlayNext(value);
    try {
      localStorage.setItem(AUTO_PLAY_NEXT_KEY, JSON.stringify(value));
    } catch (error) {
      console.warn('Failed to save auto play next setting to localStorage:', error);
    }
  };

  return {
    autoPlayNext,
    setAutoPlayNext: setAutoPlayNextWithStorage,
    isLoaded
  };
} 