// Dependency-free static HTTP server exclusively for CI browser tests.
// Serves the local checkout; never reads browser-local game progress.
import {createServer} from 'node:http';
import {createReadStream} from 'node:fs';
import {stat} from 'node:fs/promises';
import {resolve,sep,extname} from 'node:path';

const root=process.cwd(),port=Number(process.env.PORT||4173);
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8',
 '.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8',
 '.json':'application/json','.webmanifest':'application/manifest+json',
 '.png':'image/png','.ico':'image/x-icon','.svg':'image/svg+xml',
 '.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp'};
const send=(res,status,body)=>{
 res.writeHead(status,{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store'});
 res.end(body);
};
const server=createServer(async(req,res)=>{
 let pathname;
 try{
  pathname=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname);
  if(pathname.endsWith('/'))pathname+='index.html';
  const file=resolve(root,'.'+pathname);
  if(!(file===root||file.startsWith(root+sep)))return send(res,403,'Forbidden');
  const st=await stat(file);
  if(!st.isFile())return send(res,404,'Not found');
  res.writeHead(200,{'Content-Type':mime[extname(file)]||'application/octet-stream',
   'Cache-Control':'no-store'});
  createReadStream(file).on('error',()=>res.destroy()).pipe(res);
 }catch(_){send(res,404,'Not found');}
});
server.listen(port,'127.0.0.1',()=>console.log('Bit Bazaar CI site at http://127.0.0.1:'+port));
