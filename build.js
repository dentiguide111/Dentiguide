// DentiGuide site builder. Run: node build.js   (no installation needed)
// Reads content-en/ms/zh.json, site.json, quiz.json, visuals.json and the media folder, and writes the website to the "dist" folder.
const fs=require('fs'),path=require('path');
const rd=f=>JSON.parse(fs.readFileSync(f,'utf8'));
const site=rd('site.json'),quiz=rd('quiz.json'),vis=fs.existsSync('visuals.json')?rd('visuals.json'):{};
const LANGS=['en','ms','zh'],C={};LANGS.forEach(l=>C[l]=rd(`content-${l}.json`));
const DIST='dist';fs.rmSync(DIST,{recursive:true,force:true});fs.mkdirSync(DIST,{recursive:true});
const warn=[],stats={pages:0};
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const write=(p,t)=>{const f=path.join(DIST,p);fs.mkdirSync(path.dirname(f),{recursive:true});fs.writeFileSync(f,t);stats.pages+=p.endsWith('.html')?1:0};
const settings=fs.existsSync('settings.json')?rd('settings.json'):{};if(settings.goatcounter_code)site.goatcounter_code=String(settings.goatcounter_code).trim();
const showPH=settings.show_media_placeholders!==false;
// ---- structure from the English file ----
const EN=C.en,pub=x=>x.status!=='draft';
const topicById={};EN.topics.forEach(t=>topicById[t.id]=t);
const where=t=>t.section==='ohe'?'ohe':'ohi';
const topicPath=t=>`${where(t)}/${t.slug}/`;
const agePath=a=>`ohi/age/${a.slug}/`;
const idPath={};EN.topics.filter(pub).forEach(t=>idPath[t.id]=topicPath(t));
// ---- text helpers ----
function inline(s,L,depth){
 s=esc(s).replace(/\*\*(.+?)\*\*/g,'<b>$1</b>');
 return s.replace(/\[([^\]]+)\]\(([^)]+)\)/g,(m,t,u)=>link(t,u,depth));
}
function link(t,u,depth){u=u.replace(/&amp;/g,'&');
 if(u.startsWith('topic:')){const p=idPath[u.slice(6)];if(!p){warn.push('Link to unknown or unpublished topic id '+u.slice(6));return t}return `<a href="${rel(depth,'__L__/'+p)}">${t}</a>`}
 return `<a href="${esc(u)}" target="_blank" rel="noopener">${t}</a>`}
function rel(depth,p){return '../'.repeat(depth)+p}
function block(s,depth){ // markdown-lite to HTML; raw HTML blocks (diagrams) pass through
 if(/<svg|<div/.test(s))return s.replace(/href="topic:(\d+)"/g,(m,i)=>idPath[i]?`href="${rel(depth,'__L__/'+idPath[i])}"`:'href="#"');
 return s.split(/\n\s*\n/).map(p=>p.startsWith('> ')?`<div class="flag">⚠ ${inline(p.slice(2),0,depth)}</div>`:`<p>${inline(p,0,depth)}</p>`).join('');
}
// ---- media ----
function ytId(u){const m=u.match(/(?:youtu\.be\/|v=|embed\/)([\w-]{6,})/);return m?m[1]:''}
function mediaHTML(m,L){
 const cap=(m.caption&&m.caption[L])||'',alt=(m.alt&&m.alt[L])||(m.caption&&m.caption[L])||'';
 const f=m.file?(m.file.startsWith('/')?m.file:'/'+m.file):'';
 let inner='';
 if(m.video_url&&ytId(m.video_url))inner=`<iframe src="https://www.youtube-nocookie.com/embed/${ytId(m.video_url)}" title="${esc(cap||m.video_title||'Video')}" allowfullscreen loading="lazy"></iframe>`;
 else if(f&&m.type==='video')inner=`<video controls preload="metadata" src="__R__${f}"></video>`;
 else if(f)inner=`<img src="__R__${f}" alt="${esc(alt)}" loading="lazy">`;
 if(inner)return `<figure class="media">${inner}${cap?`<figcaption>${esc(cap)}</figcaption>`:''}</figure>`;
 if(!showPH)return '';
 const T={image:'IMAGE PLACEHOLDER',gif:'GIF / ANIMATION PLACEHOLDER',video:'VIDEO PLACEHOLDER'}[m.type]||'MEDIA PLACEHOLDER';
 return `<div class="ph"><span class="tg">MEDIA TO BE ADDED</span><br><b>&lt;${T}&gt;</b><ul><li><b>Required:</b> ${esc(m.required)}</li><li><b>What it must show:</b> ${esc(m.what)}</li><li><b>Suggested filename:</b> ${esc(m.filename)}</li><li><b>Size / duration:</b> ${esc(m.size)}</li></ul></div>`;
}
// ---- page shell ----
const RV={en:['Clinical review','Reviewed','Sources'],ms:['Semakan klinikal','Disemak','Sumber'],zh:['临床审核','已审核','资料来源']};
const TOOTH='<svg width="34" height="34" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5C10 3.3 6 3.5 5.5 7c-.4 2.8.8 5.2 1.3 8 .4 2.5.8 5 2 5 1.3 0 1.3-4 3.2-4s1.9 4 3.2 4c1.2 0 1.6-2.5 2-5 .5-2.8 1.7-5.2 1.3-8C18 3.5 14 3.3 12 5z" fill="#0b7f86"/><path d="M8.5 8.2c.7-.9 1.8-1.1 2.8-.6" stroke="#fff" stroke-width="1.4" fill="none" stroke-linecap="round"/></svg>';
function shell(L,rp,title,body,crumbs,navOn){
 const U=site.ui[L],depth=rp.split('/').filter(Boolean).length+1,P=(p)=>rel(depth,p);
 const fix=s=>s.replace(/__L__/g,L).replace(/__R__/g,rel(depth,''));
 const nav=[['',U.home],['ohe/',U.oe],['ohi/',U.oi],['dental-treatment-guidance/',U.dt],['quiz/',U.quiz]].map(n=>`<a href="${P(L+'/'+n[0])}"${navOn===n[0]?' class="on" aria-current="page"':''}>${esc(n[1])}</a>`).join('');
 const langs=LANGS.map(x=>`<a class="lg${x===L?' on':''}" lang="${x}" href="${P(x+'/'+rp)}">${esc(site.ui[x].lang_name)}</a>`).join('');
 const cr=crumbs&&crumbs.length?`<nav class="crumbs" aria-label="Breadcrumb">${crumbs.map((c,i)=>(i?'<span>›</span>':'')+(c[1]!==null?`<a href="${P(L+'/'+c[1])}">${esc(c[0])}</a>`:`<span>${esc(c[0])}</span>`)).join('')}</nav>`:'';
 const gc=site.goatcounter_code?`<script data-goatcounter="https://${esc(site.goatcounter_code)}.goatcounter.com/count" async src="//gc.zgo.at/count.js"></script>`:'';
 return fix(`<!doctype html><html lang="${L==='zh'?'zh-Hans':L}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(title)} · DentiGuide</title><link rel="stylesheet" href="${P('style.css')}">${gc}</head><body><header><div class="bar"><a class="logo" href="${P(L+'/')}">${TOOTH}<span>DentiGuide</span></a><div class="langs" role="group" aria-label="Language">${langs}</div></div><nav aria-label="Main">${nav}</nav></header><main id="main">${cr}${body}</main><footer>${esc(U.disclaimer)}</footer></body></html>`);
}
const advice=U=>`<div class="advice"><svg width="44" height="44" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5C10 3.3 6 3.5 5.5 7c-.4 2.8.8 5.2 1.3 8 .4 2.5.8 5 2 5 1.3 0 1.3-4 3.2-4s1.9 4 3.2 4c1.2 0 1.6-2.5 2-5 .5-2.8 1.7-5.2 1.3-8C18 3.5 14 3.3 12 5z" fill="#0b7f86"/></svg><p style="margin:0;font-weight:600">${esc(U.advice)}</p></div>`;
// ---- page bodies ----
function bodyTopic(t,e,L,depth,isAge,vkey,ageTabs){
 const U=site.ui[L],miss=!t._own;let h=ageTabs||'';
 h+=`<h1>${esc(t.title)}</h1>`;if(miss)h+=`<div class="flag">${esc(U.missing_translation)}</div>`;
 const top=(e.media||[]).filter(m=>m.after_question===undefined||m.after_question===null||m.after_question==='');
 h+=top.map(m=>mediaHTML(m,L)).join('');
 h+=((vis[L]||{})[vkey]||(vis.en||{})[vkey]||[]).join('');
 if((t.bullets||[]).length)h+=`<ul>${t.bullets.map(b=>`<li>${inline(b,L,depth)}</li>`).join('')}</ul>`;
 (t.warnings||[]).forEach(w=>h+=`<div class="flag">⚠ ${esc(w)}</div>`);
 if((t.why||[]).length)h+=`<div class="why"><h3>💡 ${esc(t.why_title)}</h3>${t.why.map((s,n)=>`<div class="step"><div class="num">${n+1}</div><div>${esc(s)}</div></div>`).join('')}</div>`;
 (t.notes||[]).forEach(n=>h+=`<p class="note">${inline(n,L,depth)}</p>`);
 let lastGroup='';
 (t.qa||[]).forEach((q,n)=>{if(isAge&&q.group&&q.group!==lastGroup&&q.group==='key')h+=`<div class="sec">${esc(U.key_topics||({en:'Key topics for this age group',ms:'Topik penting untuk kumpulan umur ini',zh:'本年龄组的重点主题'})[L])}</div>`;lastGroup=q.group||'';
  h+=`<details class="qa"${n<2||q.group==='key'?' open':''}><summary>${esc(q.question)}</summary>${block(q.answer,depth)}`+(e.media||[]).filter(m=>m.after_question===n).map(m=>mediaHTML(m,L)).join('')+`</details>`});
 if(isAge){const RM={0:10,1:5,2:5,3:11,4:6,5:7},rid=RM[e.id];if(rid&&idPath[rid])h+=`<p class="note">${esc(U.more)}: <a href="${rel(depth,'__L__/'+idPath[rid])}">${esc(get(L,rid).title)}</a></p>`}
 const refs=(e.references||[]).filter(r=>r.url);if(refs.length)h+=`<p class="refs"><b>${RV[L][2]}:</b></p><ul class="refs">${refs.map(r=>`<li><a href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.title||r.url)}</a></li>`).join('')}</ul>`;
 const rv=e.review||{};if(rv.status==='reviewed'&&(rv.reviewer||rv.date))h+=`<p class="rv">${RV[L][0]}: ${esc(rv.reviewer||'')} ${esc(rv.date||'')}</p>`;
 return h+advice(U);
}
const cardA=(href,title,sub)=>`<a class="card" href="${href}"><h3>${esc(title)}</h3>${sub?`<p class="note">${esc(sub)}</p>`:''}</a>`;
const get=(L,id)=>{const o=C[L].topics.find(t=>t.id===id);return o?Object.assign({_own:true},o):Object.assign({_own:false},topicById[id])};
const getAge=(L,id)=>{const o=C[L].ages.find(t=>t.id===id),f=EN.ages.find(t=>t.id===id);return o?Object.assign({_own:true},o):Object.assign({_own:false},f)};
function build(L){
 const U=site.ui[L],cat=U.categories;
 const topicsPub=EN.topics.filter(pub);
 // home
 write(`${L}/index.html`,shell(L,'',U.home,`<div class="hero"><h1>DentiGuide</h1><div class="tag">${esc(U.tagline)}</div><p>${esc(U.hero_text)}</p></div><div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(260px,1fr))"><a class="cat c1" href="ohe/"><h3>${esc(U.oe)}</h3><p>${esc(U.oe_card)}</p></a><a class="cat c2" href="ohi/"><h3>${esc(U.oi)}</h3><p>${esc(U.oi_card)}</p></a><a class="cat c3" href="dental-treatment-guidance/"><h3>${esc(U.dt)}</h3><p>${esc(U.dt_card)}</p><span class="sp">${esc(U.soon)}</span></a></div><a class="btn alt" href="quiz/" style="display:inline-block;text-decoration:none">${esc(U.quiz)} →</a>`,null,''));
 // OHE hub
 const order=['understanding','diseases','cancer','prevention','general'];
 const oheCats=[...new Set(topicsPub.filter(t=>t.section==='ohe').map(t=>t.category))];
 const cats=order.filter(c=>oheCats.includes(c)).concat(oheCats.filter(c=>!order.includes(c)));
 write(`${L}/ohe/index.html`,shell(L,'ohe/',U.oe,`<h1>${esc(U.oe)}</h1><p>${esc(U.oe_intro)}</p>`+cats.map(c=>`<div class="sec">${esc(cat[c]||c)}</div><div class="grid">${topicsPub.filter(t=>t.section==='ohe'&&t.category===c).sort((a,b)=>a.order-b.order).map(t=>cardA(topicPath(t).replace(/^ohe\//,''),get(L,t.id).title)).join('')}</div>`).join(''),[[U.home,''],[U.oe,null]],'ohe/'));
 // OHI hub
 const sec=s=>topicsPub.filter(t=>t.section===s).sort((a,b)=>a.order-b.order).map(t=>cardA(topicPath(t).replace(/^ohi\//,''),get(L,t.id).title)).join('');
 const ageCards=[0,1,3,4,5].map((a,k)=>cardA(`age/${EN.ages[a].slug}/`,U.ages[k])).join('');
 write(`${L}/ohi/index.html`,shell(L,'ohi/',U.oi,`<h1>${esc(U.oi)}</h1><p>${esc(U.oi_intro)}</p><div class="sec">${esc(U.basics)}</div><div class="grid">${sec('ohi-basics')}</div><div class="sec">${esc(U.by_age)}</div><div class="grid">${ageCards}</div><div class="sec">${esc(U.special)}</div><div class="grid">${sec('ohi-special')}</div>`,[[U.home,''],[U.oi,null]],'ohi/'));
 // treatment
 write(`${L}/dental-treatment-guidance/index.html`,shell(L,'dental-treatment-guidance/',U.dt,`<h1>${esc(U.dt)}</h1><p>${esc(U.treat_intro)}</p><div class="grid">${U.treatment.map(x=>`<div class="card"><h3>${esc(x)}</h3><span class="pill w">${esc(U.soon)}</span></div>`).join('')}</div><p class="note">${esc(U.treat_more)}</p>`,[[U.home,''],[U.dt,null]],'dental-treatment-guidance/'));
 // topics
 topicsPub.forEach(e=>{const t=get(L,e.id),rp=topicPath(e),depth=rp.split('/').filter(Boolean).length+1;
  const crumbs=[[U.home,''],[e.section==='ohe'?U.oe:U.oi,e.section==='ohe'?'ohe/':'ohi/'],[t.title,null]];
  write(`${L}/${rp}index.html`,shell(L,rp,t.title,bodyTopic(t,e,L,depth,false,'m'+e.id),crumbs,e.section==='ohe'?'ohe/':'ohi/'))});
 // ages
 EN.ages.filter(pub).forEach(e=>{const t=getAge(L,e.id),rp=agePath(e),depth=rp.split('/').filter(Boolean).length+1;
  let tabs='';if(e.id===1||e.id===2){tabs=`<div class="tabs">${[1,2].map((g,k)=>`<a href="../${EN.ages[g].slug}/"${g===e.id?' class="on" aria-current="page"':''}>${esc(U.child_tabs[k])}</a>`).join('')}</div>`}
  const crumbs=[[U.home,''],[U.oi,'ohi/'],[t.title,null]];
  write(`${L}/${rp}index.html`,shell(L,rp,t.title,bodyTopic(t,e,L,depth,true,'a'+e.id,tabs),crumbs,'ohi/'))});
 // quizzes
 write(`${L}/quiz/index.html`,shell(L,'quiz/',U.quiz,`<h1>${esc(U.quiz)}</h1><div class="grid">${quiz.quizzes.map(q=>cardA(q.id+'/',q.title[L]||q.title.en)).join('')}</div>`,[[U.home,''],[U.quiz,null]],'quiz/'));
 quiz.quizzes.forEach(q=>{const data={id:q.id,lang:L,ui:U.quiz_ui,questions:q.questions};
  write(`${L}/quiz/${q.id}/index.html`,shell(L,`quiz/${q.id}/`,q.title[L]||q.title.en,`<h1>${esc(q.title[L]||q.title.en)}</h1><div id="quiz-root"></div><script type="application/json" id="quiz-data">${JSON.stringify(data).replace(/</g,'\\u003c')}</script><script src="__R__quiz.js"></script>`,[[U.home,''],[U.quiz,'quiz/'],[q.title[L]||q.title.en,null]],'quiz/'))});
}
LANGS.forEach(build);
// translation completeness report
LANGS.slice(1).forEach(L=>{EN.topics.filter(pub).forEach(t=>{if(!C[L].topics.find(x=>x.id===t.id))warn.push(`Missing ${L} translation for topic ${t.id}: ${t.title}`)});EN.ages.filter(pub).forEach(t=>{if(!C[L].ages.find(x=>x.id===t.id))warn.push(`Missing ${L} translation for age page ${t.id}: ${t.title}`)})});
// landing, 404, assets
write('index.html',`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>DentiGuide</title><link rel="stylesheet" href="style.css"></head><body><main><div class="hero"><h1>DentiGuide</h1><p>Your Guide to a Healthier Smile.</p></div><div class="langpick">${LANGS.map(l=>`<a class="cat c${LANGS.indexOf(l)+1}" lang="${l}" href="${l}/"><h3>${site.ui[l].lang_name}</h3></a>`).join('')}</div></main></body></html>`);
write('404.html','<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>DentiGuide</title><link rel="stylesheet" href="/style.css"></head><body><main><div class="hero"><h1>Page not found</h1><p><a href="/">DentiGuide</a></p></div></main></body></html>');
['style.css','quiz.js'].forEach(f=>fs.copyFileSync(f,path.join(DIST,f)));
if(fs.existsSync('media'))fs.cpSync('media',path.join(DIST,'media'),{recursive:true});
// broken link check
const missing=[];(function walk(d){fs.readdirSync(d).forEach(n=>{const p=path.join(d,n);if(fs.statSync(p).isDirectory())return walk(p);if(!p.endsWith('.html'))return;const h=fs.readFileSync(p,'utf8');(h.match(/(?:href|src)="(?!https?:|\/\/|#|mailto:)([^"]+)"/g)||[]).forEach(m=>{let u=m.replace(/^(?:href|src)="/,'').replace(/"$/,'').split('#')[0];if(!u)return;let t=path.normalize(path.join(path.dirname(p),u));if(fs.existsSync(t)&&fs.statSync(t).isDirectory())t=path.join(t,'index.html');if(!fs.existsSync(t))missing.push(p+' -> '+u)})})})(DIST);
console.log(`DentiGuide built: ${stats.pages} pages in ${LANGS.length} languages.`);
if(warn.length){console.log('\nNOTICES ('+warn.length+'):');[...new Set(warn)].slice(0,40).forEach(w=>console.log(' - '+w))}
if(missing.length){console.log('\nBROKEN LINKS ('+missing.length+'):');missing.slice(0,20).forEach(w=>console.log(' - '+w));process.exitCode=1}else console.log('No broken internal links.');
