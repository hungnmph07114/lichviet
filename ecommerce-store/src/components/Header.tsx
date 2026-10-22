'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingCart, Search, Package, ShieldCheck, Heart, LayoutDashboard } from 'lucide-react';

interface HeaderProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenTracking: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  cartCount,
  onOpenCart,
  onOpenTracking,
  searchQuery,
  onSearchChange
}) => {
  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 100, backgroundColor: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}>
      {/* Top Banner */}
      <div style={{ backgroundColor: '#0f172a', color: '#cbd5e1', fontSize: '0.8rem', padding: '0.45rem 1rem' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: '#10b981', fontWeight: 600 }}>
              <ShieldCheck size={14} /> 100% Hàng chính hãng
            </span>
            <span>•</span>
            <span>Miễn phí vận chuyển toàn quốc cho đơn từ 500.000₫</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
            <button
              onClick={onOpenTracking}
              style={{ color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem' }}
            >
              <Package size={14} /> Tra cứu đơn hàng
            </button>
            <Link
              href="/admin"
              style={{ color: '#818cf8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}
            >
              <LayoutDashboard size={14} /> Trang Quản Trị
            </Link>
          </div>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.9rem 1.25rem', gap: '1.5rem' }}>
        {/* Brand Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}>
          <div style={{
            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
            color: '#fff',
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '1.3rem',
            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.4)'
          }}>
            N
          </div>
          <div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.5px', color: '#0f172a', lineHeight: 1.1 }}>
              NOVA<span style={{ color: '#4f46e5' }}>MART</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, letterSpacing: '0.5px' }}>
              GENERAL E-COMMERCE
            </div>
          </div>
        </Link>

        {/* Live Search Input */}
        <div style={{ flex: 1, maxWidth: '600px', position: 'relative' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#f1f5f9',
            borderRadius: 'var(--radius-full)',
            padding: '0.45rem 1.1rem',
            border: '1.5px solid transparent',
            transition: 'all 0.2s',
          }}>
            <Search size={18} color="#64748b" style={{ marginRight: '0.6rem', flexShrink: 0 }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Tìm kiếm điện thoại, tai nghe, đồ gia dụng, balo thời trang..."
              style={{
                border: 'none',
                background: 'transparent',
                outline: 'none',
                width: '100%',
                color: '#0f172a',
                fontSize: '0.92rem'
              }}
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 700, padding: '0 0.4rem' }}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <button
            onClick={onOpenTracking}
            className="btn btn-secondary btn-sm"
            style={{ borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Package size={16} />
            <span style={{ fontSize: '0.85rem' }}>Tra cứu đơn</span>
          </button>

          {/* Cart Trigger Button */}
          <button
            onClick={onOpenCart}
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'var(--primary)',
              color: '#fff',
              padding: '0.55rem 1.15rem',
              borderRadius: 'var(--radius-full)',
              fontWeight: 600,
              boxShadow: 'var(--shadow-primary)',
              cursor: 'pointer'
            }}
          >
            <ShoppingCart size={19} />
            <span style={{ fontSize: '0.9rem' }}>Giỏ hàng</span>
            {cartCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-5px',
                right: '-5px',
                backgroundColor: '#f43f5e',
                color: '#fff',
                borderRadius: '50%',
                width: '22px',
                height: '22px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 800,
                boxShadow: '0 2px 6px rgba(244, 63, 94, 0.4)'
              }}>
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
