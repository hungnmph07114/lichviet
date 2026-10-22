import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    let orders = db.getOrders();

    if (status && status !== 'all') {
      orders = orders.filter(o => o.status === status);
    }

    if (search) {
      const q = search.toLowerCase().trim();
      orders = orders.filter(o =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.customer.fullName.toLowerCase().includes(q) ||
        o.customer.phone.includes(q)
      );
    }

    return NextResponse.json({ success: true, count: orders.length, orders });
  } catch (error) {
    console.error('API Orders GET error:', error);
    return NextResponse.json({ success: false, message: 'Lỗi tải danh sách đơn hàng' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customer, items, paymentMethod, discountAmount = 0 } = body;

    if (!customer || !customer.fullName || !customer.phone || !customer.address) {
      return NextResponse.json({
        success: false,
        message: 'Vui lòng điền đầy đủ họ tên, số điện thoại và địa chỉ nhận hàng'
      }, { status: 400 });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Giỏ hàng của bạn đang trống'
      }, { status: 400 });
    }

    const subtotal = items.reduce((sum: number, it: { price: number; quantity: number }) => sum + it.price * it.quantity, 0);
    const shippingFee = subtotal >= 500000 ? 0 : 30000;
    const finalTotal = Math.max(0, subtotal + shippingFee - discountAmount);

    const newOrder = db.createOrder({
      customer,
      items,
      subtotal,
      shippingFee,
      discountAmount,
      totalAmount: finalTotal,
      paymentMethod: paymentMethod || 'cod',
      paymentStatus: paymentMethod === 'bank_transfer' ? 'paid' : 'unpaid',
      status: 'pending'
    });

    return NextResponse.json({ success: true, order: newOrder }, { status: 201 });
  } catch (error) {
    console.error('API Orders POST error:', error);
    return NextResponse.json({ success: false, message: 'Lỗi tạo đơn hàng' }, { status: 500 });
  }
}
