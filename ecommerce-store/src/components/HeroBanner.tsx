'use client';

import React from 'react';
import { Truck, ShieldCheck, RefreshCw, Headphones, Sparkles, Flame, ArrowRight } from 'lucide-react';

interface HeroBannerProps {
  onExploreClick: () => void;
  onFlashSaleClick: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onExploreClick,
  onFlashSaleClick
}) => {
  return (
    <section style={{ margin: '1.5rem 0 2rem 0' }}>
      <div className="container">
        {/* Main Hero Card */}
        <div style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4338ca 100%)',
          borderRadius: 'var(--radius-xl)',
          padding: '2.5rem 2rem',
          color: '#ffffff',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-lg)'
        }}>
          {/* Subtle Background Glow Circles */}
          <div style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '320px',
            height: '320px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.35) 0%, rgba(99, 102, 241, 0) 70%)',
            pointerEvents: 'none'
          }} />
          <div style={{
            position: 'absolute',
            bottom: '-40px',
            left: '30%',
            width: '260px',
            height: '260px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(244, 63, 94, 0.25) 0%, rgba(244, 63, 94, 0) 70%)',
            pointerEvents: 'none'
          }} />

          <div style={{ maxWidth: '680px', position: 'relative', zIndex: 1 }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(8px)',
              padding: '0.35rem 0.85rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: '#fbcfe8',
              marginBottom: '1rem',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <Flame size={16} color="#f43f5e" /> Đại Tiệc Mua Sắm Tổng Hợp • Giảm Đến 35%
            </div>

            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: 800,
              lineHeight: 1.2,
              marginBottom: '1rem',
              letterSpacing: '-0.5px'
            }}>
              Nâng Tầm Không Gian Sống & Trải Nghiệm Công Nghệ
            </h1>

            <p style={{
              fontSize: '1.05rem',
              color: '#c7d2fe',
              lineHeight: 1.6,
              marginBottom: '1.8rem',
              maxWidth: '560px'
            }}>
              Tổng kho mua sắm trực tuyến đa ngành: từ thiết bị âm thanh đỉnh cao, phụ kiện công nghệ cho đến đồ gia dụng thông minh và balo thời trang cao cấp.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.9rem' }}>
              <button
                onClick={onExploreClick}
                className="btn btn-primary btn-lg"
                style={{
                  background: 'linear-gradient(135deg, #f43f5e, #e11d48)',
                  boxShadow: '0 4px 15px rgba(244, 63, 94, 0.45)'
                }}
              >
                <span>Xem Ngay Sản Phẩm</span>
                <ArrowRight size={18} />
              </button>

              <button
                onClick={onFlashSaleClick}
                className="btn btn-secondary btn-lg"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.12)',
                  color: '#ffffff',
                  borderColor: 'rgba(255, 255, 255, 0.25)',
                  backdropFilter: 'blur(6px)'
                }}
              >
                <Sparkles size={18} color="#fbbf24" />
                <span>Ưu Đãi Flash Sale</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4 Guarantees Banner */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
          gap: '1rem',
          marginTop: '1.25rem'
        }}>
          <div style={{
            backgroundColor: 'var(--bg-card)',
            padding: '1.1rem 1.25rem',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.9rem',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{
              backgroundColor: '#e0e7ff',
              color: '#4f46e5',
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)'
            }}>
              <Truck size={22} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a' }}>Miễn Phí Vận Chuyển</h4>
              <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Đơn hàng từ 500.000₫</p>
            </div>
          </div>

          <div style={{
            backgroundColor: 'var(--bg-card)',
            padding: '1.1rem 1.25rem',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.9rem',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{
              backgroundColor: '#d1fae5',
              color: '#059669',
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)'
            }}>
              <ShieldCheck size={22} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a' }}>100% Chính Hãng</h4>
              <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Bảo hành chuẩn 12-24 tháng</p>
            </div>
          </div>

          <div style={{
            backgroundColor: 'var(--bg-card)',
            padding: '1.1rem 1.25rem',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.9rem',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{
              backgroundColor: '#fef3c7',
              color: '#d97706',
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)'
            }}>
              <RefreshCw size={22} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a' }}>Đổi Trả Dễ Dàng</h4>
              <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Trong 7 ngày nếu lỗi NSX</p>
            </div>
          </div>

          <div style={{
            backgroundColor: 'var(--bg-card)',
            padding: '1.1rem 1.25rem',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.9rem',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{
              backgroundColor: '#ffe4e6',
              color: '#e11d48',
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)'
            }}>
              <Headphones size={22} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a' }}>Hỗ Trợ 24/7</h4>
              <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Tư vấn chu đáo & nhiệt tình</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
