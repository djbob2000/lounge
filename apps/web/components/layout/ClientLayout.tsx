'use client';

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';

interface ClientLayoutProps {
  children: ReactNode;
  className: string;
}

export default function ClientLayout({ children, className }: ClientLayoutProps) {
  const [isMounted, setIsMounted] = useState(false);

  // Prevent hydration mismatch by ensuring client-side rendering
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className={className} suppressHydrationWarning>
        {/* Render a skeleton or minimal content during SSR */}
        <div className="min-h-screen" />
      </div>
    );
  }

  return (
    <div className={className} suppressHydrationWarning>
      {children}
    </div>
  );
}
