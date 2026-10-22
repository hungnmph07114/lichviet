import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const logs = db.getWebhookLogs();
    const settings = db.getSettings();
    return NextResponse.json({
      status: 'active',
      webhookUrl: '/api/payment/webhook',
      provider: settings.webhookProvider,
      recentLogs: logs.slice(0, 10)
    });
  } catch (error) {
    return NextResponse.json({ status: 'error', message: 'Lỗi tải logs webhook' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('[PAYMENT WEBHOOK RECEIVED]:', JSON.stringify(body));

    // Nhận diện header hoặc provider nếu có
    const userAgent = request.headers.get('user-agent') || '';
    let provider = 'generic';
    if (userAgent.includes('PayOS') || body.data?.orderCode) {
      provider = 'payos';
    } else if (userAgent.includes('Casso') || Array.isArray(body.data)) {
      provider = 'casso';
    }

    const result = db.processPaymentWebhook(body, provider);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        orderNumber: result.order?.orderNumber,
        status: result.order?.status
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: result.message
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('[PAYMENT WEBHOOK ERROR]:', error);
    return NextResponse.json(
      { success: false, message: 'Dữ liệu webhook không hợp lệ' },
      { status: 400 }
    );
  }
}
