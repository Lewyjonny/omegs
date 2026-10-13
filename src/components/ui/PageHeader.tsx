import type { ReactNode } from 'react';

export function PageHeader({ eyebrow, title, description, children }: { eyebrow?: string; title: string; description?: string; children?: ReactNode }) {
  return (
    <section className="relative overflow-hidden bg-surface">
      <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-mint-100/70 blur-3xl" />
      <div className="container-page relative py-16 sm:py-20 lg:py-24">
        <div className="max-w-3xl animate-fade-up">
          {eyebrow && <span className="eyebrow">{eyebrow}</span>}
          <h1 className="mt-4 text-4xl font-bold sm:text-5xl lg:text-6xl">{title}</h1>
          {description && <p className="mt-5 max-w-2xl text-lg leading-relaxed text-navy-600">{description}</p>}
          {children && <div className="mt-8">{children}</div>}
        </div>
      </div>
    </section>
  );
}
