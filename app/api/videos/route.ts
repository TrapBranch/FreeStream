import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.API_BASE || process.env.NEXT_PUBLIC_API_BASE;
export async function GET(request: NextRequest) {
  try {
    // Get search parameters directly from request
    const searchParams = request.nextUrl.searchParams;
    
    // Forward all query parameters
    const params = new URLSearchParams();
    searchParams.forEach((value, key) => {
      params.append(key, value);
    });

    // Always add ac=videolist if not present
    if (!params.has('ac')) {
      params.set('ac', 'videolist');
    }

    const apiUrl = `${API_BASE}?${params.toString()}`;
    console.log('Fetching from:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      },
    });

    if (!response.ok) {
      console.error('API response not ok:', response.status, response.statusText);
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    console.log('API response received, data length:', data.list?.length || 0);
    
    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('API proxy error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch data', 
        code: 500, 
        msg: error instanceof Error ? error.message : 'Internal server error',
        timestamp: new Date().toISOString()
      },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
        }
      }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
} 