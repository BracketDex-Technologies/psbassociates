import { serviceAnswers, faqSchema } from './service-answers.mjs';
import { industries } from './industries.mjs';
export const faqs=[
 ['What services does PSB Associates provide?','P S B & Associates LLP provides audit and assurance, income tax and GST compliance, corporate advisory, business setup, accounting outsourcing, payroll, MIS reporting and virtual CFO services.'],
 ['Does PSB Associates serve clients outside its office cities?','Yes. P S B & Associates LLP serves clients in India and abroad. Engagements are scoped around the client’s business, applicable requirements and professional obligations rather than a particular city.'],
 ['Where are PSB Associates offices located?','The firm has offices in Chhatrapati Sambhajinagar, Hingoli and Pune, Maharashtra. Office addresses and directions are available on the Contact page.'],
 ['Does PSB work with startups and companies?','Yes. The firm supports startups, Indian and multinational companies, financial institutions, individuals, NGOs and public trusts. Engagement scope is agreed according to each client’s requirements.'],
 ['Which industries does PSB Associates serve?',`P S B & Associates LLP serves the following sectors: ${industries.map(industry=>industry.name).join('; ')}. Services include accounting, taxation, audit and advisory, for businesses and organisations in India and abroad.`],
 ['How can I contact PSB Associates?','Email office@psbassociates.in or call +91 99224 12220. Office hours are Monday to Saturday, 10:30 AM to 7:30 PM IST.'],
 ['Where does the PSB Briefing get its updates?','The Briefing checks the official GST, Income Tax, ICAI and RBI announcement sources. Each item links to its official source and shows the publication date when available. Refresh checks all four sources immediately; unavailable sources retain clearly marked previously checked information.']
];
export const faqMarkup=`<section class="wrap faq-section"><span class="eyebrow">USEFUL ANSWERS</span><h2>About our practice.</h2>${faqs.map(([q,a])=>`<details><summary>${q}</summary><p>${a}</p></details>`).join('')}<a class="text-link" href="/contact/">Office addresses and contact details</a></section>`;
export function seo(origin,route,title,description){
 const verification=route==='/'?'<meta name="google-site-verification" content="Ubrs6quGv6rDhrCqP6ZlVnqqGe8q5ldt_Tpmxx4lxsM">':'';
 return verification+pageSeo(origin,route,title,description);
}
function pageSeo(origin,route,title,description){
 const name='P S B & Associates LLP';
 const searchTitles={
  '/':'PSB & Associates LLP | Chartered Accountants',
  '/about/':'About PSB Associates LLP | Chartered Accountants',
  '/contact/':'Contact PSB & Associates LLP | Chartered Accountants',
  '/services/':'Audit, GST, Tax & Accounting Services | PSB Associates LLP',
  '/services/audit-assurance/':'Audit & Assurance Services | PSB Associates LLP',
  '/services/taxation/':'Income Tax & GST Advisory | PSB Associates LLP',
  '/services/accounting-outsourcing/':'Accounting & Virtual CFO Services | PSB Associates LLP',
  '/services/corporate-advisory/':'Business Setup & Corporate Advisory | PSB Associates LLP',
  '/services/gst-litigation-dispute-resolution/':'GST Notices, Appeals & Dispute Resolution | PSB Associates',
  '/services/ngo-public-trust-registrations/':'NGO & Public Trust Registration Advisory | PSB Associates',
  '/services/llp-partnership-structuring/':'LLP & Partnership Formation Advisory | PSB Associates LLP'
 };
 const headline=searchTitles[route]||`${title} | ${name}`;
 const pageDescriptions={
  '/':'Audit, Tax, GST, Accounting & Business Advisory. Partner-led chartered accountancy practice since 2013.',
  '/services/audit-assurance/':'Audit and assurance services from PSB Associates LLP, Chartered Accountants serving businesses and institutions in India and abroad.',
  '/services/taxation/':'Income tax planning, GST compliance, international taxation and transfer pricing advisory from PSB Associates LLP, Chartered Accountants.',
  '/services/accounting-outsourcing/':'Bookkeeping, payroll, MIS reporting and virtual CFO services from PSB Associates LLP for startups, established businesses and corporate clients.',
  '/services/corporate-advisory/':'Company formation, business setup and corporate advisory from PSB Associates LLP for startups, established businesses and international clients.'
 };
 description=pageDescriptions[route]||description;
 const firm={'@type':'AccountingService','@id':origin+'/#firm',name,alternateName:'PSB Associates',url:origin+'/',logo:origin+'/assets/brand-icon.png',image:origin+'/assets/social-preview-square.png',description:'Chartered accountants providing audit, income tax, GST, accounting and corporate advisory services since 2013.',foundingDate:'2013',telephone:'+91-9922412220',email:'office@psbassociates.in',address:{'@type':'PostalAddress',streetAddress:'Office No. 5 & 6, next to CIDCO Bus Stand, Jalgaon Road, N-1, CIDCO',addressLocality:'Chhatrapati Sambhajinagar',addressRegion:'Maharashtra',addressCountry:'IN'},areaServed:'India and abroad',openingHoursSpecification:{'@type':'OpeningHoursSpecification',dayOfWeek:['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],opens:'10:30',closes:'19:30'},department:[{'@type':'AccountingService',name:name+' — Hingoli office',address:{'@type':'PostalAddress',streetAddress:'Shop No. 18 & 19, Municipal Shopping Complex, near Peoples Co-Op. Bank, Akola Road',addressLocality:'Hingoli',addressRegion:'Maharashtra',postalCode:'431513',addressCountry:'IN'},telephone:'+91-9403806446'},{'@type':'AccountingService',name:name+' — Pune office',address:{'@type':'PostalAddress',streetAddress:'Office No. 229, Ultima Business Centre, Near Shree Shantinagar Society, Kondhwa Budruk',addressLocality:'Pune',addressRegion:'Maharashtra',postalCode:'411048',addressCountry:'IN'}}]};
 firm.address.streetAddress='Office No. 5 & 6, Mehra Chambers, next to CIDCO Bus Stand, Jalgaon Road, N-1, CIDCO';
 firm.alternateName=['PSB Associates','PSB Associates LLP','P S B & Associates LLP'];
 firm.hasOfferCatalog={'@type':'OfferCatalog',name:'PSB Associates professional services',itemListElement:Object.keys(serviceAnswers).map(slug=>({'@type':'Offer',itemOffered:{'@type':'Service','@id':origin+'/services/'+slug+'/#service',url:origin+'/services/'+slug+'/',name:{'audit-assurance':'Audit & Assurance','taxation':'Direct & Indirect Taxation','corporate-advisory':'Corporate Advisory & Startups','accounting-outsourcing':'Accounting & Virtual CFO','gst-litigation-dispute-resolution':'GST Litigation & Dispute Resolution','ngo-public-trust-registrations':'NGO & Public Trust Registrations','llp-partnership-structuring':'LLP & Partnership Firm Structuring'}[slug]}}))};
 for(const office of firm.department){
  const city=office.address.addressLocality;
  office['@id']=origin+'/contact/#office-'+city.toLowerCase();
  office.url=origin+'/contact/#office-'+city.toLowerCase();
  office.parentOrganization={'@id':firm['@id']};
  office.openingHoursSpecification=firm.openingHoursSpecification;
  if(city==='Pune')office.hasMap='https://maps.app.goo.gl/kXgueiyf7dEYAdwx8?g_st=iw';
 }
 const graph=[firm,{'@type':'WebSite','@id':origin+'/#website',name,alternateName:'PSB Associates LLP',url:origin+'/',publisher:{'@id':firm['@id']}},{'@type':'WebPage','@id':origin+route+'#webpage',url:origin+route,name:headline,description,inLanguage:'en-IN',isPartOf:{'@id':origin+'/#website'},about:{'@id':firm['@id']}}];
 for(const offer of firm.hasOfferCatalog.itemListElement)offer.itemOffered.audience=industries.map(industry=>({'@type':'BusinessAudience',audienceType:industry.name}));
 const answers=route==='/'?faqs:serviceAnswers[route.split('/')[2]];
 if(answers?.length)graph.push(faqSchema(origin,route,answers));
 if(route!=='/')graph.push({'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Home',item:origin+'/'},{'@type':'ListItem',position:2,name:title,item:origin+route}]});
 if(route.startsWith('/services/')&&route!=='/services/')graph.push({'@type':'Service','@id':origin+route+'#service',name:firm.hasOfferCatalog.itemListElement.find(offer=>offer.itemOffered.url===origin+route)?.itemOffered.name||title,description,url:origin+route,provider:{'@id':firm['@id']},areaServed:'India and abroad'});
 return `<title>${headline}</title><meta name="description" content="${description}"><link rel="canonical" href="${origin}${route}"><meta name="robots" content="${['/thank-you/','/404.html'].includes(route)?'noindex, follow':'index, follow, max-image-preview:large'}"><meta property="og:site_name" content="${name}"><meta property="og:title" content="${headline}"><meta property="og:description" content="${description}"><meta property="og:type" content="website"><meta property="og:url" content="${origin}${route}"><meta property="og:image" content="${origin}/assets/social-preview-square.png"><meta property="og:image:secure_url" content="${origin}/assets/social-preview-square.png"><meta property="og:image:type" content="image/png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="1200"><meta property="og:image:alt" content="CA India logo and PSB &amp; Associates LLP — Chartered Accountants, square sharing artwork"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${headline}"><meta name="twitter:description" content="${description}"><meta name="twitter:image" content="${origin}/assets/social-preview-square.png"><link rel="apple-touch-icon" href="/assets/brand-icon.png"><script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@graph':graph}).replaceAll('<','\\u003c')}</script>`;
}
