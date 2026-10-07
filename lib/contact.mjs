const reply = (status, data) =>
  Response.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });

export function contactConfig(env = {}) {
  const accessKey = String(env.WEB3FORMS_ACCESS_KEY || "").trim();
  return { enabled: Boolean(accessKey), accessKey };
}

export async function handleContact(request, env = {}) {
  if (request.method === "GET") return reply(200, contactConfig(env));

  return new Response("Method not allowed", {
    status: 405,
    headers: { Allow: "GET" },
  });
}
