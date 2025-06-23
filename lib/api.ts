export interface VideoItem {
  vod_id: number;
  vod_name: string;
  vod_pic: string;
  vod_remarks: string;
  vod_time: string;
  vod_year: string;
  vod_area: string;
  vod_lang: string;
  vod_actor: string;
  vod_director: string;
  vod_content: string;
  vod_play_url: string;
  vod_play_from: string;
  type_id: number;
  type_name: string;
}

export interface ApiResponse {
  code: number;
  msg: string;
  page: number;
  pagecount: number;
  limit: string;
  total: number;
  list: VideoItem[];
  class?: CategoryItem[];
}

export interface CategoryItem {
  type_id: number;
  type_name: string;
  type_pid: number;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://jszyapi.com/api.php/provide/vod/';

// 统一的 fetch 封装函数
async function apiRequest(url: string, options: RequestInit = {}): Promise<ApiResponse> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });


    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();

      try {
        const data = JSON.parse(text);
        return data;
      } catch (error) {
      }
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.error("🚀 ~ apiRequest ~ error:", error)
    // 返回一个默认的错误响应
    return {
      code: 0,
      msg: error instanceof Error ? error.message : 'Unknown error',
      page: 1,
      pagecount: 1,
      limit: '20',
      total: 0,
      list: [],
      class: []
    };
  }
}

export async function getLatestVideos(page: number = 1, limit?: number): Promise<ApiResponse> {
  const params = new URLSearchParams({
    ac: 'videolist',
    pg: page.toString()
  });

  if (limit) {
    params.append('limit', limit.toString());
  }

  return apiRequest(`${API_BASE}?${params.toString()}`, {
    cache: 'no-store'
  });
}

export async function getVideosByCategory(categoryId: string, page: number = 1, limit?: number): Promise<ApiResponse> {
  const params = new URLSearchParams({
    ac: 'videolist',
    t: categoryId,
    pg: page.toString()
  });

  if (limit) {
    params.append('limit', limit.toString());
  }


  return apiRequest(`${API_BASE}?${params.toString()}`, {
    cache: 'no-store'
  });
}

export async function getVideoDetails(videoId: string): Promise<ApiResponse> {
  return apiRequest(`${API_BASE}?ac=videolist&ids=${videoId}`, {
    cache: 'no-store'
  });
}

export async function searchVideos(query: string, page: number = 1, limit?: number): Promise<ApiResponse> {
  const params = new URLSearchParams({
    ac: 'videolist',
    wd: query,
    pg: page.toString()
  });

  if (limit) {
    params.append('limit', limit.toString());
  }

  return apiRequest(`${API_BASE}?${params.toString()}`, {
    cache: 'no-store'
  });
}

export async function getCategories(): Promise<ApiResponse> {
  try {
    const data = await apiRequest(`${API_BASE}`, {
      cache: 'force-cache'
    });

    // 如果 API 请求失败，返回默认分类
    if (data.code === 0 || !data.class || data.class.length === 0) {
      return {
        code: 1,
        msg: 'fallback',
        page: 1,
        pagecount: 1,
        limit: '20',
        total: 5,
        list: [],
        class: [
          { type_id: 1, type_name: '电影', type_pid: 0 },
          { type_id: 2, type_name: '电视剧', type_pid: 0 },
          { type_id: 3, type_name: '综艺', type_pid: 0 },
          { type_id: 4, type_name: '动漫', type_pid: 0 },
          { type_id: 5, type_name: '纪录片', type_pid: 0 }
        ]
      };
    }

    return data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    // Return a fallback response
    return {
      code: 1,
      msg: 'fallback',
      page: 1,
      pagecount: 1,
      limit: '20',
      total: 5,
      list: [],
      class: [
        { type_id: 1, type_name: '电影', type_pid: 0 },
        { type_id: 2, type_name: '电视剧', type_pid: 0 },
        { type_id: 3, type_name: '综艺', type_pid: 0 },
        { type_id: 4, type_name: '动漫', type_pid: 0 },
        { type_id: 5, type_name: '纪录片', type_pid: 0 }
      ]
    };
  }
}

export async function getRecentVideos(hours: number = 24, page: number = 1, limit?: number): Promise<ApiResponse> {
  const params = new URLSearchParams({
    ac: 'videolist',
    h: hours.toString(),
    pg: page.toString()
  });

  if (limit) {
    params.append('limit', limit.toString());
  }

  return apiRequest(`${API_BASE}?${params.toString()}`, {
    cache: 'no-store'
  });
}

// New method for client-side fetching with better error handling
export async function fetchVideos(params: {
  page?: number;
  categoryId?: string;
  query?: string;
  hours?: number;
  limit?: number;
}): Promise<ApiResponse> {
  const urlParams = new URLSearchParams({
    ac: 'videolist',
    pg: (params.page || 1).toString()
  });

  if (params.categoryId) {
    urlParams.append('t', params.categoryId);
  }

  if (params.query) {
    urlParams.append('wd', params.query);
  }

  if (params.hours) {
    urlParams.append('h', params.hours.toString());
  }

  if (params.limit) {
    urlParams.append('limit', params.limit.toString());
  }

  return apiRequest(`${API_BASE}?${urlParams.toString()}`, {
    cache: 'no-store'
  });
}

