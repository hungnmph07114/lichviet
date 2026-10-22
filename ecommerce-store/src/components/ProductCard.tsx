'use client';

import React from 'react';
import { Product } from '@/types';
import { formatVND } from '@/lib/utils';
import { Star, ShoppingCart, Eye, Sparkles } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onViewDetail: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onViewDetail
}) => {
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <div style={{
      backgroundColor: 'var(--bg-card)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: 'var(--shadow-sm)'
    }}>
      {/* Product Image Container */}
      <div
        style={{
          position: 'relative',
          paddingTop: '80%',
          backgroundColor: '#f8fafc',
          cursor: 'pointer',
          overflow: 'hidden'
        }}
        onClick={() => onViewDetail(product)}
      >
        <img
          src={product.images[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'}
          alt={product.name}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.4s ease'
          }}
          onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.06)')}
          onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        />

        {/* Badges overlay */}
        <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {product.discount && product.discount > 0 && (
            <span className="badge badge-sale">
              -{product.discount}%
            </span>
          )}
          {product.isFlashSale && (
            <span className="badge" style={{ backgroundColor: '#ffedd5', color: '#c2410c' }}>
              <Sparkles size={11} /> Flash Sale
            </span>
          )}
        </div>

        {/* Quick View Button on Image */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewDetail(product);
          }}
          style={{
            position: 'absolute',
            bottom: '10px',
            right: '10px',
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            color: '#fff',
            borderRadius: 'var(--radius-full)',
            padding: '0.45rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(4px)',
            opacity: 0.9,
            transition: 'all 0.2s'
          }}
          title="Xem chi tiết"
        >
          <Eye size={16} />
        </button>
      </div>

      {/* Card Content */}
      <div style={{ padding: '1.1rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Rating and Reviews */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.45rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', color: '#f59e0b', fontSize: '0.85rem', fontWeight: 700 }}>
            <Star size={14} fill="#f59e0b" color="#f59e0b" style={{ marginRight: '3px' }} />
            <span>{product.rating.toFixed(1)}</span>
          </div>
          <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>({product.reviewsCount} đánh giá)</span>
          <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: isOutOfStock ? '#ef4444' : isLowStock ? '#f59e0b' : '#10b981', fontWeight: 600 }}>
            {isOutOfStock ? 'Hết hàng' : isLowStock ? `Chỉ còn ${product.stock}` : `Còn ${product.stock} sp`}
          </span>
        </div>

        {/* Product Title */}
        <h3
          onClick={() => onViewDetail(product)}
          style={{
            fontSize: '0.96rem',
            fontWeight: 700,
            color: '#0f172a',
            lineHeight: 1.4,
            marginBottom: '0.65rem',
            cursor: 'pointer',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: '2.7rem'
          }}
        >
          {product.name}
        </h3>

        {/* Price Area */}
        <div style={{ marginTop: 'auto', paddingTop: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary)' }}>
              {formatVND(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span style={{ fontSize: '0.85rem', color: '#94a3b8', textDecoration: 'line-through' }}>
                {formatVND(product.originalPrice)}
              </span>
            )}
          </div>

          {/* Action Button */}
          <button
            onClick={() => onAddToCart(product)}
            disabled={isOutOfStock}
            className="btn btn-primary"
            style={{
              width: '100%',
              marginTop: '0.85rem',
              borderRadius: 'var(--radius-md)',
              padding: '0.55rem',
              fontSize: '0.9rem',
              opacity: isOutOfStock ? 0.5 : 1,
              cursor: isOutOfStock ? 'not-allowed' : 'pointer'
            }}
          >
            <ShoppingCart size={16} />
            <span>{isOutOfStock ? 'Hết hàng' : 'Thêm Vào Giỏ'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
