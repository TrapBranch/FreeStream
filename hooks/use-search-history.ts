'use client';

import { useState, useEffect } from 'react';

interface SearchHistoryItem {
  query: string;
  timestamp: number;
}

const SEARCH_HISTORY_KEY = 'movie-app-search-history';
const MAX_HISTORY_ITEMS = 10;

export function useSearchHistory() {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SEARCH_HISTORY_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setHistory(Array.isArray(parsed) ? parsed : []);
      }
    } catch (error) {
      console.error('Error loading search history:', error);
    }
  }, []);

  // Add a new search query to history
  const addToHistory = (query: string) => {
    if (!query.trim()) return;
    
    const trimmedQuery = query.trim();
    const timestamp = Date.now();
    
    setHistory(prev => {
      // Remove existing entry if it exists
      const filtered = prev.filter(item => item.query !== trimmedQuery);
      
      // Add new entry at the beginning
      const newHistory = [{ query: trimmedQuery, timestamp }, ...filtered];
      
      // Keep only the latest MAX_HISTORY_ITEMS
      const limited = newHistory.slice(0, MAX_HISTORY_ITEMS);
      
      // Save to localStorage
      try {
        localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(limited));
      } catch (error) {
        console.error('Error saving search history:', error);
      }
      
      return limited;
    });
  };

  // Remove a specific item from history
  const removeFromHistory = (query: string) => {
    setHistory(prev => {
      const filtered = prev.filter(item => item.query !== query);
      
      // Save to localStorage
      try {
        localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(filtered));
      } catch (error) {
        console.error('Error saving search history:', error);
      }
      
      return filtered;
    });
  };

  // Clear all history
  const clearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(SEARCH_HISTORY_KEY);
    } catch (error) {
      console.error('Error clearing search history:', error);
    }
  };

  // Get recent search queries as strings
  const getRecentQueries = (limit?: number) => {
    const queries = history.map(item => item.query);
    return limit ? queries.slice(0, limit) : queries;
  };

  return {
    history,
    addToHistory,
    removeFromHistory,
    clearHistory,
    getRecentQueries
  };
} 