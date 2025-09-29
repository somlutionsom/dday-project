import { NextRequest, NextResponse } from 'next/server';
import { validateToken } from '@/lib/notion';
import { encodeConfig } from '@/lib/store';

export async function POST(request: NextRequest) {
  try {
    const { token, dbId, imageProp, dateProp } = await request.json();
    
    const isValid = await validateToken(token);
    if (!isValid) {
      return NextResponse.json({ ok: false, error: 'Invalid token' }, { status: 401 });
    }
    
    // URL에서 문제되는 문자 방지를 위해 Base64URL 인코딩 사용
    const cfg = encodeConfig({
      token,
      dbId,
      imageProp,
      dateProp,
      createdAt: new Date()
    });
    
    const baseUrl = process.env.BASE_URL || `${request.headers.get('x-forwarded-proto') || 'http'}://${request.headers.get('host')}`;
    const embedUrl = `${baseUrl}/u/${cfg}`;
    
    return NextResponse.json({ ok: true, cfg, embedUrl });
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
