import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

// Exercise the shipped script, including its phone media queries and observers.
function phoneHarness({ reduced = false, withCarousel = false, copyText = null, copyInDetails = false } = {}) {
  const events = new Map(), observers = [], tweens = [], loops = [], queries = [], timelines = [];
  const classes = () => ({ add() {}, remove() {}, toggle() {} });
  const node = () => ({ classList: classes(), contains: () => false, querySelector: () => null });
  const number = { dataset: { count: '13', suffix: '+' }, textContent: '13+' };
  const strip = { ...node(), querySelectorAll: () => [number] };
  const sweep = node();
  const panel = { ...node(), querySelector: selector => selector === '.radar-sweep' ? sweep : null };
  const attributes = new Set();
  const button = { ...node(), inert: false, style: { setProperty() {} },
    getBoundingClientRect: () => ({ left: 328, right: 376, top: 780, bottom: 828 }),
    toggleAttribute: (name, present) => present ? attributes.add(name) : attributes.delete(name) };
  const footer = { getBoundingClientRect: () => ({ left: 0, right: 390, top: 600, bottom: 844, width: 390, height: 244 }) };
  const railEvents = {}, previous = { addEventListener: (name, callback) => { previous[name] = callback; } };
  const next = { addEventListener: (name, callback) => { next[name] = callback; } }, position = {};
  const controls = { querySelector: selector => selector.includes('"-1"') ? previous : selector.includes('"1"') ? next : position };
  const carousel = { scrollLeft: 0, clientWidth: 335, scrollWidth: 872, nextElementSibling: controls,
    querySelectorAll: () => [0, 296, 592].map(offsetLeft => ({ offsetLeft })),
    setAttribute() {}, removeAttribute() {},
    addEventListener: (name, callback) => { railEvents[name] = callback; },
    scrollTo(options) { this.lastScroll = options; this.scrollLeft = Math.max(0, Math.min(537, options.left)); railEvents.scroll(); } };
  const copyParagraph = { textContent: copyText, children: [], closest: () => copyInDetails ? {} : null,
    replaceChildren(...nodes) { this.nodes = nodes; } };
  const makeElement = () => ({ attributes: {}, hidden: false,
    setAttribute(name, value) { this.attributes[name] = value; },
    addEventListener(name, callback) { this[name] = callback; } });
  const document = { hidden: false, activeElement: null, body: {}, documentElement: { scrollHeight: 3000 },
    querySelector: selector => selector === '.floating-whatsapp' ? button : null,
    querySelectorAll: selector => selector === '[data-animated-stats]' ? [strip]
      : selector === '[data-updates]' ? [panel] : selector.startsWith('.about-introduction>p') && copyText ? [copyParagraph]
      : selector === '[data-people-rail]' && withCarousel ? [carousel]
      : selector.startsWith('.contact-band,footer') ? [footer] : [],
    createElement: makeElement, createTextNode: textContent => ({ textContent }),
    addEventListener: (name, callback) => events.set(name, callback), removeEventListener() {} };
  let phone = true;
  const phoneListeners = [];
  const matchMedia = query => ({ get matches() { return query.includes('reduced-motion') ? (query.includes('no-preference') ? !reduced : reduced)
    : query.includes('max-width: 650px') && phone; }, addEventListener(name, callback) { if(query.includes('max-width: 650px'))phoneListeners.push(callback); } });
  const timeline = () => {
    const value = { fromTo(target, from, to) { tweens.push({ target, from, to }); return this; },
      restart() { this.replays = (this.replays || 0) + 1; }, progress() { return this; }, pause() {} };
    timelines.push(value); return value;
  };
  const gsap = { timeline, matchMedia: () => ({ add(conditions, callback) {
    queries.push(conditions);
    callback({ conditions: { phone: true, motion: !reduced } });
  } }), to(target, options) {
    const loop = { target, options, restart() { this.playing = true; }, pause() { this.playing = false; }, resume() { this.playing = true; } };
    loops.push(loop); return loop;
  } };
  class Observer {
    constructor(callback) { this.callback = callback; this.targets = []; observers.push(this); }
    observe(target) { this.targets.push(target); }
    disconnect() {}
  }
  const window = { matchMedia, gsap, IntersectionObserver: Observer, innerHeight: 844, scrollY: 0, addEventListener() {} };
  vm.runInNewContext(fs.readFileSync('dist/assets/site.js', 'utf8'), { document, window, IntersectionObserver: Observer,
    requestAnimationFrame: callback => callback(), location: { hash: '' } });
  return { button, attributes, number, tweens, loops, observers, queries, events, panel, strip, timelines, document, carousel, previous, next, position, railEvents, copyParagraph,
    setPhone(value) { phone = value; phoneListeners.forEach(callback => callback()); } };
}

test('phone counters and radar are animated and replay on viewport re-entry', () => {
  const state = phoneHarness();
  assert.ok(state.tweens.some(tween => tween.to.value === 13), 'Phone stats must count up, not only fade');
  assert.equal(state.loops.length, 1, 'Phone radar must have a sweep animation');
  const observer = state.observers[0];
  for (const isIntersecting of [true, false, true]) observer.callback([{ target: state.panel, isIntersecting }, { target: state.strip, isIntersecting }]);
  assert.equal(state.loops[0].playing, true);
  assert.equal(state.timelines[0].replays, 2, 'Counter restarts after scrolling away and back');
  state.document.hidden = true;
  state.events.get('visibilitychange')();
  assert.equal(state.loops[0].playing, false, 'Radar pauses in a background tab');
  state.document.hidden = false;
  state.events.get('visibilitychange')();
  assert.equal(state.loops[0].playing, true);
});

test('phone WhatsApp remains interactive when the footer enters view', () => {
  const { button, attributes } = phoneHarness();
  assert.equal(attributes.has('data-obscured'), false, 'Phone contact action must not disappear over the footer');
  assert.equal(button.inert, false, 'Phone contact action must remain tappable');
});

test('motion setup responds to phone breakpoint changes and honours reduced motion', () => {
  const state = phoneHarness();
  assert.ok(state.queries.some(query => typeof query === 'object' && Object.values(query).some(value => value.includes('max-width: 650px'))));
  const reduced = phoneHarness({ reduced: true });
  assert.equal(reduced.tweens.length, 0);
  assert.equal(reduced.loops.length, 0);
  assert.equal(reduced.button.inert, false);
});

test('phone partner carousel moves through all cards and supports keyboard navigation', () => {
  const { carousel, previous, next, position, railEvents } = phoneHarness({ withCarousel: true });
  assert.equal(previous.disabled, true);
  next.click();
  assert.equal(position.textContent, '2 / 3');
  assert.equal(carousel.lastScroll.behavior, 'smooth');
  next.click();
  assert.equal(position.textContent, '3 / 3');
  assert.equal(next.disabled, true);
  previous.click();
  assert.equal(position.textContent, '2 / 3');
  let prevented = false;
  railEvents.keydown({ target: carousel, key: 'ArrowLeft', preventDefault() { prevented = true; } });
  assert.equal(position.textContent, '1 / 3');
  assert.equal(previous.disabled, true);
  assert.equal(prevented, true);
});

test('partner carousel honours reduced-motion preferences', () => {
  const { carousel, next } = phoneHarness({ reduced: true, withCarousel: true });
  next.click();
  assert.equal(carousel.lastScroll.behavior, 'instant');
});

test('long mobile copy expands, collapses and remains fully visible on desktop', () => {
  const original = 'Our partners provide careful professional guidance and clear communication for clients. '.repeat(8);
  const state = phoneHarness({ copyText: original });
  const [preview, ellipsis, remainder, button] = state.copyParagraph.nodes;
  assert.equal(preview.textContent + remainder.textContent, original);
  assert.ok(preview.textContent.length <= 180);
  assert.equal(remainder.hidden, true);
  assert.equal(button.textContent, 'View more');
  assert.equal(button.attributes['aria-expanded'], 'false');
  assert.equal(button.attributes['aria-controls'], remainder.id);
  button.click();
  assert.equal(remainder.hidden, false);
  assert.equal(ellipsis.hidden, true);
  assert.equal(button.textContent, 'View less');
  button.click();
  assert.equal(remainder.hidden, true);
  state.setPhone(false);
  assert.equal(remainder.hidden, false);
  assert.equal(button.hidden, true);
  state.setPhone(true);
  assert.equal(remainder.hidden, true);
});

test('short copy and native disclosures do not receive duplicate controls', () => {
  assert.equal(phoneHarness({ copyText: 'A short description.' }).copyParagraph.nodes, undefined);
  assert.equal(phoneHarness({ copyText: 'Long description. '.repeat(30), copyInDetails: true }).copyParagraph.nodes, undefined);
});
