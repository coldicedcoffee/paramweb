/* ====================================================================
   editor.js  —  Full Admin CMS  (v4)
   ==================================================================== */

const KEYS = {
  blog:"pp_blog_v3", projects:"pp_projects_v3", experience:"pp_experience_v3",
  profile:"pp_profile_v3", leadership:"pp_leadership_v3",
  achievements:"pp_achievements_v3", session:"pp_session_v3",
};
const PW_HASH = "60fefd770b1ea964f85db078ad6c551e1b107d568c96e12b1e213fd28fee8c0d";

let profile,experience,leadership,projects,posts,achievements;
let quill=null, editIdx=null;

// ── Boot ─────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded",()=>{
  loadAll();
  bindLogin();
  if(sessionStorage.getItem(KEYS.session)==="ok") unlock();
});

function loadAll(){
  profile=load(KEYS.profile)||defProfile();
  experience=load(KEYS.experience)||defExperience();
  leadership=load(KEYS.leadership)||defLeadership();
  projects=load(KEYS.projects)||defProjects();
  posts=load(KEYS.blog)||defPosts();
  achievements=load(KEYS.achievements)||defAchievements();
}
function load(k){try{const r=localStorage.getItem(k);return r?JSON.parse(r):null;}catch{return null;}}
function save(k,d){localStorage.setItem(k,JSON.stringify(d));}

// Defaults
function defProfile(){return{name:"Param Pabari",tagline:"Private Capital & Strategic Finance",description:"Mechanical Engineering at IIT Bombay with a minor in AI & Data Science.",bio:"I'm Param Pabari — a second-year undergraduate at IIT Bombay studying Mechanical Engineering with a minor in AI & Data Science. What drives me is the intersection of capital, strategy, and execution.",email:"param.pabari@iitb.ac.in",resume:"23B2136-1.pdf",institution:"IIT Bombay",degree:"B.TECH • CPI 8.5",stats:[{value:120,suffix:"+",label:"STARTUP CALLS"},{value:12000,suffix:"+",label:"LABS EVALUATED"},{value:15,prefix:"₹",suffix:"L+",label:"FUND MANAGED"},{value:99.76,suffix:"%",decimals:2,label:"JEE PERCENTILE"}]};}
function defExperience(){return[{role:"Business Strategy Intern",org:"Traya Health",period:"Current",theme:"D2C",bullets:["D2C health brand strategy."]},{role:"Part-time Investment Analyst",org:"YPoint Capital",period:"Current",theme:"VC",bullets:["Deal evaluation at INR 250 Cr AUM fund."]},{role:"Investment Analyst Intern",org:"RSPN Ventures",period:"Nov 2025 – Jan 2026",theme:"VC",bullets:["Led diagnostics diligence."]},{role:"Operations Intern",org:"Armstrong Dematic",period:"May–Jul 2025",theme:"Automation",bullets:["Built Traffic Editor for 10+ engineers."]}];}
function defLeadership(){return[{role:"Head of Investment Team",org:"Undergraduate Academic Council, IIT Bombay",period:"Current",bullets:["Scaled team to 12 across VC, ER, and Quant."]},{role:"Institute Web & Coding Convener",org:"Institute Technical Council, IIT Bombay",period:"2024–2025",bullets:["800+ students in DSA bootcamp."]},{role:"Department Academic Mentor",org:"Student Mentorship Program",period:"Jun 2025 – Present",bullets:["Mentoring 6 sophomores."]}];}
function defProjects(){return[{id:"roots",title:"Roots Healthtech Thesis",category:"VC",period:"2025",summary:"Healthtech sector thesis.",impact:"Mapped USD 100M+ opp.",detail:"11 pre-Series A targets.",tags:["Thesis"]},{id:"bcg",title:"BCG Ideathon GTM",category:"Consulting",period:"2024",summary:"National semi-final.",impact:"USD 171M GTM strategy.",detail:"Segmentation + pricing.",tags:["GTM"]},{id:"rbi",title:"RBI Transmission Study",category:"Macro",period:"2025",summary:"12 rate cycles analyzed.",impact:"3-4 quarter lag identified.",detail:"CPI tracking.",tags:["Macro"]}];}
function defPosts(){return[{id:"diagnostics",title:"Diagnostics Roll-Up Economics",dateISO:"2026-01-28",summary:"Service-node roll-up modeling.",tags:["VC","Healthtech"],content:"<p>Diagnostics thesis analysis.</p>"},{id:"rbi-cycles",title:"RBI Rate Cycles & Rotation",dateISO:"2026-02-12",summary:"Policy lag and equity rotation.",tags:["Macro"],content:"<p>Multi-quarter lag creates timing gaps.</p>"}];}
function defAchievements(){return[{title:"VC Case — 1st Place",detail:"1st / 200+ teams."},{title:"Ace The Case — 3rd",detail:"3rd / 300+ teams."},{title:"BCG Ideathon — Semi-Finals",detail:"IIT Bombay from 1,700+ applicants."},{title:"HSBC — National Finals",detail:"Structured financial recommendations."},{title:"CFA Research Challenge",detail:"First IIT Bombay team nationally."},{title:"Hockey Gold Medal",detail:"150+ hours NSO Hockey."}];}

// ── Auth ─────────────────────────────────────────────────────────────
function bindLogin(){
  const btn=document.getElementById("ed-unlock"),pw=document.getElementById("ed-pw"),err=document.getElementById("ed-pw-err");
  btn?.addEventListener("click",async()=>{
    const raw=pw?.value?.trim();
    if(!raw){err.textContent="Enter password.";return;}
    if(await sha(raw)!==PW_HASH){err.textContent="Wrong password.";return;}
    sessionStorage.setItem(KEYS.session,"ok");unlock();
  });
  pw?.addEventListener("keydown",e=>{if(e.key==="Enter")btn?.click();});
}
function unlock(){
  document.getElementById("ed-login").hidden=true;
  document.getElementById("ed-app").hidden=false;
  initTabs();initProfile();initCRUD("experience",experience,KEYS.experience,"ex",["role","org","period","theme"],"bullets");
  initCRUD("leadership",leadership,KEYS.leadership,"por",["role","org","period"],"bullets");
  initProjectEditor();initAchievementEditor();initBlogEditor();
}
async function sha(t){const b=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(t));return Array.from(new Uint8Array(b)).map(x=>x.toString(16).padStart(2,"0")).join("");}

// ── Tabs ─────────────────────────────────────────────────────────────
function initTabs(){
  const tabs=document.querySelectorAll(".ed-tab");
  tabs.forEach(t=>t.addEventListener("click",()=>{
    tabs.forEach(x=>x.classList.remove("active"));t.classList.add("active");
    document.querySelectorAll(".ed-panel").forEach(p=>p.classList.remove("active"));
    document.querySelector(`[data-panel="${t.dataset.tab}"]`)?.classList.add("active");
    editIdx=null;
  }));
}

// ── PROFILE ──────────────────────────────────────────────────────────
function initProfile(){
  const el=id=>document.getElementById(id);
  el("pf-name").value=profile.name||"";
  el("pf-email").value=profile.email||"";
  el("pf-tagline").value=profile.tagline||"";
  el("pf-desc").value=profile.description||"";
  el("pf-bio").value=profile.bio||"";
  el("pf-inst").value=profile.institution||"";
  el("pf-degree").value=profile.degree||"";
  el("pf-resume").value=profile.resume||"";
  renderStats();
  el("pf-save")?.addEventListener("click",()=>{
    profile.name=el("pf-name").value.trim();profile.email=el("pf-email").value.trim();
    profile.tagline=el("pf-tagline").value.trim();profile.description=el("pf-desc").value.trim();
    profile.bio=el("pf-bio").value.trim();profile.institution=el("pf-inst").value.trim();
    profile.degree=el("pf-degree").value.trim();profile.resume=el("pf-resume").value.trim();
    profile.stats=Array.from(document.querySelectorAll(".stat-row")).map(r=>({
      value:+(r.querySelector("[data-sf=val]")?.value||0),suffix:r.querySelector("[data-sf=suf]")?.value||"",
      prefix:r.querySelector("[data-sf=pre]")?.value||"",label:r.querySelector("[data-sf=lbl]")?.value||"",
    }));
    save(KEYS.profile,profile);msg("pf-status","Profile saved.","ok");
  });
  el("pf-reset")?.addEventListener("click",()=>{if(!confirm("Reset?"))return;localStorage.removeItem(KEYS.profile);profile=defProfile();initProfile();msg("pf-status","Reset.","ok");});
  el("ed-lock")?.addEventListener("click",()=>{sessionStorage.removeItem(KEYS.session);location.reload();});
}
function renderStats(){
  document.getElementById("stat-editor").innerHTML=(profile.stats||[]).map(s=>`
    <div class="stat-row">
      <div class="form-field"><span>VALUE</span><input class="input" data-sf="val" value="${s.value||""}" /></div>
      <div class="form-field"><span>PREFIX</span><input class="input" data-sf="pre" value="${s.prefix||""}" /></div>
      <div class="form-field"><span>SUFFIX</span><input class="input" data-sf="suf" value="${s.suffix||""}" /></div>
      <div class="form-field"><span>LABEL</span><input class="input" data-sf="lbl" value="${s.label||""}" /></div>
    </div>
  `).join("");
}

// ── Generic CRUD (Experience & Leadership) ──────────────────────────
function initCRUD(panelKey,dataArr,storageKey,prefix,fields,bulletsField){
  const getArr=()=>panelKey==="experience"?experience:leadership;
  const setArr=(a)=>{if(panelKey==="experience")experience=a;else leadership=a;};

  function renderList(){
    const arr=getArr();
    const list=document.getElementById(`${prefix}-list`);
    list.innerHTML=arr.map((e,i)=>`
      <div class="ed-item">
        <span>${e.role||e.title||"Item"}</span>
        <div class="ed-item-btns">
          <button class="btn btn--outline btn--sm" onclick="crudOpen('${prefix}',${i})">EDIT</button>
          <button class="btn btn--outline btn--sm" onclick="crudMove('${prefix}',${i},-1)">↑</button>
          <button class="btn btn--outline btn--sm" onclick="crudMove('${prefix}',${i},1)">↓</button>
        </div>
      </div>
    `).join("")||"<p style='color:var(--muted);padding:.5rem'>Empty.</p>";
  }

  function clearForm(){
    editIdx=null;
    document.getElementById(`${prefix==="por"?"por":"exp"}-form-title`).textContent="Add New";
    fields.forEach(f=>document.getElementById(`${prefix}-${f}`).value="");
    if(bulletsField) document.getElementById(`${prefix}-${bulletsField}`).value="";
    msg(`${prefix}-status`,"","");
  }

  window[`crudOpen`+prefix]=window.crudOpen=window.crudOpen||function(){};
  window.crudOpen=function(pfx,i){
    if(pfx!==prefix) return (window[`_crudOpen_${pfx}`]||function(){})(pfx,i);
    const arr=getArr(); const e=arr[i]; if(!e)return;
    editIdx=i;
    document.getElementById(`${prefix==="por"?"por":"exp"}-form-title`).textContent="Edit";
    fields.forEach(f=>document.getElementById(`${prefix}-${f}`).value=e[f]||"");
    if(bulletsField) document.getElementById(`${prefix}-${bulletsField}`).value=(e[bulletsField]||[]).join("\n");
    msg(`${prefix}-status`,`Editing: ${e.role||""}`, "ok");
  };
  // Store handler per prefix
  window[`_crudOpen_${prefix}`]=function(pfx,i){
    const arr=getArr(); const e=arr[i]; if(!e)return;
    editIdx=i;
    document.getElementById(`${prefix==="por"?"por":"exp"}-form-title`).textContent="Edit";
    fields.forEach(f=>document.getElementById(`${prefix}-${f}`).value=e[f]||"");
    if(bulletsField) document.getElementById(`${prefix}-${bulletsField}`).value=(e[bulletsField]||[]).join("\n");
    msg(`${prefix}-status`,`Editing: ${e.role||""}`, "ok");
  };
  window.crudOpen=function(pfx,i){ (window[`_crudOpen_${pfx}`]||function(){})(pfx,i); };

  window.crudMove=window.crudMove||function(){};
  window[`_crudMove_${prefix}`]=function(pfx,i,dir){
    const arr=getArr();const j=i+dir;
    if(j<0||j>=arr.length)return;
    [arr[i],arr[j]]=[arr[j],arr[i]];
    setArr(arr);save(storageKey,arr);renderList();
  };
  window.crudMove=function(pfx,i,dir){ (window[`_crudMove_${pfx}`]||function(){})(pfx,i,dir); };

  document.getElementById(`${prefix}-save`)?.addEventListener("click",()=>{
    const rec={};
    fields.forEach(f=>rec[f]=document.getElementById(`${prefix}-${f}`).value.trim());
    if(!rec[fields[0]])return msg(`${prefix}-status`,`${fields[0]} required.`,"err");
    if(bulletsField) rec[bulletsField]=document.getElementById(`${prefix}-${bulletsField}`).value.split("\n").map(s=>s.trim()).filter(Boolean);
    const arr=getArr();
    if(editIdx!==null) arr[editIdx]=rec; else arr.unshift(rec);
    setArr(arr);save(storageKey,arr);renderList();msg(`${prefix}-status`,"Saved.","ok");
  });
  document.getElementById(`${prefix}-new`)?.addEventListener("click",clearForm);
  document.getElementById(`${prefix}-del`)?.addEventListener("click",()=>{
    if(editIdx===null) return msg(`${prefix}-status`,"Select first.","err");
    if(!confirm("Delete?"))return;
    const arr=getArr();arr.splice(editIdx,1);setArr(arr);save(storageKey,arr);clearForm();renderList();msg(`${prefix}-status`,"Deleted.","ok");
  });

  renderList();
}

// ── PROJECTS ─────────────────────────────────────────────────────────
function initProjectEditor(){
  renderProjList();
  document.getElementById("pj-save")?.addEventListener("click",saveProj);
  document.getElementById("pj-new")?.addEventListener("click",()=>{editIdx=null;clearProjForm();});
  document.getElementById("pj-del")?.addEventListener("click",deleteProj);
  document.getElementById("pj-export")?.addEventListener("click",()=>exportJSON(projects,"projects"));
  document.getElementById("pj-import")?.addEventListener("click",()=>document.getElementById("pj-file").click());
  document.getElementById("pj-file")?.addEventListener("change",e=>importJSON(e,KEYS.projects,d=>{projects=d;renderProjList();},"pj-status"));
}
function renderProjList(){
  document.getElementById("pj-list").innerHTML=projects.map((p,i)=>`
    <div class="ed-item">
      <span>${p.title}</span>
      <div class="ed-item-btns">
        <button class="btn btn--outline btn--sm" onclick="openProj(${i})">EDIT</button>
        <button class="btn btn--outline btn--sm" onclick="moveProj(${i},-1)">↑</button>
        <button class="btn btn--outline btn--sm" onclick="moveProj(${i},1)">↓</button>
      </div>
    </div>
  `).join("")||"<p style='color:var(--muted)'>No projects.</p>";
}
window.openProj=function(i){
  const p=projects[i];if(!p)return;editIdx=i;
  document.getElementById("proj-form-title").textContent="Edit Project";
  document.getElementById("pj-title").value=p.title;document.getElementById("pj-cat").value=p.category||"";
  document.getElementById("pj-period").value=p.period||"";document.getElementById("pj-tags").value=(p.tags||[]).join(", ");
  document.getElementById("pj-summary").value=p.summary||"";document.getElementById("pj-impact").value=p.impact||"";
  document.getElementById("pj-detail").value=p.detail||"";msg("pj-status",`Editing: ${p.title}`,"ok");
};
window.moveProj=function(i,dir){
  const j=i+dir;if(j<0||j>=projects.length)return;
  [projects[i],projects[j]]=[projects[j],projects[i]];
  save(KEYS.projects,projects);renderProjList();
};
function clearProjForm(){editIdx=null;document.getElementById("proj-form-title").textContent="Add Project";["pj-title","pj-cat","pj-period","pj-tags","pj-summary","pj-impact","pj-detail"].forEach(id=>document.getElementById(id).value="");msg("pj-status","","");}
function saveProj(){
  const title=document.getElementById("pj-title").value.trim();if(!title)return msg("pj-status","Title required.","err");
  const rec={id:editIdx!==null?projects[editIdx].id:slug(title),title,category:document.getElementById("pj-cat").value.trim()||"General",period:document.getElementById("pj-period").value.trim(),tags:document.getElementById("pj-tags").value.split(",").map(s=>s.trim()).filter(Boolean),summary:document.getElementById("pj-summary").value.trim(),impact:document.getElementById("pj-impact").value.trim(),detail:document.getElementById("pj-detail").value.trim()};
  if(editIdx!==null)projects[editIdx]=rec;else projects.unshift(rec);
  save(KEYS.projects,projects);renderProjList();msg("pj-status","Saved.","ok");
}
function deleteProj(){if(editIdx===null)return msg("pj-status","Select first.","err");if(!confirm("Delete?"))return;projects.splice(editIdx,1);save(KEYS.projects,projects);clearProjForm();renderProjList();msg("pj-status","Deleted.","ok");}

// ── ACHIEVEMENTS ─────────────────────────────────────────────────────
function initAchievementEditor(){
  renderAchList();
  document.getElementById("ach-save")?.addEventListener("click",saveAch);
  document.getElementById("ach-new")?.addEventListener("click",()=>{editIdx=null;clearAchForm();});
  document.getElementById("ach-del")?.addEventListener("click",deleteAch);
}
function renderAchList(){
  document.getElementById("ach-list").innerHTML=achievements.map((a,i)=>`
    <div class="ed-item">
      <span>${a.title}</span>
      <div class="ed-item-btns">
        <button class="btn btn--outline btn--sm" onclick="openAch(${i})">EDIT</button>
        <button class="btn btn--outline btn--sm" onclick="moveAch(${i},-1)">↑</button>
        <button class="btn btn--outline btn--sm" onclick="moveAch(${i},1)">↓</button>
      </div>
    </div>
  `).join("")||"<p style='color:var(--muted)'>None.</p>";
}
window.openAch=function(i){const a=achievements[i];if(!a)return;editIdx=i;document.getElementById("ach-form-title").textContent="Edit";document.getElementById("ach-title").value=a.title;document.getElementById("ach-detail").value=a.detail;msg("ach-status",`Editing: ${a.title}`,"ok");};
window.moveAch=function(i,dir){const j=i+dir;if(j<0||j>=achievements.length)return;[achievements[i],achievements[j]]=[achievements[j],achievements[i]];save(KEYS.achievements,achievements);renderAchList();};
function clearAchForm(){editIdx=null;document.getElementById("ach-form-title").textContent="Add Competition";["ach-title","ach-detail"].forEach(id=>document.getElementById(id).value="");msg("ach-status","","");}
function saveAch(){const title=document.getElementById("ach-title").value.trim();if(!title)return msg("ach-status","Title required.","err");const rec={title,detail:document.getElementById("ach-detail").value.trim()};if(editIdx!==null)achievements[editIdx]=rec;else achievements.unshift(rec);save(KEYS.achievements,achievements);renderAchList();msg("ach-status","Saved.","ok");}
function deleteAch(){if(editIdx===null)return msg("ach-status","Select first.","err");if(!confirm("Delete?"))return;achievements.splice(editIdx,1);save(KEYS.achievements,achievements);clearAchForm();renderAchList();msg("ach-status","Deleted.","ok");}

// ── BLOG ─────────────────────────────────────────────────────────────
function initBlogEditor(){
  quill=new Quill("#quill-editor",{theme:"snow",modules:{toolbar:[[{header:[1,2,3,false]}],["bold","italic","underline"],[{list:"ordered"},{list:"bullet"}],["blockquote","code-block"],["link","image"],["clean"]]}});
  document.getElementById("bl-date").value=isoDate(new Date());
  renderBlogList();
  document.getElementById("bl-save")?.addEventListener("click",saveBlog);
  document.getElementById("bl-new")?.addEventListener("click",()=>{editIdx=null;clearBlogForm();});
  document.getElementById("bl-del")?.addEventListener("click",deleteBlog);
  document.getElementById("bl-export")?.addEventListener("click",()=>exportJSON(posts,"blog"));
  document.getElementById("bl-import")?.addEventListener("click",()=>document.getElementById("bl-file").click());
  document.getElementById("bl-file")?.addEventListener("change",e=>importJSON(e,KEYS.blog,d=>{posts=d;renderBlogList();},"bl-status"));
}
function renderBlogList(){
  document.getElementById("bl-list").innerHTML=posts.map((p,i)=>`
    <div class="ed-item">
      <span>${p.title}</span>
      <div class="ed-item-btns">
        <button class="btn btn--outline btn--sm" onclick="openBlog(${i})">EDIT</button>
        <button class="btn btn--outline btn--sm" onclick="moveBlog(${i},-1)">↑</button>
        <button class="btn btn--outline btn--sm" onclick="moveBlog(${i},1)">↓</button>
      </div>
    </div>
  `).join("")||"<p style='color:var(--muted)'>No posts.</p>";
}
window.openBlog=function(i){const p=posts[i];if(!p)return;editIdx=i;document.getElementById("blog-form-title").textContent="Edit Post";document.getElementById("bl-title").value=p.title;document.getElementById("bl-date").value=p.dateISO||"";document.getElementById("bl-summary").value=p.summary||"";document.getElementById("bl-tags").value=(p.tags||[]).join(", ");if(quill)quill.root.innerHTML=p.content||"";msg("bl-status",`Editing: ${p.title}`,"ok");};
window.moveBlog=function(i,dir){const j=i+dir;if(j<0||j>=posts.length)return;[posts[i],posts[j]]=[posts[j],posts[i]];save(KEYS.blog,posts);renderBlogList();};
function clearBlogForm(){editIdx=null;document.getElementById("blog-form-title").textContent="Add Post";["bl-title","bl-summary","bl-tags"].forEach(id=>document.getElementById(id).value="");document.getElementById("bl-date").value=isoDate(new Date());if(quill)quill.setContents([]);msg("bl-status","","");}
function saveBlog(){const title=document.getElementById("bl-title").value.trim();if(!title)return msg("bl-status","Title required.","err");const rec={id:editIdx!==null?posts[editIdx].id:slug(title),title,dateISO:document.getElementById("bl-date").value,summary:document.getElementById("bl-summary").value.trim(),tags:document.getElementById("bl-tags").value.split(",").map(s=>s.trim()).filter(Boolean),content:quill?quill.root.innerHTML.trim():""};if(editIdx!==null)posts[editIdx]=rec;else posts.unshift(rec);save(KEYS.blog,posts);renderBlogList();msg("bl-status","Saved.","ok");}
function deleteBlog(){if(editIdx===null)return msg("bl-status","Select first.","err");if(!confirm("Delete?"))return;posts.splice(editIdx,1);save(KEYS.blog,posts);clearBlogForm();renderBlogList();msg("bl-status","Deleted.","ok");}

// ── Utilities ────────────────────────────────────────────────────────
function slug(s){return(s||"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"")||"item";}
function isoDate(d){return`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;}
function msg(elId,text,type){const el=document.getElementById(elId);if(!el)return;el.textContent=text;el.style.color=type==="err"?"var(--danger)":type==="ok"?"var(--ok)":"var(--muted)";}
function exportJSON(data,name){const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`pp-${name}-${Date.now()}.json`;a.click();URL.revokeObjectURL(a.href);}
function importJSON(event,storageKey,onLoad,statusId){const file=event.target.files?.[0];if(!file)return;const reader=new FileReader();reader.onload=()=>{try{const data=JSON.parse(reader.result);if(!Array.isArray(data))throw new Error;save(storageKey,data);onLoad(data);msg(statusId,"Imported.","ok");}catch{msg(statusId,"Import failed.","err");}};reader.readAsText(file);event.target.value="";}
