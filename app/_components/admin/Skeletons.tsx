'use client';

import React, { useState, useEffect, useRef } from 'react';

export function Skeleton({ w = '100%', h = 12, radius = 3, mb = 0, mt = 0, style = {} }: any) {
  return (
    <div className="shimmer" style={{
      width: w, height: h, borderRadius: radius,
      marginBottom: mb, marginTop: mt,
      background: 'var(--hair)',
      ...style,
    }}/>
  );
}

export function SkeletonCircle({ size = 36 }: any) {
  return <Skeleton w={size} h={size} radius={999}/>;
}

export function TableSkeleton({ rows = 6, cols = 4 }: any) {
  return (
    <div style={{ border: '1px solid var(--hair)', borderRadius: 2, overflow: 'hidden' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: 16, padding: '12px 20px',
        borderBottom: '1px solid var(--hair)',
        background: 'color-mix(in oklch, var(--paper) 50%, #fff)',
      }}>
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} h={8} w="60%"/>
        ))}
      </div>
      {Array.from({ length: rows }).map((_, ri) => (
        <div key={ri} style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: 16, padding: '16px 20px',
          borderBottom: ri < rows - 1 ? '1px solid var(--hair)' : 'none',
          alignItems: 'center',
        }}>
          {Array.from({ length: cols }).map((_, ci) => (
            <Skeleton key={ci} h={10} w={ci === 0 ? '40%' : ci === 1 ? '80%' : '60%'}/>
          ))}
        </div>
      ))}
    </div>
  );
}

export function KPIStripSkeleton({ count = 4 }: any) {
  return (
    <div style={{ display: 'flex', border: '1px solid var(--hair)', borderRight: 0, marginBottom: 32 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ flex: 1, padding: '20px 24px', borderRight: '1px solid var(--hair)' }}>
          <Skeleton h={8} w="50%" mb={10}/>
          <Skeleton h={28} w="60%" mb={6}/>
          <Skeleton h={7} w="40%"/>
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton({ count = 3 }: any) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${count}, 1fr)`, gap: 16 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ border: '1px solid var(--hair)', borderRadius: 8, padding: 20 }}>
          <Skeleton h={8} w="40%" mb={12}/>
          <Skeleton h={24} w="70%" mb={8}/>
          <Skeleton h={8} w="55%" mb={6}/>
          <Skeleton h={8} w="45%"/>
        </div>
      ))}
    </div>
  );
}

export function MastheadSkeleton() {
  return (
    <div style={{ marginBottom: 32 }}>
      <Skeleton h={8} w="20%" mb={12}/>
      <Skeleton h={44} w="60%" mb={8}/>
      <Skeleton h={44} w="45%"/>
    </div>
  );
}

export function TopProgress({ active }: any) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (!active) { setWidth(0); return; }
    setWidth(20);
    const t1 = setTimeout(() => setWidth(60), 100);
    const t2 = setTimeout(() => setWidth(85), 600);
    const t3 = setTimeout(() => setWidth(95), 1500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [active]);

  if (!active && width === 0) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, height: 2, zIndex: 9990,
      background: 'var(--hair)',
    }}>
      <div style={{
        height: '100%',
        width: `${active ? width : 100}%`,
        background: 'var(--ink)',
        transition: active
          ? 'width 0.8s cubic-bezier(.1,.7,.1,1)'
          : 'width 0.2s ease, opacity 0.3s ease 0.1s',
        opacity: active ? 1 : 0,
      }}/>
    </div>
  );
}

export function useInitialLoad(delay = 650) {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return loading;
}

export function PageSkeleton({ variant = 'kpi-table' }: any) {
  if (variant === 'kpi-table') {
    return (
      <div style={{ padding: '40px 48px' }}>
        <MastheadSkeleton/>
        <KPIStripSkeleton/>
        <TableSkeleton/>
      </div>
    );
  }
  if (variant === 'kpi-cards') {
    return (
      <div style={{ padding: '40px 48px' }}>
        <MastheadSkeleton/>
        <KPIStripSkeleton/>
        <CardSkeleton/>
      </div>
    );
  }
  if (variant === 'detail') {
    return (
      <div style={{ padding: '32px 48px' }}>
        <Skeleton h={10} w="15%" mb={16}/>
        <Skeleton h={48} w="55%" mb={8}/>
        <Skeleton h={48} w="40%" mb={24}/>
        <KPIStripSkeleton count={5}/>
        <TableSkeleton rows={8}/>
      </div>
    );
  }
  return (
    <div style={{ padding: '40px 48px' }}>
      <MastheadSkeleton/>
      <TableSkeleton rows={8}/>
    </div>
  );
}

export function LoadingFrame({ keyDep, delay = 650, variant = 'kpi-table', children }: any) {
  const [loading, setLoading] = useState(true);
  const keyRef = useRef(keyDep);

  useEffect(() => {
    setLoading(true);
    keyRef.current = keyDep;
    const t = setTimeout(() => {
      if (keyRef.current === keyDep) setLoading(false);
    }, delay);
    return () => clearTimeout(t);
  }, [keyDep, delay]);

  return (
    <>
      <TopProgress active={loading}/>
      {loading ? <PageSkeleton variant={variant}/> : children}
    </>
  );
}

export default LoadingFrame;
