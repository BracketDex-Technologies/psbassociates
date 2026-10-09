// Contact-page markup uses the same office and practice data as the rest of the site.
const escapeHtml = value => String(value)
  .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

const icon = name => `<span class="contact-icon contact-icon-${name}" aria-hidden="true"></span>`;
const phoneLinks = phones => phones.map(number => `<a href="tel:+91${number}">+91 ${number}</a>`).join('');

export function contactPage({ offices, practices }) {
  const services = [...practices.map(practice => practice.name), 'General inquiry'];

  return `
    <section class="contact-hero" aria-labelledby="contact-title">
      <div class="wrap contact-hero-inner">
        <div class="contact-introduction">
          <span class="eyebrow contact-eyebrow">Contact &amp; offices</span>
          <h1 id="contact-title">A conversation <br>starts with <br>understanding.</h1>
          <p class="contact-lead">Tell us what you need help with and our team will get back to you from our Chhatrapati Sambhajinagar or Hingoli office.</p>

          <ul class="contact-details">
            <li>
              <span class="contact-icon-badge">${icon('mail')}</span>
              <div><span class="contact-detail-label">Write to us at</span><a class="contact-email" href="mailto:office@psbassociates.in">office@psbassociates.in</a></div>
            </li>
            <li>
              <span class="contact-icon-badge">${icon('clock')}</span>
              <div><span class="contact-detail-label">Our working hours</span><p class="contact-detail-value">Monday–Saturday</p><p class="contact-hours">10:30 AM–7:30 PM IST</p></div>
            </li>
            <li>
              <span class="contact-icon-badge">${icon('phone')}</span>
              <div><span class="contact-detail-label">Prefer to call?</span><p class="contact-office-label">Head office</p><div class="contact-phone-links">${phoneLinks(offices[0].phones)}</div></div>
            </li>
          </ul>
        </div>

        <form id="inquiry" class="contact-form" aria-labelledby="inquiry-title" aria-describedby="contact-delivery-note">
          <div class="contact-form-heading">
            <h2 id="inquiry-title">Share the context.</h2>
            <p>Tell us what you need help with.</p>
          </div>
          <label class="form-honeypot" aria-hidden="true">Leave this field empty<input name="website" tabindex="-1" autocomplete="off"></label>
          <div class="contact-field-row">
            <label for="inquiry-name">Your name<input id="inquiry-name" name="name" autocomplete="name" required maxlength="120" placeholder="e.g. Amit Sharma"></label>
            <label for="inquiry-email">Email address<input id="inquiry-email" type="email" name="email" autocomplete="email" required maxlength="200" placeholder="e.g. amit@company.com"></label>
          </div>
          <fieldset class="contact-services">
            <legend>Area of interest</legend>
            <p class="contact-field-hint">Select all that apply.</p>
            <div class="contact-service-dropdown">
              <button type="button" class="contact-service-trigger" aria-expanded="false" aria-controls="contact-service-menu">
                <span data-service-placeholder>Select one or more areas</span><span class="contact-service-chevron" aria-hidden="true">⌄</span>
              </button>
              <div id="contact-service-menu" class="contact-service-menu" hidden>
                <button type="button" class="contact-service-menu-back" data-service-back><span aria-hidden="true">←</span> Back</button>
                ${services.map((service, index) => `<label class="contact-service-option"><input type="checkbox" name="service" value="${escapeHtml(service)}"${index === 0 ? ' required' : ''}><span>${escapeHtml(service)}</span></label>`).join('\n')}
              </div>
            </div>
            <div class="contact-service-summary" aria-live="polite" aria-label="Selected areas of interest"></div>
            <p class="contact-field-error" data-service-error role="alert" hidden>Please select at least one area of interest.</p>
          </fieldset>
          <label class="contact-message" for="inquiry-message">How can we help?<textarea id="inquiry-message" name="message" rows="4" required maxlength="3000" placeholder="A short overview of your requirements" aria-describedby="contact-privacy-note"></textarea></label>
          <label class="contact-consent"><input type="checkbox" name="consent" required><span>I have read the <a href="/disclaimer/">professional disclaimer</a> and <a href="/privacy/">privacy notice</a>.</span></label>
          <button type="submit" class="contact-submit" disabled>Send enquiry</button>
          <p id="contact-delivery-note" class="contact-form-note" data-form-note>Your enquiry is sent securely and directly to our team.</p>
          <p id="contact-privacy-note" class="contact-form-note">Please avoid confidential documents or sensitive financial information.</p>
          <p id="form-status" role="status" aria-live="polite"></p>
        </form>
      </div>
    </section>

    <section class="wrap contact-offices" aria-labelledby="offices-title">
      <div class="contact-offices-heading">
        <span class="eyebrow contact-eyebrow">Our offices</span>
        <h2 id="offices-title">Visit our offices.</h2>
        <p>We are available at the following locations.</p>
      </div>
      <div class="contact-office-grid">
        ${offices.map(office => `<article class="contact-office">
          <span class="eyebrow">${office.type}</span>
          <h3>${escapeHtml(office.city)}</h3>
          <div class="contact-address">${icon('map-pin')}<address>${office.address}</address></div>
          <div class="contact-office-phones">${icon('phone')}<div class="contact-phone-links">${phoneLinks(office.phones)}</div></div>
          <a class="contact-directions" href="https://www.google.com/maps/search/?api=1&amp;query=${encodeURIComponent(office.map)}">View directions${icon('arrow-right')}<span class="sr-only"> to the ${escapeHtml(office.city)} office</span></a>
          <iframe title="Map of ${escapeHtml(office.city)} office area" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://maps.google.com/maps?q=${encodeURIComponent(office.map)}&amp;output=embed"></iframe>
        </article>`).join('\n')}
      </div>
    </section>`;
}
