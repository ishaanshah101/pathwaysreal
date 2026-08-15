import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { screenContent, classifyRisk, logModerationEvent, excerptOf, MODERATION_BLOCK_REASON } from '../../shared/moderation.ts';
import { consumeRateLimit } from '../../shared/rateLimit.ts';
import { validateAttachments, screenAttachments, screenImage, IMAGE_BLOCK_REASON } from '../../shared/attachments.ts';

const CATEGORIES = [
  'applications', 'essays', 'scholarships', 'majors',
  'campus_life', 'internships', 'careers', 'test_prep',
];

// The ONLY writer of Post rows, so the feed gets the same safety screening as
// messaging and the author can never be forged.
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user?.email) return Response.json({ error: 'Please sign in again.' }, { status: 401 });

    const payload = await req.json().catch(() => ({}));
    const authorEmail = String(user.email).toLowerCase();
    const title = String(payload?.title || '').trim();
    const body = String(payload?.body || '').trim();
    const category = CATEGORIES.includes(payload?.category) ? payload.category : 'applications';

    if (!title || !body) {
      return Response.json({ error: 'A title and a post are both required.' }, { status: 400 });
    }
    if (title.length > 160) {
      return Response.json({ error: 'Titles are limited to 160 characters.' }, { status: 400 });
    }
    if (body.length > 20000) {
      return Response.json({ error: 'Posts are limited to 20,000 characters.' }, { status: 400 });
    }

    const limit = await consumeRateLimit(base44, authorEmail, 'create_post', { day: 10 });
    if (!limit.ok) {
      return Response.json({ code: 'rate_limited', error: limit.message }, { status: 429 });
    }

    // Attachment shape and type checks happen before anything expensive.
    const heroUrl = String(payload?.hero_image || '').trim();
    const footerUrl = String(payload?.footer_image || '').trim();
    const valid = validateAttachments(payload?.attachments);
    if (!valid.ok) {
      return Response.json({ error: valid.error, code: valid.code }, { status: 400 });
    }

    const combined = `${title}\n\n${body}`;
    const screened = screenContent(combined);
    if (screened.blocked) {
      await logModerationEvent(base44, {
        sender_email: authorEmail,
        surface: 'post',
        rule: screened.rule,
        severity: screened.severity,
        excerpt: excerptOf(combined),
      });
      return Response.json({ blocked: true, reason: MODERATION_BLOCK_REASON });
    }

    const verdict = await classifyRisk(base44, combined);
    if (verdict.risk === 'high') {
      await logModerationEvent(base44, {
        sender_email: authorEmail,
        surface: 'post',
        rule: 'classifier',
        severity: 'high',
        excerpt: excerptOf(combined),
        detail: [verdict.category, verdict.reason].filter(Boolean).join(': '),
      });
      return Response.json({
        blocked: true,
        reason: 'This post was held back because it looked unsafe for a student audience. A moderator has been notified.',
      });
    }

    // Every image is looked at by a vision model before it can be published.
    // This fails closed: an image that cannot be checked does not go up.
    for (const [label, url] of [['hero_image', heroUrl], ['footer_image', footerUrl]] as const) {
      if (!url) continue;
      const verdict = await screenImage(base44, url);
      if (!verdict.safe) {
        await logModerationEvent(base44, {
          sender_email: authorEmail,
          surface: 'post',
          rule: `image_${verdict.category || label}`,
          severity: verdict.severity === 'high' ? 'high' : 'low',
          excerpt: `${label}: ${url}`,
          detail: verdict.reason,
        });
        return Response.json({ blocked: true, reason: IMAGE_BLOCK_REASON });
      }
    }

    const screenedFiles = await screenAttachments(base44, valid.files);
    if (!screenedFiles.ok) {
      await logModerationEvent(base44, {
        sender_email: authorEmail,
        surface: 'post',
        rule: `image_${screenedFiles.verdict.category || 'unsafe'}`,
        severity: screenedFiles.verdict.severity === 'high' ? 'high' : 'low',
        excerpt: `${screenedFiles.file.name}: ${screenedFiles.file.url}`,
        detail: screenedFiles.verdict.reason,
      });
      return Response.json({ blocked: true, reason: IMAGE_BLOCK_REASON });
    }

    // Author identity is taken from the profile on the server, never from the
    // browser, so nobody can publish as a verified professor.
    const profiles = await base44.asServiceRole.entities.Profile.filter({ user_email: authorEmail });
    const profile = Array.isArray(profiles) && profiles.length > 0 ? profiles[0] : null;

    const created = await base44.asServiceRole.entities.Post.create({
      title,
      body,
      category,
      author_email: authorEmail,
      author_name: profile?.full_name || user.full_name || 'A Pathways member',
      author_role: profile?.role || 'student',
      author_headline: profile?.headline || [profile?.grade, profile?.school].filter(Boolean).join(' · '),
      hero_image: heroUrl || undefined,
      footer_image: footerUrl || undefined,
      attachments: screenedFiles.files,
    });

    return Response.json({ post: created });
  } catch (error: any) {
    return Response.json({ error: error?.message || 'Could not publish that post.' }, { status: 500 });
  }
}