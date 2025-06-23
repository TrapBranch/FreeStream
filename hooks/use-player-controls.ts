import { useState, useEffect, useRef } from 'react';

interface UsePlayerControlsProps {
  isFullscreen: boolean;
  showEpisodes: boolean;
  isBuffering: boolean;
}

export function usePlayerControls({ isFullscreen, showEpisodes, isBuffering }: UsePlayerControlsProps) {
  const [showControls, setShowControls] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mouseMoveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      if (mouseMoveTimeoutRef.current) {
        clearTimeout(mouseMoveTimeoutRef.current);
      }
    };
  }, []);

  // Mouse enter handler
  const handleMouseEnter = () => {
    setShowControls(true);
    setShowCursor(true);
    // Clear any existing timeout when mouse enters
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (mouseMoveTimeoutRef.current) {
      clearTimeout(mouseMoveTimeoutRef.current);
    }
  };

  // Mouse leave handler
  const handleMouseLeave = () => {
    // In normal mode (not fullscreen), hide immediately when mouse leaves
    if (!isFullscreen && !showEpisodes) {
      setShowControls(false);
      setShowCursor(true); // Always show cursor when not in fullscreen
    }
  };

  // Mouse move handler (for fullscreen mode)
  const handleMouseMove = () => {
    // Only handle mouse move in fullscreen mode
    if (isFullscreen) {
      setShowControls(true);
      setShowCursor(true);
      
      // Clear the previous mouse move timeout
      if (mouseMoveTimeoutRef.current) {
        clearTimeout(mouseMoveTimeoutRef.current);
      }
      
      // Set a new timeout to hide controls and cursor after mouse stops moving
      mouseMoveTimeoutRef.current = setTimeout(() => {
        if (!showEpisodes && !isBuffering) {
          setShowControls(false);
          setShowCursor(false);
        }
      }, 3000);
    }
  };

  // Handle episodes list toggle
  const handleEpisodesToggle = (currentShowEpisodes: boolean) => {
    const newShowEpisodes = !currentShowEpisodes;
    
    // When episodes list is open, always show cursor
    if (newShowEpisodes) {
      setShowCursor(true);
      // Clear any pending hide timeout
      if (mouseMoveTimeoutRef.current) {
        clearTimeout(mouseMoveTimeoutRef.current);
      }
    }
    
    return newShowEpisodes;
  };

  // Handle fullscreen state change
  const handleFullscreenChange = (isNowFullscreen: boolean) => {
    // When exiting fullscreen, always show cursor
    if (!isNowFullscreen) {
      setShowCursor(true);
    }
  };

  return {
    showControls,
    showCursor,
    handleMouseEnter,
    handleMouseLeave,
    handleMouseMove,
    handleEpisodesToggle,
    handleFullscreenChange,
  };
} 