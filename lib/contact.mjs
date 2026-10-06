const reply = (status, data) =>
  Response.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
const defaultContactTo = "bracketdevs.teams@gmail.com";
const rateWindowMs = 15 * 60 * 1000;
const rateLimitMax = 5;
const attempts = new Map();
function rateLimit(request) {
  const now = Date.now();
  for (const [key, entry] of attempts)
    if (entry.resetAt <= now) attempts.delete(key);
  const forwarded = request.headers
    .get("x-forwarded-for")
    ?.split(",")[0]
    ?.trim();
  const key =
    forwarded || request.headers.get("cf-connecting-ip") || "anonymous";
  const entry = attempts.get(key);
  if (entry && entry.count >= rateLimitMax)
    return Math.ceil((entry.resetAt - now) / 1000);
  attempts.set(key, {
    count: (entry?.count || 0) + 1,
    resetAt: entry?.resetAt > now ? entry.resetAt : now + rateWindowMs,
  });
  return 0;
}
export function contactConfig(env) {
  return {
    enabled: !!(
      env.TURNSTILE_SITE_KEY &&
      env.TURNSTILE_SECRET_KEY &&
      env.RESEND_API_KEY &&
      env.CONTACT_FROM
    ),
    siteKey: env.TURNSTILE_SITE_KEY || "",
    contactTo: env.CONTACT_TO || defaultContactTo,
  };
}
export async function handleContact(request, env = {}, fetcher = fetch) {
  const config = contactConfig(env);
  if (request.method === "GET")
    return reply(200, {
      enabled: config.enabled,
      siteKey: config.enabled ? config.siteKey : "",
    });
  if (request.method !== "POST")
    return new Response("Method not allowed", {
      status: 405,
      headers: { Allow: "GET, POST" },
    });
  if (!config.enabled)
    return reply(503, {
      error:
        "Online submission is not available yet. Please email office@psbassociates.in.",
    });
  const retryAfter = rateLimit(request);
  if (retryAfter)
    return new Response(
      JSON.stringify({ error: "Too many attempts. Please try again later." }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
          "Retry-After": String(retryAfter),
          "X-Content-Type-Options": "nosniff",
        },
      },
    );
  const expected = new URL(env.SITE_URL || "https://psbassociates.vercel.app");
  if (request.headers.get("origin") !== expected.origin)
    return reply(403, { error: "Please submit from the contact page." });
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    return reply(415, { error: "Unsupported request format." });
  let input;
  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).length > 16000)
      return reply(413, { error: "Your message is too long." });
    input = JSON.parse(raw);
  } catch {
    return reply(400, { error: "Invalid form data." });
  }
  if (!input || typeof input !== "object" || Array.isArray(input))
    return reply(400, { error: "Invalid form data." });
  const fields = ["name", "email", "service", "message", "token"];
  if (fields.some((key) => typeof input[key] !== "string"))
    return reply(400, { error: "Please complete all required fields." });
  const { name, email, service, message, token } = Object.fromEntries(
    fields.map((key) => [key, input[key].trim()]),
  );
  const services = [
    "Audit & Assurance",
    "Direct & Indirect Taxation",
    "Corporate Advisory & Startups",
    "Accounting & Virtual CFO",
    "General inquiry",
  ];
  if (
    input.website ||
    input.consent !== true ||
    !name ||
    name.length > 120 ||
    /[\r\n]/.test(name) ||
    email.length > 200 ||
    !/^\S+@[^\s@]+\.[^\s@]+$/.test(email) ||
    !services.includes(service) ||
    !message ||
    message.length > 3000 ||
    !token ||
    token.length > 2048
  )
    return reply(400, {
      error:
        "Please check your details and complete the security verification.",
    });
  try {
    const verification = await fetcher(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          secret: env.TURNSTILE_SECRET_KEY,
          response: token,
        }),
        signal: AbortSignal.timeout(8000),
      },
    );
    if (!verification.ok)
      return reply(503, {
        error: "Security verification is unavailable. Please try again.",
      });
    const result = await verification.json();
    if (
      !result.success ||
      result.hostname !== expected.hostname ||
      result.action !== "contact"
    )
      return reply(400, {
        error: "Security verification expired or failed. Please try again.",
      });
    const delivery = await fetcher("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + env.RESEND_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: env.CONTACT_FROM,
        to: [config.contactTo],
        reply_to: email,
        subject: "PSB website enquiry: " + service,
        text: `Name: ${name}\nEmail: ${email}\nService: ${service}\n\n${message}`,
      }),
      signal: AbortSignal.timeout(10000),
    });
    if (!delivery.ok)
      return reply(502, {
        error:
          "Your enquiry could not be sent. Please try again or email the firm.",
      });
    const sent = await delivery.json();
    if (!sent.id)
      return reply(502, {
        error: "Submission could not be confirmed. Please contact the firm.",
      });
    return reply(200, { ok: true });
  } catch {
    return reply(503, {
      error:
        "Submission is temporarily unavailable. Please try again or email the firm.",
    });
  }
}
