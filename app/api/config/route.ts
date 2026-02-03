import { NextResponse } from 'next/server';

export async function GET() {
  try {
    return NextResponse.json({ pixKey: '', qrcode: '' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch config' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { pixKey, qrcode } = body;
    
    return NextResponse.json({ success: true, pixKey, qrcode });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save config' }, { status: 500 });
  }
}
