export function DemoBadge({ children = 'Demo' }: { children?: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-amber-800 ring-1 ring-inset ring-amber-200">
      {children}
    </span>
  );
}
