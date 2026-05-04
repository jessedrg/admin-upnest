'use client';
import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
  itemLabel?: string;
}

export function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  totalItems, 
  itemsPerPage,
  itemLabel = 'items'
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const showEllipsis = totalPages > 7;
    
    if (!showEllipsis) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      // Always show first page
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push('...');
      }
      
      // Show pages around current
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i);
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('...');
      }
      
      // Always show last page
      if (totalPages > 1) pages.push(totalPages);
    }
    
    return pages;
  };

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      padding: '16px 20px',
      borderTop: '1px solid var(--hair)',
      background: '#fff',
      flexWrap: 'wrap',
      gap: 12
    }}>
      {/* Info */}
      <div className="mono" style={{ fontSize: 10, letterSpacing: '.14em', color: 'var(--t-4)' }}>
        SHOWING {startItem}–{endItem} OF {totalItems} {itemLabel.toUpperCase()}
      </div>

      {/* Page controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {/* Previous */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          style={{
            appearance: 'none',
            border: '1px solid var(--hair)',
            background: currentPage === 1 ? 'var(--paper-2)' : '#fff',
            padding: '6px 10px',
            borderRadius: 4,
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            opacity: currentPage === 1 ? 0.5 : 1,
            fontFamily: 'var(--mono)',
            fontSize: 10,
            letterSpacing: '.1em',
            color: 'var(--t-3)',
            transition: 'all .15s'
          }}
        >
          ← PREV
        </button>

        {/* Page numbers */}
        <div style={{ display: 'flex', gap: 2 }}>
          {getPageNumbers().map((page, i) => (
            page === '...' ? (
              <span key={`ellipsis-${i}`} style={{ padding: '6px 8px', color: 'var(--t-4)' }}>…</span>
            ) : (
              <button
                key={page}
                onClick={() => onPageChange(page as number)}
                style={{
                  appearance: 'none',
                  border: page === currentPage ? '1px solid var(--ink)' : '1px solid transparent',
                  background: page === currentPage ? 'var(--ink)' : 'transparent',
                  color: page === currentPage ? '#fff' : 'var(--t-2)',
                  padding: '6px 10px',
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontFamily: 'var(--serif)',
                  fontSize: 13,
                  fontStyle: 'italic',
                  minWidth: 32,
                  transition: 'all .15s'
                }}
              >
                {page}
              </button>
            )
          ))}
        </div>

        {/* Next */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          style={{
            appearance: 'none',
            border: '1px solid var(--hair)',
            background: currentPage === totalPages ? 'var(--paper-2)' : '#fff',
            padding: '6px 10px',
            borderRadius: 4,
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            opacity: currentPage === totalPages ? 0.5 : 1,
            fontFamily: 'var(--mono)',
            fontSize: 10,
            letterSpacing: '.1em',
            color: 'var(--t-3)',
            transition: 'all .15s'
          }}
        >
          NEXT →
        </button>
      </div>

      {/* Items per page selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span className="mono" style={{ fontSize: 10, letterSpacing: '.14em', color: 'var(--t-4)' }}>PER PAGE</span>
        <select
          value={itemsPerPage}
          onChange={(e) => {
            // This would need to be handled by parent
          }}
          disabled
          style={{
            appearance: 'none',
            border: '1px solid var(--hair)',
            background: '#fff',
            padding: '6px 10px',
            borderRadius: 4,
            fontFamily: 'var(--mono)',
            fontSize: 11,
            color: 'var(--t-3)',
            cursor: 'default'
          }}
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </div>
    </div>
  );
}

// Hook for pagination logic
export function usePagination<T>(items: T[], itemsPerPage: number = 25) {
  const [currentPage, setCurrentPage] = React.useState(1);
  
  const totalPages = Math.ceil(items.length / itemsPerPage);
  
  // Reset to page 1 if items change significantly
  React.useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [items.length, totalPages, currentPage]);
  
  const paginatedItems = React.useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return items.slice(start, end);
  }, [items, currentPage, itemsPerPage]);
  
  return {
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedItems,
    totalItems: items.length,
    itemsPerPage
  };
}

export default Pagination;
