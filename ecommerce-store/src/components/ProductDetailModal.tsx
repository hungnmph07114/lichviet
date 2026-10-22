'use client';

import React, { useState, useEffect } from 'react';
import { Product, ProductVariant } from '@/types';
import { formatVND } from '@/lib/utils';
import { Star, X, ShoppingCart, ShieldCheck, Truck, RefreshCw, Plus, Minus, Check, Layers } from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number, variant?: ProductVariant) => void;
  onBuyNow: (product: Product, quantity: number, variant?: ProductVariant) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onBuyNow
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  // Variant selection state: map optionName -> selectedValue
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(undefined);

  // Initialize selected options when product changes
  useEffect(() => {
    if (product && product.options && product.options.length > 0) {
      const initial: Record<string, string> = {};
      product.options.forEach(opt => {
        if (opt.values.length > 0) {
          initial[opt.name] = opt.values[0];
        }
      });
      setSelectedOptions(initial);
    } else {
      setSelectedOptions({});
      setSelectedVariant(undefined);
    }
    setQuantity(1);
    setSelectedImageIndex(0);
  }, [product]);

  // Update selectedVariant when selectedOptions change
  useEffect(() => {
    if (product && product.variants && product.variants.length > 0) {
      const match = product.variants.find(v => {
        return Object.entries(selectedOptions).every(([optName, optVal]) => {
          return v.options[optName] === optVal;
        });
      });
      setSelectedVariant(match || product.variants[0]);
    } else {
      setSelectedVariant(undefined);
    }
  }, [selectedOptions, product]);

  if (!product) return null;

  // Current effective price and stock based on variant
  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const currentOriginalPrice = selectedVariant?.originalPrice || product.originalPrice;
  const currentStock = selectedVariant ? selectedVariant.stock : product.stock;
  const currentDiscount = currentOriginalPrice && currentOriginalPrice > currentPrice
    ? Math.round(((currentOriginalPrice - currentPrice) / currentOriginalPrice) * 100)
    : product.discount;

  const handleOptionSelect = (optionName: string, value: string) => {
    setSelectedOptions(prev => ({ ...prev, [optionName]: value }));
  };

  const handleAdd = () => {
    onAddToCart(product, quantity, selectedVariant);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleBuy = () => {
    onBuyNow(product, quantity, selectedVariant);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '850px', padding: '1.75rem' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            backgroundColor: '#f1f5f9',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#64748b',
            zIndex: 10
          }}
        >
          <X size={20} />
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          {/* Images Section */}
          <div>
            <div style={{
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              backgroundColor: '#f8fafc',
              border: '1px solid var(--border)',
              marginBottom: '0.8rem',
              aspectRatio: '1/1',
              position: 'relative'
            }}>
              <img
                src={product.images[selectedImageIndex] || product.images[0]}
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              {currentDiscount && currentDiscount > 0 && (
                <span className="badge badge-sale" style={{ position: 'absolute', top: '12px', left: '12px' }}>
                  Giảm {currentDiscount}%
                </span>
              )}
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div style={{ display: 'flex', gap: '0.6rem' }}>
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: 'var(--radius-sm)',
                      overflow: 'hidden',
                      border: `2px solid ${selectedImageIndex === idx ? 'var(--primary)' : 'var(--border)'}`,
                      padding: 0
                    }}
                  >
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}

            {/* Assurance guarantees */}
            <div style={{ marginTop: '1.2rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem', color: '#475569' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShieldCheck size={16} color="#10b981" />
                  <span>Cam kết chính hãng 100% - Bảo hành đầy đủ</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Truck size={16} color="#4f46e5" />
                  <span>Miễn phí giao hàng cho đơn trên 500.000₫</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <RefreshCw size={16} color="#f59e0b" />
                  <span>Hỗ trợ đổi/trả hàng dễ dàng trong 7 ngày</span>
                </div>
              </div>
            </div>
          </div>

          {/* Info Section */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.3, marginBottom: '0.5rem' }}>
              {product.name}
            </h2>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.8rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', color: '#f59e0b', fontWeight: 700, fontSize: '0.9rem' }}>
                <Star size={16} fill="#f59e0b" color="#f59e0b" style={{ marginRight: '4px' }} />
                <span>{product.rating.toFixed(1)}</span>
              </div>
              <span style={{ color: '#94a3b8' }}>•</span>
              <span style={{ color: '#64748b', fontSize: '0.85rem' }}>{product.reviewsCount} khách hàng</span>
              <span style={{ color: '#94a3b8' }}>•</span>
              <span style={{ color: currentStock > 0 ? '#10b981' : '#ef4444', fontWeight: 600, fontSize: '0.85rem' }}>
                {currentStock > 0 ? `Còn hàng (${currentStock})` : 'Tạm hết hàng'}
              </span>
            </div>

            {/* Pricing */}
            <div style={{
              backgroundColor: '#f1f5f9',
              padding: '0.9rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'baseline',
              gap: '0.8rem'
            }}>
              <span style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--primary)' }}>
                {formatVND(currentPrice)}
              </span>
              {currentOriginalPrice && (
                <span style={{ fontSize: '1rem', color: '#94a3b8', textDecoration: 'line-through' }}>
                  {formatVND(currentOriginalPrice)}
                </span>
              )}
              {currentDiscount && currentDiscount > 0 && (
                <span className="badge badge-sale" style={{ marginLeft: 'auto' }}>
                  Tiết kiệm {currentDiscount}%
                </span>
              )}
            </div>

            {/* Product Variants / Options Selector */}
            {product.options && product.options.length > 0 && (
              <div style={{ marginBottom: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.85rem', padding: '0.85rem 1rem', backgroundColor: '#faf5ff', borderRadius: 'var(--radius-md)', border: '1px solid #e9d5ff' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 700, color: '#6b21a8' }}>
                  <Layers size={16} /> Tùy chọn & Biến thể sản phẩm (Options & Variants):
                </div>

                {product.options.map((opt) => (
                  <div key={opt.name}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#4c1d95', marginBottom: '0.4rem' }}>
                      {opt.name}: <strong>{selectedOptions[opt.name]}</strong>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                      {opt.values.map(val => {
                        const isSelected = selectedOptions[opt.name] === val;
                        return (
                          <button
                            key={val}
                            type="button"
                            onClick={() => handleOptionSelect(opt.name, val)}
                            style={{
                              padding: '0.35rem 0.8rem',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: '0.82rem',
                              fontWeight: isSelected ? 700 : 500,
                              backgroundColor: isSelected ? '#7c3aed' : '#ffffff',
                              color: isSelected ? '#ffffff' : '#475569',
                              border: `1.5px solid ${isSelected ? '#7c3aed' : '#d8b4fe'}`,
                              boxShadow: isSelected ? '0 2px 6px rgba(124, 58, 237, 0.3)' : 'none',
                              cursor: 'pointer'
                            }}
                          >
                            {val}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {selectedVariant && (
                  <div style={{ fontSize: '0.78rem', color: '#6b21a8', display: 'flex', justifyContent: 'space-between', paddingTop: '0.3rem', borderTop: '1px dashed #d8b4fe' }}>
                    <span>Mã SKU: <strong>{selectedVariant.sku || selectedVariant.id}</strong></span>
                    <span>Kho biến thể: <strong>{selectedVariant.stock} sp</strong></span>
                  </div>
                )}
              </div>
            )}

            {/* Description */}
            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>Mô tả:</h4>
              <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.5 }}>{product.description}</p>
            </div>

            {/* Specs Table */}
            {product.specs && Object.keys(product.specs).length > 0 && (
              <div style={{ marginBottom: '1.2rem' }}>
                <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>Thông số kỹ thuật:</h4>
                <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', fontSize: '0.82rem' }}>
                  {Object.entries(product.specs).map(([key, val], idx) => (
                    <div
                      key={key}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '130px 1fr',
                        padding: '0.4rem 0.75rem',
                        backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc',
                        borderBottom: idx === Object.keys(product.specs).length - 1 ? 'none' : '1px solid var(--border)'
                      }}
                    >
                      <span style={{ fontWeight: 600, color: '#475569' }}>{key}</span>
                      <span style={{ color: '#0f172a' }}>{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector & Action Buttons */}
            <div style={{ marginTop: 'auto', paddingTop: '0.8rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.9rem' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#334155' }}>Số lượng:</span>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  border: '1.5px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: '#ffffff'
                }}>
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    style={{ padding: '0.4rem 0.65rem', color: '#475569' }}
                    disabled={quantity <= 1}
                  >
                    <Minus size={15} />
                  </button>
                  <span style={{ padding: '0 0.8rem', fontWeight: 700, fontSize: '0.92rem' }}>{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                    style={{ padding: '0.4rem 0.65rem', color: '#475569' }}
                    disabled={quantity >= currentStock}
                  >
                    <Plus size={15} />
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                <button
                  onClick={handleAdd}
                  disabled={currentStock <= 0}
                  className="btn btn-secondary"
                  style={{
                    padding: '0.75rem',
                    fontWeight: 700,
                    borderColor: added ? 'var(--success)' : 'var(--primary)',
                    color: added ? 'var(--success)' : 'var(--primary)',
                    backgroundColor: added ? '#ecfdf5' : '#ffffff'
                  }}
                >
                  {added ? <Check size={18} /> : <ShoppingCart size={18} />}
                  <span>{added ? 'Đã Thêm Vào Giỏ' : 'Thêm Vào Giỏ'}</span>
                </button>

                <button
                  onClick={handleBuy}
                  disabled={currentStock <= 0}
                  className="btn btn-primary"
                  style={{ padding: '0.75rem', fontWeight: 700 }}
                >
                  <span>Mua Ngay</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
