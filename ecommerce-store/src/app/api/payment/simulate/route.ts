import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderNumber, amount, provider = 'simulator' } = body;

    if (!orderNumber) {
      return NextResponse.json(
        { success: false, message: 'Thiếu mã đơn hàng để giả lập' },
        { status: 400 }
      );
    }

    const payload = {
      orderNumber,
      amount,
      provider: `sandbox_${provider}`,
      description: `CK thanh toan don hang ${orderNumber}`
    };

    const result = db.processPaymentWebhook(payload, `sandbox_${provider}`);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Lỗi giả lập thanh toán:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi khi giả lập thanh toán' },
      { status: 500 }
    );
  }
}
