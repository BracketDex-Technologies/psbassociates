export const insights = [
  {
    slug: 'gst-reconciliation-review', category: 'GST & COMPLIANCE',
    title: 'GST reconciliation: turn differences into a clear action list',
    description: 'A practical approach to comparing purchase records with GSTR-2B, investigating differences and documenting follow-up before filing.',
    service: 'taxation', serviceLabel: 'Taxation services',
    sections: [
      ['Start with the same period and records', 'A reconciliation is useful when it explains differences, rather than simply producing a matching percentage. Keep the purchase register, relevant GSTR-2B download and supporting invoices together. Identify the period covered by each file and preserve the original exports before making adjustments.'],
      ['Compare at invoice level', 'Review supplier GSTIN, invoice number, invoice date, taxable value and tax amounts. Check credit notes and amendments separately. Small formatting differences can create apparent mismatches, so standardise the comparison fields without changing the underlying source records.'],
      ['Give each difference a reason and an owner', 'Group exceptions into missing records, value differences, duplicate entries, credit notes and items requiring supplier clarification. Assign an owner and record the next action. A difference caused by timing needs a different follow-up from an invoice entered twice.'],
      ['Review credit eligibility separately', 'Matching an invoice does not settle every question about input tax credit. The GST portal recommends reconciling GSTR-2B with the taxpayer’s records and avoiding duplicate credit. Review eligibility and the applicable conditions separately before deciding how a transaction should be treated in the return.'],
      ['Keep the review trail', 'Retain the exception list, supporting documents, supplier correspondence and reviewer notes alongside the final reconciliation. Carry unresolved items into the next review rather than silently dropping them. This makes later queries easier to explain.'],
    ],
    source: ['GST portal: GSTR-2B FAQs', 'https://tutorial.gst.gov.in/userguide/returns/FAQ_gstr2b.htm'],
  },
  {
    slug: 'audit-preparation-checklist', category: 'AUDIT & ASSURANCE',
    title: 'Audit preparation: organise the evidence before the questions arrive',
    description: 'How finance teams can prepare reconciliations, supporting schedules and an organised document trail for an audit.',
    service: 'audit-assurance', serviceLabel: 'Audit and assurance services',
    sections: [
      ['Agree the scope and document request first', 'Ask the audit team for its initial information requirements, reporting period and preferred document format. Nominate a coordinator within the business. A shared request list helps distinguish documents already supplied from items that are still being prepared.'],
      ['Prepare a consistent financial starting point', 'Provide the trial balance, general ledger and draft financial statements from the same version of the accounts. Explain subsequent adjustments and keep a record of who approved them. Multiple unexplained versions make it harder to connect a supporting schedule to the reported balance.'],
      ['Reconcile balances and explain old items', 'Prepare bank reconciliations and supporting schedules for receivables, payables, fixed assets and other significant balances. Explain long-outstanding differences rather than leaving them as unexplained carry-forwards. Keep the supporting calculations available for review.'],
      ['Connect documents to the transaction', 'Organise invoices, agreements, approvals and other records using a consistent naming convention. A useful file reference connects the document to its ledger entry or schedule. Access should be controlled, particularly for payroll and commercially sensitive material.'],
      ['Track questions through to resolution', 'Use a query log with an owner, response date and evidence reference. If an answer changes an earlier schedule, update the version and explain the change. This is a preparation workflow for the business; it does not replace the auditor’s procedures or determine the audit opinion.'],
    ],
    source: ['ICAI: implementation guides for auditing standards', 'https://www.icai.org/post/aasb-implementation-guide'],
  },
  {
    slug: 'monthly-accounting-review', category: 'ACCOUNTING & REPORTING',
    title: 'Beyond the profit figure: a more useful monthly accounts review',
    description: 'A practical reporting routine that brings together cash movements, outstanding balances and explanations of changes in the accounts.',
    service: 'accounting-outsourcing', serviceLabel: 'Accounting and Virtual CFO services',
    sections: [
      ['Make the reporting period clear', 'A monthly report is easier to use when readers know what is included. Record the closing date, material estimates and outstanding entries. Use consistent classifications between periods so that changes in presentation are not confused with changes in business performance.'],
      ['Read profit alongside cash movements', 'Reported profit and the bank balance answer different questions. Review collections, payments and the timing of outstanding amounts alongside the income statement. Identify unusual movements and trace them to supporting records before drawing conclusions.'],
      ['Give outstanding balances context', 'An ageing report is more useful with comments on disputed invoices, expected collection dates and agreed payment terms. Ask the relevant team to explain older items. Keep those explanations separate from assumptions that have not yet been confirmed.'],
      ['Explain the movements that matter', 'Compare significant income and expense categories with the previous period and the business’s own budget, where available. Explain changes using operational information such as volumes, timing or one-off transactions. A short, supported explanation is more useful than a long list of unexplained percentages.'],
      ['Finish with a short action log', 'Record the follow-up, responsible person and target date for each unresolved issue. Review the previous month’s actions before adding new ones. This keeps accounting reports connected to the records and conversations needed to maintain reliable information.'],
    ],
  },
];

export function insightCards() {
  return `<section class="wrap insight-section"><div class="section-head"><div><span class="eyebrow">PRACTICAL INSIGHTS</span><h2>Understand the detail.<br>See the next step.</h2></div><p>Practical reading for business owners and finance teams.</p></div><div class="insight-grid">${insights.map(article => `<a class="insight-card" href="/resources/${article.slug}/"><span class="eyebrow">${article.category}</span><h3>${article.title}</h3><p>${article.description}</p><span class="card-link">Read insight <span aria-hidden="true">↗</span></span></a>`).join('')}</div></section>`;
}
