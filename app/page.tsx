import { getLatestVideos } from '@/lib/api';
import HeroCarousel from '@/components/hero-carousel';
import ClientHomePage from '@/components/client-home-page';

export default async function HomePage() {
  // Get initial videos for the page
  const data = await getLatestVideos(1);
  const initialVideos = data.list || [];
  const featuredVideos = initialVideos.slice(0, 5);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Carousel */}
      <div className="mb-12">
        <HeroCarousel videos={featuredVideos} />
      </div>

      {/* Main Content with Client-side Infinite Scroll */}
      <div className="px-4 lg:px-8 pb-12">
        <ClientHomePage 
          initialVideos={initialVideos}
          initialPageCount={data.pagecount}
          currentPage={1}
        />
      </div>
    </div>
  );
}