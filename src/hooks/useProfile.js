import { useState, useCallback, useEffect } from 'react'

const PROFILES_KEY = 'pitch-profiles'
const ACTIVE_KEY = 'pitch-active-id'
const LEGACY_KEY = 'pitch-profile'

const AVATARS = [
  { id: 'star', emoji: '⭐', label: 'Estrela' },
  { id: 'eagle', emoji: '🦅', label: 'Águia' },
  { id: 'lion', emoji: '🦁', label: 'Leão' },
  { id: 'dragon', emoji: '🐉', label: 'Dragão' },
  { id: 'rocket', emoji: '🚀', label: 'Foguetão' },
  { id: 'crown', emoji: '👑', label: 'Coroa' },
  { id: 'lightning', emoji: '⚡', label: 'Relâmpago' },
  { id: 'fire', emoji: '🔥', label: 'Fogo' },
]

const DEFAULT_PROFILE = {
  id: null,
  name: '',
  age: null,
  avatar: 'star',
  onboardingComplete: false,
  createdAt: null,

  universe: 'football',
  favoriteTeam: null,
  favoritePlayer: null,

  filledBy: 'parent',

  learningNeeds: {
    areas: [],
    readingLevel: 'beginning',
    supportLevel: 'some',
  },

  sensory: {
    soundEnabled: true,
    soundVolume: 'normal',
    animationLevel: 'normal',
    visualContrast: 'normal',
    fontSize: 'normal',
    reducedClutter: false,
    timePressure: true,
    ttsMode: 'on-demand', // 'auto' | 'on-demand' | 'off'
  },

  attention: {
    sessionLength: 15,
    breakReminder: true,
    breakInterval: 10,
    frustrationSensitivity: 'moderate',
  },

  goals: [],

  // Per-campo competency levels (1-10), detected by intake diagnostic
  competencyLevels: {
    campo1: 1,
    campo2: 1,
    campo3: 1,
    campo4: 1,
    campo5: 1,
    campo6: 1,
  },

  // Subscription tier: 'free', 'family', or 'therapist'
  subscriptionTier: 'free',

  // Professional type (for therapist accounts): 'speech-therapist', 'occupational-therapist', etc.
  professionalType: null,

  communication: {
    usesVisualSupports: false,
    prefersSimpleLanguage: false,
    needsAudioInstructions: true,
  },

  purchasedItems: [],
  equippedCelebration: 'confetti',
  equippedBadge: null,
  sharedAchievements: [],
  encouragements: [],
  weeklyProgress: {},
  lastWeekReset: null,
  worksheetSubmissions: [],
  realRewards: [],
  claimedRewards: [],
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

function deepMergeProfile(saved) {
  return {
    ...DEFAULT_PROFILE,
    ...saved,
    learningNeeds: { ...DEFAULT_PROFILE.learningNeeds, ...saved.learningNeeds },
    sensory: { ...DEFAULT_PROFILE.sensory, ...saved.sensory },
    attention: { ...DEFAULT_PROFILE.attention, ...saved.attention },
    competencyLevels: { ...DEFAULT_PROFILE.competencyLevels, ...saved.competencyLevels },
    communication: { ...DEFAULT_PROFILE.communication, ...saved.communication },
  }
}

/**
 * Migrate from single-profile (legacy) to multi-profile format.
 */
function migrateIfNeeded() {
  try {
    const existing = localStorage.getItem(PROFILES_KEY)
    if (existing) return

    const legacy = localStorage.getItem(LEGACY_KEY)
    if (!legacy) return

    const parsed = JSON.parse(legacy)
    if (!parsed.onboardingComplete) return

    const id = generateId()
    const migrated = deepMergeProfile({ ...parsed, id })
    localStorage.setItem(PROFILES_KEY, JSON.stringify([migrated]))
    localStorage.setItem(ACTIVE_KEY, id)
    localStorage.removeItem(LEGACY_KEY)
  } catch {
    // Silently fail migration
  }
}

function loadAllProfiles() {
  migrateIfNeeded()
  try {
    const raw = localStorage.getItem(PROFILES_KEY)
    if (!raw) return []
    return JSON.parse(raw).map(deepMergeProfile)
  } catch {
    return []
  }
}

function loadActiveId() {
  return localStorage.getItem(ACTIVE_KEY) || null
}

export { AVATARS }

export function useProfile() {
  const [profiles, setProfiles] = useState(loadAllProfiles)
  const [activeId, setActiveId] = useState(loadActiveId)

  const profile = profiles.find((p) => p.id === activeId) || null

  useEffect(() => {
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles))
  }, [profiles])

  useEffect(() => {
    if (activeId) {
      localStorage.setItem(ACTIVE_KEY, activeId)
    } else {
      localStorage.removeItem(ACTIVE_KEY)
    }
  }, [activeId])

  const updateProfile = useCallback(
    (updates) => {
      setProfiles((prev) =>
        prev.map((p) => {
          if (p.id !== activeId) return p
          // Founder profile: never downgrade tier
          const safeUpdates = { ...updates }
          if (p.isFounder && safeUpdates.subscriptionTier && safeUpdates.subscriptionTier !== 'family') {
            delete safeUpdates.subscriptionTier
          }
          return { ...p, ...safeUpdates, updatedAt: new Date().toISOString() }
        })
      )
    },
    [activeId]
  )

  const completeOnboarding = useCallback((data) => {
    // Use stable ID if provided (e.g. founder profile), otherwise generate
    const id = data.id || generateId()
    const now = new Date().toISOString()
    const newProfile = deepMergeProfile({
      ...data,
      id,
      onboardingComplete: true,
      createdAt: data.createdAt || now,
      updatedAt: now,
    })
    setProfiles((prev) => {
      // If profile with this ID already exists, don't duplicate — just activate it
      if (prev.find((p) => p.id === id)) return prev
      return [...prev, newProfile]
    })
    setActiveId(id)
  }, [])

  const switchProfile = useCallback((id) => {
    setActiveId(id)
  }, [])

  const deleteProfile = useCallback(
    (id) => {
      setProfiles((prev) => {
        const remaining = prev.filter((p) => p.id !== id)
        if (activeId === id) {
          setActiveId(remaining.length > 0 ? remaining[0].id : null)
        }
        return remaining
      })
    },
    [activeId]
  )

  const purchaseItem = useCallback(
    (item, starCost) => {
      setProfiles((prev) =>
        prev.map((p) => {
          if (p.id !== activeId) return p
          if (p.purchasedItems.find((i) => i.id === item.id)) return p
          return {
            ...p,
            purchasedItems: [
              ...p.purchasedItems,
              { ...item, purchasedAt: new Date().toISOString() },
            ],
          }
        })
      )
      return starCost
    },
    [activeId]
  )

  const equipItem = useCallback(
    (type, itemId) => {
      setProfiles((prev) =>
        prev.map((p) => {
          if (p.id !== activeId) return p
          if (type === 'celebration') return { ...p, equippedCelebration: itemId }
          if (type === 'badge') return { ...p, equippedBadge: itemId }
          return p
        })
      )
    },
    [activeId]
  )

  const shareAchievement = useCallback(
    (achievement) => {
      setProfiles((prev) =>
        prev.map((p) => {
          if (p.id !== activeId) return p
          return {
            ...p,
            sharedAchievements: [
              ...p.sharedAchievements,
              { ...achievement, sharedAt: new Date().toISOString() },
            ],
          }
        })
      )
    },
    [activeId]
  )

  const addEncouragement = useCallback(
    (from, message) => {
      setProfiles((prev) =>
        prev.map((p) => {
          if (p.id !== activeId) return p
          return {
            ...p,
            encouragements: [
              ...p.encouragements,
              { from, message, date: new Date().toISOString(), id: Date.now() },
            ],
          }
        })
      )
    },
    [activeId]
  )

  const updateWeeklyProgress = useCallback(
    (challengeId, progress) => {
      setProfiles((prev) =>
        prev.map((p) => {
          if (p.id !== activeId) return p
          return {
            ...p,
            weeklyProgress: { ...p.weeklyProgress, [challengeId]: progress },
          }
        })
      )
    },
    [activeId]
  )

  const resetWeekly = useCallback(() => {
    setProfiles((prev) =>
      prev.map((p) => {
        if (p.id !== activeId) return p
        return { ...p, weeklyProgress: {}, lastWeekReset: new Date().toISOString() }
      })
    )
  }, [activeId])

  const submitWorksheet = useCallback(
    (worksheetId, photoData) => {
      const submission = {
        id: generateId(),
        worksheetId,
        photoData: photoData || null,
        date: new Date().toISOString(),
        status: 'pending',
        stars: null,
        feedback: null,
      }
      setProfiles((prev) =>
        prev.map((p) => {
          if (p.id !== activeId) return p
          return {
            ...p,
            worksheetSubmissions: [...(p.worksheetSubmissions || []), submission],
          }
        })
      )
      return submission.id
    },
    [activeId]
  )

  const reviewWorksheet = useCallback(
    (submissionId, stars, feedback) => {
      setProfiles((prev) =>
        prev.map((p) => {
          if (p.id !== activeId) return p
          return {
            ...p,
            worksheetSubmissions: (p.worksheetSubmissions || []).map((s) =>
              s.id === submissionId
                ? { ...s, status: 'reviewed', stars, feedback, reviewedAt: new Date().toISOString() }
                : s
            ),
          }
        })
      )
    },
    [activeId]
  )

  const addRealReward = useCallback(
    (name, starCost, icon) => {
      const reward = {
        id: generateId(),
        name,
        starCost: parseInt(starCost, 10) || 5,
        icon: icon || '🎁',
        createdAt: new Date().toISOString(),
      }
      setProfiles((prev) =>
        prev.map((p) => {
          if (p.id !== activeId) return p
          return { ...p, realRewards: [...(p.realRewards || []), reward] }
        })
      )
      return reward.id
    },
    [activeId]
  )

  const removeRealReward = useCallback(
    (rewardId) => {
      setProfiles((prev) =>
        prev.map((p) => {
          if (p.id !== activeId) return p
          return {
            ...p,
            realRewards: (p.realRewards || []).filter((r) => r.id !== rewardId),
          }
        })
      )
    },
    [activeId]
  )

  const claimRealReward = useCallback(
    (rewardId) => {
      setProfiles((prev) =>
        prev.map((p) => {
          if (p.id !== activeId) return p
          const reward = (p.realRewards || []).find((r) => r.id === rewardId)
          if (!reward) return p
          return {
            ...p,
            claimedRewards: [
              ...(p.claimedRewards || []),
              { ...reward, claimedAt: new Date().toISOString(), confirmed: false },
            ],
          }
        })
      )
    },
    [activeId]
  )

  const confirmRewardClaim = useCallback(
    (claimIndex) => {
      setProfiles((prev) =>
        prev.map((p) => {
          if (p.id !== activeId) return p
          const claims = [...(p.claimedRewards || [])]
          if (claims[claimIndex]) {
            claims[claimIndex] = { ...claims[claimIndex], confirmed: true, confirmedAt: new Date().toISOString() }
          }
          return { ...p, claimedRewards: claims }
        })
      )
    },
    [activeId]
  )

  // Import profiles from cloud — merges with local, newer wins per profile
  const importFromCloud = useCallback((cloudProfiles, cloudActiveId) => {
    if (!cloudProfiles || !Array.isArray(cloudProfiles)) return

    setProfiles((local) => {
      const merged = [...local]
      const localById = new Map(local.map((p) => [p.id, p]))

      for (const cloudProfile of cloudProfiles) {
        if (!cloudProfile.id) continue
        const localProfile = localById.get(cloudProfile.id)

        if (!localProfile) {
          // Profile only exists in cloud — add it
          merged.push(deepMergeProfile(cloudProfile))
        } else {
          // Both exist — keep the one with newer updatedAt
          const cloudTime = new Date(cloudProfile.updatedAt || cloudProfile.createdAt || 0).getTime()
          const localTime = new Date(localProfile.updatedAt || localProfile.createdAt || 0).getTime()
          if (cloudTime > localTime) {
            const idx = merged.findIndex((p) => p.id === cloudProfile.id)
            if (idx >= 0) merged[idx] = deepMergeProfile(cloudProfile)
          }
        }
      }
      return merged
    })

    // Restore active profile from cloud if no local active
    if (cloudActiveId && !activeId) {
      setActiveId(cloudActiveId)
    }
  }, [activeId])

  const resetAll = useCallback(() => {
    if (activeId) {
      setProfiles((prev) => prev.filter((p) => p.id !== activeId))
    }
    setActiveId(null)
  }, [activeId])

  const resetEverything = useCallback(() => {
    localStorage.removeItem(PROFILES_KEY)
    localStorage.removeItem(ACTIVE_KEY)
    localStorage.removeItem(LEGACY_KEY)
    setProfiles([])
    setActiveId(null)
  }, [])

  return {
    profile,
    profiles,
    activeId,
    updateProfile,
    completeOnboarding,
    switchProfile,
    deleteProfile,
    purchaseItem,
    equipItem,
    shareAchievement,
    addEncouragement,
    updateWeeklyProgress,
    resetWeekly,
    importFromCloud,
    resetAll,
    resetEverything,
    submitWorksheet,
    reviewWorksheet,
    addRealReward,
    removeRealReward,
    claimRealReward,
    confirmRewardClaim,
  }
}
