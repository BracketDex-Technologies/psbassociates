import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);
const html=walk('dist').filter(f=>f.endsWith('.html')),titles=new Set(),descriptions=new Set();
for(const file of html){
 const text=fs.readFileSync(file,'utf8');const title=text.match(/<title>(.*?)<\/title>/)?.[1];assert(title?.trim(),'Missing title '+file);assert(!titles.has(title),'Duplicate title '+title);titles.add(title);
 const description=text.match(/name="description" content="([^"]+)"/)?.[1];assert(description?.trim(),'Missing description '+file);assert(!descriptions.has(description),'Duplicate description '+file);descriptions.add(description);
 assert.equal((text.match(/<h1[ >]/g)||[]).length,1,'Expected one H1 '+file);
 for(const image of text.matchAll(/<img\b[^>]*>/g))assert(/\balt="[^"]*"/.test(image[0]),'Missing image alt '+file);
 for(const [,url]of text.matchAll(/(?:href|src)="(\/[^"#?]*)"/g))assert(fs.existsSync(path.join('dist',url)),'Missing local target '+url+' in '+file);
 const image=text.match(/property="og:image" content="([^"]+)"/)?.[1];assert(image?.startsWith('https://'),'Missing HTTPS preview '+file);assert(fs.existsSync(path.join('dist',new URL(image).pathname)),'Missing preview image '+file);assert(text.includes('name="twitter:image"'),'Missing social preview '+file);
 JSON.parse(text.match(/<script type="application\/ld\+json">(.*?)<\/script>/)?.[1]);
}
assert.equal(html.length,21,'Expected 19 content pages plus 404 and thank-you');const sitemap=fs.readFileSync('dist/sitemap.xml','utf8');assert.equal((sitemap.match(/<loc>/g)||[]).length,19);assert(!sitemap.includes('thank-you')&&!sitemap.includes('404.html'));
for(const page of ['404.html','thank-you/index.html'])assert(fs.readFileSync('dist/'+page,'utf8').includes('noindex, follow'));
assert(fs.readFileSync('dist/robots.txt','utf8').includes('Sitemap: https://'));const home=fs.readFileSync('dist/index.html','utf8');assert(home.includes('13+'));assert(home.includes('M.Com., ACA'));assert(home.includes('href="tel:+919922412220"'));assert(!home.includes('about:invalid'));assert(!home.includes('Aurangabad'));assert(!home.includes('refinance'));
console.log('Verified 21 pages: unique titles/descriptions, H1s, alt text, internal links, social images, structured data, sitemap, contact link and utility-page noindex.');
