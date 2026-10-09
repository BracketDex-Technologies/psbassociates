const toggle=document.querySelector('.menu-toggle');
const menu=document.querySelector('#navigation');
toggle?.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));menu.classList.toggle('open',open)});
menu?.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{menu.classList.remove('open');toggle?.setAttribute('aria-expanded','false')}));
document.addEventListener('keydown',e=>{if(e.key==='Escape'){menu?.classList.remove('open');toggle?.setAttribute('aria-expanded','false')}});
document.querySelectorAll('[data-year]').forEach(el=>el.textContent=new Date().getFullYear());
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
document.querySelectorAll('[data-animated-stats]').forEach(strip=>{
 const numbers=[...strip.querySelectorAll('strong[data-count]')];
 if(reducedMotion.matches||!window.gsap)return;
 window.gsap.set(numbers,{y:18,opacity:0});
 const play=()=>numbers.forEach((number,index)=>{
  const target=Number(number.dataset.count);
  const counter={value:Number(number.dataset.start||0)};
  const suffix=number.dataset.suffix||'';
  const pad=Number(number.dataset.pad||0);
  window.gsap.to(number,{y:0,opacity:1,duration:.65,delay:index*.11,ease:'power3.out'});
  window.gsap.to(counter,{value:target,duration:1.45,delay:index*.11,ease:'power3.out',snap:{value:1},onUpdate:()=>{number.textContent=String(Math.round(counter.value)).padStart(pad,'0')+suffix;},onComplete:()=>{number.textContent=String(target).padStart(pad,'0')+suffix;}});
 });
 if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){play();observer.disconnect();}}),{threshold:.35});observer.observe(strip);}else play();
});
if('IntersectionObserver' in window&&!reducedMotion.matches){const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('revealed');observer.unobserve(entry.target)}}),{threshold:.1});document.querySelectorAll('.firm-section,.section-head,.values-layout,.people-grid,.industries-home,.contact-band,.industry-grid article,.resource,.about-body,.partner-profile').forEach(el=>{el.classList.add('reveal');observer.observe(el)});}
const progress=document.querySelector('.reading-progress');let framePending=false;const updateScroll=()=>{const max=document.documentElement.scrollHeight-window.innerHeight;if(progress)progress.style.transform=`scaleX(${max>0?window.scrollY/max:0})`;document.querySelector('header')?.classList.toggle('scrolled',window.scrollY>30);framePending=false;};window.addEventListener('scroll',()=>{if(!framePending){requestAnimationFrame(updateScroll);framePending=true}},{passive:true});updateScroll();
document.querySelectorAll('.scroll-controls').forEach(controls=>{const rail=controls.previousElementSibling;const buttons=controls.querySelectorAll('[data-slide]');const sync=()=>{buttons[0].disabled=rail.scrollLeft<5;buttons[1].disabled=rail.scrollLeft+rail.clientWidth>=rail.scrollWidth-5};buttons.forEach(button=>button.addEventListener('click',()=>rail.scrollBy({left:Number(button.dataset.slide)*(rail.querySelector('.practice-card').getBoundingClientRect().width+24),behavior:reducedMotion.matches?'instant':'smooth'})));rail.addEventListener('scroll',sync,{passive:true});window.addEventListener('resize',sync);sync()});
