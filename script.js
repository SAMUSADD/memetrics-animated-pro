// ----- CONFIG -----
const yearEl = document.getElementById('year');
yearEl.textContent = new Date().getFullYear();

// Update Live DVI link if user provides Space URL in config.js
if (window.MEMETRICS_SPACE_URL) {
  const live = document.getElementById('liveLink');
  live.href = window.MEMETRICS_SPACE_URL;
}

// ----- Particles background (lightweight) -----
const canvas = document.getElementById('bg');
const ctx = canvas.getContext('2d');
let w, h, particles;

function resize(){
  w = canvas.width = window.innerWidth;
  h = canvas.height = window.innerHeight;
  particles = Array.from({length: Math.min(120, Math.floor(w*h/18000))}, () => ({
    x: Math.random()*w,
    y: Math.random()*h,
    r: Math.random()*1.8 + 0.4,
    vx: (Math.random()-.5)*0.4,
    vy: (Math.random()-.5)*0.4,
    a: Math.random()*0.6+0.2
  }));
}
resize();
window.addEventListener('resize', resize);

function tick(){
  ctx.clearRect(0,0,w,h);
  ctx.fillStyle = '#0b1220';
  particles.forEach(p=>{
    p.x += p.vx; p.y += p.vy;
    if(p.x<0||p.x>w) p.vx*=-1;
    if(p.y<0||p.y>h) p.vy*=-1;
    ctx.globalAlpha = p.a;
    ctx.beginPath();
    ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
    ctx.fill();
  });
  requestAnimationFrame(tick);
}
tick();

// ----- 3D tilt -----
document.querySelectorAll('[data-tilt]').forEach(card=>{
  card.addEventListener('mousemove', (e)=>{
    const r = card.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    const rx = ((y/r.height)-0.5)*-8;
    const ry = ((x/r.width)-0.5)*8;
    card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg)`;
  });
  card.addEventListener('mouseleave', ()=>{
    card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg)';
  });
});

// ----- Counters -----
document.querySelectorAll('.count').forEach(el=>{
  const target = +el.dataset.target;
  let n = 0;
  const step = () => {
    n += Math.max(1, Math.floor(target/60));
    if(n >= target){ n = target; }
    el.textContent = n;
    if(n < target) requestAnimationFrame(step);
  };
  step();
});

// ----- Reveal on scroll -----
const io = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('show'); });
},{threshold:.15});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

// ----- Split text animation (GSAP-like) -----
function splitText(selector){
  const el = document.querySelector(selector);
  const parts = el.querySelectorAll('span');
  el.classList.add('ready');
  // already styled via CSS keyframes
}
splitText('#headline');

// ----- Gauge helpers -----
function dashFor(score){
  const circumference = 2 * Math.PI * 60;
  const pct = Math.max(0, Math.min(900, score)) / 900;
  return `${circumference * pct} ${circumference}`;
}
const arc = document.getElementById('arc');
const arcMini = document.getElementById('arcMini');
arcMini.setAttribute('stroke-dasharray', dashFor(785));
arc.setAttribute('stroke-dasharray', dashFor(785));

// ----- Demo compute (synthetic) -----
const skills = document.getElementById('skills');
const pace = document.getElementById('pace');
const finance = document.getElementById('finance');
const scoreEl = document.getElementById('score');
const gradeEl = document.getElementById('grade');
const apiNote = document.getElementById('apiNote');

document.getElementById('compute').addEventListener('click', ()=>{
  const s = (+skills.value)/5;
  const p = (+pace.value)/100;
  const f = (+finance.value)/100;
  const score = Math.round(300 + 600*(0.4*s + 0.35*p + 0.25*f));
  scoreEl.textContent = score;
  gradeEl.textContent = score>760?'Excellent':score>680?'Good':score>580?'Fair':'Developing';
  arc.setAttribute('stroke-dasharray', dashFor(score));
});

// ----- Call Space API (optional) -----
document.getElementById('callApi').addEventListener('click', async ()=>{
  if(!window.MEMETRICS_SPACE_URL){
    apiNote.textContent = 'Set MEMETRICS_SPACE_URL in config.js to call your Space. Using local demo.';
    apiNote.classList.add('show');
    return;
  }
  try{
    apiNote.textContent = 'Calling Space...';
    const payload = { skills: +skills.value, pace: +pace.value, finance: +finance.value };
    const res = await fetch(window.MEMETRICS_SPACE_URL, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    const score = Math.round(data.score ?? 700);
    scoreEl.textContent = score;
    gradeEl.textContent = score>760?'Excellent':score>680?'Good':score>580?'Fair':'Developing';
    arc.setAttribute('stroke-dasharray', dashFor(score));
    apiNote.textContent = 'Space response OK';
  }catch(err){
    apiNote.textContent = 'API error. Falling back to local demo.';
  }
});

// ----- Peek button scroll -----
document.getElementById('peek').addEventListener('click', ()=>{
  document.querySelector('#profile').scrollIntoView({behavior:'smooth'});
});
