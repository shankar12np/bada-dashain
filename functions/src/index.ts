/**
 * Tika — Cloud Functions (2nd gen).
 *
 * Small and cheap on purpose; all image work happens in the browser.
 *   cardPage        GET /c/:id → index.html with per-card Open Graph tags
 *                   (WhatsApp/Facebook/Viber crawlers don't run JavaScript).
 *   onCardCreated   increments the parent's remixCount for "Make it mine".
 *   onReportCreated counts reports and auto-hides a card at a threshold.
 *
 * Requires the Blaze plan. Everything still works without functions — you
 * just lose rich link previews, remix counters and auto-moderation.
 */
import { initializeApp } from 'firebase-admin/app';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { setGlobalOptions } from 'firebase-functions/v2';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { onRequest } from 'firebase-functions/v2/https';
import { logger } from 'firebase-functions';

initializeApp();
const db = getFirestore();

// Keep costs predictable: small instances, scale to zero.
setGlobalOptions({ region: 'us-central1', maxInstances: 10, memory: '256MiB' });

/** Reports needed before a card is hidden pending review. */
const AUTO_HIDE_AT = 3;

// ─── cardPage ──────────────────────────────────────────────────────────────

let indexHtml: { html: string; at: number } | null = null;

async function getIndexHtml(origin: string): Promise<string> {
  // Cache the SPA shell for 10 minutes per instance.
  if (indexHtml && Date.now() - indexHtml.at < 10 * 60_000) return indexHtml.html;
  const res = await fetch(`${origin}/index.html`);
  const html = await res.text();
  indexHtml = { html, at: Date.now() };
  return html;
}

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

// invoker: 'public' — Facebook, X, WhatsApp etc. fetch the link without logging in.
export const cardPage = onRequest({ concurrency: 80, invoker: 'public' }, async (req, res) => {
  const host = req.get('x-forwarded-host') ?? req.hostname;
  // Calls straight to the function URL (not via Hosting) can't fetch the shell from themselves.
  const origin = host.endsWith('.cloudfunctions.net') || host.endsWith('.run.app')
    ? 'https://bada-dashain.web.app'
    : `https://${host}`;
  const id = (req.path.split('/')[2] ?? '').replace(/[^A-Za-z0-9]/g, '').slice(0, 40);
  let html: string;
  try {
    html = await getIndexHtml(origin);
  } catch (e) {
    logger.error('index fetch failed', e);
    res.redirect(302, '/');
    return;
  }

  try {
    const snap = id ? await db.doc(`cards/${id}`).get() : null;
    const card = snap?.exists ? snap.data()! : null;
    logger.info('cardPage', { id, found: !!card, status: card?.status, ua: req.get('user-agent') });
    const expired = card?.expireAt ? card.expireAt.toMillis() <= Date.now() : false;
    if (card && card.status === 'active' && !expired) {
      const title = esc(`${card.text.greeting} · Tika`);
      const desc = esc(card.text.subline ?? 'Make this Dashain card your own — टीका');
      const img = esc(card.ogUrl ?? card.imageUrl);
      const url = esc(`${origin}/c/${id}`);
      const tags = [
        `<title>${title}</title>`,
        `<meta name="description" content="${desc}">`,
        `<meta property="og:title" content="${title}">`,
        `<meta property="og:description" content="${desc}">`,
        `<meta property="og:image" content="${img}">`,
        `<meta property="og:image:width" content="1200">`,
        `<meta property="og:image:height" content="630">`,
        `<meta property="og:url" content="${url}">`,
        `<meta property="og:type" content="website">`,
        `<meta property="og:image:type" content="image/jpeg">`,
        `<meta name="twitter:card" content="summary_large_image">`,
        `<meta name="twitter:title" content="${title}">`,
        `<meta name="twitter:description" content="${desc}">`,
        `<meta name="twitter:image" content="${img}">`,
      ].join('\n    ');
      // Drop the default tags from the shell, then inject the card's own.
      html = html
        .replace(/<title>.*?<\/title>/s, '')
        .replace(/<meta (property="og:[^"]+"|name="(description|twitter:[^"]+)")[^>]*>\s*/g, '')
        .replace('</head>', `    ${tags}\n  </head>`);
    }
  } catch (e) {
    logger.warn('card lookup failed', { id, e });
  }

  html = html.replace(/content="\/og-default\.jpg"/g, `content="${origin}/og-default.jpg"`);

  // CDN-cache at the edge; cards are immutable so this is safe.
  res.set('Cache-Control', 'public, max-age=300, s-maxage=3600');
  res.status(200).send(html);
});

// ─── counters & moderation ─────────────────────────────────────────────────

export const onCardCreated = onDocumentCreated('cards/{cardId}', async (event) => {
  const parentId = event.data?.get('remixOf') as string | null | undefined;
  if (!parentId) return;
  await db
    .doc(`cards/${parentId}`)
    .update({ remixCount: FieldValue.increment(1) })
    .catch((e) => logger.warn('parent missing', { parentId, e }));
});

export const onReportCreated = onDocumentCreated('reports/{reportId}', async (event) => {
  const cardId = event.data?.get('cardId') as string | undefined;
  if (!cardId) return;
  const ref = db.doc(`cards/${cardId}`);
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) return;
    const count = (snap.get('reportCount') ?? 0) + 1;
    const update: Record<string, unknown> = { reportCount: count };
    if (count >= AUTO_HIDE_AT && snap.get('status') === 'active') {
      update['status'] = 'hidden';
      logger.info('card auto-hidden after reports', { cardId, count });
    }
    tx.update(ref, update);
  });
});
