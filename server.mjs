import http from 'node:http';
import worker from './dist/server/index.js';
http.createServer(async(req,res)=>{try{const response=await worker.fetch(new Request('http://127.0.0.1:4173'+req.url,{method:req.method}),{},{});res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));}catch(error){console.error(error);res.writeHead(500).end('Unable to complete request');}}).listen(4173,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:4173'));
