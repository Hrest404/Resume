import * as React from 'react';
import { cn } from '@/lib/utils';

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link' | 'glass';
    size?: 'default' | 'sm' | 'lg' | 'icon';
  }
>(({ className, variant = 'default', size = 'default', ...props }, ref) => {
  const base =
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] cursor-pointer';

  const variants = {
    default:
      'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-600/20 hover:shadow-lg hover:shadow-indigo-600/30 border border-indigo-500/50',
    secondary:
      'bg-white/80 text-slate-800 hover:bg-white border border-white/60 shadow-sm backdrop-blur-md',
    outline:
      'border border-slate-300/80 bg-white/70 hover:bg-white text-slate-700 hover:text-slate-900 shadow-xs backdrop-blur-md',
    ghost:
      'hover:bg-white/60 text-slate-700 hover:text-slate-900',
    destructive:
      'bg-rose-500 text-white hover:bg-rose-600 shadow-md shadow-rose-500/20',
    link:
      'text-indigo-600 underline-offset-4 hover:underline p-0 h-auto',
    glass:
      'bg-white/30 hover:bg-white/50 text-slate-800 border border-white/40 shadow-sm backdrop-blur-md',
  };

  const sizes = {
    default: 'h-9 px-4 py-2',
    sm: 'h-8 px-3 text-xs',
    lg: 'h-11 px-6 text-base',
    icon: 'h-8 w-8 p-0',
  };

  return (
    <button
      ref={ref}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  );
});
Button.displayName = 'Button';

export { Button };
