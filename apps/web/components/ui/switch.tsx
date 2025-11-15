'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface SwitchProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
}

const Switch = ({ checked = false, onCheckedChange, disabled, className, ...props }: SwitchProps) => {
  const handleToggle = () => {
    if (disabled) return;
    onCheckedChange?.(!checked);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onCheckedChange?.(!checked);
    }
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-disabled={disabled}
      onClick={handleToggle}
      onKeyDown={handleKeyDown}
      className={cn(
        'inline-flex items-center h-6 w-10 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ring-offset-background',
        checked ? 'bg-primary' : 'bg-muted',
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
        className,
      )}
      {...props}
    >
      <span
        className={cn(
          'inline-block h-5 w-5 bg-background rounded-full shadow transform transition-transform',
          checked ? 'translate-x-5' : 'translate-x-0',
        )}
      />
    </button>
  );
};

export { Switch };