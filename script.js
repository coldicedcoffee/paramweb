/* ====================================================================
   script.js  —  Param Pabari Portfolio  (v5 – data.json backed)
   ==================================================================== */

const KEYS = { session:"pp_session_v3", theme:"pp_theme" };
const PW_HASH = "60fefd770b1ea964f85db078ad6c551e1b107d568c96e12b1e213fd28fee8c0d";
const GITHUB_RAW_URL = "https://raw.githubusercontent.com/coldicedcoffee/paramweb/main/data.json";
const DATA_URL = "data.json";

// ─── State ───────────────────────────────────────────────────────────
let profile, experience, leadership, projects, posts, achievements;

// ─── Boot ────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", async () => {
  await loadAllData();
  initTheme();
  initNav();
  initAnimations();
  initAdmin();
  initContactForm();
  renderHome();
  document.getElementById("year").textContent = new Date().getFullYear();
});

async function loadAllData() {
  // Try GitHub raw first (always fresh), fall back to local copy
  const urls = [GITHUB_RAW_URL + "?t=" + Date.now(), DATA_URL + "?t=" + Date.now()];
  for (const url of urls) {
    try {
      const resp = await fetch(url);
      if (!resp.ok) throw new Error("fetch failed: " + resp.status);
      const data = await resp.json();
      profile      = data.profile      || {};
      experience   = data.experience   || [];
      leadership   = data.leadership   || [];
      projects     = data.projects     || [];
      posts        = data.posts        || [];
      achievements = data.achievements || [];
      return; // success — stop trying
    } catch(err) {
      console.warn("Failed to load from " + url + ":", err.message);
    }
  }
  console.error("All data sources failed, using empty defaults.");
  profile = {}; experience = []; leadership = []; projects = []; posts = []; achievements = [];
}

// ─── Theme Toggle ────────────────────────────────────────────────────
function initTheme() {
  const saved = localStorage.getItem(KEYS.theme);
  if (saved === "dark") document.documentElement.removeAttribute("data-theme");
  else document.documentElement.setAttribute("data-theme","light");
  updateThemeIcon();

  document.getElementById("theme-toggle")?.addEventListener("click", () => {
    const isLight = document.documentElement.getAttribute("data-theme") === "light";
    if (isLight) {
      document.documentElement.removeAttribute("data-theme");
      localStorage.setItem(KEYS.theme, "dark");
    } else {
      document.documentElement.setAttribute("data-theme", "light");
      localStorage.setItem(KEYS.theme, "light");
    }
    updateThemeIcon();
  });
}

function updateThemeIcon() {
  const btn = document.getElementById("theme-toggle");
  if (!btn) return;
  btn.textContent = document.documentElement.getAttribute("data-theme") === "light" ? "☾" : "☀";
}

// ─── Navigation ──────────────────────────────────────────────────────
function initNav() {
  document.querySelectorAll("[data-nav]").forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      switchPage(link.dataset.nav);
      document.getElementById("nav")?.classList.remove("open");
    });
  });
  document.getElementById("nav-toggle")?.addEventListener("click", () => {
    document.getElementById("nav")?.classList.toggle("open");
  });
}

function switchPage(id) {
  closeReader();
  document.querySelectorAll(".page").forEach(p => p.classList.remove("page--active"));
  document.querySelector(`[data-page="${id}"]`)?.classList.add("page--active");
  document.querySelectorAll("[data-nav]").forEach(l => l.classList.toggle("active", l.dataset.nav===id));
  window.scrollTo({top:0,behavior:"smooth"});
  if (id==="home") renderHome();
  if (id==="portfolio") renderPortfolio();
  if (id==="thoughts") renderThoughts();
  if (id==="about") renderAbout();
  requestAnimationFrame(()=>initAnimations());
}

// ─── Animations ──────────────────────────────────────────────────────
function initAnimations() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if(e.isIntersecting){e.target.classList.add("visible");obs.unobserve(e.target);} });
  },{threshold:.12,rootMargin:"0px 0px -40px 0px"});
  document.querySelectorAll(".anim-up:not(.visible)").forEach(el => obs.observe(el));
  const cObs = new IntersectionObserver(entries => {
    entries.forEach(e => { if(e.isIntersecting){animateCount(e.target);cObs.unobserve(e.target);} });
  },{threshold:.5});
  document.querySelectorAll("[data-count]").forEach(el => cObs.observe(el));
}

function animateCount(el) {
  const target=+el.dataset.count, decimals=+(el.dataset.decimals||0),
    prefix=el.dataset.prefix||"", suffix=el.dataset.suffix||"", dur=1200, start=performance.now(),
    fmt=new Intl.NumberFormat("en-IN",{minimumFractionDigits:decimals,maximumFractionDigits:decimals});
  (function tick(now){
    const p=Math.min(1,(now-start)/dur), e=1-Math.pow(1-p,3);
    el.textContent=prefix+fmt.format(target*e)+suffix;
    if(p<1) requestAnimationFrame(tick);
  })(start);
}

function fmtDate(iso) {
  if(!iso) return "";
  const d=new Date(iso); return isNaN(d)?iso:d.toLocaleDateString("en-US",{month:"short",day:"2-digit",year:"numeric"});
}

// ─── Render: HOME ────────────────────────────────────────────────────
function renderHome() {
  const rb = document.getElementById("resume-btn");
  if (rb && profile.resume) rb.href = profile.resume;

  const hl = document.getElementById("hero-logo");
  const hSvg = document.getElementById("hero-badge-svg");
  if (hl) {
    if (profile.heroLogo) {
      hl.src = profile.heroLogo;
      hl.hidden = false;
      if(hSvg) hSvg.hidden = true;
    } else {
      hl.hidden = true;
      if(hSvg) hSvg.hidden = false;
    }
  }

  // Positions
  const pl = document.getElementById("positions-list");
  if (pl) {
    const current = experience.filter(e => /current|present/i.test(e.period));
    const leaderCurrent = leadership.filter(e => /current|present/i.test(e.period));
    const all = [...current, ...leaderCurrent];
    pl.innerHTML = all.map(e => `
      <div class="pos-card anim-up">
        ${e.image ? `<img src="${e.image}" class="pos-card__logo" alt="Logo" />` : ""}
        <div class="pos-card__role">${e.role}</div>
        <div class="pos-card__org">${e.org||""}</div>
        <div class="pos-card__period">${e.period}</div>
      </div>
    `).join("");
  }

  // Featured projects
  const fp = document.getElementById("featured-projects");
  if (fp) {
    fp.innerHTML = projects.slice(0,3).map(p => `
      <div class="card anim-up" onclick="switchPage('portfolio')">
        <span class="card__label">${p.category} · ${p.period}</span>
        <div class="card__title">${p.title}</div>
        <div class="card__desc">${p.summary}</div>
        <div class="card__footer">${p.impact}</div>
      </div>
    `).join("");
  }

  // Featured posts
  const fpo = document.getElementById("featured-posts");
  if (fpo) {
    const sorted = [...posts].sort((a,b)=>new Date(b.dateISO||0)-new Date(a.dateISO||0));
    fpo.innerHTML = sorted.slice(0,2).map((p,i) => `
      <div class="card anim-up" data-open-post="${i}">
        <span class="card__label">${fmtDate(p.dateISO)}</span>
        <div class="card__title">${p.title}</div>
        <div class="card__desc">${p.summary}</div>
      </div>
    `).join("");
    fpo.querySelectorAll("[data-open-post]").forEach(el => {
      el.addEventListener("click", () => openReader(sorted[+el.dataset.openPost]));
    });
  }

  // Competitions Carousel
  const ct = document.getElementById("competitions-track");
  if (ct && achievements.length > 0) {
    const items = achievements.map(a => `
      <div class="ach-card">
        <div class="ach-card__title">${a.title}</div>
        <div class="ach-card__detail">${a.detail}</div>
      </div>
    `).join("");
    ct.innerHTML = items + items + items;
  }

  initAnimations();
}

// ─── Render: PORTFOLIO ───────────────────────────────────────────────
let activeFilter = "All";
function renderPortfolio() {
  const cats = ["All",...new Set(projects.map(p=>p.category))];
  const fb = document.getElementById("project-filters");
  if (fb) {
    fb.innerHTML = cats.map(c=>`<button class="filter-btn ${c===activeFilter?"active":""}" data-cat="${c}">${c}</button>`).join("");
    fb.querySelectorAll(".filter-btn").forEach(b=>b.addEventListener("click",()=>{activeFilter=b.dataset.cat;renderPortfolio();}));
  }
  const list = document.getElementById("project-list");
  const visible = activeFilter==="All"?projects:projects.filter(p=>p.category===activeFilter);
  if (list) {
    list.innerHTML = visible.map(p=>`
      <div class="card anim-up" data-pid="${p.id}">
        ${p.image ? `<img src="${p.image}" class="card__image" alt="Cover" />` : ""}
        <span class="card__label">${p.category} · ${p.period}</span>
        <div class="card__title">${p.title}</div>
        <div class="card__desc">${p.summary}</div>
        <div class="card__expanded">
          <p>${p.detail||""}</p>
          ${p.impact ? `<div class="card__impact">${p.impact}</div>` : ""}
          <div class="card__tags">${(p.tags||[]).map(t=>`<span>${t}</span>`).join("")}</div>
        </div>
      </div>
    `).join("");
    list.querySelectorAll("[data-pid]").forEach(n=>n.addEventListener("click",()=>{
      const isExpanded = n.classList.contains("expanded");
      list.querySelectorAll(".card").forEach(c=>c.classList.remove("expanded"));
      if (!isExpanded) n.classList.add("expanded");
    }));
  }
  initAnimations();
}

// ─── Render: THOUGHTS ────────────────────────────────────────────────
let blogTag="All", blogQ="";
function renderThoughts() {
  const sorted=[...posts].sort((a,b)=>new Date(b.dateISO||0)-new Date(a.dateISO||0));
  const tags=["All",...new Set(sorted.flatMap(p=>p.tags||[]))];
  const fb=document.getElementById("blog-filters");
  if(fb){
    fb.innerHTML=tags.map(t=>`<button class="filter-btn ${t===blogTag?"active":""}" data-tag="${t}">${t}</button>`).join("");
    fb.querySelectorAll(".filter-btn").forEach(b=>b.addEventListener("click",()=>{blogTag=b.dataset.tag;renderThoughts();}));
  }
  const search=document.getElementById("blog-search");
  if(search&&!search._bound){search._bound=true;search.addEventListener("input",()=>{blogQ=search.value.trim().toLowerCase();renderThoughts();});}
  const q=blogQ;
  const filtered=sorted.filter(p=>{
    if(blogTag!=="All"&&!(p.tags||[]).includes(blogTag)) return false;
    if(q&&![p.title,p.summary,(p.tags||[]).join(" ")].join(" ").toLowerCase().includes(q)) return false;
    return true;
  });
  const list=document.getElementById("blog-list");
  const empty=document.getElementById("blog-empty");
  if(list){
    list.innerHTML=filtered.map((p,i)=>`
      <div class="card anim-up" data-blog-idx="${i}">
        ${p.image ? `<img src="${p.image}" class="card__image" alt="Cover" />` : ""}
        <span class="card__label">${fmtDate(p.dateISO)}</span>
        <div class="card__title">${p.title}</div>
        <div class="card__desc">${p.summary}</div>
        <div class="card__footer">${(p.tags||[]).join(" · ")}</div>
      </div>
    `).join("");
    list.querySelectorAll("[data-blog-idx]").forEach(el=>{
      el.addEventListener("click",()=>openReader(filtered[+el.dataset.blogIdx]));
    });
  }
  if(empty) empty.hidden=filtered.length>0;
  initAnimations();
}

// ─── Article Reader ──────────────────────────────────────────────────
function openReader(post) {
  if (!post) return;
  const reader = document.getElementById("reader");
  document.getElementById("reader-meta").textContent = fmtDate(post.dateISO);
  document.getElementById("reader-title").textContent = post.title;
  document.getElementById("reader-summary").textContent = post.summary;
  document.getElementById("reader-body").innerHTML = post.content || "<p>No content.</p>";
  document.getElementById("reader-tags").innerHTML = (post.tags||[]).map(t=>`<span>${t}</span>`).join("");
  reader.hidden = false;
  window.scrollTo({top:0});
}

function closeReader() {
  const reader = document.getElementById("reader");
  if (reader) reader.hidden = true;
}

document.addEventListener("click", e => {
  if (e.target.id === "reader-back" || e.target.closest("#reader-back")) closeReader();
});

// ─── Render: ABOUT ───────────────────────────────────────────────────
function renderAbout() {
  const bio = document.getElementById("about-bio");
  if (bio) bio.innerHTML = `<p>${profile.bio || ""}</p>`;

  const tl = document.getElementById("exp-timeline");
  if (tl) {
    tl.innerHTML = experience.map(e=>`
      <div class="exp-item anim-up">
        <div class="exp-item__content">
          <div class="exp-item__role">${e.role}</div>
          <div class="exp-item__meta">${e.org||""} · ${e.period}</div>
          <ul class="exp-item__bullets">${(e.bullets||[]).map(b=>`<li>${b}</li>`).join("")}</ul>
        </div>
        ${e.image ? `<img src="${e.image}" class="exp-item__image" alt="Logo" />` : ""}
      </div>
    `).join("");
  }

  const por = document.getElementById("por-list");
  if (por) {
    por.innerHTML = leadership.map(e=>`
      <div class="exp-item anim-up">
        <div class="exp-item__content">
          <div class="exp-item__role">${e.role}</div>
          <div class="exp-item__meta">${e.org||""} · ${e.period}</div>
          <ul class="exp-item__bullets">${(e.bullets||[]).map(b=>`<li>${b}</li>`).join("")}</ul>
        </div>
        ${e.image ? `<img src="${e.image}" class="exp-item__image" alt="Logo" />` : ""}
      </div>
    `).join("");
  }

  const al = document.getElementById("achievement-list");
  if (al) {
    al.innerHTML = achievements.map(a=>`
      <div class="ach-item anim-up"><div class="ach-item__title">${a.title}</div><div class="ach-item__detail">${a.detail}</div></div>
    `).join("");
  }
  initAnimations();
}

// ─── Contact ─────────────────────────────────────────────────────────
function initContactForm() {
  const form=document.getElementById("contact-form"), status=document.getElementById("form-status");
  if(!form) return;
  form.addEventListener("submit",e=>{
    e.preventDefault();
    const name=document.getElementById("c-name").value.trim(), email=document.getElementById("c-email").value.trim(),
      topic=document.getElementById("c-topic").value.trim(), msg=document.getElementById("c-msg").value.trim();
    if(!name||!email||!topic||!msg){status.textContent="All fields required.";status.style.color="var(--danger)";return;}
    if(!/^\S+@\S+\.\S+$/.test(email)){status.textContent="Invalid email.";status.style.color="var(--danger)";return;}
    const subj=encodeURIComponent(`[Portfolio] ${topic}`), body=encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${msg}`);
    status.textContent="Opening email client...";status.style.color="var(--ok)";
    window.location.href=`mailto:${profile.email}?subject=${subj}&body=${body}`;form.reset();
  });
}

// ─── Admin ───────────────────────────────────────────────────────────
function initAdmin() {
  const overlay=document.getElementById("admin-overlay"), pwInput=document.getElementById("admin-pw"),
    errEl=document.getElementById("admin-err");
  document.getElementById("admin-open")?.addEventListener("click",()=>{overlay.hidden=false;pwInput?.focus();});
  document.getElementById("admin-cancel")?.addEventListener("click",()=>{overlay.hidden=true;errEl.textContent="";});
  pwInput?.addEventListener("keydown",e=>{if(e.key==="Enter") document.getElementById("admin-go")?.click();});
  document.getElementById("admin-go")?.addEventListener("click",async()=>{
    const raw=pwInput?.value?.trim();
    if(!raw){errEl.textContent="Enter password.";errEl.style.color="var(--danger)";return;}
    if(await sha256(raw)!==PW_HASH){errEl.textContent="Wrong password.";errEl.style.color="var(--danger)";return;}
    sessionStorage.setItem(KEYS.session,"ok");
    window.location.href="editor.html";
  });
}

async function sha256(text) {
  const buf=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,"0")).join("");
}
