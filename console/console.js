'use strict';
const frame=document.getElementById('workspace');
const labels={NONE:'Waiting',IDLE:'Waiting',PLANNING:'Planning',ORDER_READY:'Ready to build',BUILDING:'Writing code',VERIFYING:'Running tests',REVIEWING:'Independent review',DECIDING:'Deciding',PASS:'Verified',RECOVERED:'Recovered · verified',FAIL:'Verification failed',HUMAN_REQUIRED:'Needs a fix',TIMEOUT:'Timed out'};
let busy=false,doc;
function el(tag,text,cls){const n=doc.createElement(tag);n.textContent=text;if(cls)n.className=cls;return n;}
function setup(){
 doc=frame.contentDocument;if(!doc?.getElementById('main'))return;
 if(doc.getElementById('mission-control'))return;
 doc.body.classList.add('director-v2');
 const css=doc.createElement('link');css.rel='stylesheet';css.href='/console.css';doc.head.append(css);
 const panel=el('section','','mission-control');panel.id='mission-control';
 const heading=el('div','','mission-heading'),identity=el('div');identity.append(el('span','ANTIGRAVITY / DEVELOPMENT WORKSPACE','mission-kicker'),el('h1','A workshop built with three AIs'));
 const navigation=el('div','','workspace-links');for(const [name,url] of [['Solomon office','http://127.0.0.1:8710'],['Original screen','/classic']]){const a=el('a',name+' ↗');a.href=url;a.target='_top';navigation.append(a);}heading.append(identity,navigation);
 const summary=el('div','','mission-summary'),state=el('div','','mission-state');state.append(el('span','Current task','mission-kicker'),el('strong','Connecting'));state.lastChild.id='mission-state';
 const next=el('div','','mission-next');next.append(el('span','Next action','mission-kicker'),el('p','Reading the run record.'));next.lastChild.id='mission-next';summary.append(state,next);
 const meta=el('div','','mission-meta');for(const id of ['mission-project','mission-updated','mission-tests']){const n=el('span','—');n.id=id;meta.append(n);}
 const stages=el('div','','mission-stages');stages.setAttribute('aria-label','Task stages');for(const [key,name] of [['PLANNING','01 Plan'],['BUILDING','02 Build'],['VERIFYING','03 Test'],['REVIEWING','04 Review'],['DECIDING','05 Decide']]){const n=el('span',name);n.dataset.stage=key;stages.append(n);}
 const evidence=el('details','','mission-evidence');evidence.append(el('summary','Cause and ID of the current run'));const body=el('pre');body.id='mission-details';evidence.append(body);
 panel.append(heading,summary,meta,stages,evidence);doc.getElementById('corestrip').before(panel);
 const inbox=el('details','','mission-evidence');inbox.append(el('summary','Solomon inbox · linked requests'));const entries=el('div','','bridge-inbox');inbox.append(entries);inbox.addEventListener('toggle',async()=>{if(!inbox.open)return;entries.replaceChildren(el('p','Reading the request record.'));try{const response=await fetch('/ops/state',{cache:'no-store'});if(!response.ok)throw Error('Could not reach the inbox');const ops=await response.json();entries.replaceChildren();for(const order of ops.orders||[]){const card=el('article');card.append(el('strong',labels[order.current_state]||order.current_state||'Received'),el('p',order.goal||order.error||'Development request'),el('small',order.project_path||''));const more=el('details');more.append(el('summary','Run ID and request'));const raw=el('pre',JSON.stringify(order,null,2));more.append(raw);card.append(more);entries.append(card);}if(!entries.children.length)entries.append(el('p','No development request from Solomon yet.'));}catch(e){entries.replaceChildren(el('p',e.message));}});panel.append(inbox);
 const tools=el('div','','conversation-tools');
 const focus=el('button','Jump to chat ↓');focus.type='button';focus.onclick=()=>doc.getElementById('chat-panel').scrollIntoView({behavior:'smooth',block:'start'});
 const noise=el('button','Hide system notices');noise.type='button';noise.setAttribute('aria-pressed','false');noise.onclick=()=>{const hidden=doc.body.classList.toggle('hide-system');noise.textContent=hidden?'Show system notices':'Hide system notices';noise.setAttribute('aria-pressed',String(hidden));};
 const latest=el('button','Latest message ↓');latest.type='button';latest.onclick=()=>{const box=doc.getElementById('chat-box');box.scrollTop=box.scrollHeight;doc.getElementById('chat-panel').scrollIntoView({behavior:'smooth',block:'start'});};
 tools.append(focus,noise,latest);doc.getElementById('chat-head').after(tools);
 setupRoles();
 setupFolderPicker();
 setupActivity(panel);
 doc.getElementById('chat-box').setAttribute('aria-label','HEAD conversation');refresh();
 for(const id of ['normal-mode-btn','triad-mode-btn'])doc.getElementById(id)?.addEventListener('click',()=>refresh());
}
async function refresh(){if(busy||!doc||!doc.getElementById('mission-control'))return;busy=true;try{
 const response=await fetch('/status',{cache:'no-store'});if(!response.ok)throw Error('Could not read status');const s=await response.json(),run=s.run||{},state=run.state||'NONE',research=doc.getElementById('triad-mode-btn')?.classList.contains('on'),r=s.research||{};
 doc.getElementById('mission-state').textContent=research?(r.current_stage_ko||'Research waiting'):(labels[state]||state);
 doc.getElementById('mission-control').dataset.state=research?(r.status||'NONE'):state;
 let next=s.next_step||s.stage_sentence||'Enter a new task.';
 if(state==='HUMAN_REQUIRED'&&run.details){next=run.details.includes('PERMISSION_SETUP_FAILED')?'Stopped by a setup error. Fix the path and permission rules, then verify again.':run.details.includes('BASELINE_FAILED')?'Stopped by the pre-build check. Look at the failed tests and the environment in the details.':run.details.includes('P1')?'The review found defects to fix. Fix them, then run tests and review again.':next;}
 doc.getElementById('mission-next').textContent=research?(r.next_step||'Waiting for the research record.'):next;
 doc.getElementById('mission-project').textContent='Project · '+(s.project_name||'none');
 const timestamp=run.updated_at?new Date(run.updated_at+(/Z|[+]\d\d:\d\d$/.test(run.updated_at)?'':'Z')):null;
 const elapsed=timestamp?Math.max(0,Math.floor((Date.now()-timestamp.getTime())/1000)):null;
 doc.getElementById('mission-updated').textContent=elapsed===null?'No run recorded yet.':'Latest step · '+(elapsed<60?elapsed+'s ago':Math.floor(elapsed/60)+'m ago');
 doc.getElementById('mission-tests').textContent=(s.pending_result_count||0)+' ready to apply · '+(s.human_required_count||0)+' waiting for approval';
 doc.getElementById('mission-details').textContent=research?((r.session_id||'No research session')+'\nCycle '+(r.cycle_number||0)+' / '+(r.cycle_budget||0)+'\n'+(r.moonshot||'')):((run.run_id||'No task')+'\n'+(run.details||s.stage_sentence||'')+'\nLatest run record: '+(run.updated_at||'none'));
 const order=['PLANNING','ORDER_READY','BUILDING','VERIFYING','REVIEWING','DECIDING','PASS'],at=order.indexOf(state);
 const researchStage=(r.current_stage||'');const mapped=researchStage.includes('BUILD')?'BUILDING':researchStage.includes('VERIFY')?'VERIFYING':researchStage.includes('REVIEW')||researchStage.includes('CRITIQUE')?'REVIEWING':researchStage.includes('INTERPRET')||researchStage.includes('COMPLETE')?'DECIDING':'PLANNING';
 for(const n of doc.querySelectorAll('.mission-stages span')){const i=order.indexOf(n.dataset.stage);n.classList.toggle('current',research?mapped===n.dataset.stage:(state===n.dataset.stage||(state==='ORDER_READY'&&n.dataset.stage==='PLANNING')));n.classList.toggle('paused',!research&&state==='HUMAN_REQUIRED'&&run.last_stage===n.dataset.stage);n.classList.toggle('done',!research&&at>i);}
 document.getElementById('shell-error').hidden=true;offlineVeil(0);
 }catch(e){const error=document.getElementById('shell-error');error.hidden=false;error.textContent='Checking the status connection · '+e.message;offlineVeil((window.__pollMisses||0)+1);}finally{busy=false;}}
frame.addEventListener('load',setup);if(frame.contentDocument?.readyState==='complete')setup();setInterval(refresh,5000);

async function setupRoles(){
 const domains={OPENAI:'openai',GOOGLE:'antigravity',ANTHROPIC:'claude'};
 const order=['head','builder','reviewer'],names={head:'HEAD · directs',builder:'BUILDER · writes code',reviewer:'REVIEWER · reviews'};
 let roles,csrf,saving=false;
 const notice=el('p','Loading roles…','role-notice');notice.setAttribute('aria-live','polite');doc.getElementById('corestrip').after(notice);
 const buttons={};
 function paint(){for(const [domain,provider] of Object.entries(domains)){const role=order.find(r=>roles[r]===provider);buttons[domain].textContent='Next: '+names[role]+' ↻';buttons[domain].disabled=saving;buttons[domain].setAttribute('aria-label',domain+' change role. Currently '+names[role]);}}
 for(const [domain,provider] of Object.entries(domains)){
  const button=el('button','Connecting role…','role-cycle');button.type='button';button.disabled=true;buttons[domain]=button;doc.getElementById('node-'+domain)?.append(button);
  button.onclick=async()=>{if(saving||!roles)return;saving=true;paint();const next={...roles},current=order.find(r=>roles[r]===provider),target=order[(order.indexOf(current)+1)%3];next[current]=roles[target];next[target]=provider;
   try{const response=await fetch('/ops/roles',{method:'POST',headers:{'Content-Type':'application/json','X-Solomon-Bridge':csrf},body:JSON.stringify(next)});const result=await response.json();if(!response.ok)throw Error(result.error||'Could not save');roles=result.roles;notice.textContent=result.message;}
   catch(error){notice.textContent='Could not change the role · '+error.message;}finally{saving=false;paint();}};
 }
 try{const response=await fetch('/ops/roles',{cache:'no-store'});if(!response.ok)throw Error('Could not read settings');const result=await response.json();roles=result.roles;csrf=result.csrf;paint();notice.textContent='Each click rotates the role and swaps it with the other AI. Applies from the next chat or task. The current run and TRIAD research assignments stay as they are.';}catch(error){notice.textContent=error.message;}
}

// ---------------------------------------------------------------- AI work visibility (missions, who works now, workload)
const PROVIDER={ANTHROPIC:'Claude',OPENAI:'Codex',GOOGLE:'Antigravity'},ROLE={HEAD:'HEAD · directs',BUILDER:'BUILDER · builds',REVIEWER:'REVIEWER · reviews',OTHER:'Other'};
const STEP_CLASS={PASS:'ok',FAIL:'bad',TIMEOUT:'bad',HUMAN_REQUIRED:'warn'};
const MISSION_STATUS={DONE:'Done',INCOMPLETE:'Budget used up',BLOCKED:'Needs your decision',FAILED:'Failed'};
let activityBusy=false,usageWindow='mission';
function fmtTime(sec){sec=Math.round(sec||0);if(sec<60)return sec+'s';const m=Math.floor(sec/60);if(m<60)return m+'m'+(m<10&&sec%60?' '+(sec%60)+'s':'');return Math.floor(m/60)+'h '+(m%60)+'m';}
function fmtTokens(b){if(!b)return '—';if(!b.tokens)return b.unknown_calls?'not recorded':'—';return (b.exact_tokens<b.tokens?'~':'')+b.tokens.toLocaleString('en-US')+(b.unknown_calls?' (+'+b.unknown_calls+' not recorded)':'');}
function ago(iso){if(!iso)return '';const t=new Date(iso+(/Z|[+]\d\d:\d\d$/.test(iso)?'':'Z')),s=Math.max(0,Math.floor((Date.now()-t)/1000));return s<60?s+'s ago':s<3600?Math.floor(s/60)+'m ago':s<86400?Math.floor(s/3600)+'h ago':Math.floor(s/86400)+'d ago';}
function setupActivity(panel){
 const box=el('section','','ai-activity');box.id='ai-activity';
 const head=el('div','','ai-activity-head');head.append(el('span','AI activity · refreshes every 5s','mission-kicker'));
 const now=el('div','','ai-now');now.id='ai-now';now.append(el('span','Reading the work record.'));
 const grid=el('div','','ai-grid');
 const mission=el('div','','ai-card');mission.id='ai-mission';
 const work=el('div','','ai-card');const tabs=el('div','','ai-tabs');
 for(const [key,name] of [['mission','This mission'],['today','Today'],['all','All']]){const b=el('button',name);b.type='button';b.dataset.win=key;b.onclick=()=>{usageWindow=key;refreshActivity();};tabs.append(b);}
 const table=el('div','','ai-table');table.id='ai-work';
 work.append(el('strong','Work by AI'),tabs,table,el('p','Tokens: ~ is estimated from text length. Otherwise it is the real value reported by the CLI. "not recorded" means the call predates the ledger (30 Sep), so only time is counted.','ai-footnote'));
 grid.append(mission,work);
 const calls=el('details','','mission-evidence');calls.append(el('summary','Recent AI calls'));const callList=el('div','','ai-list');callList.id='ai-calls';calls.append(callList);
 const events=el('details','','mission-evidence');events.append(el('summary','Recent progress (stage changes)'));const eventList=el('div','','ai-list');eventList.id='ai-events';events.append(eventList);
 box.append(head,now,grid,calls,events);panel.append(box);
 refreshActivity();setInterval(refreshActivity,5000);
}
function paintNow(a,focus){
 const now=doc.getElementById('ai-now');now.replaceChildren();
 if((a.working_now||[]).length){for(const w of a.working_now){const line=el('div','','ai-now-line working');line.append(el('span','','dot'),el('strong',(ROLE[w.role]||w.role||'AI')+' · '+(PROVIDER[w.provider]||w.provider)),el('span',' working · '+fmtTime(w.elapsed_sec)+(w.stage_ko?' · '+w.stage_ko:'')+(w.mission_id?' · '+w.mission_id:'')));now.append(line);}return;}
 const line=el('div','','ai-now-line idle');line.append(el('span','','dot'),el('span',focus&&focus.live?'Preparing the next AI call.':'No AI work is running.'));now.append(line);
}
function paintMission(focus){
 const m=doc.getElementById('ai-mission'),opened=new Set([...m.querySelectorAll('details[open]>summary')].map(s=>s.textContent)),scroll=m.scrollTop;m.replaceChildren();
 if(!focus){m.append(el('strong','Mission'),el('p','No mission recorded yet. Ask in chat and the steps will show up here.'));return;}
 const status=focus.status==='RUNNING'?(focus.live?'In progress':'Stopped · waiting to resume'):(MISSION_STATUS[focus.status]||focus.status);
 const title=el('div','','ai-mission-title');title.append(el('strong','Mission · '+focus.project),el('span',status,'ai-badge '+(focus.status==='DONE'?'ok':focus.status==='RUNNING'&&focus.live?'run':'warn')));
 m.append(title,el('p',focus.goal,'ai-goal'));
 const bar=el('div','','ai-steps');
 for(let i=1;i<=Math.max(focus.max_steps||0,focus.steps.length);i++){const s=focus.steps.find(x=>x.index===i);const chip=el('span',String(i),'chip '+(s?(STEP_CLASS[s.state]||'run'):'todo'));chip.title=s?('Step '+i+' · '+(s.state_ko||'in progress')+' · '+s.goal):'Remaining step budget';bar.append(chip);}
 m.append(bar,el('small',focus.passed_steps+' steps passed · '+focus.steps.length+'/'+focus.max_steps+' steps used · updated '+ago(focus.updated_at),'ai-sub'));
 const list=el('details');list.append(el('summary','Results by step'));
 for(const s of [...focus.steps].reverse()){const row=el('div','','ai-step '+(STEP_CLASS[s.state]||'run'));const t=s.tests?(' · tests '+s.tests.passed+'/'+s.tests.total):'';row.append(el('strong','Step '+s.index+' · '+(s.state_ko||s.state||'in progress')+t+(s.review?' · review '+s.review:'')+(s.repairs?' · auto-fix '+s.repairs:'')+(s.builds_on_failed_attempt?' · continued from the previous attempt':'')),el('p',s.goal));if(s.note)row.append(el('small',s.note));list.append(row);}
 m.append(list);
 if(focus.summary){const sm=el('details');sm.append(el('summary','HEAD summary'),el('p',focus.summary));m.append(sm);}
 if(focus.blocked_reason){m.append(el('small','Stopped because: '+focus.blocked_reason,'ai-sub'));}
 if(focus.deliverable)m.append(el('small','Result location: '+focus.deliverable,'ai-sub path'));
 for(const d of m.querySelectorAll('details'))if(opened.has(d.querySelector('summary').textContent))d.open=true;m.scrollTop=scroll;
}
function paintWork(a){
 for(const b of doc.querySelectorAll('.ai-tabs button')){b.classList.toggle('on',b.dataset.win===usageWindow);b.disabled=b.dataset.win==='mission'&&!a.usage.mission;}
 if(usageWindow==='mission'&&!a.usage.mission)usageWindow='today';
 const win=a.usage[usageWindow],table=doc.getElementById('ai-work');table.replaceChildren();
 const header=el('div','','ai-row head');for(const h of ['Role','AI (calls)','Calls','CLI time','Tokens'])header.append(el('span',h));table.append(header);
 for(const role of ['HEAD','BUILDER','REVIEWER','OTHER']){const b=win.by_role[role];if(!b&&role==='OTHER')continue;const who=b?Object.entries(b.providers||{}).sort((x,y)=>y[1]-x[1]).map(([p,n])=>(PROVIDER[p]||p)+' '+n).join(', '):'No record (calls before 30 Sep are not counted)';const row=el('div','','ai-row');row.append(el('span',ROLE[role]),el('span',who),el('span',b?String(b.calls)+(b.failed?' (failed '+b.failed+')':''):'0'),el('span',b?fmtTime(b.seconds):'—'),el('span',fmtTokens(b)));table.append(row);}
 const tot=el('div','','ai-row total');tot.append(el('span','Total'),el('span',''),el('span',String(win.total.calls)),el('span',fmtTime(win.total.seconds)),el('span',fmtTokens(win.total)));table.append(tot);
 for(const p of ['OPENAI','GOOGLE','ANTHROPIC']){const node=doc.getElementById('node-'+p);if(!node)continue;let line=node.querySelector('.ai-card-usage');if(!line){line=el('p','','ai-card-usage');node.append(line);}const b=a.usage.today.by_provider[p],busy=(a.working_now||[]).find(w=>w.provider===p);line.textContent=(busy?'● Working · '+(ROLE[busy.role]||busy.role)+' · '+fmtTime(busy.elapsed_sec)+' — ':'')+'Today '+(b?b.calls+' calls · '+fmtTime(b.seconds)+' · tokens '+fmtTokens(b):'no calls');line.classList.toggle('busy',!!busy);}
}
function paintLists(a){
 const calls=doc.getElementById('ai-calls');calls.replaceChildren();
 for(const c of a.recent_calls||[])calls.append(el('div',ago(c.at)+' · '+(ROLE[c.role]||c.role||'?')+' · '+(PROVIDER[c.provider]||c.provider)+' · '+fmtTime(c.seconds)+' · '+(c.tokens?((c.exact?'':'~')+c.tokens.toLocaleString('en-US')+' tokens'):'tokens not recorded')+(c.status!=='OK'?' · '+c.status:''),'ai-item'));
 if(!calls.children.length)calls.append(el('div','No AI calls recorded yet.','ai-item'));
 const events=doc.getElementById('ai-events');events.replaceChildren();
 for(const e of a.events||[])events.append(el('div',ago(e.at)+' · '+e.project+' · '+(e.state_ko||e.to_state)+(e.details?' — '+e.details:''),'ai-item'));
}
async function refreshActivity(){if(activityBusy||!doc||!doc.getElementById('ai-activity'))return;activityBusy=true;try{
 const response=await fetch('/ops/activity',{cache:'no-store'});if(!response.ok)throw Error('Could not read activity');const a=await response.json();if(a.error)throw Error(a.error);
 const focus=(a.missions||[]).find(m=>m.mission_id===a.focus_mission_id);
 paintNow(a,focus);paintMission(focus);paintWork(a);paintLists(a);
 }catch(e){const now=doc.getElementById('ai-now');if(now)now.textContent='Connecting to activity · '+e.message;}finally{activityBusy=false;}}

// ---------------------------------------------------------------- project folder: native folder dialog instead of typing a path
async function chooseProjectFolder(){
 const roles=await fetch('/ops/roles',{cache:'no-store'}).then(r=>r.json());
 const picked=await fetch('/ops/pick-folder',{method:'POST',headers:{'X-Solomon-Bridge':roles.csrf}}).then(r=>r.json());
 if(picked.error)throw Error(picked.error);
 if(!picked.path)return null;
 const res=await fetch('/project',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8','Accept':'application/json'},body:new URLSearchParams({path:picked.path}).toString()}).then(r=>r.json());
 return {path:picked.path,ok:res.status==='ok',message:res.message||''};
}
function setupFolderPicker(){
 const old=doc.getElementById('project-change'),form=doc.getElementById('project-form');if(!old||!form)return;
 const button=old.cloneNode(true);old.replaceWith(button);button.textContent='Choose folder…';
 const manual=el('button','Type a path','ghost');manual.type='button';manual.onclick=()=>{form.style.display=form.style.display==='none'?'':'none';if(form.style.display!=='none')doc.getElementById('project-input').focus();};
 button.after(' ',manual);
 const note=doc.getElementById('project-result');
 button.onclick=async()=>{if(button.disabled)return;button.disabled=true;const label=button.textContent;button.textContent='Folder window open…';
  try{const r=await chooseProjectFolder();if(r){form.style.display='';if(note)note.textContent=r.ok?'Selected · '+r.path:r.message;if(r.ok){form.style.display='none';doc.getElementById('project-name').textContent=r.path.split(/[\/]/).filter(Boolean).pop();doc.getElementById('project-path').textContent=r.path;}}}
  catch(e){form.style.display='';if(note)note.textContent='Could not open the folder window. Type the path instead. ('+e.message+')';}
  finally{button.disabled=false;button.textContent=label;refresh();}};
}

// ---------------------------------------------------------------- shut down: stop the companion from the console
function showVeil(title,detail){
 let veil=document.getElementById('shutdown-veil');
 if(!veil){veil=document.createElement('div');veil.id='shutdown-veil';document.body.append(veil);}
 veil.innerHTML='<div><strong></strong><p class="veil-detail"></p><p>To start it again, use the <code>Start AI DEV</code> button in the Solomon office, or run <code>start-companion.ps1</code>.</p></div>';
 veil.querySelector('strong').textContent=title;veil.querySelector('.veil-detail').textContent=detail||'';
 document.body.classList.add('offline');
}
function offlineVeil(misses){
 window.__pollMisses=misses;
 if(misses===0){if(!window.__stoppedByButton){document.getElementById('shutdown-veil')?.remove();document.body.classList.remove('offline');}return;}
 if(misses>=3&&!document.getElementById('shutdown-veil'))showVeil('AI DEV is off','The server (8081) is not responding. Motion on this screen is only in the browser. No task is running.');
}
// heartbeat: the stage view does not run the workshop status poll, so check the server itself every 5 s
setInterval(async()=>{try{const r=await fetch('/ops/roles',{cache:'no-store'});if(!r.ok)throw Error(r.status);offlineVeil(0);}catch(e){offlineVeil((window.__pollMisses||0)+1);}},5000);
(()=>{
 const b=document.getElementById('btn-shutdown');if(!b)return;
 b.onclick=async()=>{
  if(!confirm('Shut down AI DEV?\nA running task will be interrupted. Records and work copies are kept, and a stopped mission continues when you start again.'))return;
  b.disabled=true;b.textContent='Stopping…';
  try{
   const roles=await fetch('/ops/roles',{cache:'no-store'}).then(r=>r.json());
   const r=await fetch('/ops/shutdown',{method:'POST',headers:{'X-Solomon-Bridge':roles.csrf}});const j=await r.json();
   if(!r.ok)throw Error(j.error||'Could not shut down');
   window.__stoppedByButton=true;showVeil('AI DEV has stopped',j.message);
  }catch(e){alert('Could not shut down · '+e.message);b.disabled=false;b.textContent='Shut down';}
 };
})();

// ---------------------------------------------------------------- stop work: stop running missions, keep the dashboard
(()=>{
 const b=document.getElementById('btn-halt');if(!b)return;
 b.onclick=async()=>{
  if(!confirm('Stop the running mission?\nThis cuts off the AI processes and leaves the mission stopped. Records and work copies are kept, and you can resume later.'))return;
  b.disabled=true;const was=b.textContent;b.textContent='Stopping…';
  try{
   const roles=await fetch('/ops/roles',{cache:'no-store'}).then(r=>r.json());
   const r=await fetch('/ops/missions/stop',{method:'POST',headers:{'Content-Type':'application/json','X-Solomon-Bridge':roles.csrf},body:JSON.stringify({reason:'console stop-work button'})});
   const j=await r.json();if(!r.ok)throw Error(j.error||'Could not stop');
   alert(j.status==='stopped'?('Stopped mission '+j.missions.join(', ')+' · ended '+j.killed.length+' AI processes'):'No mission is running.');
  }catch(e){alert('Could not stop · '+e.message);}finally{b.disabled=false;b.textContent=was;}
 };
})();
