import { useState, useCallback, useMemo } from 'react'

/**
 * usePrescriptions — manages therapy programs prescribed by professionals.
 *
 * Stores programs in localStorage (later syncs to Supabase).
 * Professionals create programs → children see prescribed activities in their planner.
 *
 * Key concepts:
 * - Program: a set of activities with frequency, created by a professional
 * - Prescription: an active program assigned to a specific child profile
 * - Today's tasks: activities due today based on frequency rules
 */

const STORAGE_KEY = 'pitch-prescriptions'

function loadPrescriptions() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : { programs: [], prescriptions: [] }
  } catch {
    return { programs: [], prescriptions: [] }
  }
}

function savePrescriptions(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // Storage full or unavailable
  }
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

export function usePrescriptions(profileId) {
  const [data, setData] = useState(loadPrescriptions)

  const save = useCallback((newData) => {
    setData(newData)
    savePrescriptions(newData)
  }, [])

  /**
   * Create a new therapy program.
   */
  const createProgram = useCallback((program) => {
    const newProgram = {
      ...program,
      id: generateId(),
      createdAt: new Date().toISOString(),
      status: 'active',
    }
    const newData = {
      ...data,
      programs: [...data.programs, newProgram],
    }
    save(newData)
    return newProgram
  }, [data, save])

  /**
   * Assign a program to a child profile.
   */
  const prescribe = useCallback((programId, childProfileId) => {
    const prescription = {
      id: generateId(),
      programId,
      profileId: childProfileId,
      startDate: new Date().toISOString(),
      status: 'active',
      completedSessions: {},
    }
    const newData = {
      ...data,
      prescriptions: [...data.prescriptions, prescription],
    }
    save(newData)
    return prescription
  }, [data, save])

  /**
   * Mark a prescribed activity as done for today.
   */
  const markDone = useCallback((prescriptionId, activityId) => {
    const today = new Date().toISOString().slice(0, 10)
    const newData = {
      ...data,
      prescriptions: data.prescriptions.map((p) => {
        if (p.id !== prescriptionId) return p
        const sessions = { ...p.completedSessions }
        if (!sessions[today]) sessions[today] = []
        if (!sessions[today].includes(activityId)) {
          sessions[today] = [...sessions[today], activityId]
        }
        return { ...p, completedSessions: sessions }
      }),
    }
    save(newData)
  }, [data, save])

  /**
   * Pause or resume a prescription.
   */
  const togglePause = useCallback((prescriptionId) => {
    const newData = {
      ...data,
      prescriptions: data.prescriptions.map((p) => {
        if (p.id !== prescriptionId) return p
        return { ...p, status: p.status === 'active' ? 'paused' : 'active' }
      }),
    }
    save(newData)
  }, [data, save])

  /**
   * Delete a program.
   */
  const deleteProgram = useCallback((programId) => {
    const newData = {
      programs: data.programs.filter((p) => p.id !== programId),
      prescriptions: data.prescriptions.filter((p) => p.programId !== programId),
    }
    save(newData)
  }, [data, save])

  /**
   * Get active prescriptions for the current child profile.
   */
  const activeForChild = useMemo(() => {
    if (!profileId) return []
    return data.prescriptions
      .filter((p) => p.profileId === profileId && p.status === 'active')
      .map((prescription) => {
        const program = data.programs.find((p) => p.id === prescription.programId)
        return { ...prescription, program }
      })
      .filter((p) => p.program)
  }, [data, profileId])

  /**
   * Get today's prescribed activities for the current child.
   * Respects frequency rules (daily, 3x-week, weekly).
   */
  const todayTasks = useMemo(() => {
    const today = new Date()
    const dayOfWeek = today.getDay() // 0=Sun, 1=Mon, ...
    const todayStr = today.toISOString().slice(0, 10)

    const tasks = []

    for (const { prescription, program } of activeForChild.map((p) => ({
      prescription: p,
      program: p.program,
    }))) {
      for (const activity of program.activities) {
        let isDueToday = false

        switch (activity.frequency) {
          case 'daily':
            isDueToday = true
            break
          case '3x-week':
            isDueToday = [1, 3, 5].includes(dayOfWeek) // Mon, Wed, Fri
            break
          case 'weekly':
            isDueToday = dayOfWeek === 1 // Monday
            break
          default:
            isDueToday = true
        }

        if (isDueToday) {
          const isDone = prescription.completedSessions?.[todayStr]?.includes(activity.activityId)
          tasks.push({
            prescriptionId: prescription.id,
            programName: program.name,
            professionalName: program.professionalName,
            professionalType: program.professionalType,
            activityId: activity.activityId,
            notes: activity.notes,
            targetLevel: activity.targetLevel,
            frequency: activity.frequency,
            isDone,
          })
        }
      }
    }

    return tasks
  }, [activeForChild])

  /**
   * All programs (for professional view).
   */
  const allPrograms = data.programs

  return {
    programs: allPrograms,
    prescriptions: data.prescriptions,
    activeForChild,
    todayTasks,
    createProgram,
    prescribe,
    markDone,
    togglePause,
    deleteProgram,
  }
}
