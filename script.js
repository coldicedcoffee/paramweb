/* ====================================================================
   script.js  —  Param Pabari Portfolio  (v4)
   ==================================================================== */

const KEYS = {
  blog:"pp_blog_v3", projects:"pp_projects_v3", experience:"pp_experience_v3",
  profile:"pp_profile_v3", leadership:"pp_leadership_v3",
  achievements:"pp_achievements_v3", session:"pp_session_v3", theme:"pp_theme",
};

const PW_HASH = "60fefd770b1ea964f85db078ad6c551e1b107d568c96e12b1e213fd28fee8c0d";

// ─── Default Data ────────────────────────────────────────────────────
const DEFAULT_PROFILE = {
  name:"Param Pabari",
  tagline:"Private Capital & Strategic Finance",
  description:"Mechanical Engineering at IIT Bombay with a minor in AI & Data Science. Direct experience across venture investing, business strategy, and startup operations.",
  bio:"I'm Param Pabari — a second-year undergraduate at IIT Bombay studying Mechanical Engineering with a minor in AI & Data Science. What drives me is the intersection of capital, strategy, and execution. I spend most of my time evaluating startups, building investment theses, and working on live deal pipelines. Outside of finance, I've led large-scale technical programming on campus, mentored juniors, and competed in hockey at the institute level. I believe the best way to learn is to operate — with real stakes, real deadlines, and real accountability.",
  email:"param.pabari@iitb.ac.in",
  resume:"23B2136-1.pdf",
  institution:"IIT Bombay",
  degree:"B.TECH • CPI 8.5",
  stats:[
    {value:120,suffix:"+",label:"STARTUP CALLS"},
    {value:12000,suffix:"+",label:"LABS EVALUATED"},
    {value:15,prefix:"₹",suffix:"L+",label:"FUND MANAGED"},
    {value:99.76,suffix:"%",decimals:2,label:"JEE PERCENTILE"},
  ],
};

const DEFAULT_EXPERIENCE = [
  {role:"Business Strategy Intern",org:"Traya Health",period:"Current",theme:"D2C Growth",
    bullets:["Working on business strategy priorities for a D2C health brand with INR 237 Cr FY24 revenue.","Parallel execution with live investment analyst responsibilities."]},
  {role:"Part-time Investment Analyst",org:"YPoint Capital",period:"Current",theme:"VC Fundside",
    bullets:["Supporting live deal evaluation and sourcing at a VC fund with INR 250 Cr AUM.","Contributing to thesis framing, screening, and pre-investment decision flow."]},
  {role:"Investment Analyst Intern",org:"RSPN Ventures",period:"Nov 2025 – Jan 2026",theme:"Family Office VC",
    bullets:["Led commercial diligence on diagnostics with 3-4x acquisition vs 8-10x exit arbitrage across 12,000 labs.","Built unit-economics models; proposed service-node roll-up structure adopted in deal design."]},
  {role:"Operations & Supply Chain Intern",org:"Armstrong Dematic",period:"May 2025 – Jul 2025",theme:"Warehouse Automation",
    bullets:["Built a custom Traffic Editor used weekly by 10+ engineers.","Co-led four AI capability workshops for 50+ engineers.","Received Letter of Recommendation from the AGM."]},
];

const DEFAULT_LEADERSHIP = [
  {role:"Head of Investment Team",org:"Undergraduate Academic Council, IIT Bombay",period:"Current",
    bullets:["Scaled analyst team to 12 members across VC, Equity Research, and Quant Finance.","Created first external fund partnerships with YPoint Capital and RSPN Ventures.","Managing INR 15L+ live student investment fund targeting 15% CAGR."]},
  {role:"Institute Web & Coding Convener",org:"Institute Technical Council, IIT Bombay",period:"2024–2025",
    bullets:["Led IIT Bombay's first DSA bootcamp with Coding Ninjas — 800+ students in 6 weeks.","Delivered 7+ flagship events impacting 1,000+ students."]},
  {role:"Department Academic Mentor",org:"Student Mentorship Program",period:"Jun 2025 – Present",
    bullets:["Mentoring 6 sophomores on academics, prioritization, and co-curricular strategy."]},
];

const DEFAULT_PROJECTS = [
  {id:"roots-healthtech",title:"Roots Ventures Healthtech Thesis",category:"Venture Capital",period:"2025",
    summary:"Authored sector thesis across 5+ healthtech sub-sectors and mapped deployable opportunities.",
    impact:"Mapped USD 100M+ market opportunity and recommended 11 pre-Series A targets.",
    detail:"Profiled 10+ late-stage investors to frame realistic exit optionality for each thesis segment.",tags:["Thesis","Market Mapping","Sourcing"]},
  {id:"bcg-ideathon",title:"BCG Ideathon GTM Strategy",category:"Consulting",period:"Aug – Nov 2024",
    summary:"National semi-final project focused on Indian healthtech diligence and growth model design.",
    impact:"Formulated and pitched a USD 171M GTM strategy to BCG senior reviewers.",
    detail:"Combined customer segmentation, pricing pathways, and scale economics into one narrative.",tags:["GTM","Diligence","Case Competition"]},
  {id:"rbi-transmission",title:"RBI Monetary Policy Transmission",category:"Macroeconomics",period:"2025",
    summary:"Independent macro analysis of 12 RBI rate cycles from 2013 to 2025.",
    impact:"Identified 3–4 quarter lag from rate action to real economy response.",
    detail:"Tracked CPI easing from 7.8% to 5.7% after 250bps tightening in FY22-FY23.",tags:["Macro","Rates","Sector Rotation"]},
  {id:"v2g2h",title:"V2G2H Charging Infrastructure",category:"Sustainability",period:"2025–2026",
    summary:"Built vehicle-to-grid-to-home architecture for Indian residential EV contexts.",
    impact:"Reached finals of Global Sustainability Challenge and Innomax by Thermax.",
    detail:"Focused on deployment economics, household load balancing, and grid responsiveness.",tags:["Climate","Energy","EV"]},
  {id:"sharda-dcf",title:"Sharda Motors DCF Thesis",category:"Equity Research",period:"2025",
    summary:"Prepared DCF-led equity report for a national-level equity research competition.",
    impact:"Built valuation model and investment recommendation under competition timelines.",
    detail:"Used sensitivity testing on margins and terminal value assumptions.",tags:["DCF","Valuation","Public Markets"]},
];

const DEFAULT_POSTS = [
  {id:"diagnostics-rollup",title:"A Practical Memo On Diagnostics Roll-Up Economics",dateISO:"2026-01-28",
    summary:"What changes when diagnostics is modeled as a service-node roll-up rather than a loose asset basket.",
    tags:["VC","Healthtech","Diligence"],
    content:"<p>A diagnostics thesis only works when service density, referral pathways, and test mix are modeled together. In fragmented markets, simple top-line multiplication often hides execution drag.</p><h2>What moved the analysis</h2><p>The highest signal came from unit economics at node level and not from aggregate market-size claims. Modeling acquisition at lower multiples and exits at strategic-scale multiples created a tighter view of risk-adjusted return.</p><p>For investors, the practical question is not market size alone. It is whether integration velocity and quality consistency can compound before capital intensity erodes optionality.</p>"},
  {id:"rbi-rate-cycles",title:"How RBI Rate Cycles Shape Equity Rotation",dateISO:"2026-02-12",
    summary:"Twelve cycles suggest policy effects show up with a lag, but markets reprice expectations earlier.",
    tags:["Macro","Rates","Equities"],
    content:"<p>Across major tightening and easing windows since 2013, policy transmission to real demand has generally shown a multi-quarter lag. That lag creates a timing gap between narrative and fundamentals.</p><h2>Where this is useful</h2><p>For portfolio construction, the key is sequencing. Bond repricing tends to move first, while equity leadership rotates only after confidence on earnings durability improves.</p><p>The implication is simple: avoid one-step conclusions from policy announcements, and treat each sector by balance-sheet resilience and pricing power.</p>"},
  {id:"student-fund-risk",title:"Building A Student Investment Fund Risk Framework",dateISO:"2026-03-03",
    summary:"How to keep conviction high while preserving downside control in an educational portfolio setting.",
    tags:["Portfolio","Risk","Learning"],
    content:"<p>Student funds fail when process is replaced by opinion. A robust framework starts with allocation guardrails, review cadence, and explicit kill criteria.</p><h2>Core rules</h2><ul><li>Position sizing should reflect uncertainty and not excitement.</li><li>Each thesis must have a disconfirming signal defined in advance.</li><li>Post-mortems are mandatory for both winners and losers.</li></ul><p>The objective is to train judgement under pressure, not to chase isolated outcomes.</p>"},
];

const DEFAULT_ACHIEVEMENTS = [
  {title:"VC Case Competition — 1st Place",detail:"1st / 200+ teams nationally with analysis of Loop Health (YC W20)."},
  {title:"Ace The Case (M&A) — 3rd Place",detail:"3rd / 300+ teams with M&A strategy, valuation, and synergy work."},
  {title:"BCG Ideathon — National Semi-Finalist",detail:"One of three IIT Bombay teams from 1,700+ applicants; pitched USD 171M GTM strategy."},
  {title:"HSBC Case Challenge — National Finalist",detail:"Reached national finals with structured financial recommendation design."},
  {title:"CFA Research Challenge Rep",detail:"First IIT Bombay team to compete nationally with institutional-style equity research."},
  {title:"Gold Medal — Friesheista Hockey",detail:"Won gold after 150+ hours of NSO Hockey training at IIT Bombay."},
];

// ─── State ───────────────────────────────────────────────────────────
let profile, experience, leadership, projects, posts, achievements;

// ─── Boot ────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  loadAllData();
  initTheme();
  initNav();
  initAnimations();
  initAdmin();
  initContactForm();
  renderHome();
  document.getElementById("year").textContent = new Date().getFullYear();
});

function loadAllData() {
  profile      = loadJSON(KEYS.profile)      || DEFAULT_PROFILE;
  experience   = loadJSON(KEYS.experience)   || DEFAULT_EXPERIENCE;
  leadership   = loadJSON(KEYS.leadership)   || DEFAULT_LEADERSHIP;
  projects     = loadJSON(KEYS.projects)     || DEFAULT_PROJECTS;
  posts        = loadJSON(KEYS.blog)         || DEFAULT_POSTS;
  achievements = loadJSON(KEYS.achievements) || DEFAULT_ACHIEVEMENTS;
}

function loadJSON(k) { try { const r=localStorage.getItem(k); return r?JSON.parse(r):null; } catch{return null;} }
function saveJSON(k,d) { localStorage.setItem(k,JSON.stringify(d)); }

// ─── Theme Toggle ────────────────────────────────────────────────────
function initTheme() {
  const saved = localStorage.getItem(KEYS.theme);
  if (saved === "light") document.documentElement.setAttribute("data-theme","light");
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
  // Close reader if open
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

  // Positions
  const pl = document.getElementById("positions-list");
  if (pl) {
    const current = experience.filter(e => /current|present/i.test(e.period));
    const leaderCurrent = leadership.filter(e => /current|present/i.test(e.period));
    const all = [...current, ...leaderCurrent];
    pl.innerHTML = all.map(e => `
      <div class="pos-card anim-up">
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
        <span class="card__label">${p.category} · ${p.period}</span>
        <div class="card__title">${p.title}</div>
        <div class="card__desc">${p.summary}</div>
        <div class="card__footer">${p.impact}</div>
      </div>
    `).join("");
    list.querySelectorAll("[data-pid]").forEach(n=>n.addEventListener("click",()=>{
      const sel=projects.find(p=>p.id===n.dataset.pid);
      if(sel) renderSpotlight(sel);
      list.querySelectorAll(".card").forEach(c=>c.classList.remove("selected"));
      n.classList.add("selected");
    }));
  }
  if(visible.length>0) renderSpotlight(visible[0]);
  initAnimations();
}
function renderSpotlight(p) {
  document.getElementById("spot-title").textContent=p.title;
  document.getElementById("spot-detail").textContent=p.detail||p.summary;
  document.getElementById("spot-impact").textContent=p.impact;
  document.getElementById("spot-tags").innerHTML=(p.tags||[]).map(t=>`<span>${t}</span>`).join("");
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
  // Bio
  const bio = document.getElementById("about-bio");
  if (bio) bio.innerHTML = `<p>${profile.bio || ""}</p>`;

  // Professional
  const tl = document.getElementById("exp-timeline");
  if (tl) {
    tl.innerHTML = experience.map(e=>`
      <div class="exp-item anim-up">
        <div class="exp-item__role">${e.role}</div>
        <div class="exp-item__meta">${e.org||""} · ${e.period}</div>
        <ul class="exp-item__bullets">${(e.bullets||[]).map(b=>`<li>${b}</li>`).join("")}</ul>
      </div>
    `).join("");
  }

  // PoR
  const por = document.getElementById("por-list");
  if (por) {
    por.innerHTML = leadership.map(e=>`
      <div class="exp-item anim-up">
        <div class="exp-item__role">${e.role}</div>
        <div class="exp-item__meta">${e.org||""} · ${e.period}</div>
        <ul class="exp-item__bullets">${(e.bullets||[]).map(b=>`<li>${b}</li>`).join("")}</ul>
      </div>
    `).join("");
  }

  // Achievements
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
