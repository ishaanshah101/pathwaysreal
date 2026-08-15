import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';

// The single source of truth for "is this signed-in user onboarded yet".
// Routing decisions (Phase 1 vs Phase 2) are made from real auth state plus
// this record, never from a hardcoded assumption about being logged out.
export function useProfile() {
  const { user, isAuthenticated, isLoadingAuth } = useAuth();
  const email = user?.email || null;
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['profile', email],
    enabled: Boolean(isAuthenticated && email),
    staleTime: 15000,
    retry: 1,
    queryFn: async () => {
      const rows = await base44.entities.Profile.filter({ user_email: email });
      return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
    },
  });

  // Saving goes through the save-profile backend function, which is what
  // enforces the age floor and derives is_minor. Writing the row directly from
  // here would let a browser set those itself, which is the whole point of
  // having the function.
  //
  // Errors are re-thrown with the server's message and code attached, so the
  // onboarding form can tell an under-13 visitor something kind rather than
  // showing a generic failure.
  const saveProfile = async (patch) => {
    if (!email) throw new Error('Not signed in');
    try {
      const res = await base44.functions.invoke('save-profile', patch);
      await queryClient.invalidateQueries({ queryKey: ['profile', email] });
      return res?.data?.profile ?? null;
    } catch (err) {
      const data = err?.response?.data;
      const e = new Error(data?.error || 'Could not save your profile. Please try again.');
      e.code = data?.code;
      throw e;
    }
  };

  return {
    profile: query.data ?? null,
    email,
    // Treat "still figuring out who this is" as loading so we never flash
    // the logged-out landing page at a signed-in user.
    isLoadingProfile: isLoadingAuth || (Boolean(isAuthenticated && email) && query.isLoading),
    isOnboarded: Boolean(query.data?.onboarded),
    profileError: query.error || null,
    refetchProfile: query.refetch,
    saveProfile,
  };
}

export const ROLE_LABELS = {
  student: 'High school student',
  college_student: 'College student',
  educator: 'Educator / professor',
  counselor: 'Admissions counselor',
};

export const CATEGORY_LABELS = {
  general: 'General',
  applications: 'Applications',
  essays: 'Essays',
  scholarships: 'Scholarships',
  majors: 'Majors',
  campus_life: 'Campus life',
  internships: 'Internships',
  careers: 'Careers',
  test_prep: 'Test prep',
};

export function threadKey(a, b) {
  return [String(a || '').toLowerCase(), String(b || '').toLowerCase()].sort().join('|');
}