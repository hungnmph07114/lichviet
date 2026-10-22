import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const customers = db.getCustomers();
    return NextResponse.json({ success: true, count: customers.length, customers });
  } catch (error) {
    console.error('API Customers GET error:', error);
    return NextResponse.json({ success: false, message: 'Lỗi tải danh sách khách hàng' }, { status: 500 });
  }
}
