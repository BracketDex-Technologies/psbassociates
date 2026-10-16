import fs from 'node:fs';
import path from 'node:path';
import { gzipSync } from 'node:zlib';
import {legacyRoutes} from '../page-sections.mjs';
const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.name==='server'?[]:e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.webp':'image/webp','.jpg':'image/jpeg','.png':'image/png','.woff2':'font/woff2','.svg':'image/svg+xml','.xml':'application/xml','.txt':'text/plain'};
fs.mkdirSync('dist/assets',{recursive:true});fs.copyFileSync('data/announcements.json','dist/assets/announcements-snapshot.json');
const assets={};for(const filename of walk('dist')){if(filename.includes('.openai'))continue;const ext=path.extname(filename),binary=['.webp','.jpg','.png','.woff2'].includes(ext);let route='/'+path.relative('dist',filename).replaceAll('\\','/');const entry={type:mime[ext]||'application/octet-stream',binary,body:fs.readFileSync(filename,binary?'base64':'utf8')};if(!binary&&Buffer.byteLength(entry.body)>1024)entry.gzip=gzipSync(entry.body,{level:9}).toString('base64');assets[route]=entry;if(route.endsWith('/index.html'))assets[route.slice(0,-10)]=entry;}
const feed=fs.readFileSync('lib/announcements.mjs','utf8').replace(/\bexport /g,'');
const respond=fs.readFileSync('lib/static-response.mjs','utf8').replace(/\bexport /g,'');
const source=`${feed}
${respond}
const snapshot=${fs.readFileSync('data/announcements.json','utf8')};
const assets=${JSON.stringify(assets)};
const feedHandler=createFeedHandler(snapshot);
export default { async fetch(request,env,ctx){
 const url=new URL(request.url);
 if(!['GET','HEAD'].includes(request.method))return new Response('Method not allowed',{status:405,headers:{Allow:'GET, HEAD'}});
 const redirects=${JSON.stringify(legacyRoutes)};
 const normalizedPath=url.pathname.endsWith('/')?url.pathname:url.pathname+'/';
 if(redirects[normalizedPath])return Response.redirect(url.origin+redirects[normalizedPath],308);
 if(url.pathname==='/api/announcements')return feedHandler(request);
 const asset=assets[url.pathname];
 if(!asset&&!url.pathname.endsWith('/')&&assets[url.pathname+'/'])return Response.redirect(url.origin+url.pathname+'/',308);
 if(!asset){
  const response=staticResponse(request,assets['/404.html'],'/404.html');
  response.headers.set('X-Robots-Tag','noindex');
  return new Response(response.body,{status:404,headers:response.headers});
 }
 return staticResponse(request,asset,url.pathname);
}};`;
fs.mkdirSync('dist/server',{recursive:true});fs.writeFileSync('dist/server/index.js',source);
console.log('Built self-contained Worker with announcements API and '+Object.keys(assets).length+' asset routes.');
