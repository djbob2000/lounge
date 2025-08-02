'use client';

import { ReactNode } from 'react';

interface ClientLayoutProps {
  children: ReactNode;
  className: string;
}

export default function ClientLayout({
  children,
  className,
}: ClientLayoutProps) {
  return <div className={className}>{children}</div>;
}
