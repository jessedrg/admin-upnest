'use client';

import React, { useState, useEffect } from 'react';

interface ToastItem {
  id: string;
  kind: 'success' | 'error' | 'info' | 'warn' | 'ok';
  title?: string;
  body?: string;
  ttl: number;
  leaving?: boolean;
}

export function ToastHost() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    const on = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      const id = Math.random().toString(36).slice(2);
      const item: ToastItem = { id, kind: 'info', ttl: 4200, ...detail };
      setItems(prev => [...prev, item]);
      setTimeout(() => {
        setItems(prev => prev.map(x => x.id === id ? { ...x, leaving: true } : x));
        setTimeout(() => setItems(prev => prev.filter(x => x.id !== id)), 260);
      }, item.ttl);
    };
    window.addEventListener('toast', on);
    return () => window.removeEventListener('toast', on);
  }, []);

  const kindStyle: Record<string, React.CSSProperties> = {
    ok:      { background:'#D4EDDA', color:'#1B5E20', borderColor:'#A8D5B5' },
    success: { background:'#D4EDDA', color:'#1B5E20', borderColor:'#A8D5B5' },
    error:   { background:'#FDECEA', color:'#7B1111', borderColor:'#F5C6CB' },
    warn:    { background:'#FFF3CD', color:'#664D03', borderColor:'#FFE69C' },
    info:    { background:'var(--paper)', color:'var(--ink)', borderColor:'var(--hair)' },
  };

  if (!items.length) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
      display: 'flex', flexDirection: 'column', gap: 10,
      pointerEvents: 'none',
    }}>
      {items.map(item => {
        const s = kindStyle[item.kind] || kindStyle.info;
        return (
          <div key={item.id} style={{
            ...s,
            border: '1px solid',
            borderColor: s.borderColor as string,
            borderRadius: 10,
            padding: '12px 18px',
            minWidth: 280,
            maxWidth: 380,
            boxShadow: '0 8px 24px rgba(0,0,0,.12)',
            opacity: item.leaving ? 0 : 1,
            transform: item.leaving ? 'translateY(8px)' : 'translateY(0)',
            transition: 'opacity .26s ease, transform .26s ease',
            pointerEvents: 'auto',
          }}>
            {item.title && (
              <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 15, marginBottom: item.body ? 4 : 0 }}>
                {item.title}
              </div>
            )}
            {item.body && (
              <div style={{ fontSize: 13, opacity: .8, lineHeight: 1.4 }}>{item.body}</div>
            )}
            {!item.title && !item.body && (
              <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 15 }}>
                {String((item as any).message || '')}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function toast(detail: Partial<ToastItem> | string) {
  const payload = typeof detail === 'string'
    ? { title: detail }
    : detail;
  window.dispatchEvent(new CustomEvent('toast', { detail: payload }));
}

export function showToast(msg: string, opts?: Partial<ToastItem>) {
  toast({ title: msg, ...opts });
}

export default ToastHost;
