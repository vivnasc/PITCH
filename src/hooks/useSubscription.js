import { useMemo } from 'react'
import { TIERS, isActivityAvailable, isUniverseAvailable, FREE_ACTIVITIES } from '../data/tiers'

/**
 * Founder emails — these accounts always get full access (family tier).
 * This is the platform creator and should never be locked out.
 */
const FOUNDER_EMAILS = [
  'viv.saraiva@gmail.com',
]

/**
 * Subscription hook — reads the tier from the profile and exposes helpers.
 *
 * The tier is stored on the profile object as `subscriptionTier`.
 * Breno's hardcoded profile gets 'family' tier by default.
 * New profiles start on 'free'.
 *
 * Founder emails (e.g. viv.saraiva@gmail.com) always get 'family' tier
 * regardless of what's stored in the profile.
 *
 * This is a client-side gate only. When Stripe/Paddle is integrated,
 * the tier will be validated server-side on Supabase.
 */
export function useSubscription(profile, authUser) {
  const isFounder = authUser?.email && FOUNDER_EMAILS.includes(authUser.email.toLowerCase())
  const tierId = isFounder ? 'family' : (profile?.subscriptionTier || 'free')
  const tier = TIERS[tierId] || TIERS.free

  const helpers = useMemo(() => ({
    tierId,
    tier,
    isFounder: !!isFounder,
    isFree: tierId === 'free',
    isFamily: tierId === 'family',
    isTherapist: tierId === 'therapist',
    isPaid: tierId !== 'free',

    /**
     * Check if an activity is locked for this tier.
     * Returns true if locked (not available).
     */
    isActivityLocked(activityId, campoId) {
      return !isActivityAvailable(activityId, campoId, tierId)
    },

    /**
     * Check if a universe is locked for this tier.
     */
    isUniverseLocked(universeId) {
      return !isUniverseAvailable(universeId, tierId)
    },

    /**
     * Get free activities for a campo.
     */
    getFreeActivities(campoId) {
      return FREE_ACTIVITIES[campoId] || []
    },

    /**
     * Get count of available activities for a campo.
     */
    getAvailableCount(campoId) {
      return tier.activitiesPerCampo
    },

    /**
     * Check if worksheets/fichas are available.
     */
    hasFichas: tierId !== 'free',

    /**
     * Check if weekly challenges are available.
     */
    hasDesafios: tierId !== 'free',

    /**
     * Check if shop is available.
     */
    hasLoja: tierId !== 'free',

    /**
     * Check if dashboard is available.
     */
    hasDashboard: tierId !== 'free',

    /**
     * Max profiles allowed.
     */
    maxProfiles: tier.maxProfiles,
  }), [tierId, tier, isFounder])

  return helpers
}
