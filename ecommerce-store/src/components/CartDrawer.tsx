'use client';

import React, { useState } from 'react';
import { CartItem } from '@/types';
import { formatVND } from '@/lib/utils';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag, Tag, Check, Truck, Layers } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number, variantId?: string) => void;
  onRemoveItem: (productId: string, variantId?: string) => void;
  onProceedToCheckout: (discountAmount: number, promoCode: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout
}) => {
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [promoError, setPromoError] = useState('');

  if (!isOpen) return null;

  const getItemPrice = (item: CartItem) => item.variant ? item.variant.price : item.product.price;
  const subtotal = items.reduce((sum, item) => sum + getItemPrice(item) * item.quantity, 0);
  const freeShippingThreshold = 500000;
  const isFreeShipping = subtotal >= freeShippingThreshold;
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingProgress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  // Discount calculation
  let discountAmount = 0;
  if (appliedPromo === 'NOVASALE' || appliedPromo === 'GIAM10') {
    discountAmount = Math.round(subtotal * 0.1);
  }

  const shippingFee = isFreeShipping || items.length === 0 ? 0 : 30000;
  const total = Math.max(0, subtotal + shippingFee - discountAmount);

  const handleApplyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    if (code === 'NOVASALE' || code === 'GIAM10') {
      setAppliedPromo(code);
      setPromoError('');
    } else {
      setPromoError('Mã không hợp lệ. Hãy thử: NOVASALE hoặc GIAM10');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ justifyContent: 'flex-end', padding: 0 }}>
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          height: '100vh',
          backgroundColor: '#ffffff',
          boxShadow: 'var(--shadow-xl)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          animation: 'fadeIn 0.25s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#ffffff'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <ShoppingBag size={22} color="var(--primary)" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>Giỏ Hàng Của Bạn</h3>
            <span style={{
              backgroundColor: '#f1f5f9',
              color: '#475569',
              fontSize: '0.8rem',
              fontWeight: 700,
              padding: '0.15rem 0.55rem',
              borderRadius: 'var(--radius-full)'
            }}>
              {items.length} món
            </span>
          </div>

          <button
            onClick={onClose}
            style={{
              backgroundColor: '#f1f5f9',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748b'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Free Shipping Progress Bar */}
        <div style={{ padding: '0.8rem 1.5rem', backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: '#334155', marginBottom: '0.4rem' }}>
            <Truck size={16} color={isFreeShipping ? '#10b981' : 'var(--primary)'} />
            <span>
              {isFreeShipping ? (
                <strong style={{ color: '#059669' }}>Chúc mừng! Bạn đã được Miễn phí vận chuyển.</strong>
              ) : (
                <>Mua thêm <strong style={{ color: 'var(--primary)' }}>{formatVND(amountToFreeShipping)}</strong> để được <strong>Freeship</strong></>
              )}
            </span>
          </div>
          <div style={{ width: '100%', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{
              width: `${freeShippingProgress}%`,
              height: '100%',
              backgroundColor: isFreeShipping ? '#10b981' : 'var(--primary)',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>

        {/* Cart Item List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.2rem 1.5rem' }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: '#94a3b8' }}>
              <ShoppingBag size={48} strokeWidth={1.5} style={{ margin: '0 auto 1rem', color: '#cbd5e1' }} />
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#475569', marginBottom: '0.4rem' }}>
                Giỏ hàng đang trống
              </h4>
              <p style={{ fontSize: '0.85rem' }}>Hãy chọn cho mình những món đồ ưng ý nhé!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {items.map(({ product, variant, quantity }) => {
                const itemPrice = variant ? variant.price : product.price;
                const maxStock = variant ? variant.stock : product.stock;
                const itemKey = `${product.id}-${variant?.id || 'base'}`;

                return (
                  <div
                    key={itemKey}
                    style={{
                      display: 'flex',
                      gap: '0.85rem',
                      padding: '0.85rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border)',
                      backgroundColor: '#ffffff'
                    }}
                  >
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      style={{ width: '70px', height: '70px', borderRadius: 'var(--radius-sm)', objectFit: 'cover', backgroundColor: '#f8fafc' }}
                    />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.3, maxWidth: '190px' }}>
                            {product.name}
                          </h4>
                          {variant && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: '#7c3aed', fontWeight: 600, marginTop: '2px' }}>
                              <Layers size={11} /> {variant.title}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => onRemoveItem(product.id, variant?.id)}
                          style={{ color: '#94a3b8', padding: '2px' }}
                          title="Xóa món"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary)', marginTop: '0.3rem' }}>
                        {formatVND(itemPrice)}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '0.4rem' }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          border: '1px solid var(--border)',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: '#f8fafc'
                        }}>
                          <button
                            onClick={() => onUpdateQuantity(product.id, quantity - 1, variant?.id)}
                            style={{ padding: '0.2rem 0.5rem', color: '#64748b' }}
                          >
                            <Minus size={13} />
                          </button>
                          <span style={{ padding: '0 0.5rem', fontSize: '0.85rem', fontWeight: 700 }}>
                            {quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(product.id, quantity + 1, variant?.id)}
                            style={{ padding: '0.2rem 0.5rem', color: '#64748b' }}
                            disabled={quantity >= maxStock}
                          >
                            <Plus size={13} />
                          </button>
                        </div>

                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                          {formatVND(itemPrice * quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Area with Promo & Checkout */}
        {items.length > 0 && (
          <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid var(--border)', backgroundColor: '#ffffff' }}>
            {/* Promo Code Input */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <div style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#f8fafc',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.4rem 0.75rem'
                }}>
                  <Tag size={15} color="#64748b" style={{ marginRight: '0.4rem' }} />
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    placeholder="Mã giảm giá (ví dụ: NOVASALE)"
                    style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.85rem', textTransform: 'uppercase' }}
                  />
                </div>
                <button
                  onClick={handleApplyPromo}
                  className="btn btn-secondary btn-sm"
                  style={{ fontWeight: 600 }}
                >
                  Áp dụng
                </button>
              </div>
              {appliedPromo && (
                <div style={{ fontSize: '0.78rem', color: '#059669', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600 }}>
                  <Check size={13} /> Đã áp dụng mã {appliedPromo} (-10%)
                </div>
              )}
              {promoError && (
                <div style={{ fontSize: '0.78rem', color: '#ef4444', marginTop: '0.3rem' }}>
                  {promoError}
                </div>
              )}
            </div>

            {/* Calculations Breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.88rem', color: '#64748b', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Tạm tính:</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>{formatVND(subtotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Phí vận chuyển:</span>
                <span style={{ fontWeight: 600, color: shippingFee === 0 ? '#10b981' : '#0f172a' }}>
                  {shippingFee === 0 ? 'MIỄN PHÍ' : formatVND(shippingFee)}
                </span>
              </div>
              {discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669' }}>
                  <span>Giảm giá khuyến mãi:</span>
                  <span style={{ fontWeight: 600 }}>-{formatVND(discountAmount)}</span>
                </div>
              )}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '1.1rem',
                fontWeight: 800,
                color: '#0f172a',
                paddingTop: '0.6rem',
                borderTop: '1px dashed var(--border)'
              }}>
                <span>Tổng cộng:</span>
                <span style={{ color: 'var(--primary)' }}>{formatVND(total)}</span>
              </div>
            </div>

            <button
              onClick={() => onProceedToCheckout(discountAmount, appliedPromo || '')}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', fontWeight: 700 }}
            >
              <span>Tiến Hành Đặt Hàng</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
