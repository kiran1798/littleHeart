const NOTIFY_TO = "karatekalyan92@gmail.com";

export async function onRequestPost(context) {
  const { request, env } = context;

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return new Response("Bad request", { status: 400 });
  }

  const score = Number(body.score) || 0;
  const total = Number(body.total) || 0;
  const rounds = Array.isArray(body.rounds) ? body.rounds : [];

  const lines = rounds
    .map((r) => `${r.correct ? "correct  " : "missed   "} ${r.movie}`)
    .join("\n");

  const text = `Someone just finished Mass Entry.\n\nScore: ${score} / ${total}\n\n${lines}`;

  if (!env.RESEND_API_KEY) {
    return new Response("Email not configured", { status: 500 });
  }

  const resp = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Mass Entry <onboarding@resend.dev>",
      to: [NOTIFY_TO],
      subject: `Mass Entry result: ${score}/${total}`,
      text,
    }),
  });

  if (!resp.ok) {
    return new Response("Email send failed", { status: 502 });
  }

  return new Response("OK", { status: 200 });
}
