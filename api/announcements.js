import snapshot from '../data/announcements.json' with {type:'json'};
import {createFeedHandler} from '../lib/announcements.mjs';

const getFeed=createFeedHandler(snapshot,{cacheProvider:()=>undefined});

// Vercel's Node function adapter shares the collector with the local/Sites runtime.
export default async function announcements(req,res){
  if(!['GET','HEAD'].includes(req.method)){
    res.setHeader('Allow','GET, HEAD');
    res.statusCode=405;
    res.end('Method not allowed');
    return;
  }
  try{
    const response=await getFeed(new Request(new URL(req.url,'https://psbassociates.vercel.app'),{method:req.method}));
    res.statusCode=response.status;
    for(const [key,value] of response.headers)res.setHeader(key,value);
    res.end(req.method==='HEAD'?undefined:Buffer.from(await response.arrayBuffer()));
  }catch{
    res.statusCode=503;
    res.setHeader('Cache-Control','no-store');
    res.setHeader('Content-Type','application/json');
    res.end(JSON.stringify({error:'Announcements are temporarily unavailable. Please retry.'}));
  }
}
