import { useState } from 'react'
import { CAMPO1_ACTIVITIES } from '../data/activities'
import { VOCABULARY_CATEGORIES, VOCABULARY_WORDS } from '../data/vocabulary'
import ActivityCard from '../components/ActivityCard'
import ProgressBar from '../components/ProgressBar'
import UpgradePrompt from '../components/UpgradePrompt'

export default function Campo1Bancada({ progress, subscription, prescriptions }) {
  const [showUpgrade, setShowUpgrade] = useState(false)
  const learnedCount = progress.wordsLearned.length
  const totalWords = VOCABULARY_WORDS.length
  const prescribedIds = (prescriptions?.activeForChild || [])
    .flatMap((p) => (p.program?.activities || []).map((a) => a.activityId))

  return (
    <div style={styles.container} className="animate-fade-in">
      {showUpgrade && (
        <UpgradePrompt onClose={() => setShowUpgrade(false)} feature="activity" />
      )}

      <header style={styles.header}>
        <span style={styles.icon}>🗣️</span>
        <div>
          <h1 style={styles.title}>A Bancada</h1>
          <p style={styles.subtitle}>Linguagem e Comunicação</p>
        </div>
      </header>

      <div style={styles.progressSection}>
        <div style={styles.progressLabel}>
          <span>Vocabulário Inglês</span>
          <span style={styles.progressCount}>
            {learnedCount}/{totalWords} palavras
          </span>
        </div>
        <ProgressBar value={learnedCount} max={totalWords} color="var(--color-campo1)" />
      </div>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Actividades</h2>
        <div style={styles.activityList}>
          {CAMPO1_ACTIVITIES.map((a) => (
            <ActivityCard
              key={a.id}
              activity={a}
              basePath="/campo/1"
              completed={progress.activitiesCompleted[a.id]}
              locked={subscription?.isActivityLocked(a.id, 'campo1')}
              onLockedClick={() => setShowUpgrade(true)}
              prescribed={prescribedIds.includes(a.id)}
            />
          ))}
        </div>
      </section>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Categorias</h2>
        <div style={styles.categoryGrid}>
          {VOCABULARY_CATEGORIES.map((cat) => {
            const words = VOCABULARY_WORDS.filter((w) => w.category === cat.id)
            const learned = words.filter((w) =>
              progress.wordsLearned.includes(w.id)
            )
            return (
              <div
                key={cat.id}
                style={{
                  ...styles.categoryCard,
                  borderTopColor: cat.color,
                }}
              >
                <span style={styles.categoryIcon}>{cat.icon}</span>
                <span style={styles.categoryName}>{cat.labelPt}</span>
                <span style={styles.categoryCount}>
                  {learned.length}/{words.length}
                </span>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-xl)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-md)',
  },
  icon: {
    fontSize: '2.5rem',
  },
  title: {
    fontSize: 'var(--font-size-2xl)',
    fontWeight: 700,
    color: 'var(--color-campo1)',
  },
  subtitle: {
    fontSize: 'var(--font-size-base)',
    color: 'var(--color-text-secondary)',
  },
  progressSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-xs)',
  },
  progressLabel: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 'var(--font-size-sm)',
    fontWeight: 600,
  },
  progressCount: {
    color: 'var(--color-campo1)',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-md)',
  },
  sectionTitle: {
    fontSize: 'var(--font-size-lg)',
    fontWeight: 700,
  },
  activityList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-sm)',
  },
  categoryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 'var(--space-sm)',
  },
  categoryCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'var(--space-xs)',
    padding: 'var(--space-md)',
    backgroundColor: 'var(--color-bg)',
    borderRadius: 'var(--radius-md)',
    borderTop: '3px solid',
  },
  categoryIcon: {
    fontSize: '1.5rem',
  },
  categoryName: {
    fontWeight: 600,
    fontSize: 'var(--font-size-sm)',
  },
  categoryCount: {
    color: 'var(--color-text-secondary)',
    fontSize: 'var(--font-size-sm)',
  },
}
