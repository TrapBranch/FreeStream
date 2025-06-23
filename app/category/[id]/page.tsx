import { getVideosByCategory, getCategories } from '@/lib/api';
import ClientCategoryPage from '@/components/client-category-page';
import { notFound } from 'next/navigation';

interface CategoryPageProps {
  params: Promise<{ id: string }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { id: categoryId } = await params;

  try {
    // Fetch category data and videos in parallel
    const [categoryResponse, videosResponse] = await Promise.all([
      getCategories(),
      getVideosByCategory(categoryId, 1)
    ]);

    // Find the category name
    const categories = categoryResponse.class || [];
    const category = categories.find(cat => cat.type_id === parseInt(categoryId));
    
    if (!category) {
      notFound();
    }

    const initialVideos = videosResponse.list || [];

    return (
      <div className="min-h-screen bg-background">
        <div className="px-4 lg:px-8 py-8">
          <ClientCategoryPage 
            categoryId={categoryId}
            categoryName={category.type_name}
            initialVideos={initialVideos}
            totalCount={videosResponse.total || 0}
            initialPageCount={videosResponse.pagecount || 1}
            currentPage={1}
          />
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error fetching category data:', error);
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">加载失败</h1>
          <p className="text-muted-foreground">无法加载分类内容，请稍后再试</p>
        </div>
      </div>
    );
  }
}

// export async function generateStaticParams() {
//   // During build time, we can't access external APIs reliably
//   // Return a few common category IDs as fallback
//   return [
//     { id: '1' },
//     { id: '2' },
//     { id: '3' },
//     { id: '4' },
//     { id: '5' },
//     { id: '6' },
//     { id: '7' },
//     { id: '8' },
//     { id: '9' },
//     { id: '10' },
//   ];
// }