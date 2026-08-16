import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// The only place a Profile should be written from the app.
//
// Three things happen here that cannot happen in a browser:
//   1. Age is computed from birth_year on the server, and under-13 is refused.
//   2. is_minor is derived, never accepted from the client.
//   3. verified and suspended are stripped from any incoming payload, so a
//      member cannot mark themselves as a verified counselor or un-suspend
//      themselves by editing a request.

const ROLES = ['student', 'college_student', 'educator', 'counselor'];

// Fields a member is allowed to set about themselves.
const EDITABLE = [
  'full_name', 'role', 'grade', 'school', 'goals',
  'interests', 'bio', 'headline', 'birth_year', 'onboarded',
  // Adult track. Harmless for a student to have empty, so they are allowed
  // through the same gate rather than branching the whitelist.
  'account_type', 'institution', 'job_title', 'expertise',
  'years_experience', 'help_with',
];

const ACCOUNT_TYPES = ['student', 'adult'];

// Fields that are ours, never theirs. Listed explicitly so it is obvious what
// is being defended and why.
const SERVER_ONLY = ['is_minor', 'verified', 'suspended', 'plan', 'user_email'];

const MIN_AGE = 13;

function ageFrom(birthYear: number, now = new Date()) {
  // Year-only, so this is the age they turn during the current calendar year.
  // Deliberately generous at the boundary: we would rather let a 13-year-old
  // in a few months early than lock out someone who has already turned 13.
  return now.getFullYear() - birthYear;
}

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user?.email) return Response.json({ error: 'Please sign in again.' }, { status: 401 });

    const email = String(user.email).toLowerCase();
    const payload = await req.json().catch(() => ({}));

    const existingRows = await base44.asServiceRole.entities.Profile.filter({ user_email: email });
    const existing = Array.isArray(existingRows) && existingRows.length > 0 ? existingRows[0] : null;

    if (existing?.suspended) {
      return Response.json(
        { code: 'suspended', error: 'Your account is under review. Email pathways.admins@gmail.com if you think that is a mistake.' },
        { status: 403 },
      );
    }

    // Take only what a member is allowed to set. Anything in SERVER_ONLY that
    // arrives in the payload is silently dropped rather than rejected, because
    // a normal client will never send it and a hostile one deserves no hints.
    const patch: Record<string, unknown> = {};
    for (const key of EDITABLE) {
      if (payload[key] !== undefined) patch[key] = payload[key];
    }
    for (const key of SERVER_ONLY) delete patch[key];

    if (patch.role !== undefined && !ROLES.includes(String(patch.role))) {
      return Response.json({ error: 'That is not a valid role.' }, { status: 400 });
    }

    if (patch.account_type !== undefined && !ACCOUNT_TYPES.includes(String(patch.account_type))) {
      return Response.json({ error: 'That is not a valid account type.' }, { status: 400 });
    }

    // Like birth_year, the student/adult track is fixed once it is set. An adult
    // who could relabel themselves a student would sidestep the rule that
    // students always send the first message.
    if (existing?.account_type && patch.account_type !== undefined
      && String(patch.account_type) !== String(existing.account_type)) {
      delete patch.account_type;
    }

    // The two tracks have to agree. An account that says it is a student but
    // carries an adult role would sit on the wrong side of the rule in
    // request-connection that stops adults opening contact with minors, so it
    // is corrected here rather than trusted.
    if (patch.account_type === 'student') patch.role = 'student';
    if (patch.account_type === 'adult' && String(patch.role || existing?.role) === 'student') {
      patch.role = 'college_student';
    }

    if (patch.years_experience !== undefined) {
      const yrs = Number(patch.years_experience);
      patch.years_experience = Number.isFinite(yrs) && yrs >= 0 && yrs <= 80 ? yrs : undefined;
      if (patch.years_experience === undefined) delete patch.years_experience;
    }

    if (patch.expertise !== undefined) {
      patch.expertise = Array.isArray(patch.expertise)
        ? patch.expertise.map((s: unknown) => String(s).slice(0, 60)).slice(0, 12)
        : [];
    }

    // Age. Required on the first save, and immutable afterwards so nobody
    // ages themselves up after being told they are too young.
    const incomingYear = patch.birth_year;
    if (incomingYear !== undefined) {
      const year = Number(incomingYear);
      const thisYear = new Date().getFullYear();

      if (!Number.isInteger(year) || year < 1900 || year > thisYear) {
        return Response.json(
          { code: 'bad_birth_year', error: 'Please enter the year you were born, as four digits.' },
          { status: 400 },
        );
      }

      const age = ageFrom(year);
      if (age < MIN_AGE) {
        return Response.json(
          {
            code: 'too_young',
            error: 'You need to be at least 13 to use Pathways. Thanks for your interest, and come back when you are.',
          },
          { status: 403 },
        );
      }

      if (existing?.birth_year && Number(existing.birth_year) !== year) {
        // Changing a recorded birth year is a support request, not a form edit.
        delete patch.birth_year;
      } else {
        patch.birth_year = year;
        patch.is_minor = age < 18;
      }
    }

    // Nobody completes onboarding without an age on file.
    if (patch.onboarded === true) {
      const year = Number(patch.birth_year ?? existing?.birth_year ?? 0);
      if (!year) {
        return Response.json(
          { code: 'birth_year_required', error: 'We need your birth year before you can finish setting up.' },
          { status: 400 },
        );
      }
      if (existing && existing.is_minor === undefined) {
        patch.is_minor = ageFrom(year) < 18;
      }
    }

    let saved;
    if (existing?.id) {
      saved = await base44.asServiceRole.entities.Profile.update(existing.id, patch);
    } else {
      saved = await base44.asServiceRole.entities.Profile.create({
        user_email: email,
        ...patch,
      });
    }

    return Response.json({ profile: saved });
  } catch (error: any) {
    return Response.json({ error: error?.message || 'Could not save your profile.' }, { status: 500 });
  }
}