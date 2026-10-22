const badgeStyles: Record<string, string> = {
  requested: 'bg-amber-50 text-amber-800 ring-amber-200',
  submitted: 'bg-amber-50 text-amber-800 ring-amber-200',
  new: 'bg-amber-50 text-amber-800 ring-amber-200',
  confirmed: 'bg-mint-50 text-mint-800 ring-mint-200',
  approved: 'bg-mint-50 text-mint-800 ring-mint-200',
  completed: 'bg-navy-50 text-navy-700 ring-navy-200',
  read: 'bg-navy-50 text-navy-700 ring-navy-200',
  archived: 'bg-navy-50 text-navy-500 ring-navy-200',
  cancelled: 'bg-red-50 text-red-700 ring-red-200',
  rejected: 'bg-red-50 text-red-700 ring-red-200',
  customer: 'bg-navy-50 text-navy-700 ring-navy-200',
  employee: 'bg-mint-50 text-mint-800 ring-mint-200',
  admin: 'bg-amber-50 text-amber-800 ring-amber-200',
};

const badgeLabels: Record<string, string> = { submitted: 'Waiting approval' };

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function Badge({ value }: { value: string }) {
  return (
    <span className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${badgeStyles[value] ?? ''}`}>
      {badgeLabels[value] ?? capitalize(value)}
    </span>
  );
}
