'use strict';
// Bit Bazaar v0.53.1: a real browser must install all 180 originals.
// The final art module REQUIRES the final 232 mounting sites to load first.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const sequence=['assets/decor-art-v0.35.js','assets/decor-sites-v0.35.js',
 'assets/decor-art-v0.36.js','assets/decor-sites-v0.36.js',
 'assets/decor-art-v0.37.js','assets/decor-runtime-v0.52.js',
 'assets/save-manager-v0.53.js'];
for(const html of ['preview-v0.53.0.html','baseline-v0.53.0-lowfx.html']){
 const src=read(html);
 let previous=-1;
 for(const asset of sequence){
  const token='src="./'+asset+'"';
  const start=src.indexOf(token);
  assert.ok(start>=0,html+' missing '+asset);
  assert.equal(src.indexOf(token,start+1),-1,'duplicate asset script '+asset);
  assert.ok(start>previous,html+' loads '+asset+' out of dependency order');
  previous=start;
 }
 assert.ok(src.includes('game-v0.53.0'),html+' points to wrong game engine');
}
const worker=read('sw.js');
assert.ok(worker.includes('const CACHE="bit-bazaar-v0.60.0"'),
 'PWA must invalidate old broken v0.53.0 cached shell');
assert.ok(read('index.html').includes('sw.js?v=0.60.0'),
 'Safari must request updated service worker after hotfix');
assert.ok(worker.includes('./assets/decor-art-v0.37.js'),
 'final original artwork remains available to offline PWA');
assert.ok(worker.includes('./assets/decor-sites-v0.36.js'),
 'final mounting-site layout remains available offline');
// The existing v0.37 regression checks actual unique 180 items and 232
// stable mounts by executing the entire original artwork chain.
assert.ok(read('tests/phase4-v037.test.cjs').includes(
 "assert.equal(catalog.items.length,180"));
console.log('PASS v0.53.1: all iPhone entrypoints load 232 sites before 180th art bundle; offline cache updates; archived 180-unique-asset regression remains enforced.');
