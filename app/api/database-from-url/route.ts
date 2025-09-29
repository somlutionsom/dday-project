import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseFromUrl } from '@/lib/notion';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing token' }, { status: 401 });
    }
    const token = authHeader.slice(7);

    const database = await getDatabaseFromUrl(token, url);
    return NextResponse.json(database);
  } catch (error: any) {
    console.error('Database from URL error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch database from URL' }, { status: 500 });
  }
}
