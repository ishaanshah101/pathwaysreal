import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { screenContent, classifyRisk, logModerationEvent, excerptOf, MODERATION_BLOCK_REASON } from '../../shared/moderation.ts';
import { consumeRateLimit } from '../../shared/rateLimit.ts';

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
    });

    return Response.json({ post: created });
  } catch (error: any) {
    return Response.json({ error: error?.message || 'Could not publish that post.' }, { status: 500 });
  }
}