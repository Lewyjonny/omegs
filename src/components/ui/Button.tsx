import { Loader2 } from 'lucide-react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router-dom';

type Variant = 'primary' | 'accent' | 'secondary' | 'outline' | 'ghost' | 'light';
type Size = 'sm' | 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 whitespace-nowrap';

const variants: Record<Variant, string> = {
  primary: 'bg-navy-900 text-white shadow-sm hover:bg-navy-800 active:bg-navy-950',
  accent: 'bg-mint-400 text-navy-950 shadow-sm hover:bg-mint-300 active:bg-mint-500',
  secondary: 'bg-mint-50 text-navy-900 ring-1 ring-inset ring-mint-200 hover:bg-mint-100',
  outline: 'bg-white text-navy-900 ring-1 ring-inset ring-navy-200 hover:bg-navy-50 hover:ring-navy-300',
  ghost: 'text-navy-700 hover:bg-navy-50 hover:text-navy-900',
  light: 'bg-white/10 text-white ring-1 ring-inset ring-white/25 hover:bg-white/20',
};

const sizes: Record<Size, string> = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-7 text-base',
};

const buttonClasses = (variant: Variant = 'primary', size: Size = 'md', className = '') =>
  `${base} ${variants[variant]} ${sizes[size]} ${className}`;

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}

export function Button({
  variant,
  size,
  className,
  loading,
  children,
  ...props
}: CommonProps & ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <button className={buttonClasses(variant, size, className)} disabled={loading || props.disabled} {...props}>
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}

export function ButtonLink({ variant, size, className, children, ...props }: CommonProps & LinkProps) {
  return (
    <Link className={buttonClasses(variant, size, className)} {...props}>
      {children}
    </Link>
  );
}
