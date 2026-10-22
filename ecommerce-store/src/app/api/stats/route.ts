import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const stats = db.getStats();
    return NextResponse.json({ success: true, stats });
  } catch (error) {
    console.error('API Stats error:', error);
    return NextResponse.json({ success: false, message: 'Lỗi tải thống kê' }, { status: 500 });
  }
}
