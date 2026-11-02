// Date helpers on plain 'YYYY-MM-DD' strings (UTC, no time zones involved).

export function ymd(date) {
  return date.toISOString().slice(0, 10);
}

export function parse(s) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) throw new Error(`Invalid date "${s}", expected YYYY-MM-DD`);
  const d = new Date(`${s}T00:00:00Z`);
  if (Number.isNaN(d.getTime()) || ymd(d) !== s) throw new Error(`Invalid date "${s}"`);
  return d;
}

export function addDays(s, n) {
  const d = parse(s);
  d.setUTCDate(d.getUTCDate() + n);
  return ymd(d);
}

export function diffDays(a, b) {
  return Math.round((parse(b) - parse(a)) / 86400000);
}

export function weekday(s) {
  return parse(s).getUTCDay();
}

export const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function weekdayName(s) {
  return WEEKDAYS[weekday(s)];
}

// nth weekday (0=Sun) of month (1-12); n = -1 means the last one.
export function nthWeekday(year, month, wd, n) {
  if (n > 0) {
    const first = new Date(Date.UTC(year, month - 1, 1));
    const offset = (wd - first.getUTCDay() + 7) % 7;
    return ymd(new Date(Date.UTC(year, month - 1, 1 + offset + (n - 1) * 7)));
  }
  const last = new Date(Date.UTC(year, month, 0));
  const offset = (last.getUTCDay() - wd + 7) % 7;
  return ymd(new Date(Date.UTC(year, month - 1, last.getUTCDate() - offset)));
}

export function today() {
  return ymd(new Date());
}

export function pad(n) {
  return String(n).padStart(2, '0');
}

// Western (Gregorian) Easter Sunday, anonymous Gregorian algorithm.
export function easter(year) {
  const a = year % 19, b = Math.floor(year / 100), c = year % 100, d = Math.floor(b / 4), e = b % 4;
  const f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31), day = ((h + l - 7 * m + 114) % 31) + 1;
  return `${year}-${pad(month)}-${pad(day)}`;
}
