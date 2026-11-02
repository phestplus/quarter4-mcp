// Client for Quarter4 Cloud (publishing, analytics, domains, billing).
// QUARTER4_API_KEY authenticates; QUARTER4_API_URL overrides the default host.
const base = () => (process.env.QUARTER4_API_URL || 'https://q4.erasstack.com').replace(/\/+$/, '');

export const NO_KEY = 'No QUARTER4_API_KEY is set. Call cloud_account with action "signup" and the user\'s email to get a free key by email, then add it to the MCP server env as QUARTER4_API_KEY and restart the client.';

async function api(path, { method = 'GET', body, auth = true } = {}) {
  const key = process.env.QUARTER4_API_KEY;
  if (auth && !key) throw new Error(NO_KEY);
  const res = await fetch(`${base()}${path}`, {
    method,
    headers: { 'content-type': 'application/json', 'user-agent': 'quarter4-mcp', ...(auth ? { authorization: `Bearer ${key}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(20000),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? `Quarter4 Cloud returned ${res.status}`);
  return data;
}

export const cloud = {
  signup: (email) => api('/v1/signup', { method: 'POST', body: { email }, auth: false }),
  me: () => api('/v1/me'),
  publish: (b) => api('/v1/pages', { method: 'POST', body: b }),
  pages: () => api('/v1/pages'),
  remove: (id) => api(`/v1/pages/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  stats: (days) => api(`/v1/stats?days=${Number(days) || 30}`),
  connectDomain: (hostname, site) => api('/v1/domains', { method: 'POST', body: { hostname, site } }),
  domainStatus: (hostname) => api(`/v1/domains/${encodeURIComponent(hostname)}`),
  checkout: (plan, currency) => api('/v1/billing/checkout', { method: 'POST', body: { plan, currency } }),
  pricingUrl: () => base(),
};
