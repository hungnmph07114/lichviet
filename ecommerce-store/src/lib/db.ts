import fs from 'fs';
import path from 'path';
import { Product, Category, Order, Customer, DashboardStats, BankSettings, PaymentWebhookLog } from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

export const POPULAR_BANKS = [
  { id: 'MB', name: 'MB Bank - Ngân hàng Quân Đội', shortName: 'MB Bank', bin: '970422' },
  { id: 'VCB', name: 'Vietcombank - Ngân hàng Ngoại Thương', shortName: 'Vietcombank', bin: '970436' },
  { id: 'TCB', name: 'Techcombank - Ngân hàng Kỹ Thương', shortName: 'Techcombank', bin: '970407' },
  { id: 'ACB', name: 'ACB - Ngân hàng Á Châu', shortName: 'ACB', bin: '970416' },
  { id: 'VPB', name: 'VPBank - Ngân hàng Việt Nam Thịnh Vượng', shortName: 'VPBank', bin: '970432' },
  { id: 'ICB', name: 'VietinBank - Ngân hàng Công Thương', shortName: 'VietinBank', bin: '970415' },
  { id: 'BIDV', name: 'BIDV - Ngân hàng Đầu tư & Phát triển', shortName: 'BIDV', bin: '970418' },
  { id: 'TPB', name: 'TPBank - Ngân hàng Tiên Phong', shortName: 'TPBank', bin: '970423' },
  { id: 'STB', name: 'Sacombank - Ngân hàng Sài Gòn Thương Tín', shortName: 'Sacombank', bin: '970403' },
  { id: 'VIB', name: 'VIB - Ngân hàng Quốc tế', shortName: 'VIB', bin: '970441' },
  { id: 'MSB', name: 'MSB - Ngân hàng Hàng Hải', shortName: 'MSB', bin: '970426' },
  { id: 'OCB', name: 'OCB - Ngân hàng Phương Đông', shortName: 'OCB', bin: '970448' },
  { id: 'SHB', name: 'SHB - Ngân hàng Sài Gòn - Hà Nội', shortName: 'SHB', bin: '970443' }
];

export const DEFAULT_BANK_SETTINGS: BankSettings = {
  bankId: 'MB',
  bankName: 'MB Bank - Ngân hàng Quân Đội',
  accountNumber: '999988886666',
  accountName: 'NOVA MART STORE',
  qrTemplate: 'compact2',
  webhookProvider: 'manual',
  autoConfirmPaid: true
};

interface DatabaseSchema {
  products: Product[];
  categories: Category[];
  orders: Order[];
  settings?: BankSettings;
  webhookLogs?: PaymentWebhookLog[];
}

const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-tech',
    name: 'Điện Tử & Công Nghệ',
    slug: 'dien-tu-cong-nghe',
    iconName: 'Smartphone',
    description: 'Điện thoại, tai nghe, máy tính bảng và phụ kiện công nghệ hàng đầu',
    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80',
    itemCount: 4
  },
  {
    id: 'cat-home',
    name: 'Gia Dụng & Đời Sống',
    slug: 'gia-dung-doi-song',
    iconName: 'Home',
    description: 'Thiết bị thông minh, đồ gia dụng tiện ích cho không gian sống hiện đại',
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80',
    itemCount: 3
  },
  {
    id: 'cat-fashion',
    name: 'Thời Trang & Phụ Kiện',
    slug: 'thoi-trang-phu-kien',
    iconName: 'Watch',
    description: 'Balo chống nước, đồng hồ thể thao và phụ kiện phong cách',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
    itemCount: 3
  },
  {
    id: 'cat-audio',
    name: 'Âm Thanh & Loa Di Động',
    slug: 'am-thanh-loa',
    iconName: 'Headphones',
    description: 'Loa bluetooth chống nước, tai nghe chống ồn chủ động đỉnh cao',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
    itemCount: 3
  }
];

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Tai Nghe Chống Ồn Nova ANC Pro 5.0',
    slug: 'tai-nghe-chong-on-nova-anc-pro',
    category: 'cat-audio',
    price: 1850000,
    originalPrice: 2490000,
    discount: 25,
    stock: 60,
    rating: 4.9,
    reviewsCount: 142,
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Tai nghe chụp tai công nghệ ANC chống ồn chủ động thế hệ mới, pin bền bỉ 40 giờ liên tục, đệm tai thoáng khí cực êm, hỗ trợ sạc nhanh Type-C và mic đàm thoại AI lọc tạp âm.',
    specs: {
      'Thời lượng pin': '40 giờ (tắt ANC) / 30 giờ (bật ANC)',
      'Kết nối': 'Bluetooth 5.3 + AUX 3.5mm',
      'Công nghệ': 'Chống ồn chủ động Hybird ANC',
      'Trọng lượng': '245g',
      'Bảo hành': '12-24 tháng chính hãng'
    },
    options: [
      { name: 'Màu sắc', values: ['Đen Carbon', 'Bạc Ánh Kim'] },
      { name: 'Bảo hành', values: ['12 Tháng (Chuẩn)', '24 Tháng (Vàng)'] }
    ],
    variants: [
      {
        id: 'var-1-1',
        title: 'Đen Carbon / 12 Tháng (Chuẩn)',
        sku: 'NOVA-ANC-BLK-12M',
        price: 1850000,
        originalPrice: 2490000,
        stock: 35,
        options: { 'Màu sắc': 'Đen Carbon', 'Bảo hành': '12 Tháng (Chuẩn)' }
      },
      {
        id: 'var-1-2',
        title: 'Bạc Ánh Kim / 12 Tháng (Chuẩn)',
        sku: 'NOVA-ANC-SLV-12M',
        price: 1890000,
        originalPrice: 2490000,
        stock: 15,
        options: { 'Màu sắc': 'Bạc Ánh Kim', 'Bảo hành': '12 Tháng (Chuẩn)' }
      },
      {
        id: 'var-1-3',
        title: 'Đen Carbon / 24 Tháng (Vàng)',
        sku: 'NOVA-ANC-BLK-24M',
        price: 2050000,
        originalPrice: 2690000,
        stock: 10,
        options: { 'Màu sắc': 'Đen Carbon', 'Bảo hành': '24 Tháng (Vàng)' }
      }
    ],
    isFeatured: true,
    isFlashSale: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-2',
    name: 'Đồng Hồ Thông Minh Titan Active Watch S3',
    slug: 'dong-ho-thong-minh-titan-active-watch-s3',
    category: 'cat-fashion',
    price: 2190000,
    originalPrice: 2890000,
    discount: 24,
    stock: 28,
    rating: 4.8,
    reviewsCount: 89,
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Màn hình AMOLED 1.43 inch siêu nét luôn hiển thị (AOD), đo nhịp tim, SpO2, theo dõi 100+ chế độ tập luyện thể thao, kháng nước chuẩn 5ATM.',
    specs: {
      'Màn hình': '1.43 inch AMOLED 466x466 px',
      'Kháng nước': '5ATM (50 mét)',
      'Thời lượng pin': '12 ngày sử dụng tiêu chuẩn',
      'Cảm biến': 'Nhịp tim PPG, SpO2, Gia tốc kế'
    },
    options: [
      { name: 'Kích cỡ', values: ['42mm (Cổ tay vừa)', '46mm (Thể thao)'] },
      { name: 'Dây đeo', values: ['Dây Cao Su Đen', 'Dây Da Nâu'] }
    ],
    variants: [
      {
        id: 'var-2-1',
        title: '42mm / Dây Cao Su Đen',
        sku: 'TITAN-S3-42-RUB',
        price: 2190000,
        originalPrice: 2890000,
        stock: 16,
        options: { 'Kích cỡ': '42mm (Cổ tay vừa)', 'Dây đeo': 'Dây Cao Su Đen' }
      },
      {
        id: 'var-2-2',
        title: '46mm / Dây Da Nâu',
        sku: 'TITAN-S3-46-LEA',
        price: 2390000,
        originalPrice: 2990000,
        stock: 12,
        options: { 'Kích cỡ': '46mm (Thể thao)', 'Dây đeo': 'Dây Da Nâu' }
      }
    ],
    isFeatured: true,
    isFlashSale: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-3',
    name: 'Bàn Phím Cơ Không Dây CyberKey RGB 87 Phím',
    slug: 'ban-phim-co-khong-day-cyberkey-rgb',
    category: 'cat-tech',
    price: 1390000,
    originalPrice: 1690000,
    discount: 17,
    stock: 35,
    rating: 4.9,
    reviewsCount: 210,
    images: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Bàn phím cơ layout Tenkeyless 87 phím, switch cơ học hotswap dễ tháo lắp, 3 chế độ kết nối (Bluetooth 5.0, 2.4Ghz Wireless, Type-C), LED RGB 16.8 triệu màu.',
    specs: {
      'Layout': '87 phím (TKL)',
      'Pin': '4000mAh dùng đến 200 giờ',
      'Keycap': 'Nhựa PBT Double-shot chống mờ'
    },
    options: [
      { name: 'Loại Switch', values: ['Red Switch (Êm ái)', 'Blue Switch (Gõ nảy)'] }
    ],
    variants: [
      {
        id: 'var-3-1',
        title: 'Red Switch (Êm ái)',
        sku: 'CYBER-87-RED',
        price: 1390000,
        stock: 20,
        options: { 'Loại Switch': 'Red Switch (Êm ái)' }
      },
      {
        id: 'var-3-2',
        title: 'Blue Switch (Gõ nảy)',
        sku: 'CYBER-87-BLU',
        price: 1390000,
        stock: 15,
        options: { 'Loại Switch': 'Blue Switch (Gõ nảy)' }
      }
    ],
    isFeatured: true,
    isFlashSale: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-4',
    name: 'Nồi Chiên Không Dầu Điện Tử SmartAir 6.5L',
    slug: 'noi-chien-khong-dau-smartair-6-5l',
    category: 'cat-home',
    price: 1750000,
    originalPrice: 2450000,
    discount: 28,
    stock: 19,
    rating: 4.7,
    reviewsCount: 76,
    images: [
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Công nghệ luồng khí nóng xoay chiều Rapid Air giảm tới 90% lượng dầu mỡ, lòng nồi chống dính ceramic cao cấp không chứa PFOA, 8 menu cài sẵn thông minh qua màn hình cảm ứng.',
    specs: {
      'Dung tích': '6.5 Lít (vừa nguyên con gà 2.2kg)',
      'Công suất': '1800W nhiệt độ 80-200°C',
      'Bảng điều khiển': 'Màn hình cảm ứng LED'
    },
    isFeatured: false,
    isFlashSale: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-5',
    name: 'Loa Bluetooth Di Động BassBoom V8 Chống Nước IPX7',
    slug: 'loa-bluetooth-bassboom-v8-ipx7',
    category: 'cat-audio',
    price: 990000,
    originalPrice: 1250000,
    discount: 20,
    stock: 52,
    rating: 4.8,
    reviewsCount: 165,
    images: [
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Âm thanh 360 độ công suất 30W với củ loa siêu trầm kép, chống nước chuẩn bơi lội IPX7, hỗ trợ ghép đôi TWS hai loa tạo dàn âm thanh vòm sống động.',
    specs: {
      'Công suất': '30W RMS',
      'Chuẩn chống nước': 'IPX7 (chìm 1m trong 30 phút)',
      'Thời gian nghe': '18 giờ liên tục'
    },
    isFeatured: false,
    isFlashSale: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-6',
    name: 'Balo Du Lịch & Công Sở Chống Nước NovaShield 28L',
    slug: 'balo-du-lich-novashield-28l',
    category: 'cat-fashion',
    price: 790000,
    originalPrice: 1100000,
    discount: 28,
    stock: 60,
    rating: 4.9,
    reviewsCount: 312,
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Chất liệu vải Oxford 1680D kháng nước vượt trội, ngăn đựng laptop chống sốc chuyên dụng lên đến 16 inch, tích hợp cổng sạc USB thông minh ngoài balo.',
    specs: {
      'Dung tích': '28 Lít',
      'Ngăn Laptop': 'Chứa tối đa laptop 16 inch',
      'Khóa kéo': 'YKK kim loại cao cấp'
    },
    options: [
      { name: 'Màu sắc', values: ['Xám Khói Titan', 'Đen Huyền Bí'] }
    ],
    variants: [
      {
        id: 'var-6-1',
        title: 'Xám Khói Titan',
        sku: 'BALO-SHIELD-GRY',
        price: 790000,
        stock: 35,
        options: { 'Màu sắc': 'Xám Khói Titan' }
      },
      {
        id: 'var-6-2',
        title: 'Đen Huyền Bí',
        sku: 'BALO-SHIELD-BLK',
        price: 790000,
        stock: 25,
        options: { 'Màu sắc': 'Đen Huyền Bí' }
      }
    ],
    isFeatured: true,
    isFlashSale: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-7',
    name: 'Robot Hút Bụi Lau Nhà Tự Động AquaClean X1',
    slug: 'robot-hut-bui-aquaclean-x1',
    category: 'cat-home',
    price: 5890000,
    originalPrice: 7990000,
    discount: 26,
    stock: 14,
    rating: 4.9,
    reviewsCount: 54,
    images: [
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Lực hút siêu mạnh 5000Pa, công nghệ quét bản đồ Laser LiDAR 3D chính xác từng centimet, tự động quay về trạm sạc, bình nước điện tử kiểm soát độ ẩm lau nhà.',
    specs: {
      'Lực hút': '5000 Pa',
      'Định vị': 'Laser LiDAR thế hệ mới',
      'Dung lượng pin': '5200 mAh (hoạt động 180 phút)'
    },
    isFeatured: true,
    isFlashSale: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-8',
    name: 'Chuột Không Dây Công Thái Học ErgoMaster Wireless',
    slug: 'chuot-cong-thai-hoc-ergomaster',
    category: 'cat-tech',
    price: 680000,
    originalPrice: 890000,
    discount: 23,
    stock: 75,
    rating: 4.8,
    reviewsCount: 188,
    images: [
      'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Thiết kế nghiêng 57 độ công thái học bảo vệ cổ tay, giảm mỏi cơ khi làm việc nhiều giờ, nút bấm tĩnh âm Silent click 90%, cảm biến quang học 4000 DPI siêu chuẩn.',
    specs: {
      'Góc nghiêng': '57 độ tiêu chuẩn công thái học',
      'Độ phân giải DPI': '800 / 1600 / 2400 / 4000',
      'Kết nối': 'Bluetooth 5.2 + USB 2.4G'
    },
    isFeatured: false,
    isFlashSale: true,
    createdAt: new Date().toISOString()
  }
];

const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-1001',
    orderNumber: 'ORD-98421',
    customer: {
      fullName: 'Nguyễn Văn Minh',
      phone: '0987654321',
      email: 'minh.nguyen@gmail.com',
      address: 'Số 45 Đường Cầu Giấy, Phường Quan Hoa',
      city: 'Hà Nội',
      note: 'Giao giờ hành chính, gọi trước 15 phút'
    },
    items: [
      {
        productId: 'prod-1',
        variantId: 'var-1-1',
        variantTitle: 'Đen Carbon / 12 Tháng (Chuẩn)',
        name: 'Tai Nghe Chống Ồn Nova ANC Pro 5.0',
        price: 1850000,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'
      }
    ],
    subtotal: 1850000,
    shippingFee: 0,
    discountAmount: 100000,
    totalAmount: 1750000,
    paymentMethod: 'bank_transfer',
    paymentStatus: 'paid',
    status: 'delivered',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'ord-1002',
    orderNumber: 'ORD-98422',
    customer: {
      fullName: 'Trần Thị Thu Hà',
      phone: '0912345678',
      email: 'thuha.tran@outlook.com',
      address: '128 Điện Biên Phủ, Phường Đa Kao, Quận 1',
      city: 'Hồ Chí Minh',
      note: 'Để ở quầy lễ tân nếu vắng mặt'
    },
    items: [
      {
        productId: 'prod-2',
        variantId: 'var-2-1',
        variantTitle: '42mm / Dây Cao Su Đen',
        name: 'Đồng Hồ Thông Minh Titan Active Watch S3',
        price: 2190000,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'
      }
    ],
    subtotal: 2190000,
    shippingFee: 30000,
    discountAmount: 0,
    totalAmount: 2220000,
    paymentMethod: 'cod',
    paymentStatus: 'unpaid',
    status: 'shipped',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

function readDb(): DatabaseSchema {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      const initial: DatabaseSchema = {
        products: INITIAL_PRODUCTS,
        categories: INITIAL_CATEGORIES,
        orders: INITIAL_ORDERS
      };
      fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const content = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(content) as DatabaseSchema;
    // Tự động nâng cấp sản phẩm cũ nếu chưa có options hoặc variants
    let modified = false;
    parsed.products = parsed.products.map(p => {
      const initP = INITIAL_PRODUCTS.find(ip => ip.id === p.id);
      if (initP && initP.variants && (!p.variants || p.variants.length === 0)) {
        modified = true;
        return { ...p, options: initP.options, variants: initP.variants };
      }
      return p;
    });
    if (modified) {
      writeDb(parsed);
    }
    if (!parsed.settings) {
      parsed.settings = DEFAULT_BANK_SETTINGS;
      modified = true;
    }
    if (!parsed.webhookLogs) {
      parsed.webhookLogs = [];
      modified = true;
    }
    if (modified) {
      writeDb(parsed);
    }
    return parsed;
  } catch (error) {
    console.error('Lỗi đọc database:', error);
    return {
      products: INITIAL_PRODUCTS,
      categories: INITIAL_CATEGORIES,
      orders: INITIAL_ORDERS
    };
  }
}

function writeDb(data: DatabaseSchema): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Lỗi ghi database:', error);
  }
}

export const db = {
  getProducts(): Product[] {
    const data = readDb();
    return data.products;
  },

  getProductById(id: string): Product | undefined {
    const data = readDb();
    return data.products.find(p => p.id === id || p.slug === id);
  },

  createProduct(product: Omit<Product, 'id' | 'createdAt'>): Product {
    const data = readDb();
    const newProduct: Product = {
      ...product,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    data.products.unshift(newProduct);
    writeDb(data);
    return newProduct;
  },

  updateProduct(id: string, updates: Partial<Product>): Product | null {
    const data = readDb();
    const index = data.products.findIndex(p => p.id === id);
    if (index === -1) return null;
    data.products[index] = { ...data.products[index], ...updates };
    writeDb(data);
    return data.products[index];
  },

  deleteProduct(id: string): boolean {
    const data = readDb();
    const prevLength = data.products.length;
    data.products = data.products.filter(p => p.id !== id);
    if (data.products.length !== prevLength) {
      writeDb(data);
      return true;
    }
    return false;
  },

  getCategories(): Category[] {
    const data = readDb();
    return data.categories.map(cat => ({
      ...cat,
      itemCount: data.products.filter(p => p.category === cat.id).length
    }));
  },

  getOrders(): Order[] {
    const data = readDb();
    return data.orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getOrderById(id: string): Order | undefined {
    const data = readDb();
    return data.orders.find(o => o.id === id || o.orderNumber.toLowerCase() === id.toLowerCase());
  },

  createOrder(orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>): Order {
    const data = readDb();
    const randomCode = Math.floor(10000 + Math.random() * 90000);
    const newOrder: Order = {
      ...orderData,
      id: `ord-${Date.now()}`,
      orderNumber: `ORD-${randomCode}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Giảm số lượng tồn kho sản phẩm hoặc biến thể tương ứng
    newOrder.items.forEach(item => {
      const product = data.products.find(p => p.id === item.productId);
      if (product) {
        product.stock = Math.max(0, product.stock - item.quantity);
        if (item.variantId && product.variants) {
          const variant = product.variants.find(v => v.id === item.variantId);
          if (variant) {
            variant.stock = Math.max(0, variant.stock - item.quantity);
          }
        }
      }
    });

    data.orders.unshift(newOrder);
    writeDb(data);
    return newOrder;
  },

  updateOrderStatus(id: string, status: Order['status'], paymentStatus?: Order['paymentStatus']): Order | null {
    const data = readDb();
    const index = data.orders.findIndex(o => o.id === id);
    if (index === -1) return null;
    data.orders[index].status = status;
    if (paymentStatus) {
      data.orders[index].paymentStatus = paymentStatus;
    }
    data.orders[index].updatedAt = new Date().toISOString();
    writeDb(data);
    return data.orders[index];
  },

  // Medusa Feature: Xử lý Đổi / Trả hàng & Khiếu nại (Returns & Refunds)
  requestReturn(orderId: string, reason: string): Order | null {
    const data = readDb();
    const order = data.orders.find(o => o.id === orderId || o.orderNumber.toLowerCase() === orderId.toLowerCase());
    if (!order) return null;

    order.returnRequest = {
      status: 'pending',
      reason,
      requestedAt: new Date().toISOString()
    };
    order.updatedAt = new Date().toISOString();
    writeDb(data);
    return order;
  },

  resolveReturnRequest(orderId: string, status: 'approved' | 'rejected', adminResponse: string): Order | null {
    const data = readDb();
    const order = data.orders.find(o => o.id === orderId || o.orderNumber.toLowerCase() === orderId.toLowerCase());
    if (!order || !order.returnRequest) return null;

    order.returnRequest.status = status;
    order.returnRequest.adminResponse = adminResponse;
    if (status === 'approved') {
      order.status = 'cancelled'; // Hủy đơn và hoàn kho
      order.items.forEach(item => {
        const prod = data.products.find(p => p.id === item.productId);
        if (prod) {
          prod.stock += item.quantity;
        }
      });
    }
    order.updatedAt = new Date().toISOString();
    writeDb(data);
    return order;
  },

  // Medusa Feature: Quản lý Khách Hàng (Customer Management)
  getCustomers(): Customer[] {
    const data = readDb();
    const customerMap = new Map<string, Customer>();

    data.orders.forEach(order => {
      const key = order.customer.phone || order.customer.email || order.customer.fullName;
      if (!customerMap.has(key)) {
        customerMap.set(key, {
          id: `cus-${Math.abs(key.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0))}`,
          fullName: order.customer.fullName,
          phone: order.customer.phone,
          email: order.customer.email,
          address: order.customer.address,
          city: order.customer.city,
          ordersCount: 1,
          totalSpent: order.status !== 'cancelled' ? order.totalAmount : 0,
          createdAt: order.createdAt
        });
      } else {
        const existing = customerMap.get(key)!;
        existing.ordersCount += 1;
        if (order.status !== 'cancelled') {
          existing.totalSpent += order.totalAmount;
        }
      }
    });

    return Array.from(customerMap.values()).sort((a, b) => b.totalSpent - a.totalSpent);
  },

  getStats(): DashboardStats {
    const data = readDb();
    const totalOrders = data.orders.length;
    const totalRevenue = data.orders
      .filter(o => o.status !== 'cancelled')
      .reduce((sum, o) => sum + o.totalAmount, 0);
    const totalProducts = data.products.length;
    const pendingOrders = data.orders.filter(o => o.status === 'pending' || o.status === 'processing').length;
    const deliveredOrders = data.orders.filter(o => o.status === 'delivered').length;
    const pendingReturns = data.orders.filter(o => o.returnRequest?.status === 'pending').length;
    
    // Đếm khách hàng duy nhất
    const uniquePhones = new Set(data.orders.map(o => o.customer.phone));
    const totalCustomers = uniquePhones.size;

    const categoryBreakdown = data.categories.map(cat => {
      const productsInCat = data.products.filter(p => p.category === cat.id);
      const catProductIds = new Set(productsInCat.map(p => p.id));
      let revenue = 0;
      data.orders.forEach(order => {
        if (order.status !== 'cancelled') {
          order.items.forEach(item => {
            if (catProductIds.has(item.productId)) {
              revenue += item.price * item.quantity;
            }
          });
        }
      });
      return {
        category: cat.name,
        count: productsInCat.length,
        revenue
      };
    });

    return {
      totalRevenue,
      totalOrders,
      totalProducts,
      totalCustomers,
      pendingOrders,
      deliveredOrders,
      pendingReturns,
      recentOrders: data.orders.slice(0, 5),
      categoryBreakdown
    };
  },

  getSettings(): BankSettings {
    const data = readDb();
    return data.settings || DEFAULT_BANK_SETTINGS;
  },

  updateSettings(newSettings: Partial<BankSettings>): BankSettings {
    const data = readDb();
    data.settings = {
      ...(data.settings || DEFAULT_BANK_SETTINGS),
      ...newSettings
    };
    writeDb(data);
    return data.settings;
  },

  getWebhookLogs(): PaymentWebhookLog[] {
    const data = readDb();
    return data.webhookLogs || [];
  },

  processPaymentWebhook(payload: any, provider?: string): { success: boolean; message: string; order?: Order } {
    const data = readDb();
    let orderNumber = '';
    let amount = 0;
    let sourceProvider = provider || 'generic';

    // 1. Phân tích payload theo PayOS
    if (payload.data && typeof payload.data === 'object' && !Array.isArray(payload.data)) {
      sourceProvider = 'payos';
      amount = Number(payload.data.amount) || 0;
      const desc = String(payload.data.description || '');
      const match = desc.match(/ORD[-_ ]?([0-9A-Za-z]+)/i);
      if (match) {
        orderNumber = `ORD-${match[1]}`;
      } else if (payload.data.orderCode) {
        orderNumber = `ORD-${payload.data.orderCode}`;
      }
    }
    // 2. Phân tích payload theo Casso
    else if (Array.isArray(payload.data) && payload.data.length > 0) {
      sourceProvider = 'casso';
      const firstTx = payload.data[0];
      amount = Number(firstTx.amount) || 0;
      const desc = String(firstTx.description || '');
      const match = desc.match(/ORD[-_ ]?([0-9A-Za-z]+)/i);
      if (match) {
        orderNumber = `ORD-${match[1]}`;
      }
    }
    // 3. Format trực tiếp / simulator
    else if (payload.orderNumber) {
      orderNumber = String(payload.orderNumber);
      amount = Number(payload.amount) || 0;
      sourceProvider = payload.provider || 'simulator';
    } else if (payload.description) {
      const match = String(payload.description).match(/ORD[-_ ]?([0-9A-Za-z]+)/i);
      if (match) {
        orderNumber = `ORD-${match[1]}`;
      }
      amount = Number(payload.amount) || 0;
    }

    if (!orderNumber) {
      const log: PaymentWebhookLog = {
        id: `wh-${Date.now()}`,
        orderNumber: 'UNKNOWN',
        amount,
        provider: sourceProvider,
        rawPayload: payload,
        status: 'failed',
        message: 'Không tìm thấy mã đơn hàng (ORD-XXXXX) trong nội dung giao dịch',
        createdAt: new Date().toISOString()
      };
      data.webhookLogs = [log, ...(data.webhookLogs || [])].slice(0, 50);
      writeDb(data);
      return { success: false, message: log.message };
    }

    const cleanOrderNum = orderNumber.toUpperCase().trim();
    const order = data.orders.find(o => 
      o.orderNumber.toUpperCase() === cleanOrderNum || 
      cleanOrderNum.includes(o.orderNumber.toUpperCase()) ||
      o.orderNumber.toUpperCase().includes(cleanOrderNum)
    );

    if (!order) {
      const log: PaymentWebhookLog = {
        id: `wh-${Date.now()}`,
        orderNumber: cleanOrderNum,
        amount,
        provider: sourceProvider,
        rawPayload: payload,
        status: 'failed',
        message: `Mã đơn hàng ${cleanOrderNum} không tìm thấy trong hệ thống`,
        createdAt: new Date().toISOString()
      };
      data.webhookLogs = [log, ...(data.webhookLogs || [])].slice(0, 50);
      writeDb(data);
      return { success: false, message: log.message };
    }

    // Kiểm tra số tiền chuyển
    if (amount > 0 && amount < order.totalAmount) {
      const log: PaymentWebhookLog = {
        id: `wh-${Date.now()}`,
        orderNumber: order.orderNumber,
        amount,
        provider: sourceProvider,
        rawPayload: payload,
        status: 'failed',
        message: `Số tiền thanh toán (${amount.toLocaleString('vi-VN')}đ) chưa đủ giá trị đơn hàng (${order.totalAmount.toLocaleString('vi-VN')}đ)`,
        createdAt: new Date().toISOString()
      };
      data.webhookLogs = [log, ...(data.webhookLogs || [])].slice(0, 50);
      writeDb(data);
      return { success: false, message: log.message, order };
    }

    // Đánh dấu thanh toán thành công
    order.paymentStatus = 'paid';
    if (order.status === 'pending') {
      order.status = 'processing';
    }
    order.updatedAt = new Date().toISOString();

    const log: PaymentWebhookLog = {
      id: `wh-${Date.now()}`,
      orderNumber: order.orderNumber,
      amount: amount || order.totalAmount,
      provider: sourceProvider,
      rawPayload: payload,
      status: 'success',
      message: `Tự động xác nhận thanh toán thành công cho đơn hàng ${order.orderNumber}`,
      createdAt: new Date().toISOString()
    };
    data.webhookLogs = [log, ...(data.webhookLogs || [])].slice(0, 50);
    writeDb(data);

    return { success: true, message: log.message, order };
  }
};
