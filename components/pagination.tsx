'use client';

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
}

export default function Pagination({ currentPage, totalPages, basePath }: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams as any);
    params.set('page', page.toString());
    return `${basePath}?${params.toString()}`;
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      router.push(createPageUrl(page));
    }
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <Button
        variant="outline"
        size="sm"
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage <= 1}
        className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
      >
        <ChevronLeft className="h-4 w-4" />
        上一页
      </Button>
      
      <div className="flex items-center gap-1">
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          let page: any;
          if (totalPages <= 5) {
            page = i + 1;
          } else if (currentPage <= 3) {
            page = i + 1;
          } else if (currentPage >= totalPages - 2) {
            page = totalPages - 4 + i;
          } else {
            page = currentPage - 2 + i;
          }
          
          return (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => goToPage(page)}
              className={currentPage === page 
                ? "bg-blue-600 text-white" 
                : "bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
              }
            >
              {page}
            </Button>
          );
        })}
      </div>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
      >
        下一页
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}