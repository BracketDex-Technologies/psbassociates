import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const clientPath = new URL('../dist/assets/contact.js', import.meta.url);

for (const failure of ['challenge', 'network', 'timeout', 'rejected']) test(`${failure} opens a manual email draft with the completed enquiry`, async () => {
  const source = await readFile(clientPath, 'utf8');
  const listeners = {};
  const submit = { disabled: true };
  const status = { textContent: '', append(text, link) { this.textContent += text; this.link = link; } };
  let destination = '';
  const form = { dataset: {}, querySelector: () => submit, reportValidity: () => true,
    addEventListener: (name, callback) => { listeners[name] = callback; } };
  vm.runInNewContext(source, {
    document: { createElement: () => ({}), querySelector: selector => selector === '#inquiry' ? form : selector === '#form-status' ? status : null },
    FormData: class { get(name) { return ({ name: 'Test & Person', email: 'test@example.com', message: 'Test enquiry\nTax & audit?', phone: '+91 12345', preferred_location: 'Pune', profile_link: 'https://example.com/resume?a=1&b=2' })[name] ?? null; } },
    fetch: async url => {
      if (url === '/api/contact') return { ok: true, json: async () => ({ enabled: true, accessKey: 'test-key' }) };
      if (failure === 'network') throw new TypeError('Failed to fetch');
      if (failure === 'timeout') { const error = new Error('Timeout'); error.name = 'TimeoutError'; throw error; }
      return { ok: false, status: 403, json: async () => {
        if (failure === 'challenge') throw new SyntaxError('Unexpected token <');
        return { success: false, message: 'Submission rejected' };
      } };
    },
    AbortSignal, location: { assign(url) { destination = url; } },
  });
  await new Promise(resolve => setImmediate(resolve));
  await listeners.submit({ preventDefault() {} });
  assert.match(destination, /^mailto:office@psbassociates\.in\?/);
  const draft = new URL(destination);
  assert.equal(draft.searchParams.get('subject'), 'PSB website enquiry: General inquiry');
  assert.match(draft.searchParams.get('body'), /Name: Test & Person/);
  assert.match(draft.searchParams.get('body'), /Tax & audit\?/);
  assert.match(draft.searchParams.get('body'), /Preferred office: Pune/);
  assert.match(draft.searchParams.get('body'), /resume\?a=1&b=2/);
  assert.doesNotMatch(destination, /test-key|access_key/);
  assert.equal(status.link.href, destination);
  assert.match(status.textContent, /Review the draft and press Send/);
  assert.equal(submit.disabled, false);
});

test('service validation is quiet initially and focuses the visible selector before sending', async () => {
  const source = await readFile(clientPath, 'utf8');
  const listeners = {};
  const submit = { disabled: true };
  const status = { textContent: '' };
  const error = { hidden: true };
  const placeholder = { textContent: '' };
  const summary = { innerHTML: '' };
  const service = { checked: false, required: true, value: 'Audit & Assurance', setCustomValidity() {}, addEventListener(event, listener) { this[event] = listener; } };
  const trigger = { focused: false, attrs: {}, addEventListener() {}, setAttribute(name, value) { this.attrs[name] = value; }, focus() { this.focused = true; } };
  const controls = {
    'button[type="submit"]': submit,
    '.contact-service-trigger': trigger,
    '.contact-service-menu': { hidden: true },
    '.contact-service-summary': summary,
    '[data-service-placeholder]': placeholder,
    '[data-service-error]': error,
  };
  const form = {
    dataset: {},
    querySelector: selector => controls[selector] || null,
    querySelectorAll: () => [service],
    reportValidity: () => true,
    addEventListener: (name, listener) => { listeners[name] = listener; },
  };
  const fetchCalls = [];
  vm.runInNewContext(source, {
    document: {
      querySelector: selector => selector === '#inquiry' ? form : selector === '#form-status' ? status : null,
      addEventListener() {},
    },
    FormData: class {
      get(name) { return ({ name: 'Test Person', email: 'test@example.com', message: 'Audit enquiry', consent: 'on', website: '' })[name] || null; }
      getAll(name) { return name === 'service' && service.checked ? [service.value] : []; }
    },
    fetch: async (url, options) => {
      fetchCalls.push({ url, options });
      return { ok: true, json: async () => url === '/api/contact' ? { enabled: true, accessKey: 'test-key' } : { success: true } };
    },
    AbortSignal,
    location: { assign() {} },
    sessionStorage: { setItem() {} },
  });
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(error.hidden, true, 'do not show an error before interaction');
  assert.equal(service.required, false, 'a hidden checkbox must not trap browser validation');
  await listeners.submit({ preventDefault() {} });
  assert.equal(fetchCalls.length, 1, 'missing service must not send the enquiry');
  assert.equal(error.hidden, false);
  assert.equal(trigger.focused, true);
  service.checked = true;
  service.change();
  assert.equal(error.hidden, true);
  controls['.contact-service-menu'].hidden = false;
  await listeners.keydown({ key: 'Escape', preventDefault() {} });
  assert.equal(controls['.contact-service-menu'].hidden, true);
  assert.equal(trigger.attrs['aria-expanded'], 'false');
  await listeners.submit({ preventDefault() {} });
  assert.equal(fetchCalls.length, 2);
  assert.equal(JSON.parse(fetchCalls[1].options.body).service, 'Audit & Assurance');
});

test('contact form submits directly to Web3Forms and opens no email application', async () => {
  const source = await readFile(clientPath, 'utf8');
  const listeners = {};
  const submit = { disabled: true };
  const status = { textContent: '' };
  const note = { textContent: '' };
  const form = {
    dataset: {},
    querySelector: () => submit,
    reportValidity: () => true,
    addEventListener: (event, listener) => { listeners[event] = listener; },
  };
  const values = new Map([
    ['name', 'Test Person'],
    ['email', 'test@example.com'],
    ['service', 'General inquiry'],
    ['message', 'Please call me.'],
    ['consent', 'on'],
    ['website', ''],
  ]);
  const fetchCalls = [];
  let destination = '';

  const context = {
    document: {
      querySelector(selector) {
        if (selector === '#inquiry') return form;
        if (selector === '#form-status') return status;
        if (selector === '[data-form-note]') return note;
        return null;
      },
    },
    FormData: class {
      get(name) { return values.get(name) ?? null; }
    },
    fetch: async (url, options = {}) => {
      fetchCalls.push({ url, options });
      if (url === '/api/contact') {
        return { ok: true, json: async () => ({ enabled: true, accessKey: 'web3forms-test-key' }) };
      }
      return { ok: true, json: async () => ({ success: true }) };
    },
    AbortSignal,
    location: { assign: value => { destination = value; } },
    sessionStorage: { setItem() {} },
    setTimeout,
    clearTimeout,
  };

  vm.runInNewContext(source, context);
  await new Promise(resolve => setImmediate(resolve));

  assert.equal(submit.disabled, false);
  await listeners.submit({ preventDefault() {} });

  assert.equal(fetchCalls[1].url, 'https://api.web3forms.com/submit');
  const payload = JSON.parse(fetchCalls[1].options.body);
  assert.deepEqual(
    {
      access_key: payload.access_key,
      name: payload.name,
      email: payload.email,
      service: payload.service,
      message: payload.message,
    },
    {
      access_key: 'web3forms-test-key',
      name: 'Test Person',
      email: 'test@example.com',
      service: 'General inquiry',
      message: 'Please call me.',
    },
  );
  assert.equal(destination, '/thank-you/');
});

test('career form emails the complete applicant profile with a clear subject', async () => {
  const source = await readFile(clientPath, 'utf8');
  const listeners = {};
  const submit = { disabled: true };
  const status = { textContent: '' };
  const note = { textContent: '' };
  const form = {
    dataset: { formSubjectPrefix: 'PSB career application' },
    querySelector: () => submit,
    reportValidity: () => true,
    addEventListener: (event, listener) => { listeners[event] = listener; },
  };
  const values = new Map([
    ['name', 'Applicant Name'],
    ['email', 'applicant@example.com'],
    ['phone', '+91 98765 43210'],
    ['application_type', 'CA Articleship'],
    ['preferred_location', 'Hingoli'],
    ['profile_link', 'https://example.com/resume'],
    ['message', 'Available from November.'],
    ['consent', 'on'],
    ['website', ''],
  ]);
  const fetchCalls = [];

  const context = {
    document: {
      querySelector(selector) {
        if (selector === '#inquiry') return form;
        if (selector === '#form-status') return status;
        if (selector === '[data-form-note]') return note;
        return null;
      },
    },
    FormData: class {
      get(name) { return values.get(name) ?? null; }
    },
    fetch: async (url, options = {}) => {
      fetchCalls.push({ url, options });
      if (url === '/api/contact') return { ok: true, json: async () => ({ enabled: true, accessKey: 'web3forms-test-key' }) };
      return { ok: true, json: async () => ({ success: true }) };
    },
    AbortSignal,
    location: { assign() {} },
    sessionStorage: { setItem() {} },
    setTimeout,
    clearTimeout,
  };

  vm.runInNewContext(source, context);
  await new Promise(resolve => setImmediate(resolve));
  await listeners.submit({ preventDefault() {} });

  const payload = JSON.parse(fetchCalls[1].options.body);
  assert.equal(payload.subject, 'PSB career application: CA Articleship');
  assert.equal(payload.replyto, 'applicant@example.com');
  assert.equal(payload.phone, '+91 98765 43210');
  assert.equal(payload.preferred_location, 'Hingoli');
  assert.equal(payload.profile_link, 'https://example.com/resume');
});
