/**
 * `fetchWithTimeout` is a wrapper around `fetch` that adds a timeout. If the
 * request takes longer than the timeout, the request will be aborted.
 */
export const fetchWithTimeout = async (
  url: string,
  options: RequestInit,
  timeout: number,
) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  const res = await fetch(url, { ...options, signal: controller.signal });
  clearTimeout(id);
  return res;
};
