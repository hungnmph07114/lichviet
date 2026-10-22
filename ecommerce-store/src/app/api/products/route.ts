import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort');
    const featured = searchParams.get('featured');
    const flashSale = searchParams.get('flashSale');

    let products = db.getProducts();

    if (category && category !== 'all') {
      products = products.filter(p => p.category === category);
    }

    if (search) {
      const q = search.toLowerCase().trim();
      products = products.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    }

    if (featured === 'true') {
      products = products.filter(p => p.isFeatured);
    }

    if (flashSale === 'true') {
      products = products.filter(p => p.isFlashSale);
    }

    if (sort === 'price-asc') {
      products.sort((a, b) => a.price - b.price);
    } else if (sort === 'price-desc') {
      products.sort((a, b) => b.price - a.price);
    } else if (sort === 'rating') {
      products.sort((a, b) => b.rating - a.rating);
    } else {
      // default: newest
      products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return NextResponse.json({ success: true, count: products.length, products });
  } catch (error) {
    console.error('API Products GET Error:', error);
    return NextResponse.json({ success: false, message: 'Lỗi tải danh sách sản phẩm' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.name || !body.price || !body.category) {
      return NextResponse.json({ success: false, message: 'Vui lòng điền đủ thông tin tên, giá và danh mục' }, { status: 400 });
    }

    const slug = body.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/([^0-9a-z-\s])/g, '')
      .replace(/(\s+)/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');

    const newProduct = db.createProduct({
      name: body.name,
      slug: `${slug}-${Date.now().toString().slice(-4)}`,
      category: body.category,
      price: Number(body.price),
      originalPrice: body.originalPrice ? Number(body.originalPrice) : undefined,
      discount: body.discount ? Number(body.discount) : (body.originalPrice && body.originalPrice > body.price ? Math.round(((body.originalPrice - body.price) / body.originalPrice) * 100) : 0),
      stock: Number(body.stock || 0),
      rating: body.rating || 5.0,
      reviewsCount: body.reviewsCount || 0,
      images: Array.isArray(body.images) && body.images.length > 0 ? body.images : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'],
      description: body.description || '',
      specs: body.specs || {},
      isFeatured: !!body.isFeatured,
      isFlashSale: !!body.isFlashSale
    });

    return NextResponse.json({ success: true, product: newProduct }, { status: 201 });
  } catch (error) {
    console.error('API Products POST Error:', error);
    return NextResponse.json({ success: false, message: 'Lỗi tạo sản phẩm mới' }, { status: 500 });
  }
}
