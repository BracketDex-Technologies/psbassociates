const toggle=document.querySelector('.menu-toggle');
const menu=document.querySelector('#navigation');
toggle?.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));menu.classList.toggle('open',open)});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){menu?.classList.remove('open');toggle?.setAttribute('aria-expanded','false')}});
document.querySelectorAll('[data-year]').forEach(el=>el.textContent=new Date().getFullYear());
const inquiry=document.querySelector('#inquiry');
inquiry?.addEventListener('submit',e=>{e.preventDefault();if(!inquiry.reportValidity())return;const data=new FormData(inquiry);const body=`Name: ${data.get('name')}\nEmail: ${data.get('email')}\nPractice area: ${data.get('service')}\n\n${data.get('message')}`;window.location.href=`mailto:office@psbassociates.in?subject=${encodeURIComponent('Website inquiry: '+data.get('service'))}&body=${encodeURIComponent(body)}`;document.querySelector('#form-status').textContent='Your email application will open with a draft. Please send it there to deliver your inquiry.'});
