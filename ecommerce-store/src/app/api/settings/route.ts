import { NextResponse } from 'next/server';
import { db, POPULAR_BANKS } from '@/lib/db';

export async function GET() {
  try {
    const settings = db.getSettings();
    const webhookLogs = db.getWebhookLogs();
    return NextResponse.json({
      success: true,
      settings,
      popularBanks: POPULAR_BANKS,
      webhookLogs
    });
  } catch (error) {
    console.error('Lỗi lấy cấu hình ngân hàng:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi khi tải cấu hình' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const updated = db.updateSettings(body);
    return NextResponse.json({
      success: true,
      message: 'Cập nhật cấu hình ngân hàng thành công',
      settings: updated
    });
  } catch (error) {
    console.error('Lỗi cập nhật cấu hình ngân hàng:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi khi lưu cấu hình' },
      { status: 500 }
    );
  }
}
