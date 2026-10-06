import {handleContact} from '../lib/contact.mjs';
export default async function contact(req,res){
 let body;
 if(req.method==='POST'){
  if(req.body!==undefined)body=typeof req.body==='string'?req.body:JSON.stringify(req.body);
  else{const chunks=[];let size=0;for await(const chunk of req){size+=chunk.length;if(size>16000){res.statusCode=413;res.end('Request too large');return;}chunks.push(chunk);}body=Buffer.concat(chunks).toString();}
 }
 const headers=new Headers();for(const [key,value]of Object.entries(req.headers))if(value)headers.set(key,Array.isArray(value)?value.join(','):value);
 const result=await handleContact(new Request(new URL(req.url,'https://psbassociates.vercel.app'),{method:req.method,headers,...(body!==undefined?{body}:{})}),process.env);
 res.statusCode=result.status;for(const [key,value]of result.headers)res.setHeader(key,value);res.end(Buffer.from(await result.arrayBuffer()));
}
