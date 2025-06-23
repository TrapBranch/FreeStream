import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import Header from '@/components/header';
import Sidebar from '@/components/sidebar';
import { getCategories } from '@/lib/api';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '随看（FreeStream） - 免费在线观看',
  description: '随看，免费在线观看',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch categories for sidebar
  const categoriesResult = await getCategories();
  const categories = categoriesResult.class || [];

  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={`${inter.className} bg-background text-foreground overflow-x-hidden antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          <div className="min-h-screen bg-background">
            {/* Sidebar - fixed on desktop, overlay on mobile */}
            <Sidebar categories={categories as any} />
            
            {/* Main Content - margin handled by CSS in globals.css */}
            <div className="min-h-screen transition-all duration-300 ease-in-out">
              {/* Header */}
              <Header />
              
              {/* Page Content */}
              <main className="bg-background text-foreground">
                {children}
              </main>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}