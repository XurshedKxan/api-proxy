export const config = { matcher: '/:path*' };

export default async function middleware(req) {
  const url = new URL(req.url);
  const targetPath = url.pathname;
  const query = url.search || '';

  let targetBase;
  if (targetPath.startsWith('/v1/')) {
    targetBase = 'https://api.openai.com';
  } else {
    targetBase = 'https://api.anthropic.com';
  }

  const targetUrl = targetBase + targetPath + query;

  const skipHeaders = new Set([
    'host', 'connection', 'cf-connecting-ip', 'x-forwarded-for',
    'x-real-ip', 'cf-ipcountry', 'cf-ray', 'cf-visitor',
    'x-vercel-ip-country', 'x-vercel-forwarded-for',
    'x-vercel-ip-city', 'x-vercel-ip-country-region',
    'x-vercel-ip-latitude', 'x-vercel-ip-longitude',
    'x-vercel-ip-timezone', 'x-vercel-proxy-signature',
    'x-vercel-proxy-signature-ts', 'x-forwarded-host',
    'x-forwarded-proto', 'x-vercel-id', 'x-vercel-trace',
    'x-middleware-invoke', 'x-middleware-next',
  ]);

  const headers = new Headers();
  for (const [key, value] of req.headers.entries()) {
    if (!skipHeaders.has(key.toLowerCase())) {
      headers.set(key, value);
    }
  }

  const response = await fetch(targetUrl, {
    method: req.method,
    headers,
    body: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : undefined,
  });

  return new Response(response.body, {
    status: response.status,
    headers: response.headers,
  });
}
