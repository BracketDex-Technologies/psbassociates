import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { industries } from '../industries.mjs';
import { howWeWork, industrySection } from '../page-sections.mjs';

test('The Firm shows the full introduction and all three professional principles', () => {
  const about = fs.readFileSync('dist/about/index.html', 'utf8');
  const narrative = about.match(/<section class="about-narrative-section">([\s\S]*?)<\/section>/)?.[1];
  assert.ok(narrative, 'Full firm introduction must be present');
  assert.doesNotMatch(narrative, /<details|<summary/);
  assert.doesNotMatch(about, /View more about our practice/);
  assert.match(narrative, /The firm provides services to clients in India and abroad/);
  assert.match(narrative, /Our practice serves clients in India and abroad/);
  assert.match(narrative, /<div class="about-introduction">/);
  assert.match(narrative, /<div class="about-continuation"><p>The firm provides services/);
  for (const heading of ['Professional integrity', 'Partner-led attention', 'Time-bound execution']) {
    assert.ok(howWeWork.includes(`<h3>${heading}</h3>`));
  }
  for (const paragraph of howWeWork.matchAll(/<p>(.*?)<\/p>/g)) {
    assert.ok(about.includes(paragraph[0]), 'Every full principle description must be rendered');
  }
});

test('all thirteen requested industries retain their full descriptions', () => {
  assert.deepEqual(industries.map(industry => industry.name), [
    'Software & Information Technology', 'Engineering', 'Travel & Hospitality',
    'Education', 'Banking & Financial Services', 'NGOs & Public Trusts',
    'Hospital & Healthcare', 'Maritime & Transportation', 'Builders & Developers',
    'Manufacturing & FMCG', 'Retail, E-Commerce & D2C',
    'Startups & Emerging Enterprises', 'Agriculture & Agri-Tech',
  ]);
  const services = fs.readFileSync('dist/services/index.html', 'utf8');
  for (const { name, description } of industries) {
    assert.ok(industrySection.includes(name));
    assert.ok(services.includes(description), `${name} must retain its full description`);
  }
});

test('services FAQ uses a single shared-width container, not a double inset', () => {
  const services = fs.readFileSync('dist/services/index.html', 'utf8');
  assert.match(services, /<section class="faq-banner"><section class="wrap faq-section"/);
  assert.doesNotMatch(services, /<section class="faq-banner"><div class="wrap">/);
  const home = fs.readFileSync('dist/index.html', 'utf8');
  assert.match(home, /<section class="insight-section">/);
  assert.doesNotMatch(home, /class="wrap insight-section"/);
});

test('mobile footer has a compact notice while the Disclaimer page retains the full text', () => {
  const home = fs.readFileSync('dist/index.html', 'utf8');
  assert.match(home, /class="footer-notice-short">Firm information only\. This website is not intended to advertise or solicit professional work\./);
  assert.match(home, /class="footer-notice-full">As per the rules of the Institute/);
  const disclaimer = fs.readFileSync('dist/disclaimer/index.html', 'utf8');
  assert.match(disclaimer, /<p class="lead">As per the rules of the Institute of Chartered Accountants of India/);
});

test('Hingoli phone and WhatsApp use the updated number, including structured data', () => {
  const contact = fs.readFileSync('dist/contact/index.html', 'utf8');
  const hingoli = contact.match(/<article class="contact-office" id="office-hingoli">([\s\S]*?)<\/article>/)?.[1];
  assert.ok(hingoli);
  assert.match(hingoli, /href="tel:\+918390673946"/);
  assert.match(hingoli, /href="https:\/\/wa.me\/918390673946"/);
  assert.ok(contact.includes('"telephone":"+91-8390673946"'));
  assert.doesNotMatch(contact, /9403806446/);
});
