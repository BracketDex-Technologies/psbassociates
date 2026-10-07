import test from 'node:test';
import assert from 'node:assert/strict';
import { handleContact } from '../lib/contact.mjs';

test('contact configuration enables Web3Forms with its public access key', async () => {
  const response = await handleContact(
    new Request('https://psb.example/api/contact'),
    { WEB3FORMS_ACCESS_KEY: 'web3forms-test-key' },
  );

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    enabled: true,
    accessKey: 'web3forms-test-key',
  });
});

test('contact configuration stays disabled without a Web3Forms access key', async () => {
  const response = await handleContact(
    new Request('https://psb.example/api/contact'),
    {},
  );

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { enabled: false, accessKey: '' });
});

test('contact endpoint rejects server-side submissions', async () => {
  const response = await handleContact(
    new Request('https://psb.example/api/contact', { method: 'POST' }),
    { WEB3FORMS_ACCESS_KEY: 'web3forms-test-key' },
  );

  assert.equal(response.status, 405);
  assert.equal(response.headers.get('allow'), 'GET');
});
