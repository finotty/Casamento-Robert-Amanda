import { NextResponse } from 'next/server';
import { Gift } from '@/lib/gifts';

export async function GET() {
  try {
    return NextResponse.json({ gifts: [] });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch gifts' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { gifts } = body;
    
    return NextResponse.json({ success: true, gifts });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save gifts' }, { status: 500 });
  }
}
