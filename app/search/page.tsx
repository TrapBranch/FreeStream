import { searchVideos } from '@/lib/api';
import ClientSearchPage from '@/components/client-search-page';
import SearchHistoryPage from '@/components/search-history-page';

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q: query = '' } = await searchParams;

  if (!query) {
    return (
      <div className="min-h-screen bg-background">
        <div className="px-4 lg:px-8 py-8">
          <SearchHistoryPage />
        </div>
      </div>
    );
  }

  try {
    const searchResponse = await searchVideos(query, 1);
    const initialVideos = searchResponse.list || [];  

    return (
      <div className="min-h-screen bg-background">
        <div className="px-4 lg:px-8 py-8">
          <ClientSearchPage 
            query={query}
            initialVideos={initialVideos}
            totalCount={searchResponse.total || 0}
            initialPageCount={searchResponse.pagecount || 1}
            currentPage={1}
          />
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error fetching search results:', error);
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">搜索失败</h1>
          <p className="text-muted-foreground">无法完成搜索，请稍后再试</p>
        </div>
      </div>
    );
  }
}