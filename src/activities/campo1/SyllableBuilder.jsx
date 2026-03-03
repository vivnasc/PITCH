import { useState, useCallback, useMemo, useEffect } from 'react'
import ActivityShell from '../../components/ActivityShell'
import FeedbackMessage from '../../components/FeedbackMessage'
import CompletionCelebration from '../../components/CompletionCelebration'
import OptionCard from '../../components/OptionCard'
import { useTTS } from '../../hooks/useTTS'
import { useHaptics } from '../../hooks/useHaptics'
import {
  getWordsForLevel,
  generateStartsWith,
  generateWordComplete,
  generateSyllableBuild,
  generateSyllableSplit,
} from '../../data/syllables'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * SyllableBuilder — Terapia da Fala (Speech Therapy)
 *
 * Portuguese syllable manipulation activity based on the
 * "Método das 28 Palavras" and phonological awareness development.
 *
 * Exercise types rotate:
 * 1. "Começa com..." — identify the starting syllable
 * 2. Word completion — fill in the missing syllable
 * 3. Syllable building — tap syllables in order to build word
 * 4. Syllable counting — how many syllables?
 *
 * Levels 1-2: simple 2-syllable words, types 1 & 4
 * Levels 3-4: 2-3 syllable words, types 1, 2 & 4
 * Levels 5-6: nasal/digraph words, all types
 * Levels 7+: complex clusters, all types, less help
 */
export default function SyllableBuilder({
  registerClick,
  registerError,
  registerSuccess,
  completeActivity,
  updateCampoProgress,
  adaptive,
}) {
  const { speak } = useTTS()
  const haptics = useHaptics()
  const campoLevel = adaptive?.campoLevel?.campo1 || 1
  const choiceCount = adaptive?.choiceCount || 4

  // Get words for this level
  const words = useMemo(() => {
    const available = getWordsForLevel(campoLevel)
    return shuffle(available).slice(0, 10) // 10 exercises per session
  }, [campoLevel])

  const allWords = useMemo(() => getWordsForLevel(campoLevel), [campoLevel])

  const [exerciseIdx, setExerciseIdx] = useState(0)
  const [score, setScore] = useState(0)
  const [feedback, setFeedback] = useState(null)

  // For syllable-build type: track selected syllables in order
  const [buildSelected, setBuildSelected] = useState([])
  const [buildError, setBuildError] = useState(false)

  // Determine exercise types available at this level
  const availableTypes = useMemo(() => {
    if (campoLevel <= 2) return ['syllable-id', 'syllable-split']
    if (campoLevel <= 4) return ['syllable-id', 'word-complete', 'syllable-split']
    return ['syllable-id', 'word-complete', 'syllable-build', 'syllable-split']
  }, [campoLevel])

  // Generate exercise for current word
  const exercise = useMemo(() => {
    const word = words[exerciseIdx]
    if (!word) return null

    // Rotate through available types
    const typeIdx = exerciseIdx % availableTypes.length
    const type = availableTypes[typeIdx]

    switch (type) {
      case 'syllable-id':
        return generateStartsWith(word, allWords, choiceCount)
      case 'word-complete':
        return generateWordComplete(word, allWords, choiceCount)
      case 'syllable-build':
        return generateSyllableBuild(word, allWords)
      case 'syllable-split':
        return generateSyllableSplit(word)
      default:
        return generateStartsWith(word, allWords, choiceCount)
    }
  }, [exerciseIdx, words, allWords, availableTypes, choiceCount])

  const isComplete = exerciseIdx >= words.length

  // Read instruction aloud
  useEffect(() => {
    if (!isComplete && exercise) {
      const text = exercise.type === 'syllable-build'
        ? `Constrói a palavra ${exercise.word}`
        : exercise.type === 'syllable-split'
          ? `Quantas sílabas tem a palavra ${exercise.word}?`
          : exercise.type === 'word-complete'
            ? `Completa a palavra ${exercise.word}`
            : `${exercise.word}. Começa com qual sílaba?`
      speak(text, { auto: true })
    }
  }, [exerciseIdx]) // eslint-disable-line react-hooks/exhaustive-deps

  // Handle answer for id/complete/split types
  const handleAnswer = useCallback((ans) => {
    registerClick()
    if (ans === exercise.correct) {
      registerSuccess()
      setScore((s) => s + 1)
      setFeedback('success')
      haptics.success()
    } else {
      registerError()
      setFeedback('tryAgain')
      haptics.error()
    }
  }, [exercise, registerClick, registerSuccess, registerError, haptics])

  // Handle syllable tap for build type
  const handleBuildTap = useCallback((syllable, poolIdx) => {
    registerClick()
    const nextExpected = exercise.correctOrder[buildSelected.length]

    if (syllable === nextExpected) {
      const newSelected = [...buildSelected, { syllable, poolIdx }]
      setBuildSelected(newSelected)
      haptics.tap()

      // Check if word is complete
      if (newSelected.length === exercise.correctOrder.length) {
        registerSuccess()
        setScore((s) => s + 1)
        setFeedback('success')
        haptics.success()
      }
    } else {
      registerError()
      setBuildError(true)
      haptics.error()
      setTimeout(() => setBuildError(false), 600)
    }
  }, [exercise, buildSelected, registerClick, registerSuccess, registerError, haptics])

  const handleNext = useCallback(() => {
    setFeedback(null)
    setBuildSelected([])
    setBuildError(false)
    const next = exerciseIdx + 1
    setExerciseIdx(next)
    updateCampoProgress('campo1', next)
    if (next >= words.length) {
      const stars = score >= 8 ? 3 : score >= 5 ? 2 : 1
      completeActivity('syllable-builder', stars)
    }
  }, [exerciseIdx, score, words.length, completeActivity, updateCampoProgress])

  const finalStars = score >= 8 ? 3 : score >= 5 ? 2 : 1

  if (isComplete) {
    return (
      <ActivityShell title="Sílabas" backPath="/campo/1" color="var(--color-campo1)">
        <CompletionCelebration
          emoji="🗣️"
          title="Fantástico! Dominaste as sílabas!"
          subtitle="A terapia da fala está a correr muito bem."
          score={score}
          total={words.length}
          stars={finalStars}
          color="var(--color-campo1)"
        />
      </ActivityShell>
    )
  }

  if (!exercise) return null

  return (
    <ActivityShell
      title="Sílabas — Terapia da Fala"
      instruction={
        exercise.type === 'syllable-build'
          ? `Toca as sílabas na ordem certa para construir: ${exercise.word}`
          : exercise.type === 'syllable-split'
            ? `Quantas sílabas tem "${exercise.word}"?`
            : exercise.type === 'word-complete'
              ? `Que sílaba falta na palavra?`
              : `Com que sílaba começa "${exercise.word}"?`
      }
      backPath="/campo/1"
      color="var(--color-campo1)"
      score={score}
      total={words.length}
      textLevel={adaptive?.textLevel}
    >
      {/* Word display with emoji */}
      <div style={styles.wordDisplay}>
        <span style={styles.wordEmoji}>{exercise.emoji}</span>
        {exercise.type === 'word-complete' ? (
          <span style={styles.wordText}>{exercise.display}</span>
        ) : exercise.type === 'syllable-build' ? (
          <div style={styles.buildProgress}>
            {exercise.correctOrder.map((s, i) => (
              <span
                key={i}
                style={{
                  ...styles.buildSlot,
                  ...(buildSelected[i]
                    ? styles.buildSlotFilled
                    : styles.buildSlotEmpty),
                }}
              >
                {buildSelected[i]?.syllable || '?'}
              </span>
            ))}
          </div>
        ) : (
          <span style={styles.wordText}>{exercise.word}</span>
        )}
        <button
          style={styles.listenBtn}
          onClick={() => speak(exercise.word)}
          aria-label={`Ouvir: ${exercise.word}`}
        >
          🔊 Ouvir
        </button>
      </div>

      {/* Exercise type: syllable-id or word-complete (tap one option) */}
      {(exercise.type === 'syllable-id' || exercise.type === 'word-complete') && (
        <div style={styles.syllableGrid}>
          {exercise.options.map((opt) => (
            <OptionCard
              key={opt}
              onClick={() => handleAnswer(opt)}
              disabled={feedback !== null}
              color="var(--color-campo1)"
              state={
                feedback === 'success' && opt === exercise.correct ? 'correct' : null
              }
              style={styles.syllableCard}
            >
              <span style={styles.syllableText}>{opt}</span>
            </OptionCard>
          ))}
        </div>
      )}

      {/* Exercise type: syllable-split (count syllables) */}
      {exercise.type === 'syllable-split' && (
        <>
          <p style={styles.hint}>
            Bate palmas para contar: {exercise.syllables.join(' · ')}
          </p>
          <div style={styles.syllableGrid}>
            {exercise.options.map((opt) => (
              <OptionCard
                key={opt}
                onClick={() => handleAnswer(opt)}
                disabled={feedback !== null}
                color="var(--color-campo1)"
                state={
                  feedback === 'success' && opt === exercise.correct ? 'correct' : null
                }
                style={styles.countCard}
              >
                <span style={styles.countNumber}>{opt}</span>
                <span style={styles.countLabel}>
                  {opt === 1 ? 'sílaba' : 'sílabas'}
                </span>
              </OptionCard>
            ))}
          </div>
        </>
      )}

      {/* Exercise type: syllable-build (tap in order) */}
      {exercise.type === 'syllable-build' && (
        <div style={styles.buildPool}>
          {exercise.pool.map((syllable, i) => {
            const isUsed = buildSelected.some((s) => s.poolIdx === i)
            return (
              <button
                key={`${syllable}-${i}`}
                style={{
                  ...styles.buildChip,
                  ...(isUsed ? styles.buildChipUsed : {}),
                  ...(buildError ? { animation: 'gentleShake 0.4s ease-out' } : {}),
                }}
                onClick={() => !isUsed && !feedback && handleBuildTap(syllable, i)}
                disabled={isUsed || feedback !== null}
              >
                {syllable}
              </button>
            )
          })}
        </div>
      )}

      <FeedbackMessage
        type={feedback}
        visible={feedback !== null}
        onDismiss={feedback === 'success' ? handleNext : () => setFeedback(null)}
        universe={adaptive?.universe}
      />
    </ActivityShell>
  )
}

const styles = {
  wordDisplay: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'var(--space-md)',
    padding: 'var(--space-xl)',
    backgroundColor: '#E3F2FD',
    borderRadius: 'var(--radius-lg)',
    border: '2px solid var(--color-campo1)',
  },
  wordEmoji: {
    fontSize: '3.5rem',
    lineHeight: 1,
  },
  wordText: {
    fontSize: 'var(--font-size-2xl)',
    fontWeight: 700,
    color: 'var(--color-campo1)',
    letterSpacing: '3px',
    textTransform: 'uppercase',
  },
  listenBtn: {
    padding: 'var(--space-xs) var(--space-md)',
    backgroundColor: 'white',
    border: '1px solid var(--color-campo1)',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-campo1)',
    fontFamily: 'inherit',
  },
  hint: {
    textAlign: 'center',
    fontSize: 'var(--font-size-base)',
    color: 'var(--color-text-secondary)',
    fontWeight: 600,
    fontStyle: 'italic',
  },
  syllableGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 'var(--space-md)',
  },
  syllableCard: {
    padding: 'var(--space-lg) var(--space-md)',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '70px',
  },
  syllableText: {
    fontSize: 'var(--font-size-2xl)',
    fontWeight: 800,
    color: 'var(--color-campo1)',
    letterSpacing: '2px',
    textTransform: 'uppercase',
  },
  countCard: {
    padding: 'var(--space-lg)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  countNumber: {
    fontSize: 'var(--font-size-3xl)',
    fontWeight: 800,
    color: 'var(--color-campo1)',
  },
  countLabel: {
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-text-secondary)',
    fontWeight: 600,
  },
  // Build mode
  buildProgress: {
    display: 'flex',
    gap: 'var(--space-sm)',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  buildSlot: {
    padding: 'var(--space-sm) var(--space-md)',
    borderRadius: 'var(--radius-sm)',
    fontWeight: 800,
    fontSize: 'var(--font-size-lg)',
    minWidth: '50px',
    textAlign: 'center',
    textTransform: 'uppercase',
    transition: 'all 0.3s ease',
  },
  buildSlotFilled: {
    backgroundColor: '#C8E6C9',
    color: 'var(--color-primary-dark)',
    border: '2px solid var(--color-success)',
  },
  buildSlotEmpty: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    color: 'var(--color-campo1)',
    border: '2px dashed var(--color-campo1)',
  },
  buildPool: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'var(--space-sm)',
    justifyContent: 'center',
    padding: 'var(--space-md)',
  },
  buildChip: {
    padding: 'var(--space-md) var(--space-lg)',
    backgroundColor: 'white',
    border: '2px solid var(--color-campo1)',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    fontWeight: 800,
    fontSize: 'var(--font-size-lg)',
    color: 'var(--color-campo1)',
    fontFamily: 'inherit',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease',
    WebkitTapHighlightColor: 'transparent',
    touchAction: 'manipulation',
    minWidth: '60px',
    textAlign: 'center',
  },
  buildChipUsed: {
    opacity: 0.25,
    transform: 'scale(0.9)',
    cursor: 'default',
  },
}
