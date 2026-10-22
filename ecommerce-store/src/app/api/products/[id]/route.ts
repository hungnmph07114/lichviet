import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = db.getProductById(id);
    if (!product) {
      return NextResponse.json({ success: false, message: 'Không tìm thấy sản phẩm' }, { status: 404 });
    }
    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error('API Product GET by ID error:', error);
    return NextResponse.json({ success: false, message: 'Lỗi máy chủ' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updated = db.updateProduct(id, body);
    if (!updated) {
      return NextResponse.json({ success: false, message: 'Không tìm thấy sản phẩm để cập nhật' }, { status: 404 });
    }
    return NextResponse.json({ success: true, product: updated });
  } catch (error) {
    console.error('API Product PUT error:', error);
    return NextResponse.json({ success: false, message: 'Lỗi cập nhật sản phẩm' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = db.deleteProduct(id);
    if (!success) {
      return NextResponse.json({ success: false, message: 'Không tìm thấy sản phẩm để xóa' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Đã xóa sản phẩm thành công' });
  } catch (error) {
    console.error('API Product DELETE error:', error);
    return NextResponse.json({ success: false, message: 'Lỗi xóa sản phẩm' }, { status: 500 });
  }
}
