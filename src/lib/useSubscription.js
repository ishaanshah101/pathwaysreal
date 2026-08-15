import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';

// Entitlement comes from the Subscription entity, which only the Stripe
// webhook can write. Reading it here is safe: a user editing their own profile
// cannot fake any of this.
const ENTITLED = new Set(['active', 'trialing']);

export const SAGE_PRICES = {
  sage_monthly: { label: 'Monthly', amount: '$5', cadence: 'per month', perWeek: '$1.15' },
  sage_yearly: { label: 'Yearly', amount: '$40', cadence: 'per year', perWeek: '$0.77' },
};

export function useSubscription() {
  const { user, isAuthenticated, isLoadingAuth } = useAuth();
  const email = user?.email || null;
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['subscription', email],
    enabled: Boolean(isAuthenticated && email),
    staleTime: 10000,
    retry: 1,
    queryFn: async () => {
      const rows = await base44.entities.Subscription.filter({ user_email: email });
      return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
    },
  });

  const subscription = query.data ?? null;

  return {
    subscription,
    hasSage: ENTITLED.has(subscription?.status),
    isPastDue: subscription?.status === 'past_due' || subscription?.status === 'unpaid',
    isCanceling: Boolean(subscription?.cancel_at_period_end),
    isLoadingSubscription: isLoadingAuth || (Boolean(isAuthenticated && email) && query.isLoading),
    refetchSubscription: query.refetch,
    invalidateSubscription: () =>
      queryClient.invalidateQueries({ queryKey: ['subscription', email] }),
  };
}

// Anything shown here is read by a student, not by whoever set up billing.
// Backend functions already translate Stripe's raw API errors, so this only
// needs to catch the cases that never reach them.
function messageFrom(err, fallback) {
  const data = err?.response?.data;
  if (data?.code === 'stripe_not_configured' || data?.code === 'billing_misconfigured') {
    return 'Sage checkout is not quite finished being set up. This is on our side, not yours. Please check back soon.';
  }
  if (data?.error) return data.error;
  // Never surface a raw network or SDK error string to a student.
  return fallback;
}

// Sends the user to Stripe's hosted checkout. We never touch card details:
// Stripe collects them on its own page, which is what keeps this PCI-safe.
export async function startSageCheckout(plan) {
  try {
    const res = await base44.functions.invoke('stripe-create-checkout', { plan });
    const url = res?.data?.url;
    if (!url) throw new Error('Stripe did not return a checkout link.');
    window.location.href = url;
  } catch (err) {
    throw new Error(messageFrom(err, 'Could not start checkout. Please try again.'));
  }
}

export async function openBillingPortal() {
  try {
    const res = await base44.functions.invoke('stripe-portal', {});
    const url = res?.data?.url;
    if (!url) throw new Error('Stripe did not return a billing link.');
    window.location.href = url;
  } catch (err) {
    throw new Error(messageFrom(err, 'Could not open billing. Please try again.'));
  }
}
