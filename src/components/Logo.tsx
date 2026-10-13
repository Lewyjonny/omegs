import { Link } from 'react-router-dom';

export function LogoMark({ className = 'h-9 w-9' }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden>
      <rect width="40" height="40" rx="12" className="fill-navy-900" />
      <path d="M20 8.5a11.5 11.5 0 1 0 0 23 11.5 11.5 0 0 0 0-23Zm0 4.6a6.9 6.9 0 1 1 0 13.8 6.9 6.9 0 0 1 0-13.8Z" fill="#fff" />
      <path d="M28.6 5.5l1.3 3.2 3.2 1.1-3.2 1.3-1.3 3.2-1.3-3.2-3.2-1.3 3.2-1.1Z" className="fill-mint-400" />
    </svg>
  );
}

export function Logo({ invert = false, className = '' }: { invert?: boolean; className?: string }) {
  return (
    <Link to="/" className={`inline-flex items-center gap-2.5 rounded-lg ${className}`} aria-label="Omegs home">
      <LogoMark />
      <span className={`text-xl font-extrabold tracking-tight ${invert ? 'text-white' : 'text-navy-900'}`}>
        omegs<span className="text-mint-400">.</span>
      </span>
    </Link>
  );
}
