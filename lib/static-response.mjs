// Shared by the self-contained preview/Worker. Vercel's static CDN handles its
// own compression; this keeps standalone deployments equally efficient.
export function staticResponse(request, asset, pathname) {
  const acceptsGzip = (request.headers.get('Accept-Encoding') || '').split(',').some(value => {
    const [encoding, ...parameters] = value.trim().split(';');
    const quality = parameters.find(parameter => parameter.trim().startsWith('q='));
    return encoding === 'gzip' && (!quality || Number(quality.trim().slice(2)) > 0);
  });
  const compressed = Boolean(asset.gzip && acceptsGzip);
  const encoded = compressed ? asset.gzip : asset.body;
  const body = compressed || asset.binary ? Uint8Array.from(atob(encoded), character => character.charCodeAt(0)) : encoded;
  const immutable = /^\/assets\/(site|forms)-[a-f0-9]{12}\.css$/.test(pathname);
  const headers = {
    'Content-Type': asset.type,
    'Cache-Control': immutable ? 'public, max-age=31536000, immutable' : pathname.startsWith('/assets/') ? 'public, max-age=3600' : 'public, max-age=60',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  };
  if (asset.gzip) headers.Vary = 'Accept-Encoding';
  if (compressed) headers['Content-Encoding'] = 'gzip';
  return new Response(request.method === 'HEAD' ? null : body, { headers });
}
