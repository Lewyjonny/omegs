import { siteConfig } from '../config/site';

function AppleGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M16.37 12.67c-.02-2.2 1.8-3.26 1.88-3.31-1.03-1.5-2.62-1.7-3.18-1.73-1.35-.14-2.64.8-3.33.8-.69 0-1.74-.78-2.87-.76-1.47.02-2.83.86-3.59 2.18-1.53 2.66-.39 6.59 1.1 8.75.73 1.05 1.6 2.24 2.73 2.2 1.1-.05 1.51-.71 2.84-.71 1.32 0 1.7.71 2.86.69 1.18-.02 1.93-1.07 2.65-2.13.84-1.22 1.18-2.4 1.2-2.46-.03-.01-2.3-.88-2.32-3.5ZM14.2 6.2c.6-.73 1.01-1.75.9-2.76-.87.03-1.92.58-2.54 1.31-.56.65-1.05 1.68-.92 2.67.97.08 1.96-.49 2.56-1.22Z" />
    </svg>
  );
}

function PlayGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M4.2 2.6 13.6 12l-9.4 9.4c-.33-.18-.55-.54-.55-.98V3.58c0-.44.22-.8.55-.98Z" fill="#34d399" />
      <path d="m16.8 8.8-3.2 3.2-9.4-9.4c.3-.17.68-.18 1.03.02l11.57 6.18Z" fill="#60a5fa" />
      <path d="m16.8 15.2-11.57 6.18c-.35.2-.73.19-1.03.02l9.4-9.4 3.2 3.2Z" fill="#f87171" />
      <path d="m20.2 10.6-3.4-1.8-3.2 3.2 3.2 3.2 3.4-1.8c.95-.51.95-2.29 0-2.8Z" fill="#fbbf24" />
    </svg>
  );
}

interface Props {
  variant?: 'dark' | 'light';
  size?: 'sm' | 'md';
}

export function AppStoreButtons({ variant = 'dark', size = 'md' }: Props) {
  const stores = [
    { key: 'ios' as const, top: 'Download on the', label: 'App Store', href: siteConfig.appStores.ios, Glyph: AppleGlyph },
    { key: 'android' as const, top: 'Get it on', label: 'Google Play', href: siteConfig.appStores.android, Glyph: PlayGlyph },
  ];
  const tone =
    variant === 'dark'
      ? 'bg-black text-white ring-white/15 hover:bg-navy-900'
      : 'bg-white text-navy-900 ring-navy-200 hover:bg-navy-50';
  const pad = size === 'sm' ? 'h-11 px-3.5 gap-2' : 'h-14 px-5 gap-3';
  const anyUnpublished = stores.some((s) => !s.href);

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {stores.map(({ key, top, label, href, Glyph }) => {
          const content = (
            <>
              <Glyph className={size === 'sm' ? 'h-5 w-5' : 'h-7 w-7'} />
              <span className="text-left leading-none">
                <span className={`block ${size === 'sm' ? 'text-[9px]' : 'text-[10px]'} uppercase tracking-wide opacity-80`}>
                  {href ? top : 'Coming soon to'}
                </span>
                <span className={`mt-0.5 block font-semibold ${size === 'sm' ? 'text-sm' : 'text-lg'}`}>{label}</span>
              </span>
            </>
          );
          return href ? (
            <a key={key} href={href} target="_blank" rel="noreferrer" className={`inline-flex items-center rounded-xl ring-1 transition ${tone} ${pad}`}>
              {content}
            </a>
          ) : (
            <span
              key={key}
              aria-disabled="true"
              title={`${label} listing not yet available`}
              className={`inline-flex cursor-not-allowed items-center rounded-xl opacity-80 ring-1 ${tone} ${pad}`}
            >
              {content}
            </span>
          );
        })}
      </div>
      {anyUnpublished && size === 'md' && (
        <p className={`mt-3 text-xs ${variant === 'dark' ? 'text-navy-400' : 'text-navy-500'}`}>
          The Omegs app is not yet published. Store links will be added once listings are live.
        </p>
      )}
    </div>
  );
}
