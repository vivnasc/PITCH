/**
 * Therapy types and professional specializations.
 *
 * Terapia da fala para crianças no espectro autista NÃO é só construção
 * silábica. Abrange 8 domínios que cruzam múltiplos campos:
 *
 * 1. Comunicação Funcional — expressar necessidades, desejos, sentimentos
 * 2. Pragmática Social — turnos, pistas sociais, conversa
 * 3. Compreensão Auditiva — seguir instruções, entender perguntas
 * 4. Construção Frásica — formar frases, usar conectores
 * 5. Narrativa — sequenciar eventos, contar histórias
 * 6. Vocabulário Funcional — palavras do dia-a-dia
 * 7. Articulação e Fonologia — pronunciar sons, consciência fonológica
 * 8. Prosódia e Fluência — entoação, ritmo, volume
 *
 * O sistema de prescrição permite profissionais:
 * 1. Criar programas terapêuticos (actividades + frequência + objectivos)
 * 2. Prescrever programas a crianças
 * 3. Acompanhar progresso nas actividades prescritas
 * 4. Deixar notas clínicas por actividade
 */

/**
 * Domínios de terapia da fala e actividades mapeadas.
 * As actividades cruzam múltiplos campos — a terapia não se limita a um campo.
 */
export const SPEECH_THERAPY_DOMAINS = [
  {
    id: 'functional-communication',
    name: 'Comunicação Funcional',
    icon: '💬',
    description: 'Expressar necessidades, desejos e sentimentos de forma clara',
    importance: 'core',
    activities: ['emotion-cards', 'story-builder', 'meu-conto', 'sentence-builder'],
    goals: [
      'Pedir ajuda usando palavras ou frases',
      'Expressar preferências (quero/não quero)',
      'Comunicar sentimentos básicos',
      'Fazer perguntas simples',
    ],
  },
  {
    id: 'social-pragmatics',
    name: 'Pragmática Social',
    icon: '🤝',
    description: 'Usar a linguagem adequadamente em contexto social',
    importance: 'core',
    activities: ['turn-talk', 'social-detective', 'fair-play', 'teatro-vozes'],
    goals: [
      'Esperar a vez numa conversa',
      'Interpretar expressões faciais',
      'Saudar e despedir-se',
      'Adaptar a fala ao contexto',
    ],
  },
  {
    id: 'auditory-comprehension',
    name: 'Compreensão Auditiva',
    icon: '👂',
    description: 'Entender o que é dito, seguir instruções, responder a perguntas',
    importance: 'core',
    activities: ['listening-quest', 'read-score', 'contos-vivos', 'fabulas-mundo'],
    goals: [
      'Seguir instruções de 2 passos',
      'Responder a perguntas sobre uma história',
      'Identificar a ideia principal',
      'Compreender perguntas "quem, o quê, onde"',
    ],
  },
  {
    id: 'sentence-building',
    name: 'Construção Frásica',
    icon: '📝',
    description: 'Formar frases, usar conectores, expandir ideias',
    importance: 'core',
    activities: ['sentence-builder', 'story-builder', 'meu-conto'],
    goals: [
      'Construir frases SVO (sujeito-verbo-objecto)',
      'Usar conectores (e, mas, porque)',
      'Expandir frases simples com detalhes',
      'Descrever imagens com frases completas',
    ],
  },
  {
    id: 'narrative',
    name: 'Narrativa',
    icon: '📖',
    description: 'Sequenciar eventos, contar histórias, causa-efeito',
    importance: 'important',
    activities: ['story-builder', 'contos-vivos', 'meu-conto', 'sound-story', 'fabulas-mundo'],
    goals: [
      'Recontar uma história com início, meio e fim',
      'Sequenciar 4+ eventos',
      'Explicar causa e efeito simples',
      'Inventar uma história curta',
    ],
  },
  {
    id: 'functional-vocabulary',
    name: 'Vocabulário Funcional',
    icon: '🏷️',
    description: 'Palavras do dia-a-dia, categorias, descrições',
    importance: 'important',
    activities: ['vocab-match', 'dress-player', 'color-kit', 'body-science', 'weather-match'],
    goals: [
      'Nomear objectos do quotidiano',
      'Agrupar palavras por categoria',
      'Usar adjectivos para descrever',
      'Compreender opostos (grande/pequeno)',
    ],
  },
  {
    id: 'articulation-phonology',
    name: 'Articulação e Fonologia',
    icon: '🔤',
    description: 'Pronunciar sons correctamente, consciência fonológica',
    importance: 'supportive',
    activities: ['syllable-builder', 'phonics', 'poesia-sonora'],
    goals: [
      'Segmentar palavras em sílabas',
      'Identificar sons iniciais e finais',
      'Produzir sons difíceis (/r/, /l/, /s/)',
      'Reconhecer rimas',
    ],
  },
  {
    id: 'prosody-fluency',
    name: 'Prosódia e Fluência',
    icon: '🎵',
    description: 'Entoação, ritmo, volume e fluência da fala',
    importance: 'supportive',
    activities: ['poesia-sonora', 'teatro-vozes', 'music-maker'],
    goals: [
      'Usar entoação adequada (pergunta vs afirmação)',
      'Controlar volume da voz',
      'Manter ritmo na fala',
      'Reduzir pausas excessivas',
    ],
  },
]

export const PROFESSIONAL_TYPES = [
  {
    id: 'speech-therapist',
    name: 'Terapeuta da Fala',
    icon: '🗣️',
    description: 'Comunicação, pragmática, compreensão, construção frásica, narrativa, articulação e prosódia',
    focusCampos: ['campo1', 'campo6', 'campo7', 'campo5'],
    // Todas as actividades relevantes para terapia da fala, organizadas por domínio
    recommendedActivities: [
      // Comunicação funcional
      'emotion-cards', 'sentence-builder',
      // Pragmática social
      'turn-talk', 'social-detective', 'fair-play', 'teatro-vozes',
      // Compreensão auditiva
      'listening-quest', 'read-score', 'contos-vivos', 'fabulas-mundo',
      // Construção frásica + Narrativa
      'story-builder', 'meu-conto', 'sound-story',
      // Vocabulário funcional
      'vocab-match', 'dress-player', 'body-science',
      // Articulação e fonologia
      'syllable-builder', 'phonics', 'poesia-sonora',
      // Prosódia
      'music-maker',
    ],
    assessmentAreas: [
      'Comunicação funcional', 'Pragmática social',
      'Compreensão auditiva', 'Construção frásica',
      'Narrativa', 'Vocabulário funcional',
      'Articulação', 'Consciência fonológica',
      'Prosódia', 'Fluência',
    ],
    domains: SPEECH_THERAPY_DOMAINS,
  },
  {
    id: 'occupational-therapist',
    name: 'Terapeuta Ocupacional',
    icon: '🤲',
    description: 'Motricidade, autonomia, integração sensorial e organização',
    focusCampos: ['campo4'],
    recommendedActivities: [
      'daily-routine', 'time-planner', 'healthy-choices',
      'dress-player', 'color-canvas', 'pattern-art',
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
    description: 'Comportamento, emoções, regulação e desenvolvimento cognitivo',
    focusCampos: ['campo6', 'campo4'],
    recommendedActivities: [
      'emotion-cards', 'fair-play', 'social-detective', 'calm-toolkit',
      'problem-solving', 'turn-talk',
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
    description: 'Aprendizagem adaptada, currículo funcional e generalização',
    focusCampos: ['campo1', 'campo2'],
    recommendedActivities: [
      'vocab-match', 'goal-math', 'read-score', 'patterns',
      'world-explorer', 'sentence-builder', 'listening-quest',
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
 * Template programs reflecting real therapy goals.
 * Speech therapy templates organized by domain, not by tool.
 */
export const PROGRAM_TEMPLATES = [
  // --- Terapia da Fala ---
  {
    id: 'communication-autism',
    name: 'Comunicação Funcional (TEA)',
    professionalType: 'speech-therapist',
    domain: 'functional-communication',
    activities: [
      { activityId: 'emotion-cards', frequency: 'daily', notes: 'Nomear emoções em si e nos outros', targetLevel: 3 },
      { activityId: 'sentence-builder', frequency: 'daily', notes: 'Construir pedidos e frases funcionais', targetLevel: 2 },
      { activityId: 'turn-talk', frequency: '3x-week', notes: 'Praticar turnos de conversa', targetLevel: 2 },
    ],
    goals: [
      'Expressar necessidades usando frases completas',
      'Nomear 4+ emoções em si e nos outros',
      'Iniciar uma interacção comunicativa',
    ],
  },
  {
    id: 'social-pragmatics',
    name: 'Pragmática Social',
    professionalType: 'speech-therapist',
    domain: 'social-pragmatics',
    activities: [
      { activityId: 'social-detective', frequency: 'daily', notes: 'Ler pistas sociais em imagens', targetLevel: 3 },
      { activityId: 'turn-talk', frequency: 'daily', notes: 'Esperar a vez, ouvir o outro', targetLevel: 2 },
      { activityId: 'teatro-vozes', frequency: '3x-week', notes: 'Praticar diálogos em contexto', targetLevel: 2 },
      { activityId: 'fair-play', frequency: 'weekly', notes: 'Resolver situações sociais', targetLevel: 2 },
    ],
    goals: [
      'Esperar a vez em 80% das interacções',
      'Interpretar expressões faciais básicas',
      'Usar saudações adequadas ao contexto',
    ],
  },
  {
    id: 'comprehension-narrative',
    name: 'Compreensão e Narrativa',
    professionalType: 'speech-therapist',
    domain: 'auditory-comprehension',
    activities: [
      { activityId: 'listening-quest', frequency: 'daily', notes: 'Seguir instruções de 2-3 passos', targetLevel: 2 },
      { activityId: 'contos-vivos', frequency: '3x-week', notes: 'Ouvir e responder sobre história', targetLevel: 3 },
      { activityId: 'story-builder', frequency: '3x-week', notes: 'Sequenciar e contar uma história', targetLevel: 2 },
    ],
    goals: [
      'Seguir instruções de 2 passos sem repetição',
      'Responder a perguntas quem/o quê/onde',
      'Recontar uma história com 3 eventos em sequência',
    ],
  },
  {
    id: 'sentence-expansion',
    name: 'Construção Frásica',
    professionalType: 'speech-therapist',
    domain: 'sentence-building',
    activities: [
      { activityId: 'sentence-builder', frequency: 'daily', notes: 'Ordenar palavras, expandir frases', targetLevel: 2 },
      { activityId: 'meu-conto', frequency: '3x-week', notes: 'Construir frases dentro de histórias', targetLevel: 2 },
      { activityId: 'vocab-match', frequency: '3x-week', notes: 'Vocabulário para usar em frases', targetLevel: 3 },
    ],
    goals: [
      'Produzir frases SVO de forma consistente',
      'Usar conectores (e, mas, porque) em frases',
      'Descrever uma imagem com 2+ frases',
    ],
  },
  {
    id: 'articulation-phonology',
    name: 'Articulação e Fonologia',
    professionalType: 'speech-therapist',
    domain: 'articulation-phonology',
    activities: [
      { activityId: 'syllable-builder', frequency: 'daily', notes: 'Segmentação e construção silábica', targetLevel: 3 },
      { activityId: 'phonics', frequency: '3x-week', notes: 'Sons iniciais e finais', targetLevel: 2 },
      { activityId: 'poesia-sonora', frequency: 'weekly', notes: 'Rimas e padrões sonoros', targetLevel: 2 },
    ],
    goals: [
      'Segmentar palavras em sílabas correctamente',
      'Identificar sons iniciais em palavras',
      'Produzir sons-alvo em palavras simples',
    ],
  },
  // --- Psicologia ---
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
  // --- Terapia Ocupacional ---
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
  // --- Educação Especial ---
  {
    id: 'literacy-numeracy',
    name: 'Literacia e Numeracia',
    professionalType: 'special-educator',
    activities: [
      { activityId: 'vocab-match', frequency: 'daily', notes: 'Vocabulário funcional', targetLevel: 3 },
      { activityId: 'goal-math', frequency: 'daily', notes: 'Operações até 10', targetLevel: 2 },
      { activityId: 'sentence-builder', frequency: '3x-week', notes: 'Construção frásica funcional', targetLevel: 2 },
    ],
    goals: ['Ler 20 palavras funcionais', 'Resolver adições até 10', 'Construir frases simples'],
  },
]

export function getProfessionalType(id) {
  return PROFESSIONAL_TYPES.find((p) => p.id === id)
}

export function getTemplatesForProfessional(professionalTypeId) {
  return PROGRAM_TEMPLATES.filter((t) => t.professionalType === professionalTypeId)
}

/**
 * Get all speech therapy domains with their activities.
 */
export function getSpeechTherapyDomains() {
  return SPEECH_THERAPY_DOMAINS
}

/**
 * Find which therapy domain(s) an activity belongs to.
 */
export function getDomainsForActivity(activityId) {
  return SPEECH_THERAPY_DOMAINS.filter((d) => d.activities.includes(activityId))
}
