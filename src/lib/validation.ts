export const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());

export const isPhone = (value: string) => /^\+?[\d\s().-]{7,20}$/.test(value.trim()) && value.replace(/\D/g, '').length >= 7;

export const passwordIssues = (value: string) => {
  const issues: string[] = [];
  if (value.length < 8) issues.push('at least 8 characters');
  if (!/[A-Za-z]/.test(value)) issues.push('a letter');
  if (!/\d/.test(value)) issues.push('a number');
  return issues;
};

export type Errors<T> = Partial<Record<keyof T, string>>;

export const hasErrors = <T,>(errors: Errors<T>) => Object.values(errors).some(Boolean);
