'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Product, Order, Category, Customer, DashboardStats, BankSettings, PaymentWebhookLog } from '@/types';
import { formatVND, formatDate } from '@/lib/utils';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  ArrowLeft,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
  Eye,
  TrendingUp,
  DollarSign,
  Users,
  Search,
  Filter,
  RefreshCw,
  X,
  Check,
  RotateCcw,
  Layers,
  Award,
  CreditCard,
  QrCode,
  Zap,
  Settings,
  ShieldCheck,
  Copy,
  ExternalLink
} from 'lucide-react';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'customers' | 'returns' | 'settings'>('overview');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  // Bank & Webhook Settings
  const [bankSettings, setBankSettings] = useState<BankSettings>({
    bankId: 'MB',
    bankName: 'MB Bank - Ngân hàng Quân Đội',
    accountNumber: '999988886666',
    accountName: 'NOVA MART STORE',
    qrTemplate: 'compact2',
    webhookProvider: 'manual',
    autoConfirmPaid: true
  });
  const [popularBanks, setPopularBanks] = useState<{ id: string; name: string; shortName: string }[]>([]);
  const [webhookLogs, setWebhookLogs] = useState<PaymentWebhookLog[]>([]);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [simulatingOrderNumber, setSimulatingOrderNumber] = useState('');
  const [isSimulatingPay, setIsSimulatingPay] = useState(false);
  const [copiedWebhookUrl, setCopiedWebhookUrl] = useState(false);

  // Filter & Search states
  const [productSearch, setProductSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');

  // Product Modal State (Create / Edit)
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    category: 'cat-tech',
    price: '',
    originalPrice: '',
    stock: '',
    image: '',
    description: '',
    isFeatured: false,
    isFlashSale: false
  });

  // Order Detail Modal State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Toast
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [statsRes, productsRes, categoriesRes, ordersRes, customersRes, settingsRes] = await Promise.all([
        fetch('/api/stats').then(r => r.json()),
        fetch('/api/products').then(r => r.json()),
        fetch('/api/categories').then(r => r.json()),
        fetch('/api/orders').then(r => r.json()),
        fetch('/api/customers').then(r => r.json()),
        fetch('/api/settings').then(r => r.json())
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (productsRes.success) setProducts(productsRes.products);
      if (categoriesRes.success) setCategories(categoriesRes.categories);
      if (ordersRes.success) setOrders(ordersRes.orders);
      if (customersRes.success) setCustomers(customersRes.customers);
      if (settingsRes.success) {
        setBankSettings(settingsRes.settings);
        setPopularBanks(settingsRes.popularBanks || []);
        setWebhookLogs(settingsRes.webhookLogs || []);
      }
    } catch (err) {
      console.error(err);
      showToast('Lỗi tải dữ liệu quản trị');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleSaveBankSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bankSettings)
      });
      const data = await res.json();
      if (data.success) {
        showToast('Đã lưu cấu hình ngân hàng & thanh toán!');
      } else {
        showToast(data.message || 'Lỗi lưu cấu hình');
      }
    } catch (err) {
      showToast('Lỗi kết nối khi lưu cài đặt');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleSimulatePayment = async () => {
    if (!simulatingOrderNumber) {
      showToast('Vui lòng chọn hoặc nhập mã đơn hàng để test');
      return;
    }
    setIsSimulatingPay(true);
    try {
      const res = await fetch('/api/payment/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber: simulatingOrderNumber,
          provider: 'Admin Sandbox Simulator'
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`✅ Đã nhận tiền thành công đơn ${simulatingOrderNumber}!`);
        await loadAllData();
      } else {
        showToast(`❌ ${data.message}`);
      }
    } catch (err) {
      showToast('Lỗi khi giả lập Webhook');
    } finally {
      setIsSimulatingPay(false);
    }
  };

  // Handle Create or Update Product
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: productForm.name,
        category: productForm.category,
        price: Number(productForm.price),
        originalPrice: productForm.originalPrice ? Number(productForm.originalPrice) : undefined,
        stock: Number(productForm.stock),
        images: productForm.image ? [productForm.image] : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'],
        description: productForm.description,
        isFeatured: productForm.isFeatured,
        isFlashSale: productForm.isFlashSale
      };

      if (editingProduct) {
        // Update
        const res = await fetch(`/api/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
          showToast('Cập nhật sản phẩm thành công!');
          setIsProductModalOpen(false);
          loadAllData();
        }
      } else {
        // Create
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
          showToast('Thêm sản phẩm mới thành công!');
          setIsProductModalOpen(false);
          loadAllData();
        }
      }
    } catch (err) {
      console.error(err);
      showToast('Lỗi khi lưu sản phẩm');
    }
  };

  // Handle Delete Product
  const handleDeleteProduct = async (id: string, name: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${name}"?`)) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('Đã xóa sản phẩm!');
        loadAllData();
      }
    } catch {
      showToast('Lỗi khi xóa sản phẩm');
    }
  };

  // Handle Update Order Status
  const handleUpdateOrderStatus = async (orderId: string, newStatus: Order['status'], newPaymentStatus?: Order['paymentStatus']) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          paymentStatus: newPaymentStatus
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Đã chuyển đơn hàng sang trạng thái: ${newStatus}`);
        loadAllData();
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(data.order);
        }
      }
    } catch {
      showToast('Lỗi cập nhật trạng thái đơn');
    }
  };

  // Handle Resolve Return Request (Medusa Feature)
  const handleResolveReturn = async (orderId: string, status: 'approved' | 'rejected') => {
    const adminResponse = prompt(
      `Nhập phản hồi cho khách hàng (${status === 'approved' ? 'Chấp thuận hoàn tiền/đổi trả' : 'Từ chối'}):`,
      status === 'approved' ? 'Đã duyệt hoàn tiền và hoàn kho sản phẩm.' : 'Sản phẩm không đáp ứng điều kiện đổi trả.'
    );
    if (adminResponse === null) return;

    try {
      const res = await fetch(`/api/orders/${orderId}/return`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, adminResponse })
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message);
        loadAllData();
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(data.order);
        }
      }
    } catch {
      showToast('Lỗi xử lý yêu cầu đổi trả');
    }
  };

  const openNewProductModal = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      category: categories[0]?.id || 'cat-tech',
      price: '',
      originalPrice: '',
      stock: '20',
      image: '',
      description: '',
      isFeatured: false,
      isFlashSale: false
    });
    setIsProductModalOpen(true);
  };

  const openEditProductModal = (p: Product) => {
    setEditingProduct(p);
    setProductForm({
      name: p.name,
      category: p.category,
      price: p.price.toString(),
      originalPrice: p.originalPrice ? p.originalPrice.toString() : '',
      stock: p.stock.toString(),
      image: p.images[0] || '',
      description: p.description || '',
      isFeatured: !!p.isFeatured,
      isFlashSale: !!p.isFlashSale
    });
    setIsProductModalOpen(true);
  };

  // Filtered lists
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.category.toLowerCase().includes(productSearch.toLowerCase())
  );

  const filteredOrders = orders.filter(o => {
    const matchStatus = orderStatusFilter === 'all' || o.status === orderStatusFilter;
    const matchSearch =
      o.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customer.fullName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customer.phone.includes(orderSearch);
    return matchStatus && matchSearch;
  });

  const returnOrders = orders.filter(o => o.returnRequest);

  const filteredCustomers = customers.filter(c =>
    c.fullName.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.phone.includes(customerSearch) ||
    c.email.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <span className="badge badge-warning"><Clock size={12} /> Chờ duyệt</span>;
      case 'processing':
        return <span className="badge badge-info"><Package size={12} /> Đang đóng gói</span>;
      case 'shipped':
        return <span className="badge" style={{ backgroundColor: '#e0e7ff', color: '#4338ca' }}><Truck size={12} /> Đang giao hàng</span>;
      case 'delivered':
        return <span className="badge badge-success"><CheckCircle size={12} /> Giao thành công</span>;
      case 'cancelled':
        return <span className="badge" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}><XCircle size={12} /> Đã hủy</span>;
      default:
        return <span>{status}</span>;
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: '#0f172a',
          color: '#ffffff',
          padding: '0.8rem 1.4rem',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-xl)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.9rem',
          fontWeight: 600
        }}>
          <Check size={16} color="#10b981" />
          <span>{toast}</span>
        </div>
      )}

      {/* Admin Top Navigation Bar */}
      <header style={{ backgroundColor: '#ffffff', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.9rem 1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
            <Link
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#64748b',
                padding: '0.4rem 0.8rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#f1f5f9'
              }}
            >
              <ArrowLeft size={16} /> Về Cửa Hàng
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{
                backgroundColor: '#4f46e5',
                color: '#fff',
                padding: '0.4rem 0.7rem',
                borderRadius: '8px',
                fontWeight: 800,
                fontSize: '0.95rem'
              }}>
                ADMIN
              </div>
              <h1 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                Hệ Thống Quản Trị NovaMart
              </h1>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <button
              onClick={loadAllData}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <RefreshCw size={14} /> Làm mới
            </button>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="container" style={{ display: 'flex', gap: '0.5rem', paddingBottom: '0.5rem', overflowX: 'auto' }}>
          {[
            { id: 'overview', label: 'Tổng Quan', icon: <LayoutDashboard size={17} /> },
            { id: 'products', label: `Sản Phẩm & Biến Thể (${products.length})`, icon: <Package size={17} /> },
            { id: 'orders', label: `Đơn Hàng (${orders.length})`, icon: <ShoppingBag size={17} /> },
            { id: 'customers', label: `Khách Hàng (${customers.length})`, icon: <Users size={17} /> },
            { id: 'returns', label: `Đổi / Trả Hàng (${returnOrders.length})`, icon: <RotateCcw size={17} /> },
            { id: 'settings', label: 'Cài Đặt & Ngân Hàng', icon: <CreditCard size={17} /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.6rem 1.1rem',
                borderBottom: `2.5px solid ${activeTab === tab.id ? 'var(--primary)' : 'transparent'}`,
                color: activeTab === tab.id ? 'var(--primary)' : '#64748b',
                fontWeight: activeTab === tab.id ? 700 : 500,
                fontSize: '0.92rem',
                borderRadius: '4px 4px 0 0',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.id === 'returns' && stats && stats.pendingReturns > 0 && (
                <span style={{ backgroundColor: '#f43f5e', color: '#fff', fontSize: '0.72rem', padding: '0.1rem 0.45rem', borderRadius: '10px' }}>
                  {stats.pendingReturns}
                </span>
              )}
            </button>
          ))}
        </div>
      </header>

      {/* Main Admin View Area */}
      <main className="container" style={{ flex: 1, padding: '2rem 1.25rem 4rem 1.25rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem 0' }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '3px solid #e2e8f0',
              borderTopColor: 'var(--primary)',
              borderRadius: '50%',
              margin: '0 auto 1rem',
              animation: 'pulse 1s infinite'
            }} />
            <p style={{ color: '#64748b' }}>Đang tải dữ liệu hệ thống...</p>
          </div>
        ) : activeTab === 'overview' ? (
          /* TAB 1: OVERVIEW & STATS */
          <div>
            {/* 5 KPI Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
              gap: '1.25rem',
              marginBottom: '2rem'
            }}>
              <div style={{ backgroundColor: '#ffffff', padding: '1.4rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Tổng Doanh Thu</span>
                  <div style={{ backgroundColor: '#ecfdf5', color: '#059669', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
                    <DollarSign size={20} />
                  </div>
                </div>
                <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a' }}>
                  {formatVND(stats?.totalRevenue || 0)}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#10b981', marginTop: '0.4rem', fontWeight: 600 }}>
                  ↑ Tăng trưởng tích cực
                </div>
              </div>

              <div style={{ backgroundColor: '#ffffff', padding: '1.4rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Tổng Số Đơn Hàng</span>
                  <div style={{ backgroundColor: '#e0e7ff', color: '#4f46e5', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
                    <ShoppingBag size={20} />
                  </div>
                </div>
                <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a' }}>
                  {stats?.totalOrders || 0}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.4rem' }}>
                  {stats?.deliveredOrders || 0} đơn đã giao thành công
                </div>
              </div>

              <div style={{ backgroundColor: '#ffffff', padding: '1.4rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Khách Hàng Đã Mua</span>
                  <div style={{ backgroundColor: '#f0fdf4', color: '#16a34a', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
                    <Users size={20} />
                  </div>
                </div>
                <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#16a34a' }}>
                  {stats?.totalCustomers || customers.length}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.4rem' }}>
                  Lưu hồ sơ tự động
                </div>
              </div>

              <div style={{ backgroundColor: '#ffffff', padding: '1.4rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Đơn Chờ Xử Lý</span>
                  <div style={{ backgroundColor: '#fef3c7', color: '#d97706', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
                    <Clock size={20} />
                  </div>
                </div>
                <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#f59e0b' }}>
                  {stats?.pendingOrders || 0}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#d97706', marginTop: '0.4rem', fontWeight: 600 }}>
                  Cần đóng gói & giao
                </div>
              </div>

              <div style={{ backgroundColor: '#ffffff', padding: '1.4rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Yêu Cầu Đổi / Trả</span>
                  <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
                    <RotateCcw size={20} />
                  </div>
                </div>
                <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#dc2626' }}>
                  {stats?.pendingReturns || 0}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#dc2626', marginTop: '0.4rem', fontWeight: 600 }}>
                  Khiếu nại từ khách
                </div>
              </div>
            </div>

            {/* Category breakdown & Recent Orders */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
              {/* Category Breakdown */}
              <div style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <TrendingUp size={18} color="var(--primary)" /> Doanh Số Theo Danh Mục
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {stats?.categoryBreakdown?.map((cat, idx) => (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                        <span style={{ fontWeight: 600, color: '#334155' }}>{cat.category}</span>
                        <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{formatVND(cat.revenue)}</span>
                      </div>
                      <div style={{ width: '100%', height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${Math.min(100, (cat.revenue / (stats.totalRevenue || 1)) * 100)}%`,
                          height: '100%',
                          backgroundColor: idx === 0 ? '#4f46e5' : idx === 1 ? '#06b6d4' : idx === 2 ? '#10b981' : '#f59e0b',
                          borderRadius: '4px'
                        }} />
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{cat.count} sản phẩm đang bày bán</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Orders Card */}
              <div style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>Đơn Hàng Gần Đây</h3>
                  <button onClick={() => setActiveTab('orders')} className="btn btn-secondary btn-sm" style={{ fontSize: '0.8rem' }}>
                    Xem tất cả
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {orders.slice(0, 5).map(o => (
                    <div
                      key={o.id}
                      style={{
                        padding: '0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border)',
                        backgroundColor: '#f8fafc',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--primary)' }}>
                          {o.orderNumber}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                          {o.customer.fullName} • {formatDate(o.createdAt)}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a' }}>
                          {formatVND(o.totalAmount)}
                        </div>
                        <div style={{ marginTop: '0.2rem' }}>
                          {getStatusBadge(o.status)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === 'products' ? (
          /* TAB 2: PRODUCTS MANAGEMENT WITH VARIANTS */
          <div>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#ffffff', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '0.5rem 0.9rem', maxWidth: '400px', flex: 1 }}>
                <Search size={18} color="#64748b" style={{ marginRight: '0.5rem' }} />
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Tìm kiếm sản phẩm theo tên..."
                  style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.9rem' }}
                />
              </div>

              <button onClick={openNewProductModal} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Plus size={18} />
                <span>Thêm Sản Phẩm Mới</span>
              </button>
            </div>

            <div style={{ backgroundColor: '#ffffff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid var(--border)', color: '#475569', fontWeight: 700 }}>
                      <th style={{ padding: '0.85rem 1rem' }}>Hình ảnh & Tên</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Danh mục</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Biến thể (Variants)</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Giá bán</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Tồn kho</th>
                      <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((p) => {
                      const catName = categories.find(c => c.id === p.category)?.name || p.category;
                      return (
                        <tr key={p.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background-color 0.15s' }}>
                          <td style={{ padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                            <img
                              src={p.images[0]}
                              alt={p.name}
                              style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover', backgroundColor: '#f8fafc' }}
                            />
                            <div>
                              <div style={{ fontWeight: 700, color: '#0f172a' }}>{p.name}</div>
                              <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.2rem' }}>
                                {p.isFlashSale && <span className="badge badge-sale" style={{ fontSize: '0.65rem' }}>Flash Sale</span>}
                                {p.isFeatured && <span className="badge badge-featured" style={{ fontSize: '0.65rem' }}>Nổi bật</span>}
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '0.85rem 1rem', color: '#64748b' }}>
                            {catName}
                          </td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            {p.variants && p.variants.length > 0 ? (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', backgroundColor: '#f3e8ff', color: '#7e22ce', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 600 }}>
                                <Layers size={12} /> {p.variants.length} biến thể
                              </span>
                            ) : (
                              <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Sản phẩm đơn lẻ</span>
                            )}
                          </td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <div style={{ fontWeight: 700, color: 'var(--primary)' }}>{formatVND(p.price)}</div>
                            {p.originalPrice && (
                              <div style={{ fontSize: '0.75rem', color: '#94a3b8', textDecoration: 'line-through' }}>
                                {formatVND(p.originalPrice)}
                              </div>
                            )}
                          </td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <span style={{ fontWeight: 700, color: p.stock > 10 ? '#10b981' : p.stock > 0 ? '#f59e0b' : '#ef4444' }}>
                              {p.stock} cái
                            </span>
                          </td>
                          <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                              <button onClick={() => openEditProductModal(p)} className="btn btn-secondary btn-sm" title="Chỉnh sửa">
                                <Edit2 size={15} />
                              </button>
                              <button onClick={() => handleDeleteProduct(p.id, p.name)} className="btn btn-danger btn-sm" title="Xóa">
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : activeTab === 'orders' ? (
          /* TAB 3: ORDERS MANAGEMENT */
          <div>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#ffffff', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '0.5rem 0.9rem', maxWidth: '400px', flex: 1 }}>
                <Search size={18} color="#64748b" style={{ marginRight: '0.5rem' }} />
                <input
                  type="text"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder="Tìm theo mã đơn hoặc tên/sđt khách hàng..."
                  style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Filter size={16} color="#64748b" />
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  style={{ padding: '0.5rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', backgroundColor: '#ffffff', fontWeight: 600, outline: 'none' }}
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="pending">Chờ xác nhận</option>
                  <option value="processing">Đang đóng gói</option>
                  <option value="shipped">Đang giao hàng</option>
                  <option value="delivered">Đã giao thành công</option>
                  <option value="cancelled">Đã hủy</option>
                </select>
              </div>
            </div>

            <div style={{ backgroundColor: '#ffffff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid var(--border)', color: '#475569', fontWeight: 700 }}>
                      <th style={{ padding: '0.85rem 1rem' }}>Mã đơn & Ngày đặt</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Khách hàng</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Sản phẩm</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Tổng tiền</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Trạng thái</th>
                      <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((o) => (
                      <tr key={o.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background-color 0.15s' }}>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ fontWeight: 800, color: 'var(--primary)' }}>{o.orderNumber}</div>
                          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{formatDate(o.createdAt)}</div>
                          {o.returnRequest && (
                            <span style={{ display: 'inline-block', marginTop: '0.2rem', backgroundColor: '#fee2e2', color: '#dc2626', fontSize: '0.72rem', fontWeight: 700, padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                              🔄 Có yêu cầu đổi/trả
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{o.customer.fullName}</div>
                          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{o.customer.phone} - {o.customer.city}</div>
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ fontSize: '0.85rem', color: '#334155' }}>
                            {o.items.length} mặt hàng
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                            ({o.items.reduce((s, it) => s + it.quantity, 0)} sp)
                          </div>
                        </td>
                        <td style={{ padding: '0.85rem 1rem', fontWeight: 800, color: '#0f172a' }}>
                          {formatVND(o.totalAmount)}
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          {getStatusBadge(o.status)}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '0.4rem', alignItems: 'center' }}>
                            <button onClick={() => setSelectedOrder(o)} className="btn btn-secondary btn-sm">
                              <Eye size={15} /> Chi tiết
                            </button>
                            {o.status === 'pending' && (
                              <button onClick={() => handleUpdateOrderStatus(o.id, 'processing')} className="btn btn-primary btn-sm">
                                Đóng gói
                              </button>
                            )}
                            {o.status === 'processing' && (
                              <button onClick={() => handleUpdateOrderStatus(o.id, 'shipped')} className="btn btn-primary btn-sm">
                                Giao hàng
                              </button>
                            )}
                            {o.status === 'shipped' && (
                              <button onClick={() => handleUpdateOrderStatus(o.id, 'delivered', 'paid')} className="btn btn-primary btn-sm" style={{ backgroundColor: 'var(--success)' }}>
                                Hoàn tất
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : activeTab === 'customers' ? (
          /* TAB 4: CUSTOMERS MANAGEMENT (MEDUSA FEATURE) */
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#ffffff', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '0.5rem 0.9rem', maxWidth: '400px', flex: 1 }}>
                <Search size={18} color="#64748b" style={{ marginRight: '0.5rem' }} />
                <input
                  type="text"
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  placeholder="Tìm khách hàng theo tên, sđt hoặc email..."
                  style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.9rem' }}
                />
              </div>
              <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>
                Tổng cộng: <strong>{customers.length}</strong> khách hàng
              </div>
            </div>

            <div style={{ backgroundColor: '#ffffff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid var(--border)', color: '#475569', fontWeight: 700 }}>
                    <th style={{ padding: '0.85rem 1rem' }}>Khách Hàng</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Số Điện Thoại</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Email & Địa Chỉ</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Số Đơn Hàng</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Tổng Chi Tiêu</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Phân Hạng</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map(c => {
                    const isVip = c.totalSpent >= 4000000;
                    return (
                      <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#0f172a' }}>
                          {c.fullName}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', color: '#334155', fontWeight: 600 }}>
                          {c.phone}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', color: '#64748b', fontSize: '0.85rem' }}>
                          <div>{c.email || 'Chưa cung cấp'}</div>
                          <div>{c.address ? `${c.address}, ${c.city}` : c.city}</div>
                        </td>
                        <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>
                          {c.ordersCount} đơn
                        </td>
                        <td style={{ padding: '0.85rem 1rem', fontWeight: 800, color: 'var(--primary)' }}>
                          {formatVND(c.totalSpent)}
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          {isVip ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', backgroundColor: '#fef3c7', color: '#b45309', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', fontWeight: 700, fontSize: '0.75rem' }}>
                              <Award size={13} /> Khách VIP
                            </span>
                          ) : (
                            <span style={{ display: 'inline-block', backgroundColor: '#e0f2fe', color: '#0369a1', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', fontWeight: 600, fontSize: '0.75rem' }}>
                              Thành viên
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* TAB 5: RETURNS & REFUNDS (MEDUSA FEATURE) */
          <div>
            <div style={{ marginBottom: '1.2rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.3rem' }}>
                Quản Lý Yêu Cầu Đổi / Trả Hàng & Hoàn Tiền (Claims & Returns)
              </h3>
              <p style={{ fontSize: '0.88rem', color: '#64748b' }}>
                Xử lý khiếu nại, đổi trả sản phẩm và hoàn kho tự động
              </p>
            </div>

            {returnOrders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 1rem', backgroundColor: '#ffffff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                <RotateCcw size={48} strokeWidth={1.5} color="#cbd5e1" style={{ margin: '0 auto 1rem' }} />
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#334155' }}>Không có yêu cầu đổi trả nào</h4>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Mọi đơn hàng đều đang diễn ra thuận lợi!</p>
              </div>
            ) : (
              <div style={{ backgroundColor: '#ffffff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid var(--border)', color: '#475569', fontWeight: 700 }}>
                      <th style={{ padding: '0.85rem 1rem' }}>Mã Đơn</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Khách Hàng</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Lý Do Đổi/Trả</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Trạng Thái</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Phản Hồi Store</th>
                      <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {returnOrders.map(o => (
                      <tr key={o.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '0.85rem 1rem', fontWeight: 800, color: 'var(--primary)' }}>
                          {o.orderNumber}
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ fontWeight: 700 }}>{o.customer.fullName}</div>
                          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{o.customer.phone}</div>
                        </td>
                        <td style={{ padding: '0.85rem 1rem', maxWidth: '240px' }}>
                          <div style={{ fontSize: '0.85rem', color: '#dc2626', fontWeight: 500 }}>{o.returnRequest?.reason}</div>
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Gửi lúc: {formatDate(o.returnRequest?.requestedAt || '')}</div>
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '0.2rem 0.55rem',
                            borderRadius: '4px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            backgroundColor: o.returnRequest?.status === 'approved' ? '#d1fae5' : o.returnRequest?.status === 'rejected' ? '#fee2e2' : '#fef3c7',
                            color: o.returnRequest?.status === 'approved' ? '#065f46' : o.returnRequest?.status === 'rejected' ? '#991b1b' : '#92400e'
                          }}>
                            {o.returnRequest?.status === 'approved' ? 'ĐÃ DUYỆT' : o.returnRequest?.status === 'rejected' ? 'TỪ CHỐI' : 'CHỜ DUYỆT'}
                          </span>
                        </td>
                        <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: '#475569' }}>
                          {o.returnRequest?.adminResponse || 'Chưa phản hồi'}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                          {o.returnRequest?.status === 'pending' ? (
                            <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                              <button
                                onClick={() => handleResolveReturn(o.id, 'approved')}
                                className="btn btn-sm"
                                style={{ backgroundColor: '#10b981', color: '#fff', fontWeight: 600 }}
                              >
                                Duyệt
                              </button>
                              <button
                                onClick={() => handleResolveReturn(o.id, 'rejected')}
                                className="btn btn-danger btn-sm"
                              >
                                Từ chối
                              </button>
                            </div>
                          ) : (
                            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Đã xử lý</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: CÀI ĐẶT NGÂN HÀNG & WEBHOOK THANH TOÁN */}
          {activeTab === 'settings' && (
            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.3rem' }}>
                  Cài Đặt Ngân Hàng & Tự Động Hóa Thanh Toán (Webhook)
                </h2>
                <p style={{ color: '#64748b', fontSize: '0.88rem' }}>
                  Cấu hình tài khoản ngân hàng thật của bạn để khách quét VietQR, và kết nối Webhook để hệ thống tự động nhận biết khi tiền về.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem' }}>
                {/* CỘT 1: Cấu hình Tài khoản Ngân Hàng */}
                <div className="card" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', paddingBottom: '0.8rem', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#eff6ff', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CreditCard size={20} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>Tài Khoản Ngân Hàng Thụ Hưởng</h3>
                      <p style={{ fontSize: '0.78rem', color: '#64748b' }}>Thông tin sẽ dùng để tạo mã VietQR cho khách chuyển tiền</p>
                    </div>
                  </div>

                  <form onSubmit={handleSaveBankSettings}>
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                        Ngân hàng *
                      </label>
                      <select
                        value={bankSettings.bankId}
                        onChange={(e) => {
                          const selected = popularBanks.find(b => b.id === e.target.value);
                          setBankSettings({
                            ...bankSettings,
                            bankId: e.target.value,
                            bankName: selected ? selected.name : e.target.value
                          });
                        }}
                        style={{
                          width: '100%',
                          padding: '0.7rem 0.85rem',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border)',
                          outline: 'none',
                          backgroundColor: '#ffffff'
                        }}
                      >
                        {popularBanks.map(b => (
                          <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                      </select>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                        Số tài khoản ngân hàng của bạn *
                      </label>
                      <input
                        type="text"
                        required
                        value={bankSettings.accountNumber}
                        onChange={(e) => setBankSettings({ ...bankSettings, accountNumber: e.target.value.trim() })}
                        placeholder="Ví dụ: 0388888888"
                        style={{
                          width: '100%',
                          padding: '0.7rem 0.85rem',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border)',
                          outline: 'none',
                          fontWeight: 700,
                          fontSize: '1rem',
                          color: 'var(--primary)'
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                        Tên chủ tài khoản (Viết hoa không dấu) *
                      </label>
                      <input
                        type="text"
                        required
                        value={bankSettings.accountName}
                        onChange={(e) => setBankSettings({ ...bankSettings, accountName: e.target.value.toUpperCase() })}
                        placeholder="Ví dụ: NGUYEN VAN A"
                        style={{
                          width: '100%',
                          padding: '0.7rem 0.85rem',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border)',
                          outline: 'none',
                          fontWeight: 700
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: '1.25rem' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                        Kiểu hiển thị mã VietQR
                      </label>
                      <select
                        value={bankSettings.qrTemplate}
                        onChange={(e) => setBankSettings({ ...bankSettings, qrTemplate: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '0.7rem 0.85rem',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border)',
                          outline: 'none',
                          backgroundColor: '#ffffff'
                        }}
                      >
                        <option value="compact2">Chuẩn VietQR Kèm Logo & Tên (Khuyên dùng)</option>
                        <option value="compact">Gọn (Compact)</option>
                        <option value="qr_only">Chỉ hiển thị QR Code đơn giản</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={isSavingSettings}
                      className="btn btn-primary"
                      style={{ width: '100%', padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                    >
                      {isSavingSettings ? <RefreshCw size={16} className="spin" /> : <Check size={16} />}
                      <span>{isSavingSettings ? 'Đang lưu...' : 'Lưu Cài Đặt Ngân Hàng'}</span>
                    </button>
                  </form>

                  {/* Preview VietQR */}
                  <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px dashed var(--border)', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                      <QrCode size={16} color="var(--primary)" /> Xem trước mã VietQR thật của bạn:
                    </div>
                    <div style={{ display: 'inline-block', padding: '0.6rem', backgroundColor: '#ffffff', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                      <img
                        src={`https://img.vietqr.io/image/${bankSettings.bankId}-${bankSettings.accountNumber}-${bankSettings.qrTemplate}.png?amount=500000&addInfo=TESTPAY&accountName=${encodeURIComponent(bankSettings.accountName)}`}
                        alt="Preview VietQR"
                        style={{ maxWidth: '210px', display: 'block', borderRadius: '4px' }}
                      />
                    </div>
                    <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>
                      Chuẩn NAPAS 24/7 - Quét được trực tiếp trên mọi app ngân hàng (VCB, MB, Techcombank, Momo, v.v.)
                    </p>
                  </div>
                </div>

                {/* CỘT 2: Cấu hình Webhook Tự Động & Sandbox */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {/* Card Webhook Settings */}
                  <div className="card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', paddingBottom: '0.8rem', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#f3e8ff', color: '#9333ea', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Zap size={20} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>Cơ Chế Webhook Tự Động</h3>
                        <p style={{ fontSize: '0.78rem', color: '#64748b' }}>Cách hệ thống tự động biết khi khách chuyển tiền</p>
                      </div>
                    </div>

                    <div style={{ marginBottom: '1.25rem' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>
                        Chọn chế độ xác nhận thanh toán:
                      </label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                        <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: `1.5px solid ${bankSettings.webhookProvider === 'manual' ? 'var(--primary)' : 'var(--border)'}`, backgroundColor: bankSettings.webhookProvider === 'manual' ? '#eff6ff' : '#ffffff', cursor: 'pointer' }}>
                          <input
                            type="radio"
                            name="webhookProvider"
                            checked={bankSettings.webhookProvider === 'manual'}
                            onChange={() => setBankSettings({ ...bankSettings, webhookProvider: 'manual' })}
                            style={{ marginTop: '0.2rem' }}
                          />
                          <div>
                            <strong style={{ fontSize: '0.88rem', display: 'block', color: '#0f172a' }}>1. Đối soát thủ công (Mặc định)</strong>
                            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Khách quét VietQR chuyển tiền vào tài khoản của bạn → Bạn kiểm tra app ngân hàng và bấm duyệt đơn trong Admin.</span>
                          </div>
                        </label>

                        <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: `1.5px solid ${bankSettings.webhookProvider === 'payos' ? '#9333ea' : 'var(--border)'}`, backgroundColor: bankSettings.webhookProvider === 'payos' ? '#faf5ff' : '#ffffff', cursor: 'pointer' }}>
                          <input
                            type="radio"
                            name="webhookProvider"
                            checked={bankSettings.webhookProvider === 'payos'}
                            onChange={() => setBankSettings({ ...bankSettings, webhookProvider: 'payos' })}
                            style={{ marginTop: '0.2rem' }}
                          />
                          <div>
                            <strong style={{ fontSize: '0.88rem', display: 'block', color: '#6b21a8' }}>2. Tự động 100% qua PayOS (Khuyên dùng)</strong>
                            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Cổng thanh toán VietQR miễn phí cho cá nhân và shop. Khách chuyển tiền, PayOS gửi Webhook tức thì → Website tự đổi trạng thái thành Đã thanh toán!</span>
                          </div>
                        </label>

                        <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: `1.5px solid ${bankSettings.webhookProvider === 'casso' ? '#059669' : 'var(--border)'}`, backgroundColor: bankSettings.webhookProvider === 'casso' ? '#f0fdf4' : '#ffffff', cursor: 'pointer' }}>
                          <input
                            type="radio"
                            name="webhookProvider"
                            checked={bankSettings.webhookProvider === 'casso'}
                            onChange={() => setBankSettings({ ...bankSettings, webhookProvider: 'casso' })}
                            style={{ marginTop: '0.2rem' }}
                          />
                          <div>
                            <strong style={{ fontSize: '0.88rem', display: 'block', color: '#065f46' }}>3. Tự động qua Casso.vn (Đồng bộ biến động số dư)</strong>
                            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Đồng bộ biến động số dư tài khoản ngân hàng thật của bạn (MB, VCB, Techcombank...).</span>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Webhook Endpoint Box */}
                    <div style={{ backgroundColor: '#f8fafc', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '0.9rem', marginBottom: '1.25rem' }}>
                      <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>
                        🔗 ĐƯỜNG DẪN WEBHOOK CỦA HỆ THỐNG:
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#ffffff', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1' }}>
                        <code style={{ fontSize: '0.85rem', color: '#0f172a', flex: 1, wordBreak: 'break-all' }}>
                          {typeof window !== 'undefined' ? `${window.location.origin}/api/payment/webhook` : '/api/payment/webhook'}
                        </code>
                        <button
                          type="button"
                          onClick={() => {
                            if (typeof window !== 'undefined') {
                              navigator.clipboard.writeText(`${window.location.origin}/api/payment/webhook`);
                              setCopiedWebhookUrl(true);
                              setTimeout(() => setCopiedWebhookUrl(false), 2000);
                            }
                          }}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                        >
                          {copiedWebhookUrl ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
                          <span>{copiedWebhookUrl ? 'Đã copy' : 'Copy'}</span>
                        </button>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginTop: '0.4rem' }}>
                        (Dán link này vào mục Webhook trên Dashboard của PayOS hoặc Casso khi bạn đăng ký)
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleSaveBankSettings}
                      disabled={isSavingSettings}
                      className="btn btn-secondary"
                      style={{ width: '100%', padding: '0.65rem' }}
                    >
                      Lưu Lựa Chọn Webhook
                    </button>
                  </div>

                  {/* Card Sandbox Test */}
                  <div className="card" style={{ padding: '1.5rem', border: '1.5px solid #d8b4fe', backgroundColor: '#fdf4ff' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#c084fc', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Zap size={18} />
                      </div>
                      <div>
                        <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#581c87' }}>Trung Tâm Thử Nghiệm Webhook (Sandbox)</h4>
                        <p style={{ fontSize: '0.78rem', color: '#7e22ce' }}>Mô phỏng tiền về thật để kiểm tra luồng tự động</p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '0.9rem' }}>
                      <select
                        value={simulatingOrderNumber}
                        onChange={(e) => setSimulatingOrderNumber(e.target.value)}
                        style={{
                          flex: 1,
                          padding: '0.6rem 0.8rem',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid #d8b4fe',
                          outline: 'none',
                          backgroundColor: '#ffffff',
                          fontSize: '0.85rem'
                        }}
                      >
                        <option value="">-- Chọn đơn hàng để test --</option>
                        {orders.filter(o => o.paymentStatus !== 'paid').map(o => (
                          <option key={o.id} value={o.orderNumber}>
                            {o.orderNumber} - {o.customer.fullName} ({formatVND(o.totalAmount)})
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={handleSimulatePayment}
                        disabled={isSimulatingPay || !simulatingOrderNumber}
                        className="btn btn-sm"
                        style={{
                          backgroundColor: '#9333ea',
                          color: '#ffffff',
                          fontWeight: 700,
                          padding: '0.6rem 1rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {isSimulatingPay ? <RefreshCw size={14} className="spin" /> : <Zap size={14} />}
                        <span>Giả lập tiền về</span>
                      </button>
                    </div>

                    {/* Webhook logs */}
                    {webhookLogs.length > 0 && (
                      <div style={{ marginTop: '0.8rem', maxHeight: '160px', overflowY: 'auto', backgroundColor: '#ffffff', borderRadius: 'var(--radius-sm)', border: '1px solid #e9d5ff', padding: '0.6rem' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b21a8', marginBottom: '0.4rem' }}>Nhật ký Webhook gần đây:</div>
                        {webhookLogs.slice(0, 5).map(log => (
                          <div key={log.id} style={{ fontSize: '0.75rem', padding: '0.3rem 0', borderBottom: '1px dashed #f3e8ff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: log.status === 'success' ? '#16a34a' : '#dc2626', fontWeight: 600 }}>
                              {log.status === 'success' ? '✔' : '✖'} {log.orderNumber} ({formatVND(log.amount)})
                            </span>
                            <span style={{ color: '#94a3b8', fontSize: '0.7rem' }}>{formatDate(log.createdAt)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </main>

      {/* MODAL: Thêm / Sửa Sản Phẩm */}
      {isProductModalOpen && (
        <div className="modal-overlay" onClick={() => setIsProductModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '600px', padding: '1.75rem' }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setIsProductModalOpen(false)} style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', color: '#64748b' }}>
              <X size={20} />
            </button>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.2rem' }}>
              {editingProduct ? 'Chỉnh Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}
            </h3>

            <form onSubmit={handleSaveProduct}>
              <div style={{ marginBottom: '0.9rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                  Tên sản phẩm *
                </label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="Ví dụ: Bàn Phím Cơ Không Dây..."
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.9rem', marginBottom: '0.9rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                    Danh mục *
                  </label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', outline: 'none', backgroundColor: '#ffffff' }}
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                    Số lượng tồn kho *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.9rem', marginBottom: '0.9rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                    Giá bán (VNĐ) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    placeholder="1500000"
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                    Giá gốc niêm yết (VNĐ)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={productForm.originalPrice}
                    onChange={(e) => setProductForm({ ...productForm, originalPrice: e.target.value })}
                    placeholder="2000000"
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '0.9rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                  Link ảnh sản phẩm (URL)
                </label>
                <input
                  type="url"
                  value={productForm.image}
                  onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                  placeholder="https://images.unsplash.com/photo-..."
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', outline: 'none' }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                  Mô tả sản phẩm
                </label>
                <textarea
                  rows={3}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="Tính năng nổi bật, bảo hành..."
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={productForm.isFlashSale}
                    onChange={(e) => setProductForm({ ...productForm, isFlashSale: e.target.checked })}
                  />
                  <span>Ưu đãi Flash Sale</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={productForm.isFeatured}
                    onChange={(e) => setProductForm({ ...productForm, isFeatured: e.target.checked })}
                  />
                  <span>Sản phẩm Nổi Bật</span>
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem' }}>
                <button type="button" onClick={() => setIsProductModalOpen(false)} className="btn btn-secondary">
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary" style={{ padding: '0.65rem 1.8rem' }}>
                  Lưu Sản Phẩm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Xem Chi Tiết Đơn Hàng */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-content" style={{ maxWidth: '640px', padding: '1.75rem' }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelectedOrder(null)} style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', color: '#64748b' }}>
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.2rem' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>
                {selectedOrder.orderNumber}
              </div>
              <div>{getStatusBadge(selectedOrder.status)}</div>
            </div>

            {/* Return Request Banner if exists */}
            {selectedOrder.returnRequest && (
              <div style={{
                padding: '0.85rem 1rem',
                backgroundColor: '#fff1f2',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid #fecdd3',
                marginBottom: '1.2rem',
                fontSize: '0.88rem'
              }}>
                <div style={{ fontWeight: 700, color: '#e11d48', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                  <RotateCcw size={16} /> Yêu cầu đổi/trả từ khách hàng:
                </div>
                <div>• Lý do: <strong>{selectedOrder.returnRequest.reason}</strong></div>
                <div>• Trạng thái: <strong>{selectedOrder.returnRequest.status.toUpperCase()}</strong></div>
                {selectedOrder.returnRequest.adminResponse && (
                  <div>• Phản hồi của bạn: {selectedOrder.returnRequest.adminResponse}</div>
                )}
                {selectedOrder.returnRequest.status === 'pending' && (
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.6rem' }}>
                    <button
                      onClick={() => handleResolveReturn(selectedOrder.id, 'approved')}
                      className="btn btn-sm"
                      style={{ backgroundColor: '#10b981', color: '#fff', fontWeight: 600 }}
                    >
                      Duyệt & Hoàn tiền
                    </button>
                    <button
                      onClick={() => handleResolveReturn(selectedOrder.id, 'rejected')}
                      className="btn btn-danger btn-sm"
                    >
                      Từ chối
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Customer Details */}
            <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', marginBottom: '1.2rem', fontSize: '0.88rem' }}>
              <h4 style={{ fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>Thông tin khách hàng & giao nhận:</h4>
              <div>• Khách hàng: <strong>{selectedOrder.customer.fullName}</strong></div>
              <div>• Số điện thoại: <strong>{selectedOrder.customer.phone}</strong></div>
              {selectedOrder.customer.email && <div>• Email: {selectedOrder.customer.email}</div>}
              <div>• Địa chỉ giao: {selectedOrder.customer.address}, {selectedOrder.customer.city}</div>
              {selectedOrder.customer.note && <div>• Ghi chú: <em>{selectedOrder.customer.note}</em></div>}
            </div>

            {/* Items */}
            <div style={{ marginBottom: '1.2rem' }}>
              <h4 style={{ fontWeight: 700, color: '#334155', marginBottom: '0.6rem', fontSize: '0.9rem' }}>
                Danh sách sản phẩm ({selectedOrder.items.length}):
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '180px', overflowY: 'auto' }}>
                {selectedOrder.items.map((it, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.5rem', borderBottom: '1px solid var(--border)' }}>
                    <img src={it.image} alt={it.name} style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0f172a' }}>{it.name}</div>
                      {it.variantTitle && (
                        <div style={{ fontSize: '0.75rem', color: '#7c3aed', fontWeight: 600 }}>Biến thể: {it.variantTitle}</div>
                      )}
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{formatVND(it.price)} x {it.quantity}</div>
                    </div>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>
                      {formatVND(it.price * it.quantity)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Totals */}
            <div style={{ padding: '0.8rem 1rem', backgroundColor: '#f1f5f9', borderRadius: 'var(--radius-md)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                <span>Tạm tính:</span>
                <span>{formatVND(selectedOrder.subtotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                <span>Phí vận chuyển:</span>
                <span>{selectedOrder.shippingFee === 0 ? 'Miễn phí' : formatVND(selectedOrder.shippingFee)}</span>
              </div>
              {selectedOrder.discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem', color: '#059669' }}>
                  <span>Giảm giá:</span>
                  <span>-{formatVND(selectedOrder.discountAmount)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.05rem', color: 'var(--primary)', paddingTop: '0.4rem', borderTop: '1px dashed #cbd5e1' }}>
                <span>Tổng tiền:</span>
                <span>{formatVND(selectedOrder.totalAmount)}</span>
              </div>
            </div>

            {/* Quick Status Actions */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', justifyContent: 'flex-end' }}>
              <button onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'processing')} className="btn btn-secondary btn-sm">
                Đang xử lý
              </button>
              <button onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'shipped')} className="btn btn-secondary btn-sm">
                Đang giao hàng
              </button>
              <button onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'delivered', 'paid')} className="btn btn-primary btn-sm" style={{ backgroundColor: 'var(--success)' }}>
                Hoàn tất & Đã TT
              </button>
              <button onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'cancelled')} className="btn btn-danger btn-sm">
                Hủy đơn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
