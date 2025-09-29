import { NextRequest, NextResponse } from 'next/server';
import { listDatabases } from '@/lib/notion';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing token' }, { status: 401 });
    }
    
    const token = authHeader.slice(7);
    const databases = await listDatabases(token);
    
    return NextResponse.json(databases);
  } catch (error) {
    console.error('Databases error:', error);
    return NextResponse.json({ error: 'Failed to fetch databases' }, { status: 500 });
  }
}
