import type { ReactNode } from 'react';

interface Props {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: 'left' | 'center';
  invert?: boolean;
  as?: 'h1' | 'h2';
}

export function SectionHeading({ eyebrow, title, description, align = 'center', invert = false, as: Tag = 'h2' }: Props) {
  return (
    <div className={`${align === 'center' ? 'mx-auto text-center' : ''} max-w-2xl`}>
      {eyebrow && <span className={invert ? 'eyebrow bg-white/10 text-mint-200 ring-white/20' : 'eyebrow'}>{eyebrow}</span>}
      <Tag className={`mt-4 text-3xl font-bold sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1] ${invert ? 'text-white' : ''}`}>{title}</Tag>
      {description && <p className={`mt-4 text-lg leading-relaxed ${invert ? 'text-navy-200' : 'text-navy-600'}`}>{description}</p>}
    </div>
  );
}
