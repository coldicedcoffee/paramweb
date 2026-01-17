document.addEventListener('DOMContentLoaded', function(){
  // year
  const y = new Date().getFullYear();
  const el = document.getElementById('year');
  if(el) el.textContent = y;

  // mobile nav
  const nav = document.getElementById('site-nav');
  const btn = document.getElementById('nav-toggle');
  if(btn && nav){
    btn.addEventListener('click', ()=>{
      nav.classList.toggle('show');
    });
    // hide on link click
    nav.querySelectorAll('a').forEach(a=>a.addEventListener('click', ()=>nav.classList.remove('show')));
  }
});
