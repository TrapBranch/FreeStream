'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Film,
  Search,
  TrendingUp,
  Clock,
  Heart,
  Settings,
  Menu,
  X,
  Tv,
  Zap,
  Star,
  Calendar,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { CategoryItem } from '@/lib/api';

interface CategoryTree {
  parent: CategoryItem;
  children: CategoryItem[];
}

interface SidebarProps {
  categories?: CategoryItem[];
}

export default function Sidebar({ categories = [] }: SidebarProps) {
  // Initialize with localStorage value or default to true, but set immediately to prevent shift
  const [isExpanded, setIsExpanded] = useState(() => {
    // Default to true, will be updated in useEffect if different
    return true;
  });
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [openCategories, setOpenCategories] = useState<number[]>([]);
  const pathname = usePathname();

  // Initialize sidebar state from localStorage and update body class
  useEffect(() => {
    const body = document.body;
    
    // Check localStorage for saved preference (only on client)
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem('sidebar-expanded');
      const shouldExpand = savedState !== null ? JSON.parse(savedState) : true;
      
      // Update state if different from initial
      if (shouldExpand !== isExpanded) {
        setIsExpanded(shouldExpand);
        return; // Let the next useEffect handle the body class
      }
    }
    
    // Set body class immediately to prevent layout shift
    if (isExpanded) {
      body.classList.remove('sidebar-collapsed');
    } else {
      body.classList.add('sidebar-collapsed');
    }
  }, []);

  // 构建分类树结构
  const categoryTree = useMemo(() => {
    const parentCategories = categories.filter(cat => cat.type_pid === 0);
    const childCategories = categories.filter(cat => cat.type_pid !== 0);

    return parentCategories.map(parent => ({
      parent,
      children: childCategories.filter(child => child.type_pid === parent.type_id)
    }));
  }, [categories]);

  // 当前选中的分类ID
  const currentCategoryId = useMemo(() => {
    const match = pathname.match(/^\/category\/(\d+)$/);
    return match ? parseInt(match[1]) : null;
  }, [pathname]);

  // 检查是否是当前选中的分类
  const isCurrentCategory = (categoryId: number) => {
    return currentCategoryId === categoryId;
  };

  // 检查父分类是否包含当前选中的子分类
  const isParentOfCurrent = (parentId: number) => {
    if (!currentCategoryId) return false;
    const currentCategory = categories.find(cat => cat.type_id === currentCategoryId);
    return currentCategory?.type_pid === parentId;
  };

  // 切换分类展开状态
  const toggleCategory = (categoryId: number) => {
    setOpenCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  // 初始化展开状态
  useEffect(() => {
    const initialOpen: number[] = [];

    // 如果有当前选中的分类，展开对应的父分类
    if (currentCategoryId) {
      const currentCategory = categories.find(cat => cat.type_id === currentCategoryId);
      if (currentCategory && currentCategory.type_pid !== 0) {
        initialOpen.push(currentCategory.type_pid);
      }
    }

    // 如果没有选中分类或选中的是父分类，默认展开第一个分类
    if (initialOpen.length === 0 && categoryTree.length > 0) {
      initialOpen.push(categoryTree[0].parent.type_id);
    }

    setOpenCategories(initialOpen);
  }, [currentCategoryId, categories, categoryTree]);

  // Update body class and localStorage when sidebar state changes
  useEffect(() => {
    const body = document.body;
    if (isExpanded) {
      body.classList.remove('sidebar-collapsed');
    } else {
      body.classList.add('sidebar-collapsed');
    }
    
    // Save preference to localStorage (only on client)
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebar-expanded', JSON.stringify(isExpanded));
    }
  }, [isExpanded]);

  // Toggle sidebar function
  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const mainMenuItems = [
    { icon: Home, label: '首页', href: '/' },
    // { icon: TrendingUp, label: '热门', href: '/trending' },
    { icon: Search, label: '搜索', href: '/search' },
    // { icon: Clock, label: '最近观看', href: '/history' },
    // { icon: Heart, label: '我的收藏', href: '/favorites' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Menu Toggle */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="fixed top-4 left-4 z-50 bg-background/20 backdrop-blur-xl rounded-xl text-foreground lg:hidden border border-border/30 hover:bg-background/30 transition-all duration-300 w-8 h-8 flex items-center justify-center"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Sidebar */}
      <div className={cn(
        "bg-background backdrop-blur-xl dark:backdrop-blur-none border-r border-border/30 transition-all duration-500 ease-in-out overflow-hidden",
        // Desktop behavior - completely fixed, full height, doesn't scroll with page
        "hidden lg:flex lg:flex-col lg:fixed lg:left-0 lg:top-0 lg:h-screen lg:z-20",
        isExpanded ? "lg:w-64" : "lg:w-16",
        // Mobile behavior - fixed overlay
        isMobileOpen && "fixed inset-y-0 left-0 w-64 z-50 flex flex-col lg:hidden bg-background/95 backdrop-blur-2xl dark:backdrop-blur-none"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 h-16 border-b border-border/10 flex-shrink-0">
          <div className={cn(
            "flex items-center gap-3 transition-all duration-300",
            (isExpanded || isMobileOpen) ? "opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden lg:opacity-0 lg:w-0"
          )}>
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <Film className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-medium text-foreground text-lg whitespace-nowrap">影视</span>
          </div>

          {/* Desktop toggle */}
          <button
            onClick={toggleSidebar}
            className="cursor-pointer hidden lg:block p-1.5 hover:bg-muted rounded-lg transition-all duration-300 text-muted-foreground hover:text-foreground flex-shrink-0"
          >
            {isExpanded ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>

          {/* Mobile close */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-1.5 hover:bg-muted rounded-lg transition-all duration-300 text-muted-foreground hover:text-foreground flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation - scrollable content */}
        <div className="flex-1 overflow-y-auto py-2 scrollbar-hide">
          {/* Main Menu */}
          <div className="px-2 mb-4">
            <nav className="space-y-1">
              {mainMenuItems.map((item) => {
                const isActive = pathname === item.href;
                const showText = isExpanded || isMobileOpen;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 group relative",
                      isActive
                        ? "bg-primary/20 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/80",
                      !showText && "lg:justify-center lg:px-2"
                    )}
                    title={!showText ? item.label : undefined}
                    onClick={() => setIsMobileOpen(false)}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    <span className={cn(
                      "transition-all duration-300 whitespace-nowrap",
                      showText ? "opacity-100 w-auto" : "hidden opacity-0 w-0 overflow-hidden lg:opacity-0 lg:w-0"
                    )}>
                      {item.label}
                    </span>
                    {/* Tooltip for collapsed state on desktop */}
                    {!isExpanded && (
                      <div className="hidden lg:block absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 border shadow-md">
                        {item.label}
                      </div>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Separator */}
          {(isExpanded || isMobileOpen) && <div className="mx-4 h-px bg-border mb-4" />}

          {/* Categories with hierarchical structure */}
          {categories.length > 0 && (
            <div className="px-2">
              <div className={cn(
                "px-3 mb-2 transition-all duration-300",
                (isExpanded || isMobileOpen) ? "opacity-100 h-auto" : "opacity-0 h-0 overflow-hidden lg:opacity-0 lg:h-0"
              )}>
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  分类
                </h3>
              </div>

              <nav className="space-y-1">
                {/* 如果有层级结构，显示二级菜单 */}
                {categoryTree.length > 0 && categoryTree.some(group => group.children.length > 0) ? (
                  categoryTree.map((categoryGroup) => {
                    const isOpen = openCategories.includes(categoryGroup.parent.type_id);
                    const hasChildren = categoryGroup.children.length > 0;
                    const isParentActive = isParentOfCurrent(categoryGroup.parent.type_id);
                    const isCurrentParent = isCurrentCategory(categoryGroup.parent.type_id);
                    const showText = isExpanded || isMobileOpen;

                    return (
                      <div key={categoryGroup.parent.type_id} className="space-y-1">
                        {/* 父分类 */}
                        <Collapsible
                          open={isOpen}
                          onOpenChange={() => hasChildren && showText && toggleCategory(categoryGroup.parent.type_id)}
                        >
                          <div className="flex items-center gap-1">
                            {/* 父分类链接 */}
                            <Link
                              href={`/category/${categoryGroup.parent.type_id}`}
                              className="flex-1"
                              onClick={() => setIsMobileOpen(false)}
                            >
                              <div className={cn(
                                "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-xl transition-all duration-200 group relative",
                                isCurrentParent || isParentActive
                                  ? "bg-primary/20 text-primary"
                                  : "text-muted-foreground hover:text-foreground hover:bg-muted/80",
                                !showText && "lg:justify-center lg:px-2"
                              )}>
                                <Film className="h-4 w-4 flex-shrink-0" />
                                <span className={cn(
                                  "transition-all duration-300 whitespace-nowrap truncate",
                                  showText ? "opacity-100 w-auto" : "hidden opacity-0 w-0 overflow-hidden lg:opacity-0 lg:w-0"
                                )}>
                                  {categoryGroup.parent.type_name}
                                </span>
                                {/* Tooltip for collapsed state on desktop */}
                                {!isExpanded && (
                                  <div className="hidden lg:block absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 border shadow-md">
                                    {categoryGroup.parent.type_name}
                                  </div>
                                )}
                              </div>
                            </Link>

                            {/* 展开/收起按钮 */}
                            {hasChildren && showText && (
                              <CollapsibleTrigger asChild>
                                <button
                                  className={cn(
                                    "cursor-pointer p-1 rounded-full transition-all duration-200 hover:bg-muted flex-shrink-0 hover:scale-110",
                                    isCurrentParent || isParentActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                                  )}
                                >
                                  <ChevronRight 
                                    className={cn(
                                      "h-3 w-3 collapsible-trigger-icon transition-transform duration-300 ease-out",
                                      isOpen && "rotate-90"
                                    )}
                                  />
                                </button>
                              </CollapsibleTrigger>
                            )}
                          </div>

                                                    {/* 子分类 */}
                          {hasChildren && showText && (
                            <CollapsibleContent className="collapsible-content space-y-1 pl-4">
                              <div className="space-y-1 pt-2 pb-1">
                                {categoryGroup.children.map((child, index) => {
                                  const categoryIcons = [Tv, Zap, Star, Calendar, Settings, TrendingUp, Heart];
                                  const IconComponent = categoryIcons[child.type_id % categoryIcons.length];
                                  
                                  return (
                                    <Link 
                                      key={child.type_id} 
                                      href={`/category/${child.type_id}`}
                                      onClick={() => setIsMobileOpen(false)}
                                      className={cn(
                                        "flex items-center gap-2 px-2 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 group relative transform hover:scale-[1.02]",
                                        isCurrentCategory(child.type_id)
                                          ? "bg-primary/20 text-primary shadow-sm"
                                          : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                                      )}
                                      style={{
                                        animationDelay: `${index * 50}ms`,
                                        animation: isOpen ? 'fadeInUp 0.3s ease-out forwards' : 'none'
                                      }}
                                    >
                                      <IconComponent className="h-3 w-3 flex-shrink-0" />
                                      <span className="whitespace-nowrap truncate">
                                        {child.type_name}
                                      </span>
                                    </Link>
                                  );
                                })}
                              </div>
                            </CollapsibleContent>
                          )}
                        </Collapsible>
                      </div>
                    );
                  })
                ) : (
                  /* 如果没有层级结构，直接显示所有分类 */
                  categories.map((category) => {
                    const isActive = pathname === `/category/${category.type_id}`;
                    const categoryIcons = [Tv, Film, Zap, Star, Calendar, Settings, TrendingUp, Heart];
                    const IconComponent = categoryIcons[category.type_id % categoryIcons.length];
                    const showText = isExpanded || isMobileOpen;

                    return (
                      <Link
                        key={category.type_id}
                        href={`/category/${category.type_id}`}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-xl transition-all duration-200 group relative",
                          isActive
                            ? "bg-primary/20 text-primary"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/80",
                          !showText && "lg:justify-center lg:px-2"
                        )}
                        title={!showText ? category.type_name : undefined}
                        onClick={() => setIsMobileOpen(false)}
                      >
                        <IconComponent className="h-4 w-4 flex-shrink-0" />
                        <span className={cn(
                          "transition-all duration-300 whitespace-nowrap truncate",
                          showText ? "opacity-100 w-auto" : "hidden opacity-0 w-0 overflow-hidden lg:opacity-0 lg:w-0"
                        )}>
                          {category.type_name}
                        </span>
                        {/* Tooltip for collapsed state on desktop */}
                        {!isExpanded && (
                          <div className="hidden lg:block absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 border shadow-md">
                            {category.type_name}
                          </div>
                        )}
                      </Link>
                    );
                  })
                )}
              </nav>
            </div>
          )}
        </div>
      </div>
    </>
  );
} 