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

test('phone services sections avoid stacked desktop whitespace', () => {
  const css = fs.readFileSync('dist/assets/refinements.css', 'utf8');
  const compactSpacing = css.match(/@media\(max-width:650px\)\{\s*\.page-services \.services-index-section\{padding-bottom:0\}[\s\S]*?\n\}/)?.[0];
  assert.ok(compactSpacing, 'Spacing changes must be restricted to phones');
  assert.match(compactSpacing, /\.page-services \.service-index\{padding-bottom:0\}/);
  assert.match(compactSpacing, /\.page-services \.industries-section\{padding:24px 0\}/);
  assert.match(compactSpacing, /\.page-services \.faq-banner\{padding:0 0 24px\}/);
});

test('shared phone spacing covers narrative, profile, form and detail page layouts', () => {
  const css = fs.readFileSync('dist/assets/refinements.css', 'utf8');
  const phoneRules = css.slice(css.indexOf('/* Phone section rhythm:'));
  assert.match(phoneRules, /@media\(max-width:650px\)/);
  assert.match(phoneRules, /--phone-section-space:24px/);
  for (const selector of ['.about-narrative-section', '.principles-section', '.detail-page-section', '.partners-overview-section', '.contact-offices-section', '.partner-profile-banner .partner-profile', '.contact-hero-inner', '.legal', '.insight-article', '.home-briefing']) {
    assert.ok(phoneRules.includes(selector), `${selector} must use the shared phone rhythm`);
  }
  assert.match(phoneRules, /padding-top:0;padding-bottom:0/);
  assert.match(phoneRules, /\.contact-band\{padding:var\(--phone-section-space\) 0;margin:0\}/);
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
