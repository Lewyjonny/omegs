import { CircleAlert, CircleCheck, Info } from 'lucide-react';
import type { ReactNode } from 'react';

type Tone = 'info' | 'success' | 'error' | 'demo';

const styles: Record<Tone, string> = {
  info: 'bg-navy-50 text-navy-800 ring-navy-200',
  success: 'bg-mint-50 text-mint-900 ring-mint-200',
  error: 'bg-red-50 text-red-800 ring-red-200',
  demo: 'bg-amber-50 text-amber-900 ring-amber-200',
};

const icons = { info: Info, success: CircleCheck, error: CircleAlert, demo: Info };

export function Alert({ tone = 'info', title, children, className = '' }: { tone?: Tone; title?: string; children?: ReactNode; className?: string }) {
  const Icon = icons[tone];
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={`flex gap-3 rounded-2xl p-4 text-sm ring-1 ring-inset ${styles[tone]} ${className}`}>
      <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
      <div className="space-y-1">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className="leading-relaxed">{children}</div>}
      </div>
    </div>
  );
}
