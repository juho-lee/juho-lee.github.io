/* Report calculations use the current snapshot, not the scenario's cached totals. */
(function (root) {
  const categories = {unassigned:'미배정·반환',newFaculty:'신임교원 예약',assigned:'기존 배정',unknown:'배정·예약 미확인'};
  const key = r => `${r.room}-${r.rackId}`;
  const number = n => typeof n === 'number' && Number.isFinite(n) && n >= 0;
  const count = items => items.reduce((n,i) => n+i.count,0);
  const sum = (items,field) => items.reduce((n,i) => n+(number(i[field])?i[field]*i.count:0),0);
  const escapeHTML = value => String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const escapeMD = value => String(value??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\|/g,'\\|').replace(/[\r\n]+/g,' ');
  function classify(rack, baseline) {
    if (categories[rack.allocationCategory]) return rack.allocationCategory;
    if (categories[baseline?.allocationCategory]) return baseline.allocationCategory;
    if (/^(미배정|없음|반환|Unassigned)$/i.test(rack.labNominal.trim())) return 'unassigned';
    if (/신임|신규.*교원/.test(rack.labNominal)) return 'newFaculty';
    if (rack.labNominal && !['학과 공용','네트워크','미확인'].includes(rack.labNominal)) return 'assigned';
    return 'unknown';
  }
  function build(data) {
    const baseline = data.reportBaseline || [];
    const byKey = new Map(baseline.map(r=>[key(r),r]));
    const originGroups = new Map();
    const occupancy = data.racks.map(rack=>{
      const original=byKey.get(key(rack));
      const fromDaejeon=rack.items.filter(i=>i.origin?.room==='대전');
      const incoming=rack.room==='대전'?[]:fromDaejeon;
      const existing=rack.items.filter(i=>i.origin?.room!=='대전');
      const owners=[...new Set(rack.items.map(i=>i.owner||original?.labActual||rack.labActual))];
      const existingOwners=existing.map(i=>i.owner||original?.labActual||rack.labActual);
      for(const item of fromDaejeon) {
        const source = item.origin.rackId==null?'대전 랙 미확인':`대전 R${String(item.origin.rackId).padStart(2,'0')}`;
        const verified = item.origin.rackMappingVerified===true;
        const groupKey=JSON.stringify([source,item.owner||rack.labActual,key(rack),verified]);
        if(!originGroups.has(groupKey))originGroups.set(groupKey,{source,owner:item.owner||rack.labActual,destination:key(rack),verified,items:[],remaining:rack.room==='대전'});
        originGroups.get(groupKey).items.push(item);
      }
      const knownU=rack.items.every(i=>number(i.estimatedU));
      const knownPower=rack.items.every(i=>number(i.estimatedMaxPowerW));
      return {rack,category:classify(rack,original),incoming,existing,owners,
        mixedExisting:incoming.length>0&&existing.length>0,
        mixedFaculty:incoming.length>0&&existingOwners.some(owner=>owner&&!['학과 공용','네트워크','미배정','미확인'].includes(owner)),
        multiLab:owners.filter(o=>!['학과 공용','네트워크','미배정'].includes(o)).length>1,
        u:sum(rack.items,'estimatedU'),powerW:sum(rack.items,'estimatedMaxPowerW'),knownU,knownPower};
    });
    const sections=[];
    const table=(title,headers,rows)=>sections.push({title,headers,rows,
      group:title==='랙별 기존 배정'?'기존 배정 상태':title==='대전 원래 랙별 이전·잔류 경로'?'이동 계획':'이동 후 상태'});
    table('랙별 기존 배정',['서버실','랙','배정 분류','배정 명의','기존 실사용자'],data.racks.map(rack=>{
      const original=byKey.get(key(rack));
      return [rack.room,`R${String(rack.rackId).padStart(2,'0')}`,original?categories[classify(original)]: '기준 정보 미확인',original?.labNominal??'미확인',original?.labActual??'미확인'];
    }));
    const rooms=['홍릉','양재','대전'];
    table('서버실별 잔여 랙', ['서버실','전체 랙','인프라','장비 있는 랙','빈 랙','순수 여유(미배정)','빈 신임 예약','빈 기존 배정','빈 분류 미확인'],rooms.map(room=>{
      const rows=occupancy.filter(r=>r.rack.room===room);const usable=rows.filter(r=>!r.rack.infra);const empty=usable.filter(r=>!r.rack.items.length);
      return [room,rows.length,rows.filter(r=>r.rack.infra).length,usable.length-empty.length,empty.length,...['unassigned','newFaculty','assigned','unknown'].map(category=>empty.filter(r=>r.category===category).length)];
    }));
    table('빈 랙의 배정 상태', ['서버실','분류','랙','배정 명의'],occupancy.filter(r=>!r.rack.infra&&!r.rack.items.length).map(r=>[r.rack.room,categories[r.category],`R${String(r.rack.rackId).padStart(2,'0')}`,r.rack.labNominal]));
    const occupied=occupancy.filter(r=>r.incoming.length);
    table('대전 이전에 사용한 공간의 성격',['분류','사용 랙 수','이전 장비 수','대상 랙'],Object.keys(categories).map(category=>{
      const rows=occupied.filter(r=>r.category===category);return [categories[category],rows.length,count(rows.flatMap(r=>r.incoming)),rows.map(r=>key(r.rack)).join(', ')||'없음'];
    }));
    table('기존 장비 혼입과 연구실 혼합',['구분','랙 수','대상 랙'],[
      ['기존 교수 소유 장비와 혼입',occupied.filter(r=>r.mixedFaculty)],
      ['기존 공용·보조 장비 등과 동거 (교수 혼입 포함)',occupied.filter(r=>r.mixedExisting)],
      ['둘 이상 연구실의 장비가 함께 사용',occupied.filter(r=>r.multiLab)]
    ].map(([label,rows])=>[label,rows.length,rows.map(r=>key(r.rack)).join(', ')||'없음']));
    table('대전 원래 랙별 이전·잔류 경로',['원래 대전 랙','연구실','현재 위치','대수 (서버/기타)','구성 매칭','장비 구성'],[...originGroups.values()].sort((a,b)=>a.source.localeCompare(b.source)||a.destination.localeCompare(b.destination)).map(g=>[
      g.source,g.owner,g.destination+(g.remaining?' (대전 잔류)':''),`${count(g.items)} (${count(g.items.filter(i=>i.type==='server'))}/${count(g.items.filter(i=>i.type!=='server'))})`,g.verified?'자료에 원래 랙 기록':'구성-원래 랙 미확인 (가배정)',g.items.map(i=>`${i.model||i.type} ×${i.count}`).join('; ')
    ]));
    table('목적지별 점유 현황',['목적지','배정 구분','원배정 명의','장비별 실사용자','대전 이전 / 기존 장비','계획 점유 U','계획 최대 kW'],occupied.map(r=>[
      key(r.rack),categories[r.category],r.rack.labNominal,r.owners.join(', '),`${count(r.incoming)} / ${count(r.existing)}`,
      r.knownU?r.u:`확인분 ${r.u} + 미확인`,r.knownPower?(r.powerW/1000).toFixed(2):`확인분 ${(r.powerW/1000).toFixed(2)} + 미확인`
    ]));
    const groupOrder=['기존 배정 상태','이동 계획','이동 후 상태'];
    sections.sort((a,b)=>groupOrder.indexOf(a.group)-groupOrder.indexOf(b.group));
    return {title:'대전 서버실 이전 및 잔여 랙 현황 보고서',sections,occupancy};
  }
  function markdown(report) {
    let group;
    return `# ${report.title}\n\n`+report.sections.map(s=> {
      const heading=s.group?(group===s.group?'':`## ${s.group}\n\n`)+`### ${s.title}\n\n`:`## ${s.title}\n\n`;
      group=s.group;
      return heading+(s.paragraphs||[]).map(p=>escapeMD(p)+'\n\n').join('')+(s.headers?'| '+s.headers.map(escapeMD).join(' | ')+' |\n| '+s.headers.map(()=>'---').join(' | ')+' |\n'+s.rows.map(row=>'| '+row.map(escapeMD).join(' | ')+' |').join('\n')+'\n\n':'' ); }).join('');
  }
  function printable(report) {
    const e=escapeHTML;
    let group;
    return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>${e(report.title)}</title><style>
      body{font:12px/1.65 system-ui,sans-serif;color:#172033;margin:32px auto;padding:0 24px;max-width:1100px}h1{font-size:24px}h2{font-size:19px;margin-top:30px}h3{font-size:15px;margin-top:20px}table{width:100%;border-collapse:collapse;margin:12px 0 24px;font-size:10px;table-layout:auto}th,td{border:1px solid #cbd5e1;padding:6px;text-align:left;vertical-align:top;overflow-wrap:anywhere}th{background:#edf2f7}thead{display:table-header-group}tr{break-inside:avoid}h2{break-after:avoid}.actions{position:sticky;top:0;background:white;padding:12px;border-bottom:1px solid #cbd5e1}.actions button{padding:8px 16px}@page{size:A4 landscape;margin:14mm}@media print{body{margin:0;padding:0;max-width:none}.actions{display:none}a{color:inherit}}
      </style></head><body><div class="actions"><button onclick="window.print()">인쇄 / PDF로 저장</button> · 인쇄 대상에서 PDF로 저장을 선택하세요.</div><h1>${e(report.title)}</h1>`+report.sections.map(s=> {
      const heading=s.group?(group===s.group?'':`<h2>${e(s.group)}</h2>`)+`<h3>${e(s.title)}</h3>`:`<h2>${e(s.title)}</h2>`;
      group=s.group;
      return `<section>${heading}`+(s.paragraphs||[]).map(p=>`<p>${e(p)}</p>`).join('')+(s.headers?`<table><thead><tr>${s.headers.map(h=>`<th>${e(h)}</th>`).join('')}</tr></thead><tbody>${s.rows.map(row=>`<tr>${row.map(v=>`<td>${e(v)}</td>`).join('')}</tr>`).join('')}</tbody></table>`:'')+'</section>'; }).join('')+'</body></html>';
  }
  root.GPUReport={build,markdown,printable,classify,categories};
})(typeof globalThis!=='undefined'?globalThis:window);
