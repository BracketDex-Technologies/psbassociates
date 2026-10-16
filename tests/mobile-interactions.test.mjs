import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

// Exercise the shipped script, including its phone media queries and observers.
function phoneHarness({ reduced = false } = {}) {
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
  const document = { hidden: false, activeElement: null, body: {}, documentElement: { scrollHeight: 3000 },
    querySelector: selector => selector === '.floating-whatsapp' ? button : null,
    querySelectorAll: selector => selector === '[data-animated-stats]' ? [strip]
      : selector === '[data-updates]' ? [panel] : selector.startsWith('.contact-band,footer') ? [footer] : [],
    addEventListener: (name, callback) => events.set(name, callback), removeEventListener() {} };
  const matchMedia = query => ({ matches: query.includes('reduced-motion') ? (query.includes('no-preference') ? !reduced : reduced)
    : query.includes('max-width: 650px'), addEventListener() {} });
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
  return { button, attributes, number, tweens, loops, observers, queries, events, panel, strip, timelines, document };
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
