import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseFromUrl } from '@/lib/notion';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const token = authHeader.replace('Bearer ', '');
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json({ error: 'Database URL is required' }, { status: 400 });
    }
    
    const database = await getDatabaseFromUrl(token, url);
    
    return NextResponse.json(database);
  } catch (error) {
    console.error('Error getting database from URL:', error);
    return NextResponse.json({ 
      error: 'Failed to access database. Please check the URL and ensure the API has access to this database.' 
    }, { status: 500 });
  }
}
