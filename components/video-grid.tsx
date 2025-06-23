import { VideoItem } from '@/lib/api';
import VideoCard from './video-card';

interface VideoGridProps {
  videos: VideoItem[];
  title?: string;
  size?: 'small' | 'medium' | 'large';
}

export default function VideoGrid({ videos, title, size = 'medium' }: VideoGridProps) {
  if (!videos || videos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">暂无视频内容</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {title && (
        <h2 className="text-2xl font-bold text-white">{title}</h2>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 3xl:grid-cols-7 4xl:grid-cols-8 5xl:grid-cols-9 6xl:grid-cols-10 gap-4 md:gap-6">
        {videos.map((video) => (
          <VideoCard key={video.vod_id} video={video} size={size} />
        ))}
      </div>
    </div>
  );
}