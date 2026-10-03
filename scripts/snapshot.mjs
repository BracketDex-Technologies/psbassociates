import fs from 'node:fs';
import {collectAnnouncements} from '../lib/announcements.mjs';
const previous=fs.existsSync('data/announcements.json')?JSON.parse(fs.readFileSync('data/announcements.json','utf8')):undefined;
const data=await collectAnnouncements({previous});
if(!data.items.length)throw new Error('No official announcements could be fetched.');
fs.mkdirSync('data',{recursive:true});fs.writeFileSync('data/announcements.json',JSON.stringify(data,null,2));
console.log(JSON.stringify({items:data.items.length,sources:data.sources}));
