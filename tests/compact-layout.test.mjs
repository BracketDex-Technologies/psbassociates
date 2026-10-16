import test from 'node:test';
import assert from 'node:assert/strict';
import { industrySection, scopeMarkup } from '../page-sections.mjs';
import { industries } from '../industries.mjs';
import { faqs, faqMarkup, seo } from '../seo.mjs';
import { contactPage } from '../contact-page.mjs';

test('contact introduction includes direct contact details beside the enquiry form', () => {
  const markup = contactPage({ offices: [{ city: 'Chhatrapati Sambhajinagar', type: 'Head office', address: 'Office No. 5 & 6, Mehra Chambers', phones: ['9422868050'], map: 'Mehra Chambers' }], practices: [] });
  assert.ok(markup.includes('class="contact-details"'));
  assert.ok(markup.includes('mailto:office@psbassociates.in'));
  assert.ok(markup.includes('Monday–Saturday'));
  assert.ok(markup.includes('https://wa.me/919422868050'));
  assert.ok(markup.indexOf('</form>') < markup.indexOf('class="contact-details"'), 'Phone reading order keeps the form before supporting details');
});

test('thirteen sectors fit twelve closed boxes with agriculture grouped under manufacturing', () => {
  assert.equal((industrySection.match(/class="sector-disclosure"/g) || []).length, 12);
  const grouped = industrySection.match(/<details class="sector-disclosure" data-sector-group="production">([\s\S]*?)<\/details>/)?.[1];
  assert.ok(grouped?.includes('<h3>Manufacturing & FMCG</h3>'));
  assert.ok(grouped?.includes('<h3>Agriculture & Agri-Tech</h3>'));
  assert.doesNotMatch(industrySection, /<details[^>]*\bopen\b/);
  for (const { name, description } of industries) {
    assert.ok(industrySection.includes(name));
    assert.ok(industrySection.includes(description));
  }
});

test('three FAQs show initially and additional answers remain accessible and in schema', () => {
  const [initial, additional] = faqMarkup.split('<details class="view-more faq-more">');
  assert.equal((initial.match(/<details>/g) || []).length, 3);
  assert.equal((additional.match(/<details>/g) || []).length, faqs.length - 3);
  const metadata = seo('https://psb.example', '/services/', 'Services', 'Services overview');
  for (const [question, answer] of faqs) {
    assert.ok(faqMarkup.includes(question));
    assert.ok(faqMarkup.includes(answer));
    assert.ok(metadata.includes(question));
  }
});

test('compact service scope retains all items behind View more', () => {
  const items = Array.from({ length: 7 }, (_, index) => 'Scope item ' + (index + 1));
  const markup = scopeMarkup(items);
  assert.equal((markup.split('<details')[0].match(/Scope item/g) || []).length, 4);
  for (const item of items) assert.ok(markup.includes(item));
  assert.ok(markup.includes('<span>07</span>'));
  assert.doesNotMatch(scopeMarkup(items.slice(0, 3)), /<details/);
});
