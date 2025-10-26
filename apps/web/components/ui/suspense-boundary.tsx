'use client';

import React from 'react';

interface SuspenseBoundaryProps {
  fallback: React.ReactNode;
  children: React.ReactNode;
  errorFallback?: React.ReactNode;
}

export function SuspenseBoundary({ fallback, children, errorFallback }: SuspenseBoundaryProps) {
  const [hasError, setHasError] = React.useState(false);

  if (hasError) {
    return (
      errorFallback || (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <p className="text-destructive mb-4">Щось пішло не так</p>
          <button
            type="button"
            onClick={() => setHasError(false)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Спробувати знову
          </button>
        </div>
      )
    );
  }

  return (
    <React.Suspense fallback={fallback}>
      <ErrorBoundary onError={() => setHasError(true)}>{children}</ErrorBoundary>
    </React.Suspense>
  );
}

// Simple error boundary component
interface ErrorBoundaryState {
  hasError: boolean;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  onError: () => void;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Suspense boundary error:', error, errorInfo);
    this.props.onError();
  }

  render() {
    if (this.state.hasError) {
      return null;
    }

    return this.props.children;
  }
}

export default SuspenseBoundary;
