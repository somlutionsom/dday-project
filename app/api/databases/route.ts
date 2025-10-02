import { NextRequest, NextResponse } from 'next/server';
import { listDatabases } from '@/lib/notion';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const token = authHeader.replace('Bearer ', '');
    
    const databases = await listDatabases(token);
    
    return NextResponse.json(databases);
  } catch (error) {
    console.error('Error listing databases:', error);
    return NextResponse.json({ error: 'Failed to list databases' }, { status: 500 });
  }
}
