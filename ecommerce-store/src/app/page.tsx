'use client';

import React, { useState, useEffect } from 'react';
import { Product, Category, CartItem, Order, ProductVariant } from '@/types';
import { Header } from '@/components/Header';
import { HeroBanner } from '@/components/HeroBanner';
import { CategoryList } from '@/components/CategoryList';
import { ProductCard } from '@/components/ProductCard';
import { ProductDetailModal } from '@/components/ProductDetailModal';
import { CartDrawer } from '@/components/CartDrawer';
import { CheckoutModal } from '@/components/CheckoutModal';
import { OrderTrackingModal } from '@/components/OrderTrackingModal';
import { SlidersHorizontal, CheckCircle2, ShoppingBag, Sparkles } from 'lucide-react';

export default function StorefrontPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [flashSaleOnly, setFlashSaleOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  // Cart & Modals State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [promoCode, setPromoCode] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load cart from localStorage
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('nova_mart_cart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('nova_mart_cart', JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  // Fetch Categories
  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setCategories(data.categories);
        }
      })
      .catch(console.error);
  }, []);

  // Fetch Products with filters
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.set('category', selectedCategory);
      if (searchQuery.trim()) params.set('search', searchQuery.trim());
      if (sortBy) params.set('sort', sortBy);
      if (flashSaleOnly) params.set('flashSale', 'true');

      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProducts();
    }, 200);

    return () => clearTimeout(delayDebounceFn);
  }, [selectedCategory, searchQuery, sortBy, flashSaleOnly]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  const handleAddToCart = (product: Product, quantity = 1, variant?: ProductVariant) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id && item.variant?.id === variant?.id);
      const maxStock = variant ? variant.stock : product.stock;
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id && item.variant?.id === variant?.id
            ? { ...item, quantity: Math.min(maxStock, item.quantity + quantity) }
            : item
        );
      } else {
        return [...prev, { product, variant, quantity }];
      }
    });
    const title = variant ? `${product.name} (${variant.title})` : product.name;
    showToast(`Đã thêm "${title}" vào giỏ hàng`);
  };

  const handleUpdateQuantity = (productId: string, quantity: number, variantId?: string) => {
    if (quantity <= 0) {
      handleRemoveItem(productId, variantId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.product.id === productId && item.variant?.id === variantId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const handleRemoveItem = (productId: string, variantId?: string) => {
    setCart(prev => prev.filter(item => !(item.product.id === productId && item.variant?.id === variantId)));
    showToast('Đã xóa sản phẩm khỏi giỏ hàng');
  };

  const handleBuyNow = (product: Product, quantity = 1, variant?: ProductVariant) => {
    handleAddToCart(product, quantity, variant);
    setSelectedProduct(null);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleProceedToCheckout = (discount: number, promo: string) => {
    setDiscountAmount(discount);
    setPromoCode(promo);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleOrderSuccess = (order: Order) => {
    setCart([]);
    localStorage.removeItem('nova_mart_cart');
    showToast(`Đặt hàng thành công! Mã đơn: ${order.orderNumber}`);
    fetchProducts();
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          backgroundColor: '#0f172a',
          color: '#ffffff',
          padding: '0.85rem 1.4rem',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-xl)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          zIndex: 2000,
          fontSize: '0.9rem',
          fontWeight: 600,
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <CheckCircle2 size={18} color="#10b981" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <Header
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenTracking={() => setIsTrackingOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Content Area */}
      <main style={{ flex: 1, paddingBottom: '4rem' }}>
        {/* Hero Section */}
        <HeroBanner
          onExploreClick={() => {
            setSelectedCategory('all');
            setFlashSaleOnly(false);
            window.scrollTo({ top: 600, behavior: 'smooth' });
          }}
          onFlashSaleClick={() => {
            setFlashSaleOnly(prev => !prev);
            window.scrollTo({ top: 600, behavior: 'smooth' });
          }}
        />

        <div className="container">
          {/* Categories Pill Selector */}
          <CategoryList
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={(catId) => {
              setSelectedCategory(catId);
              setFlashSaleOnly(false);
            }}
          />

          {/* Filtering and Sort Toolbar */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            padding: '1rem 1.25rem',
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
            marginBottom: '1.8rem',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => setFlashSaleOnly(prev => !prev)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.45rem 0.9rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  backgroundColor: flashSaleOnly ? '#fee2e2' : '#f8fafc',
                  color: flashSaleOnly ? '#e11d48' : '#475569',
                  border: `1.5px solid ${flashSaleOnly ? '#f43f5e' : '#e2e8f0'}`,
                  cursor: 'pointer'
                }}
              >
                <Sparkles size={15} color={flashSaleOnly ? '#e11d48' : '#f59e0b'} />
                <span>Chỉ hiển thị Flash Sale</span>
              </button>

              <span style={{ fontSize: '0.88rem', color: '#64748b' }}>
                Hiển thị <strong>{products.length}</strong> sản phẩm
              </span>
            </div>

            {/* Sort Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <SlidersHorizontal size={16} color="#64748b" />
              <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#475569' }}>Sắp xếp theo:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  padding: '0.45rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  backgroundColor: '#ffffff',
                  color: '#0f172a',
                  fontWeight: 600,
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="newest">Mới nhất</option>
                <option value="price-asc">Giá: Thấp đến Cao</option>
                <option value="price-desc">Giá: Cao đến Thấp</option>
                <option value="rating">Đánh giá cao nhất</option>
              </select>
            </div>
          </div>

          {/* Product Grid */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
              <div style={{
                width: '42px',
                height: '42px',
                border: '3px solid #e2e8f0',
                borderTopColor: 'var(--primary)',
                borderRadius: '50%',
                margin: '0 auto 1rem',
                animation: 'pulse 1s infinite'
              }} />
              <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Đang tải danh sách sản phẩm...</p>
            </div>
          ) : products.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              backgroundColor: '#ffffff',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border)'
            }}>
              <ShoppingBag size={52} strokeWidth={1.5} color="#cbd5e1" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem' }}>
                Không tìm thấy sản phẩm nào
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                Thử thay đổi từ khóa tìm kiếm hoặc chọn danh mục khác nhé!
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                  setFlashSaleOnly(false);
                }}
                className="btn btn-secondary"
              >
                Đặt lại bộ lọc
              </button>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '1.5rem'
            }}>
              {products.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={(p) => handleAddToCart(p, 1)}
                  onViewDetail={(p) => setSelectedProduct(p)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer style={{ backgroundColor: '#0f172a', color: '#94a3b8', padding: '3rem 0 2rem 0', marginTop: 'auto' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
          <div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.8rem' }}>
              NOVA<span style={{ color: '#818cf8' }}>MART</span>
            </div>
            <p style={{ fontSize: '0.88rem', lineHeight: 1.6, color: '#94a3b8', marginBottom: '1rem' }}>
              Hệ sinh thái mua sắm trực tuyến đa năng tiện ích, hiện đại và tin cậy. Cam kết 100% hàng chính hãng và trải nghiệm khách hàng xuất sắc.
            </p>
            <div style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>
              Hotline: <strong>1900 6868</strong> (8:00 - 22:00)
            </div>
          </div>

          <div>
            <h4 style={{ color: '#ffffff', fontSize: '1rem', fontWeight: 700, marginBottom: '0.9rem' }}>Về NovaMart</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.88rem' }}>
              <a href="#" style={{ color: '#94a3b8' }}>Giới thiệu công ty</a>
              <a href="#" style={{ color: '#94a3b8' }}>Chính sách bảo hành</a>
              <a href="#" style={{ color: '#94a3b8' }}>Quy định đổi trả hàng</a>
              <a href="#" style={{ color: '#94a3b8' }}>Bảo mật thông tin khách hàng</a>
            </div>
          </div>

          <div>
            <h4 style={{ color: '#ffffff', fontSize: '1rem', fontWeight: 700, marginBottom: '0.9rem' }}>Hỗ Trợ Khách Hàng</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.88rem' }}>
              <a href="#" style={{ color: '#94a3b8' }}>Hướng dẫn mua hàng & thanh toán</a>
              <a href="#" style={{ color: '#94a3b8' }}>Tra cứu đơn hàng trực tuyến</a>
              <a href="#" style={{ color: '#94a3b8' }}>Chính sách giao hàng toàn quốc</a>
              <a href="#" style={{ color: '#94a3b8' }}>Câu hỏi thường gặp (FAQ)</a>
            </div>
          </div>

          <div>
            <h4 style={{ color: '#ffffff', fontSize: '1rem', fontWeight: 700, marginBottom: '0.9rem' }}>Thanh Toán An Toàn</h4>
            <p style={{ fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '0.8rem' }}>
              Hỗ trợ thanh toán linh hoạt qua chuyển khoản quét mã VietQR, thẻ ATM nội địa, Visa/Mastercard hoặc tiền mặt khi nhận hàng (COD).
            </p>
            <div style={{
              display: 'inline-block',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              padding: '0.5rem 0.8rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8rem',
              color: '#34d399',
              fontWeight: 600
            }}>
              ✓ Bảo mật SSL 256-bit chuẩn quốc tế
            </div>
          </div>
        </div>

        <div className="container" style={{ borderTop: '1px solid #1e293b', paddingTop: '1.5rem', textAlign: 'center', fontSize: '0.82rem', color: '#64748b' }}>
          © 2026 NovaMart E-commerce Platform. Phát triển với Next.js & TypeScript.
        </div>
      </footer>

      {/* Modals & Drawers */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onProceedToCheckout={handleProceedToCheckout}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cart}
        discountAmount={discountAmount}
        promoCode={promoCode}
        onOrderSuccess={handleOrderSuccess}
      />

      <OrderTrackingModal
        isOpen={isTrackingOpen}
        onClose={() => setIsTrackingOpen(false)}
      />
    </div>
  );
}
