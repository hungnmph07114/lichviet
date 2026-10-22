import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const categories = db.getCategories();
    return NextResponse.json({ success: true, categories });
  } catch (error) {
    console.error('API Categories GET error:', error);
    return NextResponse.json({ success: false, message: 'Lỗi lấy danh mục' }, { status: 500 });
  }
}
