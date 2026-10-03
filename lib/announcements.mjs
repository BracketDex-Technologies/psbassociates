export const SOURCES = [
  { id: 'gst', label: 'GST', url: 'https://www.gst.gov.in/fomessage/newsupdates', home: 'https://www.gst.gov.in/newsandupdates' },
  { id: 'income-tax', label: 'Income Tax', url: 'https://www.incometax.gov.in/iec/foportal/latest-news', home: 'https://www.incometax.gov.in/iec/foportal/latest-news' },
  { id: 'icai', label: 'ICAI', url: 'https://www.icai.org/category/announcements', home: 'https://www.icai.org/category/announcements' },
  { id: 'rbi', label: 'RBI', url: 'https://www.rbi.org.in/pressreleases_rss.xml', home: 'https://www.rbi.org.in/' },
];
const SOURCE_DOMAINS = ['gst.gov.in', 'incometax.gov.in', 'icai.org', 'rbi.org.in'];
export function cleanText(value = '') {
  return String(value).replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '').replace(/<[^>]*>/g, ' ').replace(/&#(x[0-9a-f]+|\d+);/gi, (_, n) => { const cp=n[0].toLowerCase()==='x'?parseInt(n.slice(1),16):parseInt(n,10); return cp>0&&cp<=0x10ffff?String.fromCodePoint(cp):''; }).replace(/&(amp|quot|apos|lt|gt|nbsp|ndash|mdash|rsquo|lsquo|rdquo|ldquo);/g, (_, n) => ({amp:'&',quot:'"',apos:"'",lt:'<',gt:'>',nbsp:' ',ndash:'–',mdash:'—',rsquo:'’',lsquo:'‘',rdquo:'”',ldquo:'“'}[n])).replace(/\s+/g,' ').trim();
}
export function officialUrl(value, base) {
  try { const u = new URL(cleanText(value), base); if(u.protocol==='http:') u.protocol='https:'; return u.protocol==='https:' && !u.username && !u.password && SOURCE_DOMAINS.some(d=>u.hostname===d||u.hostname.endsWith('.'+d)) ? u.href : null; } catch { return null; }
}
export function parseDate(value) {
  const text=cleanText(value); let m=text.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
  if(m) { const iso=`${m[3]}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`; const d=new Date(iso+'T00:00:00Z'); return Number.isFinite(+d)&&d.toISOString().slice(0,10)===iso?iso:null; }
  m=text.match(/(\d{1,2})-([A-Za-z]{3})-(\d{4})/); if(m){const months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']; const month=months.findIndex(x=>x.toLowerCase()===m[2].toLowerCase())+1;return month?`${m[3]}-${String(month).padStart(2,'0')}-${m[1].padStart(2,'0')}`:null;}
  const d=new Date(text); return Number.isFinite(+d)?d.toISOString().slice(0,10):null;
}
function record(source,title,url,date){title=cleanText(title);url=officialUrl(url,source.home);if(!title||title.length<8||!url)return null;return {id:source.id+':'+url+':'+title.slice(0,60),source:source.id,category:source.label,title:title.slice(0,650),url,publishedAt:date};}
export function parseSource(source,body){let items=[];
  if(source.id==='gst') {const data=JSON.parse(body); const rows=Array.isArray(data)?data:data.data; if(!Array.isArray(rows))throw new Error('Unexpected GST response');items=rows.map(x=>record(source,x.title,x.linkURl||`https://www.gst.gov.in/newsandupdates/read/${encodeURIComponent(x.id)}`,parseDate(x.date)));}
  if(source.id==='icai') {const group=body.match(/<ul\s+class=["']list-group["'][^>]*>([\s\S]*?)<\/ul>/i)?.[1]||'';items=[...group.matchAll(/<a\b[^>]*href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)].map(([,url,text])=>{const title=cleanText(text);const date=title.match(/\((\d{2}-\d{2}-\d{4})\)\s*$/)?.[1];return record(source,title.replace(/\s*-\s*\(\d{2}-\d{2}-\d{4}\)\s*$/,''),url,date?parseDate(date):null)});}
  if(source.id==='income-tax') {items=body.split(/<div class="views-row">/).slice(1).map(row=>{const date=row.match(/class="up-date"[^>]*>([^<]+)/)?.[1];const content=row.match(/class="d-flex gry-ft"[^>]*>([\s\S]*?)<\/div>/)?.[1];if(!content)return null;const url=content.match(/href=["']([^"']+)["']/)?.[1]||source.home;const title=cleanText(content.replace(/<a\b[^>]*>[\s\S]*?<\/a>/gi,''));return record(source,title,url,parseDate(date));});}
  if(source.id==='rbi') {const tag=(text,name)=>text.match(new RegExp('<'+name+'[^>]*>([\\s\\S]*?)<\\/'+name+'>','i'))?.[1]||'';items=[...body.matchAll(/<item>([\s\S]*?)<\/item>/gi)].map(([,item])=>record(source,tag(item,'title'),tag(item,'link'),parseDate(tag(item,'pubDate'))));}
  const seen=new Set();return items.filter(Boolean).filter(item=>{if(seen.has(item.id))return false;seen.add(item.id);return true}).sort((a,b)=>(b.publishedAt||'').localeCompare(a.publishedAt||'')).slice(0,20);
}
export async function collectAnnouncements({fetcher=fetch,previous={items:[],sources:[]},now=new Date().toISOString()}={}) {
  const options=()=>({headers:{Accept:'application/json, application/rss+xml, text/html;q=0.9','User-Agent':'PSB-Announcements/1.0 (+https://psbassociates.in)','Cache-Control':'no-cache'},cache:'no-store',signal:AbortSignal.timeout(10000)});
  const results=await Promise.all(SOURCES.map(async source=>{try {const response=await fetcher(source.url,options());if(!response.ok)throw new Error('Source HTTP '+response.status);const body=await response.text();if(body.length>2500000)throw new Error('Source response too large');let items=parseSource(source,body);if(!items.length)throw new Error('Source format changed');if(source.id==='icai'){await Promise.all(items.filter(x=>!x.publishedAt&&new URL(x.url).hostname==='www.icai.org'&&new URL(x.url).pathname.startsWith('/post/')).slice(0,4).map(async item=>{try{const detail=await fetcher(item.url,options());if(detail.ok)item.publishedAt=parseIcaiPublicationDate(await detail.text());}catch{}}));items.sort((a,b)=>(b.publishedAt||'').localeCompare(a.publishedAt||''));}return {items,status:{id:source.id,label:source.label,url:source.home,status:'ok',checkedAt:now}};} catch(error) {console.warn('Announcement source failed',source.id,String(error?.message||error).slice(0,200));const old=previous.sources?.find(x=>x.id===source.id);const items=(previous.items||[]).filter(x=>x.source===source.id);return {items,status:{id:source.id,label:source.label,url:source.home,status:items.length?'stale':'unavailable',errorCode:/^Source HTTP \d+$/.test(error?.message)?error.message:error?.name||'ParseError',checkedAt:old?.checkedAt||null}};}}));
  return {items:results.flatMap(x=>x.items).sort((a,b)=>(b.publishedAt||'').localeCompare(a.publishedAt||'')),sources:results.map(x=>x.status),fetchedAt:now,refreshAfter:900};
}
export function createFeedHandler(snapshot, {fetcher=fetch,cacheProvider=()=>globalThis.caches?.default}={}) {
  let last=snapshot;let validUntil=0;let pending;
  return async function getFeed(request){const force=new URL(request.url).searchParams.get('refresh')==='1';const cache=cacheProvider();const key=new Request(new URL('/__psb_feed_v3',request.url));if(!force){try{const cached=await cache?.match(key);if(cached)return cached;}catch{}}
    if(!force&&Date.now()<validUntil&&last)return Response.json(last,{headers:{'Cache-Control':'public, max-age=60','X-Content-Type-Options':'nosniff'}});
    if(!pending)pending=(async()=>{last=await collectAnnouncements({fetcher,previous:last});validUntil=Date.now()+900000;return last})().finally(()=>{pending=null});
    const data=await pending;const response=Response.json(data,{headers:{'Cache-Control':'public, max-age=900','X-Content-Type-Options':'nosniff'}});try{await cache?.put(key,response.clone());}catch{}if(force)response.headers.set('Cache-Control','no-store');return response;
  };
}
export function parseIcaiPublicationDate(html){const header=html.match(/<td\b[^>]*align\s*=\s*["']right["'][^>]*>\s*<strong>([\s\S]*?)<\/strong>/i)?.[1];if(!header)return null;const text=cleanText(header);const match=text.match(/(\d{1,2})(?:st|nd|rd|th)?\s+(January|February|March|April|May|June|July|August|September|October|November|December),?\s+(\d{4})/i);return match?parseDate(match[1]+'-'+match[2].slice(0,3)+'-'+match[3]):null;}
