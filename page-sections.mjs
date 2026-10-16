import { industries } from './industries.mjs';

export const howWeWork = `<section class="firm-principles" aria-labelledby="principles-title"><span class="eyebrow">HOW WE WORK</span><h2 id="principles-title">Careful work. Clear communication.</h2><div class="three-col"><article><h3>Professional integrity</h3><p>We uphold strict independence, client confidentiality, and unwavering ethical standards across every audit, compliance, and advisory mandate.</p></article><article><h3>Partner-led attention</h3><p>Our experienced partners actively direct team workflows and remain personally accessible for strategic decisions and critical representations.</p></article><article><h3>Time-bound execution</h3><p>Disciplined project schedules, milestone reviews, and transparent communication ensure all statutory deadlines and client deliverables are met punctually.</p></article></div></section>`;

const industryCard = ({name, description}) => `<details class="sector-disclosure"><summary>${name}</summary><p>${description}</p></details>`;
export const industrySection = `<section class="wrap merged-industries" id="industries" aria-labelledby="industries-title"><div class="section-head"><div><span class="eyebrow">INDUSTRIES WE SERVE</span><h2 id="industries-title">Expertise in your sector.</h2></div><p>Select a sector to view our support.</p></div><div class="industry-grid">${industries.map(industryCard).join('')}</div></section>`;

export const legacyRoutes = {'/industries/':'/services/#industries','/resources/':'/#home-briefing'};

export function scopeMarkup(items){
 const rows=(list,offset=0)=>`<div class="service-list">${list.map((item,index)=>`<div><span>${String(index+offset+1).padStart(2,'0')}</span>${item}</div>`).join('')}</div>`;
 return rows(items.slice(0,4))+(items.length>4?`<details class="view-more"><summary><span class="when-closed">View more services</span><span class="when-open">View fewer services</span></summary>${rows(items.slice(4),4)}</details>`:'');
}
