(()=>{
 const form=document.querySelector('#inquiry');if(!form)return;
 const status=document.querySelector('#form-status'),submit=form.querySelector('button[type="submit"]');let ready=false,widget;
 fetch('/api/contact',{cache:'no-store'}).then(r=>r.ok?r.json():Promise.reject()).then(config=>{
  if(!config.enabled)return;
  const slot=document.createElement('div');slot.id='contact-verification';form.insertBefore(slot,submit);
  submit.disabled=true;submit.textContent='Send enquiry';
  const note=document.querySelector('[data-form-note]');if(note)note.textContent='Complete the form and security check to send your enquiry. Please avoid confidential documents or sensitive financial information.';
  window.psbTurnstileReady=()=>{widget=window.turnstile.render(slot,{sitekey:config.siteKey,action:'contact',callback:()=>{ready=true;submit.disabled=false;},'expired-callback':()=>{ready=false;submit.disabled=true;},'error-callback':()=>{ready=false;submit.disabled=true;status.textContent='Security check could not load. Please reload or email office@psbassociates.in.';}});};
  const script=document.createElement('script');script.src='https://challenges.cloudflare.com/turnstile/v0/api.js?onload=psbTurnstileReady&render=explicit';script.async=true;script.onerror=()=>{status.textContent='Security check is unavailable. Please email office@psbassociates.in.';};document.head.append(script);
  form.dataset.online='true';
 }).catch(()=>{});
 form.addEventListener('submit',async e=>{
  e.preventDefault();if(!form.reportValidity())return;const values=new FormData(form);
  if(form.dataset.online!=='true'){
   const body=`Name: ${values.get('name')}\nEmail: ${values.get('email')}\nPractice area: ${values.get('service')}\n\n${values.get('message')}`;
   location.href=`mailto:office@psbassociates.in?subject=${encodeURIComponent('Website inquiry: '+values.get('service'))}&body=${encodeURIComponent(body)}`;
   status.textContent='Your email application will open with a draft. Send it there to deliver your enquiry.';return;
  }
  if(!ready)return;submit.disabled=true;status.textContent='Sending your enquiry…';
  try{const response=await fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:values.get('name'),email:values.get('email'),service:values.get('service'),message:values.get('message'),consent:values.get('consent')==='on',website:values.get('website')||'',token:window.turnstile.getResponse(widget)}),signal:AbortSignal.timeout(25000)});const result=await response.json();if(!response.ok||!result.ok)throw Error(result.error||'Your enquiry could not be sent.');try{sessionStorage.setItem('psb-enquiry-sent','1');}catch{}location.assign('/thank-you/');}
  catch(error){status.textContent=error.name==='TimeoutError'?'The request timed out. Please contact the firm before retrying to avoid a duplicate enquiry.':error.message;ready=false;window.turnstile.reset(widget);}
 });
})();
