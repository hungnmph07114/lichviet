'use client';

import React, { useState, useEffect, useRef } from 'react';
import { CartItem, Order, PaymentMethod, BankSettings } from '@/types';
import { formatVND } from '@/lib/utils';
import { X, CheckCircle, Truck, QrCode, CreditCard, Copy, Check, ArrowLeft, RefreshCw, Zap, ShieldCheck } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  discountAmount: number;
  promoCode: string;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  discountAmount,
  promoCode,
  onOrderSuccess
}) => {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    city: 'Hà Nội',
    note: ''
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [bankSettings, setBankSettings] = useState<BankSettings | null>(null);
  const [isPaidSuccess, setIsPaidSuccess] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const pollingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Tải cấu hình ngân hàng thật
  useEffect(() => {
    if (isOpen) {
      fetch('/api/settings')
        .then(res => res.json())
        .then(data => {
          if (data.success && data.settings) {
            setBankSettings(data.settings);
          }
        })
        .catch(err => console.error('Lỗi tải cấu hình ngân hàng:', err));
    }
  }, [isOpen]);

  // Lắng nghe trạng thái thanh toán tự động qua Polling
  useEffect(() => {
    if (createdOrder && createdOrder.paymentMethod === 'bank_transfer' && !isPaidSuccess) {
      pollingTimerRef.current = setInterval(async () => {
        try {
          const res = await fetch(`/api/orders/${createdOrder.id}`);
          const data = await res.json();
          if (data.success && data.order && data.order.paymentStatus === 'paid') {
            setIsPaidSuccess(true);
            setCreatedOrder(data.order);
            if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
          }
        } catch (e) {
          console.error('Lỗi kiểm tra trạng thái đơn hàng:', e);
        }
      }, 3000);
    }

    return () => {
      if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
    };
  }, [createdOrder, isPaidSuccess]);

  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + (item.variant ? item.variant.price : item.product.price) * item.quantity, 0);
  const shippingFee = subtotal >= 500000 ? 0 : 30000;
  const total = Math.max(0, subtotal + shippingFee - discountAmount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.phone.trim() || !formData.address.trim()) {
      setErrorMessage('Vui lòng điền họ tên, số điện thoại và địa chỉ giao hàng');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const orderItems = items.map(item => ({
        productId: item.product.id,
        variantId: item.variant?.id,
        variantTitle: item.variant?.title,
        name: item.variant ? `${item.product.name} (${item.variant.title})` : item.product.name,
        price: item.variant ? item.variant.price : item.product.price,
        quantity: item.quantity,
        image: item.product.images[0]
      }));

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: formData,
          items: orderItems,
          paymentMethod,
          discountAmount
        })
      });

      const data = await res.json();
      if (data.success && data.order) {
        setCreatedOrder(data.order);
        onOrderSuccess(data.order);
      } else {
        setErrorMessage(data.message || 'Lỗi khi gửi đơn hàng');
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('Không thể kết nối đến máy chủ. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSimulatePayment = async () => {
    if (!createdOrder) return;
    setIsSimulating(true);
    try {
      const res = await fetch('/api/payment/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber: createdOrder.orderNumber,
          amount: createdOrder.totalAmount,
          provider: 'PayOS / Casso Webhook Sandbox'
        })
      });
      const data = await res.json();
      if (data.success && data.order) {
        setIsPaidSuccess(true);
        setCreatedOrder(data.order);
      }
    } catch (e) {
      console.error('Lỗi giả lập:', e);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={createdOrder ? onClose : undefined}>
      <div
        className="modal-content"
        style={{ maxWidth: '680px', padding: '2rem' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            backgroundColor: '#f1f5f9',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#64748b'
          }}
        >
          <X size={20} />
        </button>

        {/* Order Success View */}
        {createdOrder ? (
          <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: isPaidSuccess || createdOrder.paymentStatus === 'paid' ? '#d1fae5' : '#eff6ff',
              color: isPaidSuccess || createdOrder.paymentStatus === 'paid' ? '#10b981' : '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              boxShadow: '0 4px 14px rgba(0,0,0,0.08)'
            }}>
              {isPaidSuccess || createdOrder.paymentStatus === 'paid' ? <CheckCircle size={38} /> : <QrCode size={36} />}
            </div>

            <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.3rem' }}>
              {isPaidSuccess || createdOrder.paymentStatus === 'paid'
                ? 'Đã Thanh Toán Thành Công!'
                : 'Đặt Hàng Thành Công!'}
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.92rem', marginBottom: '1.2rem' }}>
              Cảm ơn quý khách <strong>{createdOrder.customer.fullName}</strong>. Mã tra cứu đơn hàng của bạn là:
            </p>

            {/* Order Code Box */}
            <div style={{
              backgroundColor: '#f8fafc',
              border: '1.5px dashed #cbd5e1',
              borderRadius: 'var(--radius-lg)',
              padding: '0.9rem 1.25rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '1.25rem'
            }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Mã đơn hàng</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '1px' }}>
                  {createdOrder.orderNumber}
                </div>
              </div>
              <button
                onClick={() => handleCopy(createdOrder.orderNumber, 'orderNumber')}
                className="btn btn-secondary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                {copiedField === 'orderNumber' ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                <span>{copiedField === 'orderNumber' ? 'Đã chép' : 'Sao chép'}</span>
              </button>
            </div>

            {/* QR Payment Screen for Bank Transfer */}
            {createdOrder.paymentMethod === 'bank_transfer' && (
              <div style={{
                backgroundColor: isPaidSuccess || createdOrder.paymentStatus === 'paid' ? '#f0fdf4' : '#faf5ff',
                border: `1.5px solid ${isPaidSuccess || createdOrder.paymentStatus === 'paid' ? '#86efac' : '#e9d5ff'}`,
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem',
                textAlign: 'left',
                fontSize: '0.9rem',
                marginBottom: '1.25rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
              }}>
                {isPaidSuccess || createdOrder.paymentStatus === 'paid' ? (
                  <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
                    <div style={{ color: '#16a34a', fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                      <ShieldCheck size={24} /> GIAO DỊCH ĐÃ ĐƯỢC XÁC NHẬN TỰ ĐỘNG!
                    </div>
                    <p style={{ color: '#15803d', fontSize: '0.88rem', margin: 0 }}>
                      Hệ thống đã nhận được số tiền <strong>{formatVND(createdOrder.totalAmount)}</strong> qua Webhook. Đơn hàng đã chuyển sang trạng thái <strong>Đang đóng gói</strong>.
                    </p>
                  </div>
                ) : (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px dashed #d8b4fe', paddingBottom: '0.6rem' }}>
                      <div style={{ fontWeight: 800, color: '#6b21a8', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.95rem' }}>
                        <QrCode size={20} color="#9333ea" /> Quét mã VietQR để thanh toán:
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: '#7e22ce', backgroundColor: '#f3e8ff', padding: '0.25rem 0.6rem', borderRadius: '20px', fontWeight: 600 }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#a855f7', display: 'inline-block', animation: 'pulse 1.5s infinite' }}></span>
                        Tự động nhận tiền qua Webhook
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '190px 1fr', gap: '1.25rem', alignItems: 'center' }}>
                      {/* VietQR Image */}
                      <div style={{ textAlign: 'center', backgroundColor: '#ffffff', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }}>
                        <img
                          src={`https://img.vietqr.io/image/${bankSettings?.bankId || 'MB'}-${bankSettings?.accountNumber || '999988886666'}-${bankSettings?.qrTemplate || 'compact2'}.png?amount=${createdOrder.totalAmount}&addInfo=${createdOrder.orderNumber}&accountName=${encodeURIComponent(bankSettings?.accountName || 'NOVA MART STORE')}`}
                          alt="VietQR Code"
                          style={{ width: '100%', borderRadius: '6px', display: 'block' }}
                        />
                        <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginTop: '0.35rem' }}>
                          Mở app Ngân hàng để quét
                        </span>
                      </div>

                      {/* Bank Details with Copy Buttons */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', fontSize: '0.86rem' }}>
                        <div>
                          <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Ngân hàng thụ hưởng:</span>
                          <strong style={{ color: '#0f172a' }}>{bankSettings?.bankName || 'MB Bank - Ngân hàng Quân Đội'}</strong>
                        </div>

                        <div>
                          <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Số tài khoản:</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <strong style={{ color: 'var(--primary)', fontSize: '1rem', letterSpacing: '0.5px' }}>
                              {bankSettings?.accountNumber || '999988886666'}
                            </strong>
                            <button
                              onClick={() => handleCopy(bankSettings?.accountNumber || '999988886666', 'accNum')}
                              style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}
                              title="Sao chép STK"
                            >
                              {copiedField === 'accNum' ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Chủ tài khoản:</span>
                          <strong style={{ color: '#0f172a' }}>{bankSettings?.accountName || 'NOVA MART STORE'}</strong>
                        </div>

                        <div>
                          <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Số tiền cần chuyển:</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <strong style={{ color: '#dc2626', fontSize: '1.05rem' }}>{formatVND(createdOrder.totalAmount)}</strong>
                            <button
                              onClick={() => handleCopy(String(createdOrder.totalAmount), 'amount')}
                              style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}
                              title="Sao chép số tiền"
                            >
                              {copiedField === 'amount' ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                            </button>
                          </div>
                        </div>

                        <div style={{ backgroundColor: '#fef2f2', border: '1px dashed #fca5a5', padding: '0.45rem 0.65rem', borderRadius: '6px' }}>
                          <span style={{ color: '#991b1b', display: 'block', fontSize: '0.75rem', fontWeight: 600 }}>Nội dung chuyển khoản (bắt buộc):</span>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <strong style={{ color: '#dc2626', fontSize: '1.05rem', letterSpacing: '1px' }}>{createdOrder.orderNumber}</strong>
                            <button
                              onClick={() => handleCopy(createdOrder.orderNumber, 'memo')}
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '0.15rem 0.5rem', fontSize: '0.75rem' }}
                            >
                              {copiedField === 'memo' ? 'Đã sao chép' : 'Sao chép'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Simulation Button for Testing */}
                    <div style={{ marginTop: '1rem', paddingTop: '0.8rem', borderTop: '1px dashed #e9d5ff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.8rem', color: '#6b21a8' }}>
                        💡 Đang trong chế độ kiểm thử (Sandbox):
                      </span>
                      <button
                        onClick={handleSimulatePayment}
                        disabled={isSimulating}
                        className="btn btn-sm"
                        style={{
                          backgroundColor: '#9333ea',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          fontSize: '0.8rem',
                          padding: '0.35rem 0.75rem'
                        }}
                      >
                        {isSimulating ? <RefreshCw size={13} className="spin" /> : <Zap size={13} />}
                        <span>{isSimulating ? 'Đang xử lý...' : 'Bấm để Test Webhook tiền về'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.8rem' }}>
              <button
                onClick={onClose}
                className="btn btn-primary"
                style={{ padding: '0.75rem 2rem' }}
              >
                Tiếp Tục Mua Sắm
              </button>
            </div>
          </div>
        ) : (
          /* Checkout Form */
          <div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.3rem' }}>
              Thông Tin Giao Hàng & Thanh Toán
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '1.5rem' }}>
              Vui lòng điền thông tin để chúng tôi liên hệ và giao hàng sớm nhất
            </p>

            {errorMessage && (
              <div style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#dc2626',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.88rem',
                marginBottom: '1.2rem'
              }}>
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.9rem', marginBottom: '0.9rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                    Họ và tên người nhận *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Nguyễn Văn A"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border)',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                    Số điện thoại nhận hàng *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="0987654321"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border)',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.9rem', marginBottom: '0.9rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                    Email (để nhận hóa đơn)
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="khachhang@gmail.com"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border)',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                    Tỉnh / Thành phố *
                  </label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border)',
                      outline: 'none',
                      backgroundColor: '#ffffff'
                    }}
                  >
                    <option value="Hà Nội">Hà Nội</option>
                    <option value="Hồ Chí Minh">Hồ Chí Minh</option>
                    <option value="Đà Nẵng">Đà Nẵng</option>
                    <option value="Hải Phòng">Hải Phòng</option>
                    <option value="Cần Thơ">Cần Thơ</option>
                    <option value="Bình Dương">Bình Dương</option>
                    <option value="Đồng Nai">Đồng Nai</option>
                    <option value="Tỉnh thành khác">Tỉnh thành khác</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '0.9rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                  Địa chỉ chi tiết (Số nhà, tên đường, phường/xã) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Ví dụ: 120 Cầu Giấy, P. Quan Hoa, Q. Cầu Giấy"
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                  Ghi chú cho shipper (tùy chọn)
                </label>
                <input
                  type="text"
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  placeholder="Ví dụ: Giao giờ hành chính, gọi trước 15 phút..."
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Payment Methods */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.6rem' }}>
                  Phương thức thanh toán:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    padding: '0.8rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: `1.5px solid ${paymentMethod === 'cod' ? 'var(--primary)' : 'var(--border)'}`,
                    backgroundColor: paymentMethod === 'cod' ? 'var(--primary-light)' : '#ffffff',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                    />
                    <Truck size={18} color="var(--primary)" />
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Thanh toán khi nhận hàng (COD)</span>
                  </label>

                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    padding: '0.8rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: `1.5px solid ${paymentMethod === 'bank_transfer' ? 'var(--primary)' : 'var(--border)'}`,
                    backgroundColor: paymentMethod === 'bank_transfer' ? 'var(--primary-light)' : '#ffffff',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'bank_transfer'}
                      onChange={() => setPaymentMethod('bank_transfer')}
                    />
                    <QrCode size={18} color="var(--primary)" />
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Chuyển khoản QR ngân hàng</span>
                  </label>
                </div>
              </div>

              {/* Summary and Submit Button */}
              <div style={{
                padding: '1rem',
                backgroundColor: '#f8fafc',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                marginBottom: '1.2rem',
                fontSize: '0.9rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', color: '#64748b' }}>
                  <span>Tạm tính ({items.length} món):</span>
                  <span>{formatVND(subtotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', color: '#64748b' }}>
                  <span>Phí vận chuyển:</span>
                  <span>{shippingFee === 0 ? 'Miễn phí' : formatVND(shippingFee)}</span>
                </div>
                {discountAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', color: '#059669' }}>
                    <span>Giảm giá ({promoCode}):</span>
                    <span>-{formatVND(discountAmount)}</span>
                  </div>
                )}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingTop: '0.5rem',
                  borderTop: '1px dashed var(--border)',
                  fontWeight: 800,
                  fontSize: '1.1rem',
                  color: '#0f172a'
                }}>
                  <span>Tổng tiền thanh toán:</span>
                  <span style={{ color: 'var(--primary)' }}>{formatVND(total)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.85rem', fontSize: '1.05rem', fontWeight: 700 }}
              >
                {isSubmitting ? 'Đang Xử Lý Đơn Hàng...' : 'Xác Nhận Đặt Hàng Ngay'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
