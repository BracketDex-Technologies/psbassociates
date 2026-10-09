(() => {
  const form = document.querySelector('#inquiry');
  if (!form) return;

  const status = document.querySelector('#form-status');
  const submit = form.querySelector('button[type="submit"]');
  let accessKey = '';

  fetch('/api/contact', { cache: 'no-store' })
    .then(response => response.ok ? response.json() : Promise.reject())
    .then(config => {
      if (!config.enabled || !config.accessKey) {
        status.textContent = 'Online submission is temporarily unavailable. Please contact the firm by phone or email.';
        return;
      }
      accessKey = config.accessKey;
      submit.disabled = false;
      const note = document.querySelector('[data-form-note]');
      if (note) note.textContent = form.dataset.formSubjectPrefix
        ? 'Complete the form to send your application directly to our team by email.'
        : 'Complete the form to send your enquiry directly to our team. Please avoid confidential documents or sensitive financial information.';
    })
    .catch(() => {
      status.textContent = 'Online submission is temporarily unavailable. Please contact the firm by phone or email.';
    });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const values = new FormData(form);
    if (!accessKey) {
      status.textContent = 'Online submission is temporarily unavailable. Please contact the firm by phone or email.';
      return;
    }
    if (values.get('website')) {
      location.assign('/thank-you/');
      return;
    }

    const applicationType = values.get('application_type');
    const service = values.get('service');
    const subjectPrefix = form.dataset.formSubjectPrefix || 'PSB website enquiry';
    const subjectDetail = applicationType || service || 'General inquiry';
    const payload = {
      access_key: accessKey,
      subject: `${subjectPrefix}: ${subjectDetail}`,
      from_name: 'PSB Associates Website',
      name: values.get('name'),
      email: values.get('email'),
      replyto: values.get('email'),
      service,
      application_type: applicationType,
      phone: values.get('phone'),
      preferred_location: values.get('preferred_location'),
      qualification: values.get('qualification'),
      experience: values.get('experience'),
      profile_link: values.get('profile_link'),
      message: values.get('message'),
    };

    Object.keys(payload).forEach(key => {
      if (payload[key] === null || payload[key] === '') delete payload[key];
    });

    submit.disabled = true;
    status.textContent = applicationType ? 'Sending your application…' : 'Sending your enquiry…';

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(25000),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw Error(result.message || 'Your submission could not be sent.');
      try { sessionStorage.setItem('psb-enquiry-sent', '1'); } catch {}
      location.assign('/thank-you/');
    } catch (error) {
      status.textContent = error.name === 'TimeoutError'
        ? 'The request timed out. Please contact the firm before retrying to avoid a duplicate submission.'
        : error.message;
      submit.disabled = false;
    }
  });
})();
