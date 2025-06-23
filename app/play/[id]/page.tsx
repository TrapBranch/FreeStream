import { getVideoDetails } from '@/lib/api';
import PlayPageClient from '@/components/play-page-client';
import { notFound } from 'next/navigation';

interface PlayPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ episode?: string; source?: string }>;
}

export default async function PlayPage({ params, searchParams }: PlayPageProps) {
  const { id: videoId } = await params;
  const { episode, source } = await searchParams;

  try {
    const response = await getVideoDetails(videoId);
    const video = response.list?.[0];
    
    if (!video) {
      notFound();
    }

    const initialEpisode = episode ? parseInt(episode) : 1;
    const initialSource = source ? parseInt(source) : 0;

    return (
      <PlayPageClient 
        video={video} 
        initialEpisode={initialEpisode}
        initialSource={initialSource}
      />
    );
  } catch (error) {
    console.error('Error fetching video details:', error);
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">播放页面加载失败</h1>
          <p className="text-muted-foreground">无法加载视频播放页面，请稍后再试</p>
        </div>
      </div>
    );
  }
}

// export async function generateStaticParams() {
//   // During build time, we can't access external APIs reliably
//   // Return some common video IDs as fallback
//   return [
//     { id: '1' },
//     { id: '2' },
//     { id: '3' },
//     { id: '4' },
//     { id: '5' },
//     { id: '78467' },
//     { id: '78468' },
//     { id: '78469' },
//     { id: '78470' },
//     { id: '78471' },
//   ];
// } 