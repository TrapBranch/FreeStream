import { getVideoDetails, getVideosByCategory } from '@/lib/api';
import VideoPageClient from '@/components/video-page-client';
import { notFound } from 'next/navigation';

interface VideoPageProps {
  params: Promise<{ id: string }>;
}

export default async function VideoPage({ params }: VideoPageProps) {
  const { id: videoId } = await params;

  try {
    const response = await getVideoDetails(videoId);
    const video = response.list?.[0];
    
    if (!video) {
      notFound();
    }

    // Get related videos from the same category
    let relatedVideos: any[] = [];
    if (video.type_id) {
      try {
        const relatedResponse = await getVideosByCategory(video.type_id.toString(), 1, 10);
        relatedVideos = relatedResponse.list?.filter(v => v.vod_id !== video.vod_id) || [];
      } catch (error) {
        console.error('Error fetching related videos:', error);
      }
    }

    return <VideoPageClient video={video} relatedVideos={relatedVideos} />;
  } catch (error) {
    console.error('Error fetching video details:', error);
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">视频加载失败</h1>
          <p className="text-gray-400">无法加载视频详情，请稍后再试</p>
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