/**
 * Syllable data for Portuguese speech therapy (Terapia da Fala).
 *
 * Based on the "Método das 28 Palavras" and progressive phonological
 * awareness development. Organized by mastery level.
 *
 * Exercise types:
 *   1. syllable-id    — "Começa com..." (identify starting syllable)
 *   2. word-complete  — "_BO" (complete the word with the right syllable)
 *   3. syllable-build — Join syllables to form a word
 *   4. syllable-split — Break a word into its syllables
 *   5. syllable-swap  — Change a syllable to make a new word
 */

// Core syllables used across levels
export const SYLLABLES = {
  open: ['BA', 'BE', 'BI', 'BO', 'BU', 'CA', 'CO', 'CU', 'DA', 'DE', 'DI', 'DO', 'DU',
    'FA', 'FE', 'FI', 'FO', 'FU', 'GA', 'GO', 'GU', 'JA', 'JE', 'JO',
    'LA', 'LE', 'LI', 'LO', 'LU', 'MA', 'ME', 'MI', 'MO', 'MU',
    'NA', 'NE', 'NI', 'NO', 'NU', 'PA', 'PE', 'PI', 'PO', 'PU',
    'RA', 'RE', 'RI', 'RO', 'RU', 'SA', 'SE', 'SI', 'SO', 'SU',
    'TA', 'TE', 'TI', 'TO', 'TU', 'VA', 'VE', 'VI', 'VO', 'VU',
    'ZA', 'ZE', 'ZI'],
  nasal: ['MÃ', 'MÃO', 'NÃO', 'LÃ', 'PÃO', 'CÃO', 'LÃO', 'TÃO', 'BÃO'],
  complex: ['BRA', 'BRE', 'BRI', 'BRO', 'BRU', 'CRA', 'CRE', 'CRI',
    'DRA', 'DRE', 'DRI', 'FRA', 'FRE', 'FRI', 'GRA', 'GRE', 'GRI',
    'PRA', 'PRE', 'PRI', 'PRO', 'TRA', 'TRE', 'TRI'],
}

/**
 * Words organized by level (1-10).
 * Each word has: word, syllables[], emoji, category.
 *
 * Level 1-2: Simple 2-syllable words (CVCV pattern)
 * Level 3-4: Common 2-3 syllable words
 * Level 5-6: Words with nasal syllables, digraphs
 * Level 7-8: Complex syllables (CCV), 3+ syllable words
 * Level 9-10: Multi-syllable words, less common patterns
 */
export const WORDS = [
  // Level 1 — Very basic, familiar words (2 syllables, open syllables)
  { word: 'BOLA', syllables: ['BO', 'LA'], emoji: '⚽', minLevel: 1, category: 'objectos' },
  { word: 'CASA', syllables: ['CA', 'SA'], emoji: '🏠', minLevel: 1, category: 'lugares' },
  { word: 'GATO', syllables: ['GA', 'TO'], emoji: '🐱', minLevel: 1, category: 'animais' },
  { word: 'PATO', syllables: ['PA', 'TO'], emoji: '🦆', minLevel: 1, category: 'animais' },
  { word: 'MALA', syllables: ['MA', 'LA'], emoji: '💼', minLevel: 1, category: 'objectos' },
  { word: 'SAPO', syllables: ['SA', 'PO'], emoji: '🐸', minLevel: 1, category: 'animais' },
  { word: 'DADO', syllables: ['DA', 'DO'], emoji: '🎲', minLevel: 1, category: 'objectos' },
  { word: 'LATA', syllables: ['LA', 'TA'], emoji: '🥫', minLevel: 1, category: 'objectos' },
  { word: 'RODA', syllables: ['RO', 'DA'], emoji: '🛞', minLevel: 1, category: 'objectos' },
  { word: 'VELA', syllables: ['VE', 'LA'], emoji: '🕯️', minLevel: 1, category: 'objectos' },

  // Level 2 — More familiar words (still 2 syllables)
  { word: 'BOTA', syllables: ['BO', 'TA'], emoji: '🥾', minLevel: 2, category: 'roupa' },
  { word: 'MESA', syllables: ['ME', 'SA'], emoji: '🪑', minLevel: 2, category: 'objectos' },
  { word: 'FACA', syllables: ['FA', 'CA'], emoji: '🔪', minLevel: 2, category: 'objectos' },
  { word: 'LUVA', syllables: ['LU', 'VA'], emoji: '🧤', minLevel: 2, category: 'roupa' },
  { word: 'MOLA', syllables: ['MO', 'LA'], emoji: '📎', minLevel: 2, category: 'objectos' },
  { word: 'SOPA', syllables: ['SO', 'PA'], emoji: '🍲', minLevel: 2, category: 'comida' },
  { word: 'LOBO', syllables: ['LO', 'BO'], emoji: '🐺', minLevel: 2, category: 'animais' },
  { word: 'TUBO', syllables: ['TU', 'BO'], emoji: '🧪', minLevel: 2, category: 'objectos' },
  { word: 'FIGO', syllables: ['FI', 'GO'], emoji: '🍇', minLevel: 2, category: 'comida' },
  { word: 'LAGO', syllables: ['LA', 'GO'], emoji: '🏞️', minLevel: 2, category: 'lugares' },

  // Level 3 — 3-syllable words (simple patterns)
  { word: 'BANANA', syllables: ['BA', 'NA', 'NA'], emoji: '🍌', minLevel: 3, category: 'comida' },
  { word: 'BATATA', syllables: ['BA', 'TA', 'TA'], emoji: '🥔', minLevel: 3, category: 'comida' },
  { word: 'BONECA', syllables: ['BO', 'NE', 'CA'], emoji: '🧸', minLevel: 3, category: 'objectos' },
  { word: 'SAPATO', syllables: ['SA', 'PA', 'TO'], emoji: '👟', minLevel: 3, category: 'roupa' },
  { word: 'CAVALO', syllables: ['CA', 'VA', 'LO'], emoji: '🐴', minLevel: 3, category: 'animais' },
  { word: 'MACACO', syllables: ['MA', 'CA', 'CO'], emoji: '🐒', minLevel: 3, category: 'animais' },
  { word: 'TOMATE', syllables: ['TO', 'MA', 'TE'], emoji: '🍅', minLevel: 3, category: 'comida' },
  { word: 'PANELA', syllables: ['PA', 'NE', 'LA'], emoji: '🍳', minLevel: 3, category: 'objectos' },

  // Level 4 — Words with more variety
  { word: 'MENINA', syllables: ['ME', 'NI', 'NA'], emoji: '👧', minLevel: 4, category: 'pessoas' },
  { word: 'MENINO', syllables: ['ME', 'NI', 'NO'], emoji: '👦', minLevel: 4, category: 'pessoas' },
  { word: 'JANELA', syllables: ['JA', 'NE', 'LA'], emoji: '🪟', minLevel: 4, category: 'objectos' },
  { word: 'GALINHA', syllables: ['GA', 'LI', 'NHA'], emoji: '🐔', minLevel: 4, category: 'animais' },
  { word: 'CAMISA', syllables: ['CA', 'MI', 'SA'], emoji: '👕', minLevel: 4, category: 'roupa' },
  { word: 'GELADO', syllables: ['GE', 'LA', 'DO'], emoji: '🍦', minLevel: 4, category: 'comida' },
  { word: 'VIOLA', syllables: ['VI', 'O', 'LA'], emoji: '🎸', minLevel: 4, category: 'objectos' },
  { word: 'RAPOSA', syllables: ['RA', 'PO', 'SA'], emoji: '🦊', minLevel: 4, category: 'animais' },

  // Level 5 — Nasal vowels and digraphs
  { word: 'MAMÃ', syllables: ['MA', 'MÃ'], emoji: '👩', minLevel: 5, category: 'pessoas' },
  { word: 'LIMÃO', syllables: ['LI', 'MÃO'], emoji: '🍋', minLevel: 5, category: 'comida' },
  { word: 'MELÃO', syllables: ['ME', 'LÃO'], emoji: '🍈', minLevel: 5, category: 'comida' },
  { word: 'BALÃO', syllables: ['BA', 'LÃO'], emoji: '🎈', minLevel: 5, category: 'objectos' },
  { word: 'LEQUE', syllables: ['LE', 'QUE'], emoji: '🪭', minLevel: 5, category: 'objectos' },
  { word: 'COELHO', syllables: ['CO', 'E', 'LHO'], emoji: '🐰', minLevel: 5, category: 'animais' },
  { word: 'ABELHA', syllables: ['A', 'BE', 'LHA'], emoji: '🐝', minLevel: 5, category: 'animais' },
  { word: 'FOLHA', syllables: ['FO', 'LHA'], emoji: '🍃', minLevel: 5, category: 'natureza' },

  // Level 6 — More complex patterns
  { word: 'TELHADO', syllables: ['TE', 'LHA', 'DO'], emoji: '🏠', minLevel: 6, category: 'lugares' },
  { word: 'COZINHA', syllables: ['CO', 'ZI', 'NHA'], emoji: '🍽️', minLevel: 6, category: 'lugares' },
  { word: 'CASTELO', syllables: ['CAS', 'TE', 'LO'], emoji: '🏰', minLevel: 6, category: 'lugares' },
  { word: 'PALHAÇO', syllables: ['PA', 'LHA', 'ÇO'], emoji: '🤡', minLevel: 6, category: 'pessoas' },
  { word: 'BORRACHA', syllables: ['BOR', 'RA', 'CHA'], emoji: '📏', minLevel: 6, category: 'objectos' },
  { word: 'CENOURA', syllables: ['CE', 'NOU', 'RA'], emoji: '🥕', minLevel: 6, category: 'comida' },
  { word: 'TARTARUGA', syllables: ['TAR', 'TA', 'RU', 'GA'], emoji: '🐢', minLevel: 6, category: 'animais' },

  // Level 7 — Complex clusters (CCV)
  { word: 'BRUXA', syllables: ['BRU', 'XA'], emoji: '🧙', minLevel: 7, category: 'pessoas' },
  { word: 'DRAGÃO', syllables: ['DRA', 'GÃO'], emoji: '🐉', minLevel: 7, category: 'animais' },
  { word: 'FRALDA', syllables: ['FRAL', 'DA'], emoji: '👶', minLevel: 7, category: 'objectos' },
  { word: 'GRILO', syllables: ['GRI', 'LO'], emoji: '🦗', minLevel: 7, category: 'animais' },
  { word: 'PRATO', syllables: ['PRA', 'TO'], emoji: '🍽️', minLevel: 7, category: 'objectos' },
  { word: 'TRATOR', syllables: ['TRA', 'TOR'], emoji: '🚜', minLevel: 7, category: 'objectos' },
  { word: 'PRINCESA', syllables: ['PRIN', 'CE', 'SA'], emoji: '👸', minLevel: 7, category: 'pessoas' },
  { word: 'ZEBRA', syllables: ['ZE', 'BRA'], emoji: '🦓', minLevel: 7, category: 'animais' },

  // Level 8 — Multi-syllable with mixed complexity
  { word: 'BORBOLETA', syllables: ['BOR', 'BO', 'LE', 'TA'], emoji: '🦋', minLevel: 8, category: 'animais' },
  { word: 'CHOCOLATE', syllables: ['CHO', 'CO', 'LA', 'TE'], emoji: '🍫', minLevel: 8, category: 'comida' },
  { word: 'CROCODILO', syllables: ['CRO', 'CO', 'DI', 'LO'], emoji: '🐊', minLevel: 8, category: 'animais' },
  { word: 'ELEFANTE', syllables: ['E', 'LE', 'FAN', 'TE'], emoji: '🐘', minLevel: 8, category: 'animais' },
  { word: 'GIRAFA', syllables: ['GI', 'RA', 'FA'], emoji: '🦒', minLevel: 8, category: 'animais' },
  { word: 'DINOSSAURO', syllables: ['DI', 'NOS', 'SAU', 'RO'], emoji: '🦕', minLevel: 8, category: 'animais' },

  // Level 9 — Advanced words
  { word: 'FRIGORÍFICO', syllables: ['FRI', 'GO', 'RÍ', 'FI', 'CO'], emoji: '🧊', minLevel: 9, category: 'objectos' },
  { word: 'ESTRELINHA', syllables: ['ES', 'TRE', 'LI', 'NHA'], emoji: '⭐', minLevel: 9, category: 'natureza' },
  { word: 'AMBULÂNCIA', syllables: ['AM', 'BU', 'LÂN', 'CI', 'A'], emoji: '🚑', minLevel: 9, category: 'objectos' },
  { word: 'COMPUTADOR', syllables: ['COM', 'PU', 'TA', 'DOR'], emoji: '💻', minLevel: 9, category: 'objectos' },
  { word: 'FUTEBOLISTA', syllables: ['FU', 'TE', 'BO', 'LIS', 'TA'], emoji: '⚽', minLevel: 9, category: 'pessoas' },

  // Level 10 — Expert level
  { word: 'UNIVERSIDADE', syllables: ['U', 'NI', 'VER', 'SI', 'DA', 'DE'], emoji: '🎓', minLevel: 10, category: 'lugares' },
  { word: 'HIPOPÓTAMO', syllables: ['HI', 'PO', 'PÓ', 'TA', 'MO'], emoji: '🦛', minLevel: 10, category: 'animais' },
  { word: 'ELECTRICIDADE', syllables: ['E', 'LEC', 'TRI', 'CI', 'DA', 'DE'], emoji: '⚡', minLevel: 10, category: 'natureza' },
  { word: 'SUPERMERCADO', syllables: ['SU', 'PER', 'MER', 'CA', 'DO'], emoji: '🛒', minLevel: 10, category: 'lugares' },
]

/**
 * Get words available at a given competency level.
 */
export function getWordsForLevel(level) {
  return WORDS.filter((w) => w.minLevel <= level)
}

/**
 * Generate a "Começa com..." exercise.
 * Given a word, show 4 syllable options — which one starts the word?
 */
export function generateStartsWith(word, allWords, choiceCount = 4) {
  const correct = word.syllables[0]
  const distractors = new Set()

  // Get syllables from other words at same level
  for (const w of allWords) {
    if (w.word !== word.word && w.syllables[0] !== correct) {
      distractors.add(w.syllables[0])
    }
    if (distractors.size >= choiceCount - 1) break
  }

  // Fill with random syllables if needed
  while (distractors.size < choiceCount - 1) {
    const s = SYLLABLES.open[Math.floor(Math.random() * SYLLABLES.open.length)]
    if (s !== correct) distractors.add(s)
  }

  return {
    type: 'syllable-id',
    word: word.word,
    emoji: word.emoji,
    instruction: `Começa com...`,
    correct,
    options: shuffle([correct, ...Array.from(distractors).slice(0, choiceCount - 1)]),
  }
}

/**
 * Generate a word completion exercise.
 * Show partial word with one syllable missing, child picks the right one.
 */
export function generateWordComplete(word, allWords, choiceCount = 4) {
  const syllables = word.syllables
  // Pick a random position to remove
  const removeIdx = Math.floor(Math.random() * syllables.length)
  const correct = syllables[removeIdx]

  // Build display: syllables with one replaced by "___"
  const display = syllables.map((s, i) => (i === removeIdx ? '___' : s)).join(' · ')

  const distractors = new Set()
  for (const w of allWords) {
    for (const s of w.syllables) {
      if (s !== correct) distractors.add(s)
    }
    if (distractors.size >= choiceCount * 2) break
  }

  return {
    type: 'word-complete',
    word: word.word,
    emoji: word.emoji,
    display,
    instruction: `Completa a palavra`,
    correct,
    removeIdx,
    options: shuffle([correct, ...Array.from(distractors).slice(0, choiceCount - 1)]),
  }
}

/**
 * Generate a syllable building exercise.
 * Show the word's emoji and name, child must tap syllables in order.
 */
export function generateSyllableBuild(word, allWords) {
  const correct = word.syllables
  const extras = new Set()

  for (const w of allWords) {
    for (const s of w.syllables) {
      if (!correct.includes(s)) extras.add(s)
    }
    if (extras.size >= 3) break
  }

  // Mix correct syllables with 2-3 distractors
  const distractorCount = Math.min(3, extras.size)
  const pool = shuffle([...correct, ...Array.from(extras).slice(0, distractorCount)])

  return {
    type: 'syllable-build',
    word: word.word,
    emoji: word.emoji,
    instruction: `Constrói a palavra`,
    correctOrder: correct,
    pool,
  }
}

/**
 * Generate a syllable splitting exercise.
 * Show the word, child must identify how many syllables it has.
 */
export function generateSyllableSplit(word) {
  const correct = word.syllables.length
  const options = shuffle([
    correct,
    Math.max(1, correct - 1),
    correct + 1,
    Math.max(1, correct + 2),
  ].filter((v, i, a) => a.indexOf(v) === i)) // unique values

  return {
    type: 'syllable-split',
    word: word.word,
    emoji: word.emoji,
    instruction: `Quantas sílabas tem?`,
    correct,
    syllables: word.syllables,
    options: options.slice(0, 4),
  }
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
