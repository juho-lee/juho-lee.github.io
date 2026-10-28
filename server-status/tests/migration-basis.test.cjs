const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const dir=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(dir,'index.html'),'utf8');
function runtime(storage=new Map()) {
 const c=vm.createContext({localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},useState:init=>[init(),()=>{}]});
 vm.runInContext(fs.readFileSync(path.join(dir,'report.js'),'utf8'),c);
 const initial=html.split('const { useState, useMemo, useEffect } = React;')[1].split('function RackElevation')[0];
 const parser=html.slice(html.indexOf('let LEGACY_WORKSPACE_BACKUP'),html.indexOf('function Workspace()'));
 const boot=html.slice(html.indexOf('function Workspace()'),html.indexOf('const MIGRATION_PLANS')).replace(/return <GPUDashboard[^\n]+\/\>;/,'return state;');
 vm.runInContext(initial+parser+boot+';globalThis.api={snapshot,normalizeWorkspace,applyWorkspace,Workspace};',c);
 return {c,api:c.api,storage};
}
const load=name=>JSON.parse(fs.readFileSync(path.join(dir,'plans',name)));

test('fresh browser defaults match the supplied baseline, keeping HR1–6 equipment',()=>{
 const {api}=runtime();const baseline=load('baseline.json');
 assert.deepEqual(JSON.parse(JSON.stringify(api.snapshot().racks)),baseline.racks);
 const hr=api.snapshot().racks.filter(r=>r.room==='홍릉');
 assert.equal(hr.filter(r=>r.rackId<=6).reduce((n,r)=>n+r.serverCount,0),30);
 assert.equal(hr.filter(r=>r.rackId>=8&&r.rackId<=13).reduce((n,r)=>n+r.serverCount,0),0);
 assert.equal(hr.find(r=>r.rackId===8).items.length,2);
});

test('all scenarios preserve every existing destination device; repeated loading is replacement',()=>{
 const {api}=runtime();const baseline=load('baseline.json');
 for(const file of ['01-priority1-partial.json','02-priority2-partial.json','03-priority3-partial.json']){
  const data=api.normalizeWorkspace(load(file));
  for(const before of baseline.racks.filter(r=>r.room!=='대전')){
   const after=data.racks.find(r=>r.room===before.room&&r.rackId===before.rackId);
   for(const item of before.items)assert(after.items.some(i=>JSON.stringify(i)===JSON.stringify(item)),`${file}: preserve ${before.room}-${before.rackId}`);
  }
  api.applyWorkspace(data);const once=api.snapshot();api.applyWorkspace(data);const twice=api.snapshot();
  assert.deepEqual(once.racks,twice.racks);
  assert.equal(twice.racks.reduce((n,r)=>n+r.serverCount,0),291);
 }
});

test('obsolete additional-decommission plans are rejected and cached bytes are backed up',()=>{
 const old=load('01-priority1-partial.json');delete old.migration.baselineRevision;delete old.baselineRevision;
 const raw=JSON.stringify(old);const {api,c,storage}=runtime(new Map([['gpuDashboardWorkspace_v1',raw]]));
 assert.throws(()=>api.normalizeWorkspace(old),/이전 기준 플랜/);
 const state=api.Workspace();assert(state.message.includes('최신 기준 현황'));
 assert.equal(storage.get('gpuDashboardWorkspace_v1'),raw);
 assert.equal(storage.get('gpuDashboardWorkspace_legacyBackup'),raw);
 assert.equal(vm.runInContext('LEGACY_WORKSPACE_BACKUP',c),raw);
 assert.equal(api.snapshot().racks.filter(r=>r.room==='홍릉'&&r.rackId<=6).reduce((n,r)=>n+r.serverCount,0),30);
});
