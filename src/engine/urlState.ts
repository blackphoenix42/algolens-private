export const read = () => new URLSearchParams(location.search);

export const write = (
  partial: Record<string, string | number | undefined | null>
) => {
  const q = new URLSearchParams(location.search);
  Object.entries(partial).forEach(([k, v]) => {
    if (v === undefined || v === null) q.delete(k);
    else q.set(k, String(v));
  });
  history.replaceState(null, "", `?${q.toString()}`);
};

/**
 * Parse and clamp a numeric query-string parameter.
 * Falls back to `fallback` when the value is missing or not a finite number.
 */
export const getNumber = (
  params: URLSearchParams,
  key: string,
  fallback: number,
  opts: { min?: number; max?: number; integer?: boolean } = {}
): number => {
  const raw = params.get(key);
  if (raw === null) return fallback;
  const parsed = opts.integer ? parseInt(raw, 10) : Number(raw);
  if (!Number.isFinite(parsed)) return fallback;
  let value = parsed;
  if (opts.min !== undefined) value = Math.max(opts.min, value);
  if (opts.max !== undefined) value = Math.min(opts.max, value);
  return value;
};

/** Parse a string query-string parameter, restricted to an optional whitelist. */
export const getString = <T extends string = string>(
  params: URLSearchParams,
  key: string,
  fallback: T,
  allowed?: readonly T[]
): T => {
  const raw = params.get(key);
  if (raw === null) return fallback;
  if (allowed && !allowed.includes(raw as T)) return fallback;
  return raw as T;
};
