const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const context = vm.createContext({});
vm.runInContext(fs.readFileSync(path.join(root, 'report.js'), 'utf8'), context);
const api = context.GPUReport;
const load = name => JSON.parse(fs.readFileSync(path.join(root, 'plans', name + '.json')));
const complete = '03-priority3-conditional-full';

test('scenario room totals reconcile and include auxiliary devices', () => {
  for (const [name, emptyHR, emptyYJ, moved, retained] of [
    ['01-priority1-partial', 6, 3, 55, 23],
    ['02-priority2-partial', 6, 0, 67, 11],
    [complete, 3, 0, 78, 0]
  ]) {
    const report = api.build(load(name));
    const rows = report.sections.find(s => s.title === '서버실별 잔여 랙').rows;
    assert.equal(rows[0][4], emptyHR);
    assert.equal(rows[1][4], emptyYJ);
    rows.forEach(row => {
      assert.equal(row[1], row[2] + row[3] + row[4]);
      assert.equal(row[4], row.slice(5).reduce((a,b) => a+b,0));
    });
    assert.equal(report.occupancy.flatMap(r => r.incoming).reduce((n,i) => n+i.count,0), moved);
    const input = load(name);
    assert.equal(input.racks.filter(r => r.room === '대전').flatMap(r => r.items).reduce((n,i) => n+i.count,0), retained);
  }
});

test('nominal temporary use is distinct from existing equipment mixing', () => {
  const report = api.build(load(complete));
  const section = report.sections.find(s => s.title === '대전 이전에 사용한 공간의 성격');
  assert.deepEqual(Array.from(section.rows, r => r[1]), [8,0,3,3]);
  assert.equal(report.occupancy.filter(r => r.mixedFaculty).length, 0);
  assert.equal(report.occupancy.filter(r => r.mixedExisting).length, 1);
  assert.equal(report.occupancy.find(r => r.rack.room === '홍릉' && r.rack.rackId === 1).knownPower, false);
});

test('explicit faculty reservations override defaults, source totals follow live edits', () => {
  const data = load(complete);
  data.racks.find(r => r.room === '홍릉' && r.rackId === 12).allocationCategory = 'newFaculty';
  let report = api.build(data);
  assert.equal(report.sections.find(s => s.title === '서버실별 잔여 랙').rows[0][6], 1);
  const rack = data.racks.find(r => r.items.some(i => i.origin?.room === '대전'));
  const index = rack.items.findIndex(i => i.origin?.room === '대전');
  rack.items.splice(index,1);
  report = api.build(data);
  assert.equal(report.occupancy.flatMap(r => r.incoming).reduce((n,i) => n+i.count,0), 77);
});

test('missing provenance cannot fabricate routes; output escapes user content', () => {
  const data = load(complete);
  for (const r of data.racks) for (const i of r.items) delete i.origin;
  const report = api.build(data);
  assert.equal(report.sections.find(s => s.title === '대전 원래 랙별 이전·잔류 경로').rows.length, 0);
  const malicious = { title:'<script>bad</script>',sections:[{title:'<svg>',paragraphs:['<img onerror=bad>'],headers:['A'],rows:[['<script> | value\nnext']]}] };
  assert(!api.printable(malicious).includes('<script>'));
  assert(api.markdown(malicious).includes('\\|'));
  assert(api.printable(report).includes('window.print()'));
});

test('report contains only allocation, migration and post-migration sections', () => {
  const report = api.build(load(complete));
  assert.deepEqual(Array.from(new Set(report.sections.map(s => s.group))), ['기존 배정 상태','이동 계획','이동 후 상태']);
  assert(report.sections.every(s => s.headers && !s.paragraphs));
  const md = api.markdown(report);
  assert.equal((md.match(/^## /gm) || []).length, 3);
  assert(!md.includes('판독 기준'));
  assert(!md.includes('계획 전제와 미확인 사항'));
});
