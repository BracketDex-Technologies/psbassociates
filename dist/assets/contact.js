(() => {
  const form = document.querySelector('#inquiry');
  if (!form) return;

  const status = document.querySelector('#form-status');
  const submit = form.querySelector('button[type="submit"]');
  const serviceTrigger = form.querySelector('.contact-service-trigger');
  const serviceMenu = form.querySelector('.contact-service-menu');
  const serviceSummary = form.querySelector('.contact-service-summary');
  const servicePlaceholder = form.querySelector('[data-service-placeholder]');
  const serviceError = form.querySelector('[data-service-error]');
  const serviceBackButton = form.querySelector('[data-service-back]');
  let accessKey = '';

  serviceBackButton?.addEventListener?.('click', () => {
    serviceTrigger?.setAttribute('aria-expanded', 'false');
    if (serviceMenu) serviceMenu.hidden = true;
    serviceTrigger?.focus?.();
  });

  const serviceInputs = form.querySelectorAll ? [...form.querySelectorAll('input[name="service"]')] : [];
  let serviceValidationAttempted = false;
  // Validate the group through its visible control, not a checkbox in a closed menu.
  serviceInputs.forEach(input => { input.required = false; });
  const updateServices = () => {
    if (!serviceInputs.length) return;
    const selected = serviceInputs.filter(input => input.checked);
    servicePlaceholder.textContent = selected.length ? `${selected.length} area${selected.length === 1 ? '' : 's'} selected` : 'Select one or more areas';
    serviceSummary.innerHTML = selected.map(input => `<span class="contact-service-breadcrumb"><span>Area of interest</span><b aria-hidden="true">›</b>${input.value}</span>`).join('');
    const invalid = serviceValidationAttempted && selected.length === 0;
    serviceError.hidden = !invalid;
    serviceTrigger.setAttribute('aria-invalid', String(invalid));
  };

  serviceTrigger?.addEventListener?.('click', () => {
    const open = serviceTrigger.getAttribute('aria-expanded') === 'true';
    serviceTrigger.setAttribute('aria-expanded', String(!open));
    serviceMenu.hidden = open;
  });
  form.addEventListener('keydown', event => {
    if (event.key === 'Escape' && serviceMenu && !serviceMenu.hidden) {
      event.preventDefault();
      serviceMenu.hidden = true;
      serviceTrigger.setAttribute('aria-expanded', 'false');
      serviceTrigger.focus();
    }
  });
  form.addEventListener('focusin', event => {
    if (serviceMenu && !serviceMenu.hidden && !event.target.closest('.contact-service-dropdown')) {
      serviceMenu.hidden = true;
      serviceTrigger.setAttribute('aria-expanded', 'false');
    }
  });
  serviceInputs.forEach(input => input.addEventListener?.('change', updateServices));
  document.addEventListener?.('click', event => {
    if (serviceMenu && !serviceMenu.hidden && !event.target.closest('.contact-service-dropdown')) {
      serviceTrigger.setAttribute('aria-expanded', 'false');
      serviceMenu.hidden = true;
    }
  });
  updateServices();

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
    if (serviceInputs.length && !serviceInputs.some(input => input.checked)) {
      serviceValidationAttempted = true;
      updateServices();
      serviceTrigger.focus();
      return;
    }

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
    const services = values.getAll ? values.getAll('service') : (values.get('service') ? [values.get('service')] : []);
    const service = services.join(', ');
    const subjectPrefix = form.dataset.formSubjectPrefix || 'PSB website enquiry';
    const subjectDetail = applicationType || service || 'General inquiry';
    const payload = {
      access_key: accessKey,
      subject: `${subjectPrefix}: ${services[0] || subjectDetail}`,
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
      let result;
      try {
        result = await response.json();
      } catch {
        throw Error('The email service is temporarily unavailable or blocked this request. Your enquiry has not been confirmed. Please email office@psbassociates.in or call +91 94228 68050.');
      }
      if (!response.ok || !result.success) throw Error(result.message || 'Your submission could not be sent.');
      try { sessionStorage.setItem('psb-enquiry-sent', '1'); } catch {}
      location.assign('/thank-you/');
    } catch (error) {
      status.textContent = error.name === 'TimeoutError'
        ? 'The request timed out. Please contact the firm before retrying to avoid a duplicate submission.'
        : error.name === 'TypeError'
          ? 'The email service could not be reached. Delivery has not been confirmed. Please email office@psbassociates.in or call +91 94228 68050.'
          : error.message;
      const fields = [
        ['Name', 'name'], ['Email', 'email'], ['Areas of interest', 'service'],
        ['Applying for', 'application_type'], ['Phone', 'phone'],
        ['Preferred office', 'preferred_location'], ['Qualification', 'qualification'],
        ['Experience', 'experience'], ['Resume / profile', 'profile_link'], ['Message', 'message'],
      ];
      const body = 'Online delivery was not confirmed. Please check for duplicates before processing.\r\n\r\n'
        + fields.filter(([, key]) => payload[key]).map(([label, key]) => `${label}: ${payload[key]}`).join('\r\n\r\n');
      const mailto = `mailto:office@psbassociates.in?subject=${encodeURIComponent(payload.subject)}&body=${encodeURIComponent(body)}`;
      const manualLink = document.createElement('a');
      manualLink.href = mailto;
      manualLink.textContent = 'Send manually by email';
      manualLink.className = 'manual-email-fallback';
      status.append(' Your email app will open with your completed details. Review the draft and press Send. If it does not open, use this link: ', manualLink);
      submit.disabled = false;
      // Opening a draft never sends it; keep the link for browsers that block app launches.
      try { location.assign(mailto); } catch {}
    }
  });
})();
