import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const clientPath = new URL('../dist/assets/contact.js', import.meta.url);

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
