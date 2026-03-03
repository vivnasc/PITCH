import { useState, useCallback, useEffect } from 'react'
import ActivityShell from '../../components/ActivityShell'
import FeedbackMessage from '../../components/FeedbackMessage'
import CompletionCelebration from '../../components/CompletionCelebration'
import { useTTS } from '../../hooks/useTTS'

/**
 * ListeningQuest — Compreensão Auditiva
 *
 * Core speech therapy activity: following spoken instructions and answering
 * comprehension questions. Uses TTS to give instructions the child must follow.
 *
 * Exercises:
 * 1. follow-instruction: Listen and select the correct action/image
 * 2. story-question: Listen to a short passage, answer questions
 * 3. sequence-order: Listen to steps, put them in order
 * 4. what-comes-next: Listen to a pattern/sequence, predict the next item
 *
 * Key for autism: clear, concise language, visual supports,
 * ability to repeat instructions.
 */

const INSTRUCTIONS = {
  basic: [
    {
      spoken: 'Toca no animal que voa',
      options: [
        { label: 'Pássaro', emoji: '🐦', correct: true },
        { label: 'Peixe', emoji: '🐟', correct: false },
        { label: 'Gato', emoji: '🐱', correct: false },
      ],
    },
    {
      spoken: 'Toca na fruta vermelha',
      options: [
        { label: 'Banana', emoji: '🍌', correct: false },
        { label: 'Maçã', emoji: '🍎', correct: true },
        { label: 'Uva', emoji: '🍇', correct: false },
      ],
    },
    {
      spoken: 'Toca no que usamos quando chove',
      options: [
        { label: 'Chapéu de sol', emoji: '⛱️', correct: false },
        { label: 'Guarda-chuva', emoji: '☂️', correct: true },
        { label: 'Óculos de sol', emoji: '🕶️', correct: false },
      ],
    },
    {
      spoken: 'Toca no veículo que anda na água',
      options: [
        { label: 'Carro', emoji: '🚗', correct: false },
        { label: 'Avião', emoji: '✈️', correct: false },
        { label: 'Barco', emoji: '⛵', correct: true },
      ],
    },
    {
      spoken: 'Toca no que dá luz à noite',
      options: [
        { label: 'Sol', emoji: '☀️', correct: false },
        { label: 'Lua', emoji: '🌙', correct: true },
        { label: 'Nuvem', emoji: '☁️', correct: false },
      ],
    },
    {
      spoken: 'Toca no animal maior',
      options: [
        { label: 'Formiga', emoji: '🐜', correct: false },
        { label: 'Rato', emoji: '🐭', correct: false },
        { label: 'Elefante', emoji: '🐘', correct: true },
      ],
    },
    {
      spoken: 'Toca na coisa que é fria',
      options: [
        { label: 'Gelado', emoji: '🍦', correct: true },
        { label: 'Sopa', emoji: '🍲', correct: false },
        { label: 'Café', emoji: '☕', correct: false },
      ],
    },
    {
      spoken: 'Toca no que o médico usa',
      options: [
        { label: 'Estetoscópio', emoji: '🩺', correct: true },
        { label: 'Martelo', emoji: '🔨', correct: false },
        { label: 'Pincel', emoji: '🖌️', correct: false },
      ],
    },
  ],
  intermediate: [
    {
      spoken: 'Toca primeiro no animal e depois na cor dele',
      type: 'multi-step',
      steps: [
        { options: [{ label: 'Gato', emoji: '🐱', correct: true }, { label: 'Casa', emoji: '🏠', correct: false }, { label: 'Sol', emoji: '☀️', correct: false }] },
        { options: [{ label: 'Laranja', emoji: '🟠', correct: true }, { label: 'Azul', emoji: '🔵', correct: false }, { label: 'Verde', emoji: '🟢', correct: false }] },
      ],
    },
    {
      spoken: 'Encontra o que está quente e depois o que está frio',
      type: 'multi-step',
      steps: [
        { options: [{ label: 'Sopa', emoji: '🍲', correct: true }, { label: 'Gelado', emoji: '🍦', correct: false }, { label: 'Leite', emoji: '🥛', correct: false }] },
        { options: [{ label: 'Café', emoji: '☕', correct: false }, { label: 'Gelado', emoji: '🍦', correct: true }, { label: 'Chá', emoji: '🍵', correct: false }] },
      ],
    },
    {
      spoken: 'Toca no que tem asas e voa no céu',
      options: [
        { label: 'Borboleta', emoji: '🦋', correct: true },
        { label: 'Tartaruga', emoji: '🐢', correct: false },
        { label: 'Coelho', emoji: '🐰', correct: false },
        { label: 'Avião', emoji: '✈️', correct: true },
      ],
    },
    {
      spoken: 'Toca no animal que vive na quinta e dá leite',
      options: [
        { label: 'Vaca', emoji: '🐄', correct: true },
        { label: 'Leão', emoji: '🦁', correct: false },
        { label: 'Golfinho', emoji: '🐬', correct: false },
      ],
    },
    {
      spoken: 'Encontra o que precisas para escrever',
      options: [
        { label: 'Lápis', emoji: '✏️', correct: true },
        { label: 'Garfo', emoji: '🍴', correct: false },
        { label: 'Tesoura', emoji: '✂️', correct: false },
      ],
    },
  ],
  advanced: [
    {
      spoken: 'Ouve com atenção: o menino foi ao parque, brincou com os amigos e depois comeu um gelado. O que fez primeiro?',
      type: 'comprehension',
      options: [
        { label: 'Comeu gelado', emoji: '🍦', correct: false },
        { label: 'Foi ao parque', emoji: '🌳', correct: true },
        { label: 'Dormiu', emoji: '😴', correct: false },
      ],
    },
    {
      spoken: 'A menina estava triste porque perdeu o brinquedo. Porque estava triste?',
      type: 'comprehension',
      options: [
        { label: 'Perdeu o brinquedo', emoji: '🧸', correct: true },
        { label: 'Ganhou um prémio', emoji: '🏆', correct: false },
        { label: 'Estava a chover', emoji: '🌧️', correct: false },
      ],
    },
    {
      spoken: 'Ouve: primeiro a mãe põe a mesa, depois serve a comida, e por fim todos comem juntos. O que acontece em segundo?',
      type: 'comprehension',
      options: [
        { label: 'Põe a mesa', emoji: '🍽️', correct: false },
        { label: 'Serve a comida', emoji: '🍲', correct: true },
        { label: 'Comem juntos', emoji: '👨‍👩‍👧‍👦', correct: false },
      ],
    },
    {
      spoken: 'O pai saiu de casa, mas voltou porque se esqueceu do guarda-chuva. Porque voltou?',
      type: 'comprehension',
      options: [
        { label: 'Estava com fome', emoji: '🍽️', correct: false },
        { label: 'Esqueceu o guarda-chuva', emoji: '☂️', correct: true },
        { label: 'Queria dormir', emoji: '😴', correct: false },
      ],
    },
    {
      spoken: 'A Ana gosta de gatos mas não gosta de cães. A Ana tem medo de quê?',
      type: 'comprehension',
      options: [
        { label: 'Gatos', emoji: '🐱', correct: false },
        { label: 'Nada', emoji: '🤷', correct: false },
        { label: 'Cães', emoji: '🐕', correct: true },
      ],
    },
  ],
}

// Sequence exercises
const SEQUENCES = [
  {
    spoken: 'Ouve a ordem: primeiro acordar, depois vestir, e por fim tomar o pequeno-almoço',
    steps: [
      { label: 'Acordar', emoji: '⏰' },
      { label: 'Vestir', emoji: '👕' },
      { label: 'Pequeno-almoço', emoji: '🥣' },
    ],
  },
  {
    spoken: 'Ouve: primeiro lavar as mãos, depois comer, e por fim escovar os dentes',
    steps: [
      { label: 'Lavar mãos', emoji: '🧼' },
      { label: 'Comer', emoji: '🍽️' },
      { label: 'Escovar dentes', emoji: '🪥' },
    ],
  },
  {
    spoken: 'Ouve: primeiro semente, depois planta, depois flor',
    steps: [
      { label: 'Semente', emoji: '🌰' },
      { label: 'Planta', emoji: '🌱' },
      { label: 'Flor', emoji: '🌸' },
    ],
  },
  {
    spoken: 'Ouve: primeiro ovo, depois lagarta, depois borboleta',
    steps: [
      { label: 'Ovo', emoji: '🥚' },
      { label: 'Lagarta', emoji: '🐛' },
      { label: 'Borboleta', emoji: '🦋' },
    ],
  },
  {
    spoken: 'Ouve: primeiro a chuva cai, depois aparece o arco-íris',
    steps: [
      { label: 'Chuva', emoji: '🌧️' },
      { label: 'Arco-íris', emoji: '🌈' },
    ],
  },
]

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function getLevel(campoLevel) {
  if (campoLevel <= 2) return 'basic'
  if (campoLevel <= 5) return 'intermediate'
  return 'advanced'
}

function generateRound(campoLevel, roundNum) {
  const level = getLevel(campoLevel)

  // Mix in sequence exercises at higher levels
  if (campoLevel >= 3 && roundNum % 3 === 2 && SEQUENCES.length > 0) {
    const seq = SEQUENCES[Math.floor(Math.random() * SEQUENCES.length)]
    return {
      type: 'sequence',
      spoken: seq.spoken,
      steps: seq.steps,
      shuffledSteps: shuffle(seq.steps),
    }
  }

  const pool = INSTRUCTIONS[level] || INSTRUCTIONS.basic
  const item = pool[Math.floor(Math.random() * pool.length)]

  if (item.type === 'multi-step') {
    return { ...item, currentStep: 0 }
  }

  return {
    type: item.type || 'single',
    spoken: item.spoken,
    options: shuffle(item.options),
  }
}

export default function ListeningQuest(props) {
  const {
    completeActivity,
    registerClick,
    registerError,
    registerSuccess,
    adaptive,
    soundEnabled,
  } = props

  const campoLevel = adaptive?.campoLevels?.campo1 || 1
  const questionsPerRound = campoLevel <= 3 ? 5 : 6
  const { speak } = useTTS()

  const [round, setRound] = useState(0)
  const [score, setScore] = useState(0)
  const [feedback, setFeedback] = useState(null)
  const [completed, setCompleted] = useState(false)
  const [exercise, setExercise] = useState(() => generateRound(campoLevel, 0))
  const [hasSpoken, setHasSpoken] = useState(false)

  // Sequence state
  const [sequenceSelected, setSequenceSelected] = useState([])

  // Multi-step state
  const [multiStepIndex, setMultiStepIndex] = useState(0)

  // Auto-speak instruction on new round
  useEffect(() => {
    if (!hasSpoken && exercise.spoken) {
      const timer = setTimeout(() => {
        speak(exercise.spoken)
        setHasSpoken(true)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [exercise, hasSpoken, speak])

  const nextExercise = useCallback(() => {
    const next = generateRound(campoLevel, round + 1)
    setExercise(next)
    setFeedback(null)
    setHasSpoken(false)
    setSequenceSelected([])
    setMultiStepIndex(0)
    setRound((r) => r + 1)
  }, [campoLevel, round])

  const handleComplete = useCallback(() => {
    const stars = score >= questionsPerRound ? 3 : score >= questionsPerRound * 0.6 ? 2 : 1
    completeActivity?.('listening-quest', stars)
    setCompleted(true)
  }, [score, questionsPerRound, completeActivity])

  const handleRepeat = useCallback(() => {
    speak(exercise.spoken)
  }, [exercise, speak])

  // Single instruction answer
  const handleAnswer = useCallback((option) => {
    registerClick?.()
    if (option.correct) {
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

  // Multi-step: handle each step
  const handleMultiStep = useCallback((option) => {
    registerClick?.()
    if (option.correct) {
      registerSuccess?.()
      const nextStep = multiStepIndex + 1
      if (nextStep >= exercise.steps.length) {
        setScore((s) => s + 1)
        setFeedback({ correct: true })
        setTimeout(() => {
          if (round + 1 >= questionsPerRound) handleComplete()
          else nextExercise()
        }, 1500)
      } else {
        setMultiStepIndex(nextStep)
        setFeedback({ correct: true, stepDone: true })
        setTimeout(() => setFeedback(null), 800)
      }
    } else {
      registerError?.()
      setFeedback({ correct: false })
      setTimeout(() => setFeedback(null), 1200)
    }
  }, [registerClick, registerSuccess, registerError, multiStepIndex, exercise, round, questionsPerRound, handleComplete, nextExercise])

  // Sequence: tap items in order
  const handleSequenceTap = useCallback((step, idx) => {
    registerClick?.()
    const expectedIdx = sequenceSelected.length
    const isCorrect = step.label === exercise.steps[expectedIdx]?.label

    if (isCorrect) {
      registerSuccess?.()
      const newSelected = [...sequenceSelected, step]
      setSequenceSelected(newSelected)

      if (newSelected.length === exercise.steps.length) {
        setScore((s) => s + 1)
        setFeedback({ correct: true })
        setTimeout(() => {
          if (round + 1 >= questionsPerRound) handleComplete()
          else nextExercise()
        }, 1500)
      }
    } else {
      registerError?.()
      setFeedback({ correct: false })
      setTimeout(() => {
        setFeedback(null)
        setSequenceSelected([])
      }, 1200)
    }
  }, [registerClick, registerSuccess, registerError, sequenceSelected, exercise, round, questionsPerRound, handleComplete, nextExercise])

  if (completed) {
    const stars = score >= questionsPerRound ? 3 : score >= questionsPerRound * 0.6 ? 2 : 1
    return <CompletionCelebration stars={stars} score={score} total={questionsPerRound} soundEnabled={soundEnabled} />
  }

  const instruction = exercise.type === 'sequence'
    ? 'Ouve e arruma por ordem'
    : 'Ouve com atenção e escolhe a resposta'

  return (
    <ActivityShell
      title="Compreensão Auditiva"
      icon="👂"
      campo={1}
      score={score}
      total={questionsPerRound}
      round={round}
      instruction={instruction}
      soundEnabled={soundEnabled}
    >
      <div style={styles.container}>
        {/* Repeat button */}
        <button
          style={styles.repeatBtn}
          onClick={handleRepeat}
          aria-label="Ouvir de novo"
        >
          🔊 Ouvir de novo
        </button>

        {/* SINGLE INSTRUCTION */}
        {exercise.type === 'single' && (
          <div style={styles.optionsGrid}>
            {exercise.options.map((opt, i) => (
              <button
                key={i}
                style={{
                  ...styles.optionCard,
                  ...(feedback?.correct === true && opt.correct ? styles.optionCorrect : {}),
                  ...(feedback?.correct === false && !opt.correct ? styles.optionFaded : {}),
                }}
                onClick={() => handleAnswer(opt)}
                disabled={!!feedback}
              >
                <span style={styles.optionEmoji}>{opt.emoji}</span>
                <span style={styles.optionLabel}>{opt.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* COMPREHENSION */}
        {exercise.type === 'comprehension' && (
          <div style={styles.optionsGrid}>
            {exercise.options.map((opt, i) => (
              <button
                key={i}
                style={{
                  ...styles.optionCard,
                  ...(feedback?.correct === true && opt.correct ? styles.optionCorrect : {}),
                  ...(feedback?.correct === false && !opt.correct ? styles.optionFaded : {}),
                }}
                onClick={() => handleAnswer(opt)}
                disabled={!!feedback}
              >
                <span style={styles.optionEmoji}>{opt.emoji}</span>
                <span style={styles.optionLabel}>{opt.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* MULTI-STEP */}
        {exercise.type === 'multi-step' && (
          <>
            <p style={styles.stepIndicator}>
              Passo {multiStepIndex + 1} de {exercise.steps.length}
            </p>
            <div style={styles.optionsGrid}>
              {exercise.steps[multiStepIndex]?.options.map((opt, i) => (
                <button
                  key={i}
                  style={{
                    ...styles.optionCard,
                    ...(feedback?.correct === true && opt.correct ? styles.optionCorrect : {}),
                    ...(feedback?.correct === false ? styles.optionShake : {}),
                  }}
                  onClick={() => handleMultiStep(opt)}
                  disabled={!!feedback}
                >
                  <span style={styles.optionEmoji}>{opt.emoji}</span>
                  <span style={styles.optionLabel}>{opt.label}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {/* SEQUENCE */}
        {exercise.type === 'sequence' && (
          <>
            {/* Show selected so far */}
            <div style={styles.sequenceResult}>
              {exercise.steps.map((_, i) => (
                <div
                  key={i}
                  style={{
                    ...styles.sequenceSlot,
                    ...(sequenceSelected[i] ? styles.sequenceSlotFilled : {}),
                  }}
                >
                  {sequenceSelected[i] ? (
                    <>
                      <span style={styles.sequenceSlotEmoji}>{sequenceSelected[i].emoji}</span>
                      <span style={styles.sequenceSlotNum}>{i + 1}°</span>
                    </>
                  ) : (
                    <span style={styles.sequenceSlotNum}>{i + 1}°</span>
                  )}
                </div>
              ))}
            </div>
            {/* Shuffled options */}
            <div style={styles.optionsGrid}>
              {exercise.shuffledSteps
                .filter((s) => !sequenceSelected.find((sel) => sel.label === s.label))
                .map((step, i) => (
                  <button
                    key={step.label}
                    style={{
                      ...styles.optionCard,
                      ...(feedback?.correct === false ? styles.optionShake : {}),
                    }}
                    onClick={() => handleSequenceTap(step, i)}
                    disabled={!!feedback}
                  >
                    <span style={styles.optionEmoji}>{step.emoji}</span>
                    <span style={styles.optionLabel}>{step.label}</span>
                  </button>
                ))}
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
  repeatBtn: {
    padding: 'var(--space-sm) var(--space-lg)',
    backgroundColor: '#E3F2FD',
    color: '#1565C0',
    border: '2px solid #90CAF9',
    borderRadius: 'var(--radius-lg)',
    fontFamily: 'inherit',
    fontSize: 'var(--font-size-base)',
    fontWeight: 700,
    cursor: 'pointer',
    minHeight: '48px',
  },
  optionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: 'var(--space-md)',
    width: '100%',
  },
  optionCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'var(--space-sm)',
    padding: 'var(--space-lg)',
    backgroundColor: 'var(--color-surface)',
    border: '2px solid var(--color-border)',
    borderRadius: 'var(--radius-lg)',
    cursor: 'pointer',
    fontFamily: 'inherit',
    minHeight: '100px',
    transition: 'all 0.2s',
  },
  optionEmoji: {
    fontSize: '2.5rem',
  },
  optionLabel: {
    fontSize: 'var(--font-size-sm)',
    fontWeight: 600,
    textAlign: 'center',
  },
  optionCorrect: {
    borderColor: '#2E7D32',
    backgroundColor: '#E8F5E9',
  },
  optionFaded: {
    opacity: 0.4,
  },
  optionShake: {
    animation: 'gentleShake 0.4s ease',
  },
  stepIndicator: {
    fontSize: 'var(--font-size-sm)',
    fontWeight: 600,
    color: '#E65100',
    textAlign: 'center',
    padding: '4px 12px',
    backgroundColor: '#FFF3E0',
    borderRadius: 'var(--radius-sm)',
  },
  // Sequence
  sequenceResult: {
    display: 'flex',
    gap: 'var(--space-sm)',
    justifyContent: 'center',
    padding: 'var(--space-md)',
    backgroundColor: '#E3F2FD',
    borderRadius: 'var(--radius-md)',
    width: '100%',
  },
  sequenceSlot: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    padding: 'var(--space-sm) var(--space-md)',
    backgroundColor: 'white',
    border: '2px dashed #90CAF9',
    borderRadius: 'var(--radius-md)',
    minWidth: '70px',
    minHeight: '70px',
    justifyContent: 'center',
  },
  sequenceSlotFilled: {
    borderStyle: 'solid',
    borderColor: '#2E7D32',
    backgroundColor: '#E8F5E9',
  },
  sequenceSlotEmoji: {
    fontSize: '1.5rem',
  },
  sequenceSlotNum: {
    fontSize: '0.7rem',
    fontWeight: 700,
    color: '#757575',
  },
}
