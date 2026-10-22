import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { reason } = body;

    if (!reason || !reason.trim()) {
      return NextResponse.json({ success: false, message: 'Vui lòng cung cấp lý do đổi/trả hàng' }, { status: 400 });
    }

    const order = db.requestReturn(id, reason.trim());
    if (!order) {
      return NextResponse.json({ success: false, message: 'Không tìm thấy đơn hàng' }, { status: 404 });
    }

    return NextResponse.json({ success: true, order, message: 'Đã gửi yêu cầu đổi/trả hàng thành công' });
  } catch (error) {
    console.error('API Return Request POST error:', error);
    return NextResponse.json({ success: false, message: 'Lỗi gửi yêu cầu hoàn trả' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, adminResponse = '' } = body;

    if (!status || (status !== 'approved' && status !== 'rejected')) {
      return NextResponse.json({ success: false, message: 'Trạng thái không hợp lệ (approved hoặc rejected)' }, { status: 400 });
    }

    const order = db.resolveReturnRequest(id, status, adminResponse);
    if (!order) {
      return NextResponse.json({ success: false, message: 'Không tìm thấy đơn hàng hoặc đơn chưa có yêu cầu' }, { status: 404 });
    }

    return NextResponse.json({ success: true, order, message: `Đã ${status === 'approved' ? 'chấp thuận' : 'từ chối'} yêu cầu đổi trả` });
  } catch (error) {
    console.error('API Return Request PATCH error:', error);
    return NextResponse.json({ success: false, message: 'Lỗi xử lý yêu cầu hoàn trả' }, { status: 500 });
  }
}
