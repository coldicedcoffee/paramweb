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
      nav.classList.toggle('active'); // Changed from 'show' to 'active' to match CSS
    });
    // hide on link click
    nav.querySelectorAll('a').forEach(a=>a.addEventListener('click', ()=>nav.classList.remove('active')));
  }

  // Scroll Animations (Intersection Observer)
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // Only animate once
      }
    });
  }, observerOptions);

  document.querySelectorAll('.fade-in').forEach(el => {
    el.style.animationPlayState = 'paused'; // Pause initially
    observer.observe(el);
  });
  
  // Custom trigger to play animation
  document.addEventListener('scroll', () => {
      document.querySelectorAll('.fade-in.visible').forEach(el => {
          el.style.animationPlayState = 'running';
      });
  });
  
  // Trigger immediately for above-the-fold
  setTimeout(() => {
      document.querySelectorAll('.fade-in').forEach(el => {
          const rect = el.getBoundingClientRect();
          if(rect.top < window.innerHeight) {
              el.style.animationPlayState = 'running';
          }
      });
  }, 100);

});
