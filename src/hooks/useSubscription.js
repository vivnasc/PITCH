import { useMemo } from 'react'
import { TIERS, isActivityAvailable, isUniverseAvailable, FREE_ACTIVITIES } from '../data/tiers'

/**
 * Founder emails — these accounts always get full access (family tier).
 */
const FOUNDER_EMAILS = [
  'viv.saraiva@gmail.com',
]

/**
 * Subscription hook — reads tier + viewMode from profile.
 *
 * viewMode determines the UI perspective:
 * - 'child'     → fun UI, planner, activities
 * - 'parent'    → dashboard (progress, fichas, competencies), can create home programs
 * - 'therapist' → full dashboard + professional programs + prescriptions
 *
 * prescribedActivityIds: optional Set of activity IDs from active prescriptions.
 * These bypass tier locks so children on free tier can still do prescribed therapy.
 */
export function useSubscription(profile, authUser, prescribedActivityIds) {
  const isFounder = authUser?.email && FOUNDER_EMAILS.includes(authUser.email.toLowerCase())
  const tierId = isFounder ? 'family' : (profile?.subscriptionTier || 'free')
  const tier = TIERS[tierId] || TIERS.free
  const viewMode = profile?.viewMode || 'child'

  const helpers = useMemo(() => ({
    tierId,
    tier,
    isFounder: !!isFounder,
    isFree: tierId === 'free',
    isFamily: tierId === 'family',
    isTherapist: tierId === 'therapist',
    isPaid: tierId !== 'free',

    // View mode — who is using the app right now
    viewMode,
    isChildView: viewMode === 'child',
    isParentView: viewMode === 'parent',
    isTherapistView: viewMode === 'therapist',

    /**
     * Check if an activity is locked for this tier.
     * Prescribed activities are never locked.
     */
    isActivityLocked(activityId, campoId) {
      return !isActivityAvailable(activityId, campoId, tierId, prescribedActivityIds)
    },

    /**
     * Check if a universe is locked for this tier.
     */
    isUniverseLocked(universeId) {
      return !isUniverseAvailable(universeId, tierId)
    },

    getFreeActivities(campoId) {
      return FREE_ACTIVITIES[campoId] || []
    },

    getAvailableCount(campoId) {
      return tier.activitiesPerCampo
    },

    hasFichas: tierId !== 'free',
    hasDesafios: tierId !== 'free',
    hasLoja: tierId !== 'free',

    /**
     * Dashboard available for Family (simplified) and Therapist (full).
     */
    hasDashboard: tierId !== 'free',

    /**
     * Professional program creation — therapist tier or parent in parent view.
     */
    canCreatePrograms: tierId === 'therapist' || (tierId !== 'free' && viewMode === 'parent'),

    /**
     * Full professional tools (specialization, clinical notes, 20 profiles).
     */
    hasProTools: tierId === 'therapist',

    maxProfiles: tier.maxProfiles,
  }), [tierId, tier, isFounder, viewMode, prescribedActivityIds])

  return helpers
}
