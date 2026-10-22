import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'NOVA MART - Siêu Thị Mua Sắm Trực Tuyến Đa Năng',
  description: 'Khám phá hàng ngàn sản phẩm công nghệ, gia dụng thông minh, phụ kiện thời trang chính hãng với ưu đãi tốt nhất và giao hàng siêu tốc.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
