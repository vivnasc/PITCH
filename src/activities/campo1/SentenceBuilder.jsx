import { useState, useCallback, useMemo } from 'react'
import ActivityShell from '../../components/ActivityShell'
import FeedbackMessage from '../../components/FeedbackMessage'
import CompletionCelebration from '../../components/CompletionCelebration'

/**
 * SentenceBuilder — Construção Frásica
 *
 * Core speech therapy activity: NOT syllables, but building SENTENCES.
 * Exercises:
 * 1. word-order: Arrange shuffled words into a correct sentence
 * 2. fill-gap: Complete a sentence with the missing word
 * 3. expand: Add a detail to make a simple sentence richer
 * 4. describe: Build a sentence to describe an image/scene
 *
 * Targets: SVO structure, connectors (e, mas, porque),
 * functional phrases (requests, descriptions, feelings).
 */

// Sentence data organized by level and type
const SENTENCES = {
  // Level 1-2: 2-3 word sentences, basic SVO
  basic: [
    { words: ['O', 'gato', 'dorme'], image: '🐱💤', type: 'statement' },
    { words: ['A', 'menina', 'corre'], image: '🏃‍♀️', type: 'statement' },
    { words: ['O', 'cão', 'ladra'], image: '🐕🗣️', type: 'statement' },
    { words: ['Eu', 'quero', 'água'], image: '💧', type: 'request' },
    { words: ['Eu', 'gosto', 'de', 'bola'], image: '⚽', type: 'preference' },
    { words: ['O', 'pássaro', 'voa'], image: '🐦', type: 'statement' },
    { words: ['A', 'bola', 'é', 'vermelha'], image: '🔴⚽', type: 'description' },
    { words: ['O', 'sol', 'brilha'], image: '☀️', type: 'statement' },
    { words: ['Eu', 'estou', 'feliz'], image: '😊', type: 'feeling' },
    { words: ['Eu', 'tenho', 'fome'], image: '🍽️', type: 'need' },
  ],
  // Level 3-4: 3-5 word sentences with articles and prepositions
  intermediate: [
    { words: ['O', 'menino', 'come', 'uma', 'maçã'], image: '👦🍎', type: 'statement' },
    { words: ['A', 'mãe', 'lê', 'um', 'livro'], image: '👩📖', type: 'statement' },
    { words: ['Eu', 'quero', 'ir', 'ao', 'parque'], image: '🌳🎠', type: 'request' },
    { words: ['O', 'gato', 'está', 'na', 'mesa'], image: '🐱🪑', type: 'description' },
    { words: ['Eu', 'estou', 'triste', 'porque', 'choveu'], image: '😢🌧️', type: 'feeling' },
    { words: ['A', 'bola', 'está', 'debaixo', 'da', 'cadeira'], image: '⚽🪑', type: 'description' },
    { words: ['Eu', 'não', 'gosto', 'de', 'espinafres'], image: '🥬😣', type: 'preference' },
    { words: ['O', 'pai', 'cozinha', 'o', 'jantar'], image: '👨‍🍳🍲', type: 'statement' },
    { words: ['O', 'bebé', 'chora', 'porque', 'tem', 'sono'], image: '👶😢', type: 'cause' },
    { words: ['Eu', 'preciso', 'de', 'ajuda'], image: '🙋', type: 'request' },
  ],
  // Level 5-6: Compound sentences, connectors
  advanced: [
    { words: ['O', 'menino', 'come', 'e', 'bebe', 'água'], image: '👦🍎💧', type: 'compound' },
    { words: ['Eu', 'quero', 'brincar', 'mas', 'está', 'a', 'chover'], image: '🎮🌧️', type: 'contrast' },
    { words: ['Ela', 'está', 'feliz', 'porque', 'ganhou', 'o', 'jogo'], image: '😊🏆', type: 'cause' },
    { words: ['Vamos', 'ao', 'parque', 'e', 'depois', 'comemos', 'gelado'], image: '🌳🍦', type: 'sequence' },
    { words: ['O', 'cão', 'é', 'grande', 'mas', 'é', 'meigo'], image: '🐕💛', type: 'contrast' },
    { words: ['Eu', 'gosto', 'de', 'futebol', 'porque', 'é', 'divertido'], image: '⚽😄', type: 'cause' },
    { words: ['Primeiro', 'lavo', 'as', 'mãos', 'depois', 'como'], image: '🧼🍽️', type: 'sequence' },
    { words: ['Posso', 'jogar', 'se', 'acabar', 'os', 'trabalhos'], image: '📝🎮', type: 'condition' },
  ],
  // Level 7+: Complex sentences with time, place, reason
  complex: [
    { words: ['Ontem', 'fui', 'ao', 'parque', 'e', 'brinquei', 'com', 'os', 'amigos'], image: '🌳👫', type: 'narrative' },
    { words: ['Amanhã', 'vou', 'à', 'escola', 'porque', 'é', 'segunda-feira'], image: '🏫📅', type: 'cause' },
    { words: ['Eu', 'prefiro', 'pizza', 'mas', 'a', 'mãe', 'fez', 'sopa'], image: '🍕🍲', type: 'contrast' },
    { words: ['Quando', 'chove', 'eu', 'fico', 'em', 'casa', 'a', 'ler'], image: '🌧️📖', type: 'condition' },
    { words: ['O', 'meu', 'amigo', 'está', 'doente', 'por', 'isso', 'não', 'veio'], image: '🤒😔', type: 'cause' },
  ],
}

// Fill-the-gap exercises
const FILL_GAP = {
  basic: [
    { sentence: 'O gato ___ leite', gap: 'bebe', options: ['bebe', 'voa', 'canta'], image: '🐱🥛' },
    { sentence: 'Eu ___ feliz', gap: 'estou', options: ['estou', 'como', 'corro'], image: '😊' },
    { sentence: 'A bola é ___', gap: 'redonda', options: ['redonda', 'alta', 'quente'], image: '⚽' },
    { sentence: 'O sol ___ no céu', gap: 'brilha', options: ['brilha', 'nada', 'come'], image: '☀️' },
    { sentence: 'Eu ___ brincar', gap: 'quero', options: ['quero', 'durmo', 'chovo'], image: '🎮' },
    { sentence: 'A mãe ___ um abraço', gap: 'dá', options: ['dá', 'voa', 'chove'], image: '🤗' },
  ],
  intermediate: [
    { sentence: 'O menino come porque tem ___', gap: 'fome', options: ['fome', 'sono', 'medo'], image: '👦🍽️' },
    { sentence: 'Eu vou ao parque ___ jogar', gap: 'para', options: ['para', 'sem', 'contra'], image: '🌳⚽' },
    { sentence: 'A menina está triste ___ perdeu o jogo', gap: 'porque', options: ['porque', 'e', 'ou'], image: '😢🎮' },
    { sentence: 'Eu gosto de gatos ___ de cães', gap: 'e', options: ['e', 'sem', 'contra'], image: '🐱🐕' },
    { sentence: 'Vamos brincar ___ chover', gap: 'se', options: ['se', 'com', 'por'], image: '🎮🌧️' },
    { sentence: 'Ele ___ a bola para o amigo', gap: 'passa', options: ['passa', 'come', 'dorme'], image: '⚽👫' },
  ],
  advanced: [
    { sentence: 'Ontem fui ao cinema ___ vi um filme engraçado', gap: 'e', options: ['e', 'mas', 'sem'], image: '🎬😄' },
    { sentence: 'Eu queria jogar ___ tinha trabalhos para fazer', gap: 'mas', options: ['mas', 'e', 'porque'], image: '🎮📝' },
    { sentence: '___ acabar de comer, vou escovar os dentes', gap: 'Depois de', options: ['Depois de', 'Antes de', 'Em vez de'], image: '🍽️🪥' },
    { sentence: 'O jogo foi adiado ___ estava a chover muito', gap: 'porque', options: ['porque', 'e', 'quando'], image: '⚽🌧️' },
  ],
}

// Sentence expansion exercises: start simple, add details
const EXPAND = {
  basic: [
    { base: 'O gato dorme', target: 'O gato dorme na almofada', addWord: 'na almofada', image: '🐱🛏️', hint: 'Onde?' },
    { base: 'A menina brinca', target: 'A menina brinca no jardim', addWord: 'no jardim', image: '👧🌳', hint: 'Onde?' },
    { base: 'Eu como', target: 'Eu como uma maçã', addWord: 'uma maçã', image: '🍎', hint: 'O quê?' },
    { base: 'O cão corre', target: 'O cão corre rápido', addWord: 'rápido', image: '🐕💨', hint: 'Como?' },
    { base: 'Eu estou feliz', target: 'Eu estou muito feliz', addWord: 'muito', image: '😊', hint: 'Quanto?' },
  ],
  intermediate: [
    { base: 'O menino come', target: 'O menino come um bolo de chocolate', addWord: 'um bolo de chocolate', image: '👦🍫', hint: 'O quê?' },
    { base: 'A mãe lê', target: 'A mãe lê uma história à noite', addWord: 'uma história à noite', image: '👩📖🌙', hint: 'O quê e quando?' },
    { base: 'Eu brinco', target: 'Eu brinco com o meu amigo no parque', addWord: 'com o meu amigo no parque', image: '👫🌳', hint: 'Com quem e onde?' },
  ],
}

// Describe scene exercises
const DESCRIBE = [
  { image: '👦⚽🌳', hint: 'Quem? Faz o quê? Onde?', example: 'O menino joga à bola no parque' },
  { image: '👧📖🛋️', hint: 'Quem? Faz o quê? Onde?', example: 'A menina lê um livro no sofá' },
  { image: '🐱🥛🏠', hint: 'Quem? Faz o quê? Onde?', example: 'O gato bebe leite em casa' },
  { image: '👨‍🍳🍳🔥', hint: 'Quem? Faz o quê?', example: 'O pai cozinha ovos na frigideira' },
  { image: '🌧️☂️😢', hint: 'O que acontece? Como se sente?', example: 'Está a chover e ele está triste' },
  { image: '☀️🏖️😊', hint: 'Como está o tempo? O que fazem?', example: 'Está sol e vão à praia' },
  { image: '👩‍🏫📝👧', hint: 'Quem? Faz o quê? Com quem?', example: 'A professora ensina a menina a escrever' },
  { image: '🐕🦴🏡', hint: 'Quem? Faz o quê? Onde?', example: 'O cão come um osso no jardim' },
]

function getLevelData(campoLevel) {
  if (campoLevel <= 2) return 'basic'
  if (campoLevel <= 4) return 'intermediate'
  if (campoLevel <= 6) return 'advanced'
  return 'complex'
}

function getExerciseTypes(campoLevel) {
  if (campoLevel <= 2) return ['word-order', 'fill-gap']
  if (campoLevel <= 4) return ['word-order', 'fill-gap', 'expand']
  return ['word-order', 'fill-gap', 'expand', 'describe']
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function generateRound(campoLevel, usedSentences) {
  const level = getLevelData(campoLevel)
  const types = getExerciseTypes(campoLevel)
  const type = types[Math.floor(Math.random() * types.length)]

  if (type === 'word-order') {
    const pool = SENTENCES[level] || SENTENCES.basic
    const available = pool.filter((s) => !usedSentences.has(s.words.join(' ')))
    const sentence = available.length > 0
      ? available[Math.floor(Math.random() * available.length)]
      : pool[Math.floor(Math.random() * pool.length)]
    return {
      type: 'word-order',
      sentence,
      shuffled: shuffle(sentence.words),
      correct: sentence.words,
    }
  }

  if (type === 'fill-gap') {
    const pool = FILL_GAP[level] || FILL_GAP.basic
    const item = pool[Math.floor(Math.random() * pool.length)]
    return {
      type: 'fill-gap',
      ...item,
      shuffledOptions: shuffle(item.options),
    }
  }

  if (type === 'expand') {
    const pool = EXPAND[level] || EXPAND.basic
    const item = pool[Math.floor(Math.random() * pool.length)]
    return {
      type: 'expand',
      ...item,
    }
  }

  // describe
  const scene = DESCRIBE[Math.floor(Math.random() * DESCRIBE.length)]
  return {
    type: 'describe',
    ...scene,
  }
}

export default function SentenceBuilder(props) {
  const {
    completeActivity,
    registerClick,
    registerError,
    registerSuccess,
    adaptive,
    soundEnabled,
    progress,
  } = props

  const campoLevel = adaptive?.campoLevels?.campo1 || 1
  const questionsPerRound = campoLevel <= 3 ? 5 : 6

  const [round, setRound] = useState(0)
  const [score, setScore] = useState(0)
  const [feedback, setFeedback] = useState(null)
  const [completed, setCompleted] = useState(false)
  const [usedSentences] = useState(() => new Set())

  // Current exercise
  const [exercise, setExercise] = useState(() => generateRound(campoLevel, usedSentences))

  // Word-order state
  const [selectedWords, setSelectedWords] = useState([])
  const [availableWords, setAvailableWords] = useState(() =>
    exercise.type === 'word-order' ? exercise.shuffled.map((w, i) => ({ word: w, id: i })) : []
  )

  // Expand state
  const [expandChoice, setExpandChoice] = useState(null)

  const nextExercise = useCallback(() => {
    const next = generateRound(campoLevel, usedSentences)
    setExercise(next)
    setSelectedWords([])
    setAvailableWords(
      next.type === 'word-order' ? next.shuffled.map((w, i) => ({ word: w, id: i })) : []
    )
    setExpandChoice(null)
    setFeedback(null)
    setRound((r) => r + 1)
  }, [campoLevel, usedSentences])

  const handleComplete = useCallback(() => {
    const stars = score >= questionsPerRound ? 3 : score >= questionsPerRound * 0.6 ? 2 : 1
    completeActivity?.('sentence-builder', stars)
    setCompleted(true)
  }, [score, questionsPerRound, completeActivity])

  // Word-order: tap a word to add it to sentence
  const handleWordSelect = useCallback((wordObj) => {
    registerClick?.()
    const newSelected = [...selectedWords, wordObj]
    const newAvailable = availableWords.filter((w) => w.id !== wordObj.id)
    setSelectedWords(newSelected)
    setAvailableWords(newAvailable)

    // Check if all words placed
    if (newSelected.length === exercise.correct.length) {
      const attempt = newSelected.map((w) => w.word)
      const isCorrect = attempt.join(' ') === exercise.correct.join(' ')

      if (isCorrect) {
        usedSentences.add(exercise.correct.join(' '))
        registerSuccess?.()
        setScore((s) => s + 1)
        setFeedback({ correct: true })
        setTimeout(() => {
          if (round + 1 >= questionsPerRound) handleComplete()
          else nextExercise()
        }, 1500)
      } else {
        registerError?.()
        setFeedback({ correct: false })
        // Reset after showing error
        setTimeout(() => {
          setSelectedWords([])
          setAvailableWords(exercise.shuffled.map((w, i) => ({ word: w, id: i })))
          setFeedback(null)
        }, 1500)
      }
    }
  }, [selectedWords, availableWords, exercise, registerClick, registerSuccess, registerError, usedSentences, round, questionsPerRound, handleComplete, nextExercise])

  // Word-order: tap a placed word to remove it
  const handleWordRemove = useCallback((wordObj, idx) => {
    setSelectedWords((prev) => prev.filter((_, i) => i !== idx))
    setAvailableWords((prev) => [...prev, wordObj])
  }, [])

  // Fill-gap: select answer
  const handleGapSelect = useCallback((option) => {
    registerClick?.()
    const isCorrect = option === exercise.gap
    if (isCorrect) {
      registerSuccess?.()
      setScore((s) => s + 1)
      setFeedback({ correct: true })
    } else {
      registerError?.()
      setFeedback({ correct: false })
    }
    setTimeout(() => {
      if (round + 1 >= questionsPerRound) handleComplete()
      else nextExercise()
    }, 1500)
  }, [exercise, registerClick, registerSuccess, registerError, round, questionsPerRound, handleComplete, nextExercise])

  // Expand: select correct expansion
  const handleExpandSelect = useCallback((choice) => {
    registerClick?.()
    setExpandChoice(choice)
    const isCorrect = choice === 'correct'
    if (isCorrect) {
      registerSuccess?.()
      setScore((s) => s + 1)
      setFeedback({ correct: true })
    } else {
      registerError?.()
      setFeedback({ correct: false })
    }
    setTimeout(() => {
      if (round + 1 >= questionsPerRound) handleComplete()
      else nextExercise()
    }, 1500)
  }, [registerClick, registerSuccess, registerError, round, questionsPerRound, handleComplete, nextExercise])

  // Describe: auto-pass (self-assessment)
  const handleDescribeDone = useCallback(() => {
    registerClick?.()
    registerSuccess?.()
    setScore((s) => s + 1)
    setFeedback({ correct: true })
    setTimeout(() => {
      if (round + 1 >= questionsPerRound) handleComplete()
      else nextExercise()
    }, 1500)
  }, [registerClick, registerSuccess, round, questionsPerRound, handleComplete, nextExercise])

  if (completed) {
    const stars = score >= questionsPerRound ? 3 : score >= questionsPerRound * 0.6 ? 2 : 1
    return <CompletionCelebration stars={stars} score={score} total={questionsPerRound} soundEnabled={soundEnabled} />
  }

  const instruction = exercise.type === 'word-order'
    ? 'Arruma as palavras para formar uma frase correcta'
    : exercise.type === 'fill-gap'
    ? 'Completa a frase com a palavra certa'
    : exercise.type === 'expand'
    ? 'Torna a frase mais completa'
    : 'Descreve a imagem com uma frase'

  return (
    <ActivityShell
      title="Construção Frásica"
      icon="📝"
      campo={1}
      score={score}
      total={questionsPerRound}
      round={round}
      instruction={instruction}
      soundEnabled={soundEnabled}
    >
      <div style={styles.container}>
        {/* Scene image */}
        <div style={styles.scene}>
          <span style={styles.sceneEmoji}>{exercise.image}</span>
        </div>

        {/* WORD ORDER */}
        {exercise.type === 'word-order' && (
          <>
            <div style={styles.sentenceSlots}>
              {exercise.correct.map((_, i) => (
                <button
                  key={i}
                  style={{
                    ...styles.slot,
                    ...(selectedWords[i] ? styles.slotFilled : {}),
                    ...(feedback?.correct === true && selectedWords[i] ? styles.slotCorrect : {}),
                    ...(feedback?.correct === false && selectedWords[i] ? styles.slotWrong : {}),
                  }}
                  onClick={() => selectedWords[i] && handleWordRemove(selectedWords[i], i)}
                  disabled={!!feedback}
                >
                  {selectedWords[i]?.word || '___'}
                </button>
              ))}
            </div>
            <div style={styles.wordBank}>
              {availableWords.map((wordObj) => (
                <button
                  key={wordObj.id}
                  style={styles.wordBtn}
                  onClick={() => handleWordSelect(wordObj)}
                  disabled={!!feedback}
                >
                  {wordObj.word}
                </button>
              ))}
            </div>
          </>
        )}

        {/* FILL GAP */}
        {exercise.type === 'fill-gap' && (
          <>
            <p style={styles.gapSentence}>
              {exercise.sentence.split('___').map((part, i, arr) => (
                <span key={i}>
                  {part}
                  {i < arr.length - 1 && <span style={styles.gapPlaceholder}>___</span>}
                </span>
              ))}
            </p>
            <div style={styles.options}>
              {exercise.shuffledOptions.map((opt) => (
                <button
                  key={opt}
                  style={{
                    ...styles.optionBtn,
                    ...(feedback && opt === exercise.gap ? styles.optionCorrect : {}),
                    ...(feedback?.correct === false && opt !== exercise.gap ? styles.optionFaded : {}),
                  }}
                  onClick={() => handleGapSelect(opt)}
                  disabled={!!feedback}
                >
                  {opt}
                </button>
              ))}
            </div>
          </>
        )}

        {/* EXPAND */}
        {exercise.type === 'expand' && (
          <>
            <p style={styles.baseSentence}>{exercise.base}</p>
            <p style={styles.expandHint}>{exercise.hint}</p>
            <div style={styles.expandOptions}>
              <button
                style={{
                  ...styles.expandBtn,
                  ...(expandChoice === 'correct' ? styles.expandCorrect : {}),
                }}
                onClick={() => handleExpandSelect('correct')}
                disabled={!!feedback}
              >
                {exercise.target}
              </button>
              <button
                style={{
                  ...styles.expandBtn,
                  ...(expandChoice === 'wrong' ? styles.expandWrong : {}),
                }}
                onClick={() => handleExpandSelect('wrong')}
                disabled={!!feedback}
              >
                {exercise.base}
              </button>
            </div>
          </>
        )}

        {/* DESCRIBE */}
        {exercise.type === 'describe' && (
          <>
            <p style={styles.describeHint}>{exercise.hint}</p>
            <div style={styles.describeArea}>
              <p style={styles.describeExample}>
                Exemplo: "{exercise.example}"
              </p>
              <p style={styles.describeInstruction}>
                Diz a tua frase em voz alta!
              </p>
              <button
                style={styles.describeDoneBtn}
                onClick={handleDescribeDone}
                disabled={!!feedback}
              >
                Disse a frase!
              </button>
            </div>
          </>
        )}

        {feedback && <FeedbackMessage correct={feedback.correct} soundEnabled={soundEnabled} />}
      </div>
    </ActivityShell>
  )
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-md)',
    alignItems: 'center',
    width: '100%',
    maxWidth: '500px',
    margin: '0 auto',
  },
  scene: {
    padding: 'var(--space-md)',
    backgroundColor: 'var(--color-bg)',
    borderRadius: 'var(--radius-lg)',
    textAlign: 'center',
  },
  sceneEmoji: {
    fontSize: '3rem',
    letterSpacing: '4px',
  },
  // Word order
  sentenceSlots: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    justifyContent: 'center',
    padding: 'var(--space-md)',
    backgroundColor: '#E3F2FD',
    borderRadius: 'var(--radius-md)',
    minHeight: '60px',
    width: '100%',
    alignItems: 'center',
  },
  slot: {
    padding: '8px 14px',
    backgroundColor: 'white',
    border: '2px dashed #90CAF9',
    borderRadius: 'var(--radius-md)',
    fontFamily: 'inherit',
    fontSize: 'var(--font-size-base)',
    fontWeight: 600,
    cursor: 'pointer',
    minWidth: '40px',
    textAlign: 'center',
    color: '#90CAF9',
  },
  slotFilled: {
    borderStyle: 'solid',
    borderColor: '#1565C0',
    color: '#1565C0',
    backgroundColor: '#E3F2FD',
  },
  slotCorrect: {
    borderColor: '#2E7D32',
    backgroundColor: '#E8F5E9',
    color: '#2E7D32',
  },
  slotWrong: {
    borderColor: '#C62828',
    backgroundColor: '#FFEBEE',
    color: '#C62828',
    animation: 'gentleShake 0.4s ease',
  },
  wordBank: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    justifyContent: 'center',
    width: '100%',
  },
  wordBtn: {
    padding: '10px 18px',
    backgroundColor: '#1565C0',
    color: 'white',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    fontFamily: 'inherit',
    fontSize: 'var(--font-size-base)',
    fontWeight: 700,
    cursor: 'pointer',
    minHeight: '44px',
  },
  // Fill gap
  gapSentence: {
    fontSize: 'var(--font-size-lg)',
    fontWeight: 600,
    textAlign: 'center',
    lineHeight: 1.6,
    padding: 'var(--space-md)',
  },
  gapPlaceholder: {
    color: '#1565C0',
    fontWeight: 700,
    borderBottom: '3px solid #1565C0',
    padding: '0 8px',
  },
  options: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-sm)',
    width: '100%',
  },
  optionBtn: {
    padding: 'var(--space-md)',
    backgroundColor: 'var(--color-surface)',
    border: '2px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    fontFamily: 'inherit',
    fontSize: 'var(--font-size-base)',
    fontWeight: 600,
    cursor: 'pointer',
    minHeight: '48px',
    textAlign: 'center',
  },
  optionCorrect: {
    borderColor: '#2E7D32',
    backgroundColor: '#E8F5E9',
    color: '#2E7D32',
  },
  optionFaded: {
    opacity: 0.4,
  },
  // Expand
  baseSentence: {
    fontSize: 'var(--font-size-lg)',
    fontWeight: 700,
    textAlign: 'center',
    padding: 'var(--space-sm)',
  },
  expandHint: {
    fontSize: 'var(--font-size-sm)',
    color: '#E65100',
    fontWeight: 600,
    textAlign: 'center',
  },
  expandOptions: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-sm)',
    width: '100%',
  },
  expandBtn: {
    padding: 'var(--space-md)',
    backgroundColor: 'var(--color-surface)',
    border: '2px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    fontFamily: 'inherit',
    fontSize: 'var(--font-size-base)',
    fontWeight: 600,
    cursor: 'pointer',
    minHeight: '48px',
    textAlign: 'center',
  },
  expandCorrect: {
    borderColor: '#2E7D32',
    backgroundColor: '#E8F5E9',
  },
  expandWrong: {
    borderColor: '#C62828',
    backgroundColor: '#FFEBEE',
  },
  // Describe
  describeHint: {
    fontSize: 'var(--font-size-base)',
    fontWeight: 600,
    color: '#E65100',
    textAlign: 'center',
  },
  describeArea: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-md)',
    alignItems: 'center',
    padding: 'var(--space-md)',
    backgroundColor: '#FFF3E0',
    borderRadius: 'var(--radius-md)',
    width: '100%',
  },
  describeExample: {
    fontSize: 'var(--font-size-sm)',
    color: '#757575',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  describeInstruction: {
    fontSize: 'var(--font-size-base)',
    fontWeight: 600,
    textAlign: 'center',
  },
  describeDoneBtn: {
    padding: 'var(--space-md) var(--space-xl)',
    backgroundColor: '#2E7D32',
    color: 'white',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    fontFamily: 'inherit',
    fontSize: 'var(--font-size-base)',
    fontWeight: 700,
    cursor: 'pointer',
    minHeight: '48px',
  },
}
