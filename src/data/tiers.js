/**
 * Subscription tiers for PITCH.
 *
 * Principles:
 * - Free tier is real, not a demo — 1 universe, 1 activity per campo, full progression
 * - Accessibility features are NEVER gated (TTS, contrast, frustration detection, Banco da Calma)
 * - No child's progress is ever blocked by a paywall
 * - Breno always has full access (hardcoded bypass)
 */

export const TIERS = {
  free: {
    id: 'free',
    name: 'Semente',
    emoji: '🌱',
    price: 0,
    priceLabel: 'Grátis',
    color: '#4CAF50',
    description: 'Para começar a aprender',
    maxProfiles: 1,
    // 1 activity per campo (the first/easiest one)
    activitiesPerCampo: 1,
    // Only football universe
    universes: ['football'],
    features: [
      '1 perfil',
      '1 universo (Futebol)',
      '7 actividades (1 por campo)',
      'Progressão completa (10 níveis)',
      'Mural familiar (mensagens)',
      'Detecção de frustração',
      'Instruções por voz',
      'Funciona offline',
    ],
    limitations: [
      'Sem fichas para impressão',
      'Sem desafios semanais',
      'Sem loja de cosméticos',
      'Sem comunidade social',
    ],
  },

  family: {
    id: 'family',
    name: 'Flor',
    emoji: '🌸',
    price: 5.99,
    priceLabel: '5,99 /mês',
    color: '#1565C0',
    description: 'Para a família toda',
    maxProfiles: 5,
    // All 5 activities per campo
    activitiesPerCampo: 5,
    // All 5 universes
    universes: ['football', 'dinosaurs', 'space', 'animals', 'music'],
    features: [
      'Até 5 perfis',
      '5 universos temáticos',
      '35 actividades (todas)',
      'Fichas para impressão',
      'Desafios semanais',
      'Loja de cosméticos',
      'Comunidade social (opt-in)',
      'Notificações de conquistas',
      'Backup cloud',
      'Painel do educador',
    ],
    limitations: [],
  },

  therapist: {
    id: 'therapist',
    name: 'Floresta',
    emoji: '🌲',
    price: 14.99,
    priceLabel: '14,99 /mês',
    color: '#6A1B9A',
    description: 'Para terapeutas e escolas',
    maxProfiles: 20,
    activitiesPerCampo: 5,
    universes: ['football', 'dinosaurs', 'space', 'animals', 'music'],
    features: [
      'Até 20 perfis',
      'Tudo do plano Flor',
      'Dashboard avançado',
      'Relatórios exportáveis',
      'Notas clínicas',
      'Acompanhamento remoto',
      'Suporte prioritário',
    ],
    limitations: [],
  },
}

export const TIER_ORDER = ['free', 'family', 'therapist']

/**
 * Which activities are available per campo for a given tier.
 * Free: first activity only. Family/Therapist: all.
 */
export const FREE_ACTIVITIES = {
  campo1: ['vocab-match'],
  campo2: ['goal-math'],
  campo3: ['flag-match'],
  campo4: ['daily-routine'],
  campo5: ['story-builder'],
  campo6: ['emotion-cards'],
  campo7: ['contos-vivos'],
}

/**
 * Check if an activity is available for a tier.
 * prescribedIds: optional Set of activity IDs prescribed by a therapist —
 * prescribed activities are always available regardless of tier.
 */
export function isActivityAvailable(activityId, campoId, tierId, prescribedIds) {
  if (tierId === 'family' || tierId === 'therapist') return true
  if (prescribedIds && prescribedIds.has(activityId)) return true
  const freeList = FREE_ACTIVITIES[campoId]
  return freeList ? freeList.includes(activityId) : false
}

/**
 * Check if a universe is available for a tier.
 */
export function isUniverseAvailable(universeId, tierId) {
  const tier = TIERS[tierId]
  if (!tier) return true
  return tier.universes.includes(universeId)
}
