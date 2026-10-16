const toggle=document.querySelector('.menu-toggle');
const menu=document.querySelector('#navigation');
const setMenuOpen=open=>{
 toggle?.setAttribute('aria-expanded',String(open));
 menu?.classList.toggle('open',open);
};
toggle?.addEventListener('click',()=>setMenuOpen(toggle.getAttribute('aria-expanded')!=='true'));
menu?.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>setMenuOpen(false)));
document.addEventListener('keydown',e=>{
 if(e.key==='Escape'&&toggle?.getAttribute('aria-expanded')==='true'){setMenuOpen(false);toggle.focus();}
});
document.addEventListener('click',e=>{
 if(toggle?.getAttribute('aria-expanded')==='true'&&!e.target.closest('header'))setMenuOpen(false);
});
document.addEventListener('focusin',e=>{
 if(toggle?.getAttribute('aria-expanded')==='true'&&!e.target.closest('header'))setMenuOpen(false);
});
window.matchMedia('(max-width: 1100px)').addEventListener('change',()=>setMenuOpen(false));
document.querySelectorAll('[data-year]').forEach(el=>el.textContent=new Date().getFullYear());
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
// Keep supporting detail available while shortening the initial phone layout.
const phoneLayout=window.matchMedia('(max-width: 650px)');
const compactLaptop=window.matchMedia('(min-width: 901px) and (max-height: 800px)');
const syncPhoneDetails=()=>{
 document.querySelectorAll('[data-responsive-details]').forEach(details=>{
  const collapsible=phoneLayout.matches||(details.matches('.optional-field')&&compactLaptop.matches);
  details.open=!collapsible;
  details.querySelector('summary')?.setAttribute('tabindex',collapsible?'0':'-1');
 });
 document.querySelectorAll('[data-updates].compact [data-feed-list]').forEach(list=>{
  if(phoneLayout.matches)list.removeAttribute('tabindex');else list.setAttribute('tabindex','0');
  list.setAttribute('aria-label',phoneLayout.matches?'Latest official announcements':'Scrollable official announcements');
 });
};
phoneLayout.addEventListener('change',syncPhoneDetails);
compactLaptop.addEventListener('change',syncPhoneDetails);
syncPhoneDetails();

// Short mobile previews for long editorial copy, without hiding desktop text.
// Native disclosures, forms and legal notices keep their existing behaviour.
const mobileCopySelectors='.about-introduction>p,.about-continuation>p,.firm-principles article>p,.practice-overview,.partner-profile .lead,.partner-profile .partner-experience,.detail-layout>div>p:not(.legal-reference),.page-intro>p';
document.querySelectorAll(mobileCopySelectors).forEach((paragraph,index)=>{
 const text=paragraph.textContent;
 if(text.length<300||paragraph.children.length||paragraph.closest('details'))return;
 const boundary=text.lastIndexOf(' ',180);
 if(boundary<80)return;
 const remainder=document.createElement('span');
 remainder.className='mobile-copy-remainder';remainder.id=`mobile-copy-${index}-rest`;
 remainder.textContent=text.slice(boundary);
 const ellipsis=document.createElement('span');
 ellipsis.className='mobile-copy-ellipsis';ellipsis.textContent='…';ellipsis.setAttribute('aria-hidden','true');
 const button=document.createElement('button');
 button.type='button';button.className='mobile-copy-toggle';
 button.setAttribute('aria-controls',remainder.id);
 let expanded=false;
 const sync=()=>{
  const collapsed=phoneLayout.matches&&!expanded;
  remainder.hidden=collapsed;ellipsis.hidden=!collapsed;
  button.hidden=!phoneLayout.matches;
  button.textContent=collapsed?'View more':'View less';
  button.setAttribute('aria-expanded',String(!collapsed));
 };
 paragraph.replaceChildren(document.createTextNode(text.slice(0,boundary)),ellipsis,remainder,button);
 button.addEventListener('click',()=>{expanded=!expanded;sync()});
 phoneLayout.addEventListener('change',sync);
 sync();
});
// Replay only after leaving and re-entering the viewport, in either direction.
// Content stays visible before observation, without GSAP, or with reduced motion.
document.querySelectorAll('[data-updates].compact .updates-header>div').forEach(heading=>{
 const radar=document.createElement('span');
 radar.className='radar-mark';radar.setAttribute('aria-hidden','true');
 radar.innerHTML='<span class="radar-sweep"></span><span class="radar-dot"></span>';
 heading.prepend(radar);
});
if(window.gsap&&'IntersectionObserver' in window){
 const gsap=window.gsap;
 gsap.matchMedia().add({motion:'(prefers-reduced-motion: no-preference)',phone:'(max-width: 650px)'},context=>{
  if(!context.conditions.motion)return;
  const phoneMotion=context.conditions.phone;
  const motions=new Map();
  const active=new Set();
  const register=(element,timeline,loop=null)=>{
   motions.set(element,{timeline,loop});
   element.classList.add('motion-managed');
  };
  document.querySelectorAll('.firm-section,.section-head,.values-layout,.industries-home,.contact-band-inner,.industry-grid article,.sector-disclosure,.resource,.about-body,.partner-profile,.practice-card,.specialist-card,.people-grid .person,.firm-principles .three-col article').forEach(element=>{
   const card=element.matches('.person,.practice-card,.specialist-card,.resource,.sector-disclosure');
   const index=card?[...element.parentElement.children].indexOf(element)%3:0;
   const timeline=gsap.timeline({paused:true}).fromTo(element,
    {y:phoneMotion?12:card?18:14,opacity:phoneMotion ? .5 : .35},
    {y:0,opacity:1,duration:phoneMotion ? .5 : .6,delay:index*(phoneMotion ? .05 : .07),ease:'power2.out',immediateRender:false,clearProps:'transform,opacity'});
   register(element,timeline);
  });
  document.querySelectorAll('[data-animated-stats]').forEach(strip=>{
   const timeline=gsap.timeline({paused:true});
   strip.querySelectorAll('strong[data-count]').forEach((number,index)=>{
    const target=Number(number.dataset.count),counter={value:0};
    const format=value=>String(Math.round(value)).padStart(Number(number.dataset.pad||0),'0')+(number.dataset.suffix||'');
    timeline.fromTo(counter,{value:Number(number.dataset.start||0)},
     {value:target,duration:phoneMotion ? .85 : 1.15,ease:'power2.out',immediateRender:false,
      onUpdate:()=>{number.textContent=format(counter.value)},
      onComplete:()=>{number.textContent=format(target)}},index*.08);
   });
   register(strip,timeline);
  });
  document.querySelectorAll('[data-updates]').forEach(panel=>{
   const timeline=gsap.timeline({paused:true}).fromTo(panel,
    {y:phoneMotion?8:16,opacity:.5},{y:0,opacity:1,duration:phoneMotion ? .35 : .65,ease:'power2.out',immediateRender:false,clearProps:'transform,opacity'});
   const sweep=panel.querySelector('.radar-sweep');
   const loop=sweep?gsap.to(sweep,{rotation:360,duration:phoneMotion ? 6 : 5,ease:'none',repeat:-1,paused:true}):null;
   register(panel,timeline,loop);
  });
  const observer=new IntersectionObserver(entries=>{
   entries.forEach(({target,isIntersecting})=>{
    const motion=motions.get(target);
    if(isIntersecting){
     if(active.has(target))return;
     active.add(target);
     if(!target.contains(document.activeElement))motion.timeline.restart();
     if(!document.hidden)motion.loop?.restart();
    }else{
     active.delete(target);
     motion.timeline.progress(1).pause();
     motion.loop?.pause();
    }
   });
  },{threshold:0});
  motions.forEach((_,element)=>observer.observe(element));
  const focus=event=>{
   motions.forEach(({timeline},element)=>{if(element.contains(event.target))timeline.progress(1).pause()});
  };
  const visibility=()=>motions.forEach(({loop},element)=>{
   if(document.hidden||!active.has(element))loop?.pause();else loop?.resume();
  });
  const refresh=event=>{
   const root=event.detail?.root;
   if(!root||!active.has(root)||document.hidden)return;
   const list=root.querySelector('[data-feed-list]');
   const bounds=list.getBoundingClientRect();
   const rows=[...list.querySelectorAll('.news-item')].filter(row=>{
    const rect=row.getBoundingClientRect();return rect.bottom>bounds.top&&rect.top<bounds.bottom;
   });
   gsap.fromTo(rows,{y:8,opacity:.55},{y:0,opacity:1,duration:.35,stagger:.04,ease:'power2.out',clearProps:'transform,opacity',overwrite:true});
  };
  document.addEventListener('focusin',focus);
  document.addEventListener('visibilitychange',visibility);
  document.addEventListener('psb:announcements-rendered',refresh);
  return ()=>{
   observer.disconnect();
   document.removeEventListener('focusin',focus);
   document.removeEventListener('visibilitychange',visibility);
   document.removeEventListener('psb:announcements-rendered',refresh);
   motions.forEach((_,element)=>element.classList.remove('motion-managed'));
   document.querySelectorAll('[data-count]').forEach(number=>{
    number.textContent=String(Number(number.dataset.count)).padStart(Number(number.dataset.pad||0),'0')+(number.dataset.suffix||'');
   });
   document.querySelectorAll('[data-feed-list] .news-item').forEach(row=>{
    gsap.killTweensOf(row);
    row.style.removeProperty('transform');row.style.removeProperty('opacity');
   });
  };
 });
}
// Never disable the phone's primary contact shortcut during scrolling.
// Desktop retains overlap protection; phones reserve footer space in CSS.
const floatingContact=document.querySelector('.floating-whatsapp');
const contactObstacles=[...document.querySelectorAll('.contact-band,footer,.people-section .profile-link,.home-actions,.home-hero-bottom a,.home-secondary,.home-partners,.home-briefing .updates-panel')];
const updateFloatingContact=()=>{
 if(!floatingContact)return;
 if(phoneLayout.matches){
  floatingContact.toggleAttribute('data-obscured',false);
  floatingContact.inert=false;
  return;
 }
 const button=floatingContact.getBoundingClientRect();
 const obscured=document.activeElement!==floatingContact&&contactObstacles.some(element=>{
  const rect=element.getBoundingClientRect();
  return rect.width>0&&rect.height>0&&rect.left<button.right&&rect.right>button.left&&rect.top<button.bottom&&rect.bottom>button.top;
 });
 floatingContact.toggleAttribute('data-obscured',obscured);
 floatingContact.inert=obscured;
};
window.addEventListener('resize',updateFloatingContact,{passive:true});
phoneLayout.addEventListener('change',updateFloatingContact);
document.addEventListener('focusin',updateFloatingContact);
document.addEventListener('focusout',()=>requestAnimationFrame(updateFloatingContact));
document.addEventListener('toggle',updateFloatingContact,true);
if(floatingContact&&'ResizeObserver' in window)new ResizeObserver(updateFloatingContact).observe(document.body);
const progress=document.querySelector('.reading-progress');let framePending=false;const updateScroll=()=>{const max=document.documentElement.scrollHeight-window.innerHeight;if(progress)progress.style.transform=`scaleX(${max>0?window.scrollY/max:0})`;document.querySelector('header')?.classList.toggle('scrolled',window.scrollY>30);updateFloatingContact();framePending=false;};window.addEventListener('scroll',()=>{if(!framePending){requestAnimationFrame(updateScroll);framePending=true}},{passive:true});updateScroll();
const expandBriefing=()=>{if(location.hash==='#more-briefing'){const section=document.querySelector('#more-briefing');if(section)section.open=true;}};

// Native horizontal swiping with explicit controls; never auto-advance while reading.
document.querySelectorAll('[data-people-rail]').forEach(rail=>{
 const cards=[...rail.querySelectorAll('.person')];
 const controls=rail.nextElementSibling;
 const previous=controls.querySelector('[data-people-step="-1"]');
 const next=controls.querySelector('[data-people-step="1"]');
 const position=controls.querySelector('[data-people-position]');
 const step=()=>cards.length>1?cards[1].offsetLeft-cards[0].offsetLeft:rail.clientWidth;
 const index=()=>Math.max(0,Math.min(cards.length-1,Math.round(rail.scrollLeft/step())));
 const sync=()=>{
  if(phoneLayout.matches)rail.setAttribute('tabindex','0');else rail.removeAttribute('tabindex');
  previous.disabled=rail.scrollLeft<=2;
  next.disabled=rail.scrollLeft+rail.clientWidth>=rail.scrollWidth-2;
  position.textContent=`${index()+1} / ${cards.length}`;
 };
 const move=direction=>rail.scrollTo({left:(index()+direction)*step(),behavior:reducedMotion.matches?'instant':'smooth'});
 previous.addEventListener('click',()=>move(-1));
 next.addEventListener('click',()=>move(1));
 rail.addEventListener('keydown',event=>{
  if(event.target!==rail||!phoneLayout.matches||!['ArrowLeft','ArrowRight'].includes(event.key))return;
  event.preventDefault();move(event.key==='ArrowRight'?1:-1);
 });
 rail.addEventListener('scroll',sync,{passive:true});
 window.addEventListener('resize',sync,{passive:true});
 phoneLayout.addEventListener('change',sync);
 sync();
});
document.querySelectorAll('[data-expand-briefing]').forEach(link=>link.addEventListener('click',()=>{const section=document.querySelector('#more-briefing');if(section)section.open=true;}));
window.addEventListener('hashchange',expandBriefing);expandBriefing();
document.querySelectorAll('.scroll-controls').forEach(controls=>{const rail=controls.previousElementSibling;const buttons=controls.querySelectorAll('[data-slide]');const sync=()=>{buttons[0].disabled=rail.scrollLeft<5;buttons[1].disabled=rail.scrollLeft+rail.clientWidth>=rail.scrollWidth-5};buttons.forEach(button=>button.addEventListener('click',()=>rail.scrollBy({left:Number(button.dataset.slide)*(rail.querySelector('.practice-card').getBoundingClientRect().width+24),behavior:reducedMotion.matches?'instant':'smooth'})));rail.addEventListener('scroll',sync,{passive:true});window.addEventListener('resize',sync);sync()});
