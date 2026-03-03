import { useState, useCallback, useEffect, useMemo } from 'react'
import {
  CAMPO1_ACTIVITIES,
  CAMPO2_ACTIVITIES,
  CAMPO3_ACTIVITIES,
  CAMPO4_ACTIVITIES,
  CAMPO5_ACTIVITIES,
  CAMPO6_ACTIVITIES,
  CAMPO7_ACTIVITIES,
} from '../data/activities'

const STORAGE_PREFIX = 'pitch-planner-'

const ALL_ACTIVITIES = [
  ...CAMPO1_ACTIVITIES.map((a) => ({ ...a, campo: 'campo1', path: `/campo/1/${a.id}` })),
  ...CAMPO2_ACTIVITIES.map((a) => ({ ...a, campo: 'campo2', path: `/campo/2/${a.id}` })),
  ...CAMPO3_ACTIVITIES.map((a) => ({ ...a, campo: 'campo3', path: `/campo/3/${a.id}` })),
  ...CAMPO4_ACTIVITIES.map((a) => ({ ...a, campo: 'campo4', path: `/campo/4/${a.id}` })),
  ...CAMPO5_ACTIVITIES.map((a) => ({ ...a, campo: 'campo5', path: `/campo/5/${a.id}` })),
  ...CAMPO6_ACTIVITIES.map((a) => ({ ...a, campo: 'campo6', path: `/campo/6/${a.id}` })),
  ...CAMPO7_ACTIVITIES.map((a) => ({ ...a, campo: 'campo7', path: `/campo/7/${a.id}` })),
]

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

function dayOfWeek(dateStr) {
  const d = new Date(dateStr + 'T12:00:00')
  return d.getDay()
}

function getWeekDates() {
  const today = new Date()
  const day = today.getDay()
  const monday = new Date(today)
  monday.setDate(today.getDate() - ((day + 6) % 7))
  const dates = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    dates.push(d.toISOString().slice(0, 10))
  }
  return dates
}

const DAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab']

function getStorageKey(profileId) {
  return STORAGE_PREFIX + (profileId || 'default')
}

function loadPlanner(profileId) {
  try {
    const raw = localStorage.getItem(getStorageKey(profileId))
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function savePlanner(profileId, data) {
  localStorage.setItem(getStorageKey(profileId), JSON.stringify(data))
}

function getDefaultPlanner() {
  return {
    dailyPlan: null,
    weekHistory: {},
    preferences: {
      activitiesPerDay: 3,
      focusCampos: [],
    },
  }
}

/**
 * Generates a daily plan based on profile needs, progress, and rotation.
 * Distributes activities evenly across campos (round-robin).
 */
function generateDailyPlan(prioritisedCampos, progress, preferences, weekHistory) {
  const count = preferences.activitiesPerDay || 3
  const focus = preferences.focusCampos?.length > 0
    ? preferences.focusCampos
    : prioritisedCampos

  // Group activities by campo
  const byCampo = {}
  for (const act of ALL_ACTIVITIES) {
    if (!byCampo[act.campo]) byCampo[act.campo] = []
    byCampo[act.campo].push(act)
  }

  // Score each activity within its campo
  for (const campo of Object.keys(byCampo)) {
    byCampo[campo] = byCampo[campo].map((act) => {
      let score = 0
      if (focus.includes(act.campo)) score += 10
      const stars = progress?.activitiesCompleted?.[act.id] || 0
      if (stars === 0) score += 5
      else if (stars < 3) score += 2
      const recentDays = Object.values(weekHistory || {})
      const doneRecently = recentDays.some(
        (day) => day.activities?.some((a) => a.activityId === act.id && a.completed)
      )
      if (doneRecently) score -= 3
      return { ...act, score }
    })
    byCampo[campo].sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      return Math.random() - 0.5
    })
  }

  // Round-robin across campos: pick 1 from each campo in rotation
  // Priority campos come first in the rotation
  const campoOrder = [
    ...focus.filter((c) => byCampo[c]),
    ...Object.keys(byCampo).filter((c) => !focus.includes(c)),
  ]

  const picked = []
  const campoIdx = {} // track index within each campo's sorted list
  let round = 0

  while (picked.length < count) {
    const campo = campoOrder[round % campoOrder.length]
    const idx = campoIdx[campo] || 0
    const candidates = byCampo[campo] || []

    if (idx < candidates.length) {
      const act = candidates[idx]
      // Avoid duplicates
      if (!picked.find((p) => p.activityId === act.id)) {
        picked.push({
          activityId: act.id,
          campo: act.campo,
          path: act.path,
          name: act.name,
          icon: act.icon,
          completed: false,
          completedAt: null,
        })
      }
      campoIdx[campo] = idx + 1
    }

    round++
    // Safety: if we've gone through all activities, stop
    if (round > ALL_ACTIVITIES.length + count) break
  }

  return {
    date: todayKey(),
    activities: picked,
    generatedAt: new Date().toISOString(),
  }
}

/**
 * usePlanner — manages daily activity scheduling and weekly tracking.
 */
export function usePlanner(profileId, prioritisedCampos, progress) {
  const [data, setData] = useState(() => {
    return loadPlanner(profileId) || getDefaultPlanner()
  })

  // Persist
  useEffect(() => {
    if (profileId) {
      savePlanner(profileId, data)
    }
  }, [data, profileId])

  // Reload when profile changes
  useEffect(() => {
    const loaded = loadPlanner(profileId) || getDefaultPlanner()
    setData(loaded)
  }, [profileId])

  // Auto-generate today's plan if needed
  const todayPlan = useMemo(() => {
    const today = todayKey()
    if (data.dailyPlan?.date === today) {
      return data.dailyPlan
    }
    return null
  }, [data.dailyPlan])

  const generateToday = useCallback(() => {
    const today = todayKey()
    const plan = generateDailyPlan(
      prioritisedCampos || ['campo1', 'campo2', 'campo3', 'campo4', 'campo5', 'campo6'],
      progress,
      data.preferences,
      data.weekHistory,
    )
    setData((prev) => ({
      ...prev,
      dailyPlan: plan,
      weekHistory: {
        ...prev.weekHistory,
        [today]: {
          planned: plan.activities.length,
          completed: 0,
          activities: plan.activities,
        },
      },
    }))
    return plan
  }, [prioritisedCampos, progress, data.preferences, data.weekHistory])

  // Mark activity completed in today's plan
  const markDone = useCallback((activityId) => {
    const today = todayKey()
    setData((prev) => {
      if (prev.dailyPlan?.date !== today) return prev

      const updatedActivities = prev.dailyPlan.activities.map((a) =>
        a.activityId === activityId
          ? { ...a, completed: true, completedAt: new Date().toISOString() }
          : a
      )

      const completedCount = updatedActivities.filter((a) => a.completed).length

      return {
        ...prev,
        dailyPlan: { ...prev.dailyPlan, activities: updatedActivities },
        weekHistory: {
          ...prev.weekHistory,
          [today]: {
            planned: updatedActivities.length,
            completed: completedCount,
            activities: updatedActivities,
          },
        },
      }
    })
  }, [])

  // Update preferences and regenerate plan if activitiesPerDay changed
  const updatePreferences = useCallback((updates) => {
    setData((prev) => {
      const newPrefs = { ...prev.preferences, ...updates }
      const newData = { ...prev, preferences: newPrefs }

      // If activitiesPerDay changed and we have a plan for today, regenerate
      if (updates.activitiesPerDay && updates.activitiesPerDay !== prev.preferences.activitiesPerDay) {
        const plan = generateDailyPlan(
          prioritisedCampos || ['campo1', 'campo2', 'campo3', 'campo4', 'campo5', 'campo6'],
          progress,
          newPrefs,
          prev.weekHistory,
        )
        const today = todayKey()
        newData.dailyPlan = plan
        newData.weekHistory = {
          ...prev.weekHistory,
          [today]: {
            planned: plan.activities.length,
            completed: 0,
            activities: plan.activities,
          },
        }
      }

      return newData
    })
  }, [prioritisedCampos, progress])

  // Regenerate plan (e.g. parent wants different activities)
  const regeneratePlan = useCallback(() => {
    return generateToday()
  }, [generateToday])

  // Week data
  const weekDates = useMemo(() => getWeekDates(), [])

  const weekData = useMemo(() => {
    return weekDates.map((dateStr) => {
      const dayData = data.weekHistory?.[dateStr]
      const dow = dayOfWeek(dateStr)
      return {
        date: dateStr,
        dayName: DAY_NAMES[dow],
        dayNum: parseInt(dateStr.slice(8, 10), 10),
        isToday: dateStr === todayKey(),
        planned: dayData?.planned || 0,
        completed: dayData?.completed || 0,
        activities: dayData?.activities || [],
      }
    })
  }, [weekDates, data.weekHistory])

  // Stats
  const weekStats = useMemo(() => {
    let totalPlanned = 0
    let totalCompleted = 0
    let activeDays = 0
    weekDates.forEach((d) => {
      const day = data.weekHistory?.[d]
      if (day) {
        totalPlanned += day.planned || 0
        totalCompleted += day.completed || 0
        if (day.completed > 0) activeDays++
      }
    })
    return { totalPlanned, totalCompleted, activeDays }
  }, [weekDates, data.weekHistory])

  return {
    todayPlan,
    generateToday,
    markDone,
    regeneratePlan,
    weekData,
    weekStats,
    preferences: data.preferences,
    updatePreferences,
  }
}

export { ALL_ACTIVITIES, DAY_NAMES }
