import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order = db.getOrderById(id);
    if (!order) {
      return NextResponse.json({ success: false, message: 'Không tìm thấy đơn hàng' }, { status: 404 });
    }
    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('API Order GET by ID error:', error);
    return NextResponse.json({ success: false, message: 'Lỗi tải thông tin đơn hàng' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, paymentStatus } = body;

    const updated = db.updateOrderStatus(id, status, paymentStatus);
    if (!updated) {
      return NextResponse.json({ success: false, message: 'Không tìm thấy đơn hàng để cập nhật' }, { status: 404 });
    }
    return NextResponse.json({ success: true, order: updated });
  } catch (error) {
    console.error('API Order PATCH error:', error);
    return NextResponse.json({ success: false, message: 'Lỗi cập nhật trạng thái đơn hàng' }, { status: 500 });
  }
}
