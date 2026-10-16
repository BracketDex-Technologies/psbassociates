import http from 'node:http';
import worker from './dist/server/index.js';
import {handleContact} from './lib/contact.mjs';
const port=Number(process.env.PORT||4173);
const host=process.env.HOST||'127.0.0.1';
http.createServer(async(req,res)=>{try{if(req.url.split('?')[0]==='/api/contact'){let body='';for await(const chunk of req){body+=chunk;if(Buffer.byteLength(body)>16000){res.writeHead(413).end('Request too large');return;}}const request=new Request(`http://${host}:${port}`+req.url,{method:req.method,headers:req.headers,...(req.method==='POST'?{body}:{})});const response=await handleContact(request,process.env);res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));return;}const response=await worker.fetch(new Request(`http://${host}:${port}`+req.url,{method:req.method,headers:req.headers}),{},{});res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));}catch(error){console.error(error);res.writeHead(500).end('Unable to complete request');}}).listen(port,host,()=>console.log(`Server listening on http://${host}:${port}`));
