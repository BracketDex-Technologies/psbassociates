(()=>{
 const form=document.querySelector('#inquiry');if(!form)return;
 const status=document.querySelector('#form-status'),submit=form.querySelector('button[type="submit"]');let accessKey='';
 fetch('/api/contact',{cache:'no-store'}).then(r=>r.ok?r.json():Promise.reject()).then(config=>{
  if(!config.enabled||!config.accessKey){status.textContent='Online enquiry is temporarily unavailable. Please contact the firm by phone or email.';return;}
  accessKey=config.accessKey;submit.disabled=false;
  const note=document.querySelector('[data-form-note]');if(note)note.textContent='Complete the form to send your enquiry directly to our team. Please avoid confidential documents or sensitive financial information.';
 }).catch(()=>{status.textContent='Online enquiry is temporarily unavailable. Please contact the firm by phone or email.';});
 form.addEventListener('submit',async e=>{
  e.preventDefault();if(!form.reportValidity())return;const values=new FormData(form);
  if(!accessKey){status.textContent='Online enquiry is temporarily unavailable. Please contact the firm by phone or email.';return;}
  if(values.get('website')){location.assign('/thank-you/');return;}
  submit.disabled=true;status.textContent='Sending your enquiry…';
  try{const response=await fetch('https://api.web3forms.com/submit',{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({access_key:accessKey,subject:'PSB website enquiry: '+values.get('service'),from_name:'PSB Associates Website',name:values.get('name'),email:values.get('email'),service:values.get('service'),message:values.get('message')}),signal:AbortSignal.timeout(25000)});const result=await response.json();if(!response.ok||!result.success)throw Error(result.message||'Your enquiry could not be sent.');try{sessionStorage.setItem('psb-enquiry-sent','1');}catch{}location.assign('/thank-you/');}
  catch(error){status.textContent=error.name==='TimeoutError'?'The request timed out. Please contact the firm before retrying to avoid a duplicate enquiry.':error.message;submit.disabled=false;}
 });
})();
