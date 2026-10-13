import { Plus } from 'lucide-react';
import { useId, useState } from 'react';
import type { Faq } from '../types';

export function FaqAccordion({ items, defaultOpen = 0 }: { items: Faq[]; defaultOpen?: number | null }) {
  const [open, setOpen] = useState<number | null>(defaultOpen);
  const baseId = useId();
  return (
    <div className="divide-y divide-navy-100 rounded-3xl bg-white ring-1 ring-navy-900/5 shadow-soft">
      {items.map((item, i) => {
        const isOpen = open === i;
        const panelId = `${baseId}-panel-${i}`;
        const buttonId = `${baseId}-button-${i}`;
        return (
          <div key={item.question}>
            <h3>
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left text-base font-semibold text-navy-900 transition hover:text-mint-700 sm:px-8"
              >
                {item.question}
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition ${isOpen ? 'rotate-45 bg-navy-900 text-white' : 'bg-navy-50 text-navy-700'}`}
                >
                  <Plus className="h-4 w-4" aria-hidden />
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              className={`grid transition-all duration-300 ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
            >
              <div className="overflow-hidden">
                <p className="px-6 pb-6 pr-16 text-sm leading-relaxed text-navy-600 sm:px-8 sm:pr-20">{item.answer}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
