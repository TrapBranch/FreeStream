'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EpisodePaginationProps {
  totalEpisodes: number;
  currentPage: number;
  episodesPerPage: number;
  onPageChange: (page: number) => void;
}

export default function EpisodePagination({
  totalEpisodes,
  currentPage,
  episodesPerPage,
  onPageChange
}: EpisodePaginationProps) {
  const totalPages = Math.ceil(totalEpisodes / episodesPerPage);

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-between mb-4 bg-black/20 backdrop-blur-xl rounded-xl p-3 border border-white/10">
      <Button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 0}
        variant="ghost"
        size="sm"
        className="text-white hover:bg-white/20 bg-white/10 backdrop-blur-sm rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <div className="flex items-center gap-2 flex-1 justify-center">
        {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
          let pageIndex;
          if (totalPages <= 7) {
            pageIndex = i;
          } else if (currentPage <= 3) {
            pageIndex = i;
          } else if (currentPage >= totalPages - 4) {
            pageIndex = totalPages - 7 + i;
          } else {
            pageIndex = currentPage - 3 + i;
          }
          
          const isCurrentPage = pageIndex === currentPage;
          const startEp = pageIndex * episodesPerPage + 1;
          const endEp = Math.min((pageIndex + 1) * episodesPerPage, totalEpisodes);
          
          return (
            <Button
              key={pageIndex}
              onClick={() => onPageChange(pageIndex)}
              variant="ghost"
              size="sm"
              className={`text-xs px-2 py-1 h-8 min-w-12 rounded-lg transition-all duration-200 ${
                isCurrentPage 
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white border border-white/20 shadow-lg" 
                  : "text-gray-300 hover:text-white hover:bg-white/20 bg-white/5"
              }`}
              title={`第${startEp}-${endEp}集`}
            >
              {startEp}-{endEp}
            </Button>
          );
        })}
      </div>
      
      <Button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages - 1}
        variant="ghost"
        size="sm"
        className="text-white hover:bg-white/20 bg-white/10 backdrop-blur-sm rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
} 