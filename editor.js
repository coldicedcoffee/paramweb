/* ====================================================================
   editor.js  —  Full Admin CMS  (v5 – GitHub-committed persistence)
   ==================================================================== */

const PW_HASH = "60fefd770b1ea964f85db078ad6c551e1b107d568c96e12b1e213fd28fee8c0d";
const ENCRYPTED_TOKEN = "ghdua+Gp6A0m3D1sQHEziopMyIz5ADPW6de+rqoZl8uJQNleB0Yr+6lch9WOPPcz41tfj8t6OdSl/+rAGJgKIK6x6Ho=";
const GITHUB_REPO = "coldicedcoffee/paramweb";
const DATA_FILE = "data.json";

let profile,experience,leadership,projects,posts,achievements;
let quill=null, editIdx=null, ghToken=null, fileSha=null;

// ── Boot ─────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded",()=>{
  bindLogin();
  if(sessionStorage.getItem("pp_session_v3")==="ok" && sessionStorage.getItem("pp_gh_token")){
    ghToken=sessionStorage.getItem("pp_gh_token");
    bootEditor();
  }
});

// ── Auth ─────────────────────────────────────────────────────────────
function bindLogin(){
  const btn=document.getElementById("ed-unlock"),pw=document.getElementById("ed-pw"),err=document.getElementById("ed-pw-err");
  btn?.addEventListener("click",async()=>{
    const raw=pw?.value?.trim();
    if(!raw){err.textContent="Enter password.";return;}
    const hash=await sha(raw);
    if(hash!==PW_HASH){err.textContent="Wrong password.";return;}
    // Decrypt the GitHub token using the password
    try { ghToken=await decryptToken(raw); } catch(e){ err.textContent="Token decryption failed."; return; }
    sessionStorage.setItem("pp_session_v3","ok");
    sessionStorage.setItem("pp_gh_token",ghToken);
    bootEditor();
  });
  pw?.addEventListener("keydown",e=>{if(e.key==="Enter")btn?.click();});
}

async function bootEditor(){
  await loadDataFromGitHub();
  document.getElementById("ed-login").hidden=true;
  document.getElementById("ed-app").hidden=false;
  initTabs();initProfile();
  initCRUD("experience",()=>experience,a=>{experience=a;},"ex",["role","org","period","theme"],"bullets");
  initCRUD("leadership",()=>leadership,a=>{leadership=a;},"por",["role","org","period"],"bullets");
  initProjectEditor();initAchievementEditor();initBlogEditor();
}

// ── Crypto helpers ───────────────────────────────────────────────────
async function sha(t){const b=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(t));return Array.from(new Uint8Array(b)).map(x=>x.toString(16).padStart(2,"0")).join("");}

async function decryptToken(password){
  const keyMaterial=await crypto.subtle.importKey("raw",new TextEncoder().encode(password),"PBKDF2",false,["deriveKey"]);
  // Use SHA-256 of password as raw key for AES-GCM (matches Node.js encryption)
  const rawKey=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(password));
  const aesKey=await crypto.subtle.importKey("raw",rawKey,{name:"AES-GCM"},false,["decrypt"]);
  const combined=Uint8Array.from(atob(ENCRYPTED_TOKEN),c=>c.charCodeAt(0));
  const iv=combined.slice(0,12);
  const ciphertext=combined.slice(12);
  const decrypted=await crypto.subtle.decrypt({name:"AES-GCM",iv},aesKey,ciphertext);
  return new TextDecoder().decode(decrypted);
}

// ── GitHub API ───────────────────────────────────────────────────────
async function loadDataFromGitHub(){
  try{
    const resp=await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${DATA_FILE}`,{
      headers:{"Authorization":`token ${ghToken}`,"Accept":"application/vnd.github.v3+json"}
    });
    if(!resp.ok) throw new Error("GitHub fetch failed: "+resp.status);
    const meta=await resp.json();
    fileSha=meta.sha;
    const content=JSON.parse(atob(meta.content.replace(/\n/g,"")));
    profile=content.profile||{};
    experience=content.experience||[];
    leadership=content.leadership||[];
    projects=content.projects||[];
    posts=content.posts||[];
    achievements=content.achievements||[];
  }catch(e){
    console.error("Failed to load from GitHub:",e);
    profile={};experience=[];leadership=[];projects=[];posts=[];achievements=[];
  }
}

async function commitToGitHub(statusElId){
  const data={profile,experience,leadership,projects,posts,achievements};
  const content=btoa(unescape(encodeURIComponent(JSON.stringify(data,null,2))));
  const statusEl=statusElId?document.getElementById(statusElId):null;
  try{
    if(statusEl){statusEl.textContent="Publishing to GitHub...";statusEl.style.color="var(--gold)";}
    const resp=await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${DATA_FILE}`,{
      method:"PUT",
      headers:{"Authorization":`token ${ghToken}`,"Accept":"application/vnd.github.v3+json","Content-Type":"application/json"},
      body:JSON.stringify({message:"Update site content via CMS",content,sha:fileSha})
    });
    if(!resp.ok){const err=await resp.json();throw new Error(err.message||"Commit failed");}
    const result=await resp.json();
    fileSha=result.content.sha;
    if(statusEl){statusEl.textContent="Published ✓ — live for all visitors.";statusEl.style.color="var(--ok)";}
    return true;
  }catch(e){
    console.error("GitHub commit error:",e);
    if(statusEl){statusEl.textContent="Publish failed: "+e.message;statusEl.style.color="var(--danger)";}
    return false;
  }
}

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
  el("pf-save")?.addEventListener("click",async()=>{
    profile.name=el("pf-name").value.trim();profile.email=el("pf-email").value.trim();
    profile.tagline=el("pf-tagline").value.trim();profile.description=el("pf-desc").value.trim();
    profile.bio=el("pf-bio").value.trim();profile.institution=el("pf-inst").value.trim();
    profile.degree=el("pf-degree").value.trim();profile.resume=el("pf-resume").value.trim();
    profile.stats=Array.from(document.querySelectorAll(".stat-row")).map(r=>({
      value:+(r.querySelector("[data-sf=val]")?.value||0),suffix:r.querySelector("[data-sf=suf]")?.value||"",
      prefix:r.querySelector("[data-sf=pre]")?.value||"",label:r.querySelector("[data-sf=lbl]")?.value||"",
    }));
    await commitToGitHub("pf-status");
  });
  el("ed-lock")?.addEventListener("click",()=>{sessionStorage.removeItem("pp_session_v3");sessionStorage.removeItem("pp_gh_token");location.reload();});
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
function initCRUD(panelKey,getArr,setArr,prefix,fields,bulletsField){
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

  window[`_crudOpen_${prefix}`]=function(pfx,i){
    const arr=getArr(); const e=arr[i]; if(!e)return;
    editIdx=i;
    document.getElementById(`${prefix==="por"?"por":"exp"}-form-title`).textContent="Edit";
    fields.forEach(f=>document.getElementById(`${prefix}-${f}`).value=e[f]||"");
    if(bulletsField) document.getElementById(`${prefix}-${bulletsField}`).value=(e[bulletsField]||[]).join("\n");
    msg(`${prefix}-status`,`Editing: ${e.role|""}`, "ok");
  };
  window.crudOpen=function(pfx,i){ (window[`_crudOpen_${pfx}`]||function(){})(pfx,i); };

  window[`_crudMove_${prefix}`]=function(pfx,i,dir){
    const arr=getArr();const j=i+dir;
    if(j<0||j>=arr.length)return;
    [arr[i],arr[j]]=[arr[j],arr[i]];
    setArr(arr);renderList();
  };
  window.crudMove=function(pfx,i,dir){ (window[`_crudMove_${pfx}`]||function(){})(pfx,i,dir); };

  document.getElementById(`${prefix}-save`)?.addEventListener("click",async()=>{
    const rec={};
    fields.forEach(f=>rec[f]=document.getElementById(`${prefix}-${f}`).value.trim());
    if(!rec[fields[0]])return msg(`${prefix}-status`,`${fields[0]} required.`,"err");
    if(bulletsField) rec[bulletsField]=document.getElementById(`${prefix}-${bulletsField}`).value.split("\n").map(s=>s.trim()).filter(Boolean);
    const arr=getArr();
    if(editIdx!==null) arr[editIdx]=rec; else arr.unshift(rec);
    setArr(arr);renderList();
    await commitToGitHub(`${prefix}-status`);
  });
  document.getElementById(`${prefix}-new`)?.addEventListener("click",clearForm);
  document.getElementById(`${prefix}-del`)?.addEventListener("click",async()=>{
    if(editIdx===null) return msg(`${prefix}-status`,"Select first.","err");
    if(!confirm("Delete?"))return;
    const arr=getArr();arr.splice(editIdx,1);setArr(arr);clearForm();renderList();
    await commitToGitHub(`${prefix}-status`);
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
  document.getElementById("pj-file")?.addEventListener("change",e=>importJSON(e,d=>{projects=d;renderProjList();},"pj-status"));
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
  renderProjList();
};
function clearProjForm(){editIdx=null;document.getElementById("proj-form-title").textContent="Add Project";["pj-title","pj-cat","pj-period","pj-tags","pj-summary","pj-impact","pj-detail"].forEach(id=>document.getElementById(id).value="");msg("pj-status","","");}
async function saveProj(){
  const title=document.getElementById("pj-title").value.trim();if(!title)return msg("pj-status","Title required.","err");
  const rec={id:editIdx!==null?projects[editIdx].id:slug(title),title,category:document.getElementById("pj-cat").value.trim()||"General",period:document.getElementById("pj-period").value.trim(),tags:document.getElementById("pj-tags").value.split(",").map(s=>s.trim()).filter(Boolean),summary:document.getElementById("pj-summary").value.trim(),impact:document.getElementById("pj-impact").value.trim(),detail:document.getElementById("pj-detail").value.trim()};
  if(editIdx!==null)projects[editIdx]=rec;else projects.unshift(rec);
  renderProjList();await commitToGitHub("pj-status");
}
async function deleteProj(){if(editIdx===null)return msg("pj-status","Select first.","err");if(!confirm("Delete?"))return;projects.splice(editIdx,1);clearProjForm();renderProjList();await commitToGitHub("pj-status");}

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
window.moveAch=function(i,dir){const j=i+dir;if(j<0||j>=achievements.length)return;[achievements[i],achievements[j]]=[achievements[j],achievements[i]];renderAchList();};
function clearAchForm(){editIdx=null;document.getElementById("ach-form-title").textContent="Add Competition";["ach-title","ach-detail"].forEach(id=>document.getElementById(id).value="");msg("ach-status","","");}
async function saveAch(){const title=document.getElementById("ach-title").value.trim();if(!title)return msg("ach-status","Title required.","err");const rec={title,detail:document.getElementById("ach-detail").value.trim()};if(editIdx!==null)achievements[editIdx]=rec;else achievements.unshift(rec);renderAchList();await commitToGitHub("ach-status");}
async function deleteAch(){if(editIdx===null)return msg("ach-status","Select first.","err");if(!confirm("Delete?"))return;achievements.splice(editIdx,1);clearAchForm();renderAchList();await commitToGitHub("ach-status");}

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
  document.getElementById("bl-file")?.addEventListener("change",e=>importJSON(e,d=>{posts=d;renderBlogList();},"bl-status"));
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
window.moveBlog=function(i,dir){const j=i+dir;if(j<0||j>=posts.length)return;[posts[i],posts[j]]=[posts[j],posts[i]];renderBlogList();};
function clearBlogForm(){editIdx=null;document.getElementById("blog-form-title").textContent="Add Post";["bl-title","bl-summary","bl-tags"].forEach(id=>document.getElementById(id).value="");document.getElementById("bl-date").value=isoDate(new Date());if(quill)quill.setContents([]);msg("bl-status","","");}
async function saveBlog(){const title=document.getElementById("bl-title").value.trim();if(!title)return msg("bl-status","Title required.","err");const rec={id:editIdx!==null?posts[editIdx].id:slug(title),title,dateISO:document.getElementById("bl-date").value,summary:document.getElementById("bl-summary").value.trim(),tags:document.getElementById("bl-tags").value.split(",").map(s=>s.trim()).filter(Boolean),content:quill?quill.root.innerHTML.trim():""};if(editIdx!==null)posts[editIdx]=rec;else posts.unshift(rec);renderBlogList();await commitToGitHub("bl-status");}
async function deleteBlog(){if(editIdx===null)return msg("bl-status","Select first.","err");if(!confirm("Delete?"))return;posts.splice(editIdx,1);clearBlogForm();renderBlogList();await commitToGitHub("bl-status");}

// ── Utilities ────────────────────────────────────────────────────────
function slug(s){return(s||"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"")||"item";}
function isoDate(d){return`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;}
function msg(elId,text,type){const el=document.getElementById(elId);if(!el)return;el.textContent=text;el.style.color=type==="err"?"var(--danger)":type==="ok"?"var(--ok)":"var(--muted)";}
function exportJSON(data,name){const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`pp-${name}-${Date.now()}.json`;a.click();URL.revokeObjectURL(a.href);}
function importJSON(event,onLoad,statusId){const file=event.target.files?.[0];if(!file)return;const reader=new FileReader();reader.onload=()=>{try{const data=JSON.parse(reader.result);if(!Array.isArray(data))throw new Error;onLoad(data);msg(statusId,"Imported — click SAVE to publish.","ok");}catch{msg(statusId,"Import failed.","err");}};reader.readAsText(file);event.target.value="";}
