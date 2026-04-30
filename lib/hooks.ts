"use client";

import { useEffect, useState } from "react";

/** True for the first N ms after mount — for shimmer skeletons. */
export function useInitialLoad(ms = 600) {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), ms);
    return () => clearTimeout(t);
  }, [ms]);
  return loading;
}
