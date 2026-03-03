/**
 * Therapy types and professional specializations.
 *
 * Professionals on the therapist tier can select their specialization.
 * Each specialization maps to recommended activities and assessment areas.
 *
 * The prescription system allows professionals to:
 * 1. Create therapy programs (sets of activities + frequency)
 * 2. Assign programs to children they monitor
 * 3. Track progress on prescribed activities
 * 4. Leave clinical notes
 */

export const PROFESSIONAL_TYPES = [
  {
    id: 'speech-therapist',
    name: 'Terapeuta da Fala',
    icon: '🗣️',
    description: 'Trabalha linguagem, articulação, fluência e comunicação',
    focusCampos: ['campo1'],
    recommendedActivities: [
      'syllable-builder', 'vocab-match', 'phonics', 'read-score',
    ],
    assessmentAreas: [
      'Articulação', 'Consciência fonológica', 'Vocabulário',
      'Compreensão oral', 'Fluência', 'Pragmática',
    ],
  },
  {
    id: 'occupational-therapist',
    name: 'Terapeuta Ocupacional',
    icon: '🤲',
    description: 'Trabalha motricidade, autonomia e integração sensorial',
    focusCampos: ['campo4'],
    recommendedActivities: [
      'daily-routine', 'time-planner', 'healthy-choices', 'dress-player',
    ],
    assessmentAreas: [
      'Motricidade fina', 'Motricidade grossa', 'Autonomia pessoal',
      'Integração sensorial', 'Organização', 'Planeamento motor',
    ],
  },
  {
    id: 'psychologist',
    name: 'Psicólogo',
    icon: '🧠',
    description: 'Trabalha comportamento, emoções e desenvolvimento cognitivo',
    focusCampos: ['campo6', 'campo4'],
    recommendedActivities: [
      'emotion-cards', 'fair-play', 'social-detective', 'calm-toolkit', 'problem-solving',
    ],
    assessmentAreas: [
      'Regulação emocional', 'Competências sociais', 'Atenção',
      'Comportamento adaptativo', 'Ansiedade', 'Auto-estima',
    ],
  },
  {
    id: 'special-educator',
    name: 'Educador Especial',
    icon: '📚',
    description: 'Trabalha aprendizagem adaptada e currículo funcional',
    focusCampos: ['campo1', 'campo2'],
    recommendedActivities: [
      'vocab-match', 'goal-math', 'read-score', 'patterns', 'world-explorer',
    ],
    assessmentAreas: [
      'Literacia', 'Numeracia', 'Compreensão', 'Resolução de problemas',
      'Generalização', 'Currículo funcional',
    ],
  },
  {
    id: 'generic',
    name: 'Outro Profissional',
    icon: '👤',
    description: 'Acompanhamento geral do desenvolvimento',
    focusCampos: [],
    recommendedActivities: [],
    assessmentAreas: [],
  },
]

/**
 * A therapy program is a set of activities prescribed by a professional.
 *
 * Structure:
 * {
 *   id: string,
 *   name: string,           // "Programa de Articulação — Semana 1"
 *   professionalType: string, // 'speech-therapist'
 *   professionalName: string, // "Dra. Ana Silva"
 *   activities: [
 *     {
 *       activityId: string,   // 'syllable-builder'
 *       frequency: string,    // 'daily' | '3x-week' | 'weekly'
 *       notes: string,        // "Focar em sílabas com R"
 *       targetLevel: number,  // suggested difficulty level
 *     }
 *   ],
 *   goals: string[],          // ["Produzir /r/ em posição inicial"]
 *   startDate: string,
 *   endDate: string,
 *   status: 'active' | 'paused' | 'completed',
 *   createdAt: string,
 * }
 */

/**
 * Template programs that professionals can use as starting points.
 */
export const PROGRAM_TEMPLATES = [
  {
    id: 'articulation-basic',
    name: 'Articulação — Nível Inicial',
    professionalType: 'speech-therapist',
    activities: [
      { activityId: 'syllable-builder', frequency: 'daily', notes: 'Sílabas simples CV', targetLevel: 2 },
      { activityId: 'phonics', frequency: '3x-week', notes: 'Sons iniciais', targetLevel: 1 },
    ],
    goals: ['Identificar sílabas em palavras simples', 'Reproduzir sons consonânticos'],
  },
  {
    id: 'phonological-awareness',
    name: 'Consciência Fonológica',
    professionalType: 'speech-therapist',
    activities: [
      { activityId: 'syllable-builder', frequency: 'daily', notes: 'Segmentação e reconstrução', targetLevel: 4 },
      { activityId: 'vocab-match', frequency: '3x-week', notes: 'Associação palavra-imagem', targetLevel: 3 },
      { activityId: 'read-score', frequency: 'weekly', notes: 'Leitura assistida', targetLevel: 2 },
    ],
    goals: ['Segmentar palavras em sílabas', 'Identificar rimas', 'Completar palavras'],
  },
  {
    id: 'social-emotional',
    name: 'Competências Socio-Emocionais',
    professionalType: 'psychologist',
    activities: [
      { activityId: 'emotion-cards', frequency: 'daily', notes: 'Identificar emoções básicas', targetLevel: 3 },
      { activityId: 'fair-play', frequency: '3x-week', notes: 'Situações de partilha', targetLevel: 2 },
      { activityId: 'calm-toolkit', frequency: 'daily', notes: 'Técnicas de calma quando frustrado', targetLevel: 1 },
    ],
    goals: ['Identificar 4+ emoções', 'Usar estratégias de regulação', 'Partilhar e esperar a vez'],
  },
  {
    id: 'daily-autonomy',
    name: 'Autonomia Diária',
    professionalType: 'occupational-therapist',
    activities: [
      { activityId: 'daily-routine', frequency: 'daily', notes: 'Sequência da rotina matinal', targetLevel: 3 },
      { activityId: 'time-planner', frequency: '3x-week', notes: 'Planear actividades simples', targetLevel: 2 },
      { activityId: 'healthy-choices', frequency: 'weekly', notes: 'Escolhas de higiene e alimentação', targetLevel: 2 },
    ],
    goals: ['Seguir rotina de 5 passos sozinho', 'Planear tarefas com ajuda mínima'],
  },
  {
    id: 'literacy-numeracy',
    name: 'Literacia e Numeracia',
    professionalType: 'special-educator',
    activities: [
      { activityId: 'vocab-match', frequency: 'daily', notes: 'Vocabulário funcional', targetLevel: 3 },
      { activityId: 'goal-math', frequency: 'daily', notes: 'Operações até 10', targetLevel: 2 },
      { activityId: 'patterns', frequency: '3x-week', notes: 'Padrões simples AB', targetLevel: 1 },
    ],
    goals: ['Ler 20 palavras funcionais', 'Resolver adições até 10', 'Continuar padrões AB'],
  },
]

export function getProfessionalType(id) {
  return PROFESSIONAL_TYPES.find((p) => p.id === id)
}

export function getTemplatesForProfessional(professionalTypeId) {
  return PROGRAM_TEMPLATES.filter((t) => t.professionalType === professionalTypeId)
}
