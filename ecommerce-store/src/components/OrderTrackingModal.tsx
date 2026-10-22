'use client';

import React, { useState } from 'react';
import { Order } from '@/types';
import { formatVND, formatDate } from '@/lib/utils';
import { X, Search, Package, Clock, Truck, CheckCircle, AlertCircle } from 'lucide-react';

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  isOpen,
  onClose
}) => {
  const [orderIdInput, setOrderIdInput] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Return & Refund request state
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [returnReason, setReturnReason] = useState('');
  const [submittingReturn, setSubmittingReturn] = useState(false);

  const handleSendReturn = async () => {
    if (!order || !returnReason.trim()) return;
    setSubmittingReturn(true);
    try {
      const res = await fetch(`/api/orders/${order.id}/return`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: returnReason })
      });
      const data = await res.json();
      if (data.success && data.order) {
        setOrder(data.order);
        setShowReturnForm(false);
        setReturnReason('');
      } else {
        alert(data.message || 'Lỗi gửi yêu cầu đổi/trả');
      }
    } catch {
      alert('Không thể kết nối đến máy chủ');
    } finally {
      setSubmittingReturn(false);
    }
  };

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = orderIdInput.trim();
    if (!query) return;

    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const res = await fetch(`/api/orders/${query}`);
      const data = await res.json();
      if (data.success && data.order) {
        setOrder(data.order);
      } else {
        setError(data.message || 'Không tìm thấy đơn hàng này. Vui lòng kiểm tra lại mã đơn.');
      }
    } catch {
      setError('Lỗi khi tìm kiếm đơn hàng. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusStep = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 1;
      case 'processing':
        return 2;
      case 'shipped':
        return 3;
      case 'delivered':
        return 4;
      case 'cancelled':
        return -1;
      default:
        return 1;
    }
  };

  const currentStep = order ? getStatusStep(order.status) : 0;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '640px', padding: '1.75rem' }}
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

        <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.3rem' }}>
          Tra Cứu Đơn Hàng
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '1.25rem' }}>
          Nhập mã đơn hàng của bạn (ví dụ: ORD-98421, ORD-98422...) để theo dõi tình trạng giao hàng
        </p>

        {/* Search Input Form */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.5rem' }}>
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            border: '1.5px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '0.55rem 0.85rem',
            backgroundColor: '#f8fafc'
          }}>
            <Search size={18} color="#64748b" style={{ marginRight: '0.5rem' }} />
            <input
              type="text"
              value={orderIdInput}
              onChange={(e) => setOrderIdInput(e.target.value)}
              placeholder="Nhập mã đơn (VD: ORD-98421)..."
              style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.92rem' }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ padding: '0.55rem 1.25rem' }}
          >
            {loading ? 'Đang tìm...' : 'Tra cứu'}
          </button>
        </form>

        {/* Error message */}
        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.88rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Order Details Found */}
        {order && (
          <div style={{ backgroundColor: '#ffffff', borderRadius: 'var(--radius-md)' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.85rem 1rem',
              backgroundColor: '#f1f5f9',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.5rem'
            }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>MÃ ĐƠN HÀNG</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary)' }}>{order.orderNumber}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>NGÀY ĐẶT</div>
                <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0f172a' }}>{formatDate(order.createdAt)}</div>
              </div>
            </div>

            {/* Stepper Timeline */}
            {order.status === 'cancelled' ? (
              <div style={{ padding: '1rem', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: 'var(--radius-md)', textAlign: 'center', fontWeight: 700, marginBottom: '1.5rem' }}>
                Đơn hàng này đã bị hủy.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '1.8rem', textAlign: 'center' }}>
                {[
                  { step: 1, label: 'Chờ duyệt', icon: <Clock size={16} /> },
                  { step: 2, label: 'Đang xử lý', icon: <Package size={16} /> },
                  { step: 3, label: 'Đang giao', icon: <Truck size={16} /> },
                  { step: 4, label: 'Đã nhận', icon: <CheckCircle size={16} /> }
                ].map((item) => {
                  const isDone = currentStep >= item.step;
                  const isCurrent = currentStep === item.step;
                  return (
                    <div key={item.step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        backgroundColor: isDone ? 'var(--primary)' : '#e2e8f0',
                        color: isDone ? '#ffffff' : '#94a3b8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '0.4rem',
                        boxShadow: isCurrent ? '0 0 0 4px var(--primary-glow)' : 'none'
                      }}>
                        {item.icon}
                      </div>
                      <span style={{ fontSize: '0.78rem', fontWeight: isDone ? 700 : 500, color: isDone ? '#0f172a' : '#94a3b8' }}>
                        {item.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Customer & Delivery address */}
            <div style={{ padding: '0.85rem 1rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', marginBottom: '1.2rem', fontSize: '0.88rem' }}>
              <div style={{ fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>Thông tin người nhận:</div>
              <div>• Khách hàng: <strong>{order.customer.fullName}</strong> ({order.customer.phone})</div>
              <div>• Địa chỉ: {order.customer.address}, {order.customer.city}</div>
              {order.customer.note && <div>• Ghi chú: <em>{order.customer.note}</em></div>}
            </div>

            {/* Order Items */}
            <div style={{ marginBottom: '1.2rem' }}>
              <div style={{ fontWeight: 700, color: '#334155', marginBottom: '0.6rem', fontSize: '0.9rem' }}>Sản phẩm ({order.items.length}):</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: '180px', overflowY: 'auto' }}>
                {order.items.map((it, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.5rem', borderBottom: '1px solid var(--border)' }}>
                    <img src={it.image} alt={it.name} style={{ width: '42px', height: '42px', borderRadius: '6px', objectFit: 'cover' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>{it.name}</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{formatVND(it.price)} x {it.quantity}</div>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>
                      {formatVND(it.price * it.quantity)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px dashed var(--border)', fontWeight: 800, fontSize: '1.05rem', marginBottom: '1.2rem' }}>
              <span>Tổng tiền thanh toán:</span>
              <span style={{ color: 'var(--primary)' }}>{formatVND(order.totalAmount)}</span>
            </div>

            {/* Medusa Feature: Returns & Refunds Management */}
            {order.returnRequest ? (
              <div style={{
                padding: '0.85rem 1rem',
                backgroundColor: order.returnRequest.status === 'approved' ? '#ecfdf5' : order.returnRequest.status === 'rejected' ? '#fef2f2' : '#fef3c7',
                borderRadius: 'var(--radius-md)',
                border: '1px solid ' + (order.returnRequest.status === 'approved' ? '#a7f3d0' : order.returnRequest.status === 'rejected' ? '#fecaca' : '#fde68a'),
                fontSize: '0.85rem'
              }}>
                <div style={{ fontWeight: 700, marginBottom: '0.2rem', color: order.returnRequest.status === 'approved' ? '#065f46' : order.returnRequest.status === 'rejected' ? '#991b1b' : '#92400e' }}>
                  🔄 Yêu Cầu Đổi / Trả Hàng: {order.returnRequest.status === 'approved' ? 'Đã Chấp Thuận' : order.returnRequest.status === 'rejected' ? 'Bị Từ Chối' : 'Đang Chờ Xử Lý'}
                </div>
                <div>• Lý do: {order.returnRequest.reason}</div>
                {order.returnRequest.adminResponse && (
                  <div style={{ marginTop: '0.2rem', fontWeight: 600 }}>• Phản hồi từ Store: {order.returnRequest.adminResponse}</div>
                )}
              </div>
            ) : order.status !== 'cancelled' ? (
              <div style={{ paddingTop: '0.5rem', borderTop: '1px solid var(--border)' }}>
                {showReturnForm ? (
                  <div style={{ backgroundColor: '#f8fafc', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                      Lý do yêu cầu đổi/trả hàng:
                    </div>
                    <textarea
                      rows={2}
                      value={returnReason}
                      onChange={(e) => setReturnReason(e.target.value)}
                      placeholder="Ví dụ: Sản phẩm bị trầy xước, nhầm màu sắc, muốn đổi sang sản phẩm khác..."
                      style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '0.85rem', outline: 'none', marginBottom: '0.6rem' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                      <button
                        type="button"
                        onClick={() => setShowReturnForm(false)}
                        className="btn btn-secondary btn-sm"
                      >
                        Hủy
                      </button>
                      <button
                        type="button"
                        disabled={submittingReturn}
                        onClick={handleSendReturn}
                        className="btn btn-primary btn-sm"
                        style={{ backgroundColor: '#e11d48' }}
                      >
                        {submittingReturn ? 'Đang gửi...' : 'Gửi Yêu Cầu'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowReturnForm(true)}
                    style={{ fontSize: '0.82rem', color: '#e11d48', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}
                  >
                    <span>🔄 Gặp vấn đề với đơn hàng? Yêu cầu Đổi / Trả hàng</span>
                  </button>
                )}
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};
