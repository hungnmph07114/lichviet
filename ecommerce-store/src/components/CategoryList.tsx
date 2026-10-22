'use client';

import React from 'react';
import { Category } from '@/types';
import { Smartphone, Home, Watch, Headphones, Grid } from 'lucide-react';

interface CategoryListProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (catId: string) => void;
}

export const CategoryList: React.FC<CategoryListProps> = ({
  categories,
  selectedCategory,
  onSelectCategory
}) => {
  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Smartphone':
        return <Smartphone size={18} />;
      case 'Home':
        return <Home size={18} />;
      case 'Watch':
        return <Watch size={18} />;
      case 'Headphones':
        return <Headphones size={18} />;
      default:
        return <Grid size={18} />;
    }
  };

  return (
    <div style={{ marginBottom: '1.8rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>Danh Mục Nổi Bật</h2>
        <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Chọn danh mục để lọc sản phẩm</span>
      </div>

      <div style={{
        display: 'flex',
        gap: '0.75rem',
        overflowX: 'auto',
        paddingBottom: '0.5rem',
        scrollbarWidth: 'none'
      }}>
        {/* All category pill */}
        <button
          onClick={() => onSelectCategory('all')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.65rem 1.2rem',
            borderRadius: 'var(--radius-full)',
            fontWeight: 600,
            fontSize: '0.9rem',
            whiteSpace: 'nowrap',
            backgroundColor: selectedCategory === 'all' ? '#0f172a' : '#ffffff',
            color: selectedCategory === 'all' ? '#ffffff' : '#475569',
            border: `1.5px solid ${selectedCategory === 'all' ? '#0f172a' : '#e2e8f0'}`,
            boxShadow: selectedCategory === 'all' ? '0 4px 12px rgba(15, 23, 42, 0.2)' : 'var(--shadow-sm)',
            cursor: 'pointer'
          }}
        >
          <Grid size={18} />
          <span>Tất cả sản phẩm</span>
        </button>

        {/* Dynamic Categories */}
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.55rem',
                padding: '0.65rem 1.2rem',
                borderRadius: 'var(--radius-full)',
                fontWeight: 600,
                fontSize: '0.9rem',
                whiteSpace: 'nowrap',
                backgroundColor: isSelected ? 'var(--primary)' : '#ffffff',
                color: isSelected ? '#ffffff' : '#475569',
                border: `1.5px solid ${isSelected ? 'var(--primary)' : '#e2e8f0'}`,
                boxShadow: isSelected ? 'var(--shadow-primary)' : 'var(--shadow-sm)',
                cursor: 'pointer'
              }}
            >
              {getCategoryIcon(cat.iconName)}
              <span>{cat.name}</span>
              {typeof cat.itemCount === 'number' && (
                <span style={{
                  fontSize: '0.75rem',
                  backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.25)' : '#f1f5f9',
                  color: isSelected ? '#ffffff' : '#64748b',
                  padding: '0.1rem 0.45rem',
                  borderRadius: '10px'
                }}>
                  {cat.itemCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
