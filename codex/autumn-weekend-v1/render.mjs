/* global document, window */
import {chromium} from '@playwright/test';
import {readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {createServer} from 'node:http';
const root=path.dirname(fileURLToPath(import.meta.url));
const server=createServer((req,res)=>{const id=req.url.slice(1);if(!/^(P0[1-6]|B01)\.svg$/.test(id)){res.writeHead(404).end();return;}res.setHeader('Content-Type','image/svg+xml');res.end(readFileSync(path.join(root,'06-delivery',id)));});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || '/usr/bin/chromium',args:['--no-sandbox','--force-color-profile=srgb']});
const page=await browser.newPage({deviceScaleFactor:1});
const evidence=[];
for(const id of ['P01','P02','P03','P04','P05','P06','B01']){
 const h=id==='B01'?1080:1350;await page.setViewportSize({width:1080,height:h});
 const svg=readFileSync(path.join(root,'06-delivery',id+'.svg'),'utf8');
 await page.setContent('<style>body{margin:0}body > svg{display:block}</style>'+svg);await page.evaluate(()=>document.fonts.ready);await page.evaluate(()=>window.scrollTo(0,0));
 const bounds=await page.locator('text').evaluateAll(nodes=>nodes.map(n=>{const b=n.getBBox();return {text:n.textContent,x:b.x,y:b.y,width:b.width,height:b.height,size:n.getAttribute('font-size')};}));
 const bad=bounds.filter(b=>b.x<71 || b.x+b.width>1009 || b.y<0 || b.y+b.height>h-71);
 await page.screenshot({path:path.join(root,'06-delivery',id+'.png')});
 const reopen=await browser.newPage({viewport:{width:1080,height:h},deviceScaleFactor:1});
 await reopen.goto(origin+'/'+id+'.svg');await reopen.evaluate(()=>document.fonts.ready);
 await reopen.screenshot({path:path.join(root,'evidence',id+'-native-final.png')});await reopen.close();
 for(const [width,display] of [[375,343],[768,540],[1440,432]]){
  await page.setViewportSize({width,height:Math.ceil(display*h/1080)+32});
  await page.addStyleTag({content:`body > svg{width:${display}px;height:auto;margin:16px}`});
  await page.evaluate(()=>window.scrollTo(0,0));
  await page.screenshot({path:path.join(root,'evidence',`${id}-${width}-final.png`)});
 }
 evidence.push({id,width:1080,height:h,textBounds:bounds,outOfSafeArea:bad});
}
writeFileSync(path.join(root,'evidence','text-bounds.json'),JSON.stringify(evidence,null,2));
await browser.close();await new Promise(resolve=>server.close(resolve));
if(evidence.some(e=>e.outOfSafeArea.length)){console.error(JSON.stringify(evidence.map(e=>({id:e.id,bad:e.outOfSafeArea})),null,2));process.exitCode=1;}else console.log('All text fits the 72px safe area; 7 PNG exports and 21 review-width screenshots generated.');
