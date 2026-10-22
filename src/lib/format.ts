export const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

/** Currency used for hourly rates and pay. Change here if Omegs bills in a different currency. */
export const CURRENCY = 'GBP';

export const formatMoney = (amount: number) =>
  new Intl.NumberFormat(undefined, { style: 'currency', currency: CURRENCY }).format(amount);

export const formatHours = (hours: number) => `${hours.toFixed(2)} h`;

/** YYYY-MM-DD in the visitor's local time zone. */
export const localIsoDate = (d = new Date()) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
