// The same factual answers power visible page content and structured data.
export const serviceAnswers = {
 'audit-assurance': [
  ['Does PSB Associates provide audit services in Pune?', 'P S B & Associates LLP provides statutory audit, internal audit, tax audit, certification and assurance services. The firm has offices in Pune, Chhatrapati Sambhajinagar and Hingoli. Audit engagements are subject to applicable independence and professional requirements.'],
  ['What information should I share for an audit enquiry?', 'Share the entity type, financial year, nature of the business and the audit or certification required. The team can then discuss the scope and records needed. Please send only a brief overview through the enquiry form.'],
  ['Can PSB help prepare records for an audit?', 'The firm provides accounting and compliance support as well as assurance services. Whether these services can be combined depends on the engagement and applicable independence requirements.']
 ],
 'taxation': [
  ['Does PSB Associates offer income tax and GST services in Pune?', 'P S B & Associates LLP provides income tax planning and compliance, GST advisory and compliance reviews, transfer pricing and international taxation support. Its offices are in Kondhwa Budruk, Pune, Chhatrapati Sambhajinagar and Hingoli.'],
  ['Can PSB help with GST notices and tax representations?', 'The firm provides tax representations and litigation support, with a dedicated GST litigation practice covering scrutiny, notices, departmental audits, assessments and appeals. The scope depends on the notice and procedural stage.'],
  ['How do I start a tax or GST enquiry?', 'Contact office@psbassociates.in or use the contact form. Mention the entity type, tax period and assistance needed. The team will discuss the relevant records and engagement scope.']
 ],
 'corporate-advisory': [
  ['Does PSB Associates help with company formation and business setup?', 'P S B & Associates LLP supports company formation, business setup, corporate compliance and financial advisory for startups and established businesses. The firm has offices in Pune, Chhatrapati Sambhajinagar and Hingoli.'],
  ['Can PSB advise on LLP and partnership structuring?', 'The firm provides LLP and partnership formation, conversion, agreement and deed support, capital and remuneration structuring, and continuing compliance advisory through its dedicated LLP and partnership practice.'],
  ['What details are useful for a business setup enquiry?', 'Share the proposed business activity, intended ownership structure and location, and whether you are forming a new entity or changing an existing one. The team will discuss the structure and compliance requirements relevant to your circumstances.']
 ],
 'accounting-outsourcing': [
  ['Does PSB Associates provide outsourced accounting and virtual CFO services?', 'P S B & Associates LLP provides bookkeeping, ledger scrutiny, payroll support, MIS reporting and virtual CFO services. The firm serves businesses through offices in Pune, Chhatrapati Sambhajinagar and Hingoli.'],
  ['What does the accounting and virtual CFO practice cover?', 'The practice combines accounting records, management reporting, financial planning and process reviews according to the agreed scope. It also includes MIS design, data analytics and business process outsourcing support.'],
  ['How is an accounting engagement scoped?', 'Share your business activity, current accounting system, reporting needs and the support required. The firm agrees the deliverables, responsibilities and scope based on your circumstances.']
 ],
 'gst-litigation-dispute-resolution': [
  ['Can PSB Associates help with a GST notice in Pune?', 'P S B & Associates LLP supports replies to GST notices, including ASMT-10 and DRC-01, and representation in assessments, appeals and departmental audits. The firm has offices in Pune, Chhatrapati Sambhajinagar and Hingoli.'],
  ['Does PSB support input tax credit reconciliation for GST disputes?', 'The GST litigation practice reviews returns, books, e-invoices and supporting records, reconciles input tax credit differences and prepares documented submissions based on the facts and procedural stage.'],
  ['What should I mention when enquiring about a GST notice?', 'Mention the notice type, relevant tax period, issuing authority and response deadline. Use the contact form for a brief overview; the team will discuss how to share the notice and supporting records.']
 ],
 'ngo-public-trust-registrations': [
  ['Does PSB Associates support NGO and public trust registration?', 'P S B & Associates LLP provides formation, registration and continuing compliance advisory for charitable trusts, societies and nonprofit organisations, including Section 8 companies. The firm has offices in Pune, Chhatrapati Sambhajinagar and Hingoli.'],
  ['What nonprofit compliance services does PSB provide?', 'The firm supports income tax registration and approval applications, donor reporting, CSR-1 registration, annual accounts, audits and continuing compliance. FCRA advisory is available where applicable. Requirements depend on the organisation and its activities.'],
  ['How do I enquire about trust or NGO registration?', 'Share the entity type, objects, activities and whether the organisation is new or already registered. The team can discuss formation, applications and continuing compliance relevant to your organisation.']
 ],
 'llp-partnership-structuring': [
  ['Does PSB Associates help form LLPs and partnership firms in Pune?', 'P S B & Associates LLP provides formation and conversion advisory for LLPs and partnership firms, with offices in Pune, Chhatrapati Sambhajinagar and Hingoli.'],
  ['What does LLP and partnership structuring include?', 'The firm supports agreements and deeds, capital contributions, profit-sharing, partner remuneration, tax compliance and annual LLP ROC filings, including Forms 8 and 11. The scope is agreed around the entity and its partners.'],
  ['Can PSB support an existing LLP or partnership firm?', 'The firm provides amendment and continuing compliance advisory for existing LLPs and partnerships, including accounting, income tax returns and audit support where applicable. Contact the team with your entity type and the assistance needed.']
 ]
};

const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
export function serviceAnswerMarkup(slug) {
 const answers = serviceAnswers[slug] || [];
 if (!answers.length) return '';
 return `<section class="service-answers" aria-labelledby="service-answers-title"><h2 id="service-answers-title">Common questions.</h2>${answers.map(([question, answer]) => `<details><summary>${escape(question)}</summary><p>${escape(answer)}</p></details>`).join('')}<p class="service-office-note">Pune office: Office No. 229, Ultima Business Centre, near Shree Shantinagar Society, Kondhwa Budruk, Pune – 411048, Maharashtra. <a class="text-link" href="/contact/#office-pune">Office addresses and enquiries</a></p></section>`;
}

export function faqSchema(origin, route, answers) {
 return {'@type': 'FAQPage', '@id': origin + route + '#answers', mainEntity: answers.map(([question, answer]) => ({'@type': 'Question', name: question, acceptedAnswer: {'@type': 'Answer', text: answer}}))};
}
