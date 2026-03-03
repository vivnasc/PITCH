import { useState } from 'react'
import { CAMPO3_ACTIVITIES } from '../data/activities'
import ActivityCard from '../components/ActivityCard'
import ProgressBar from '../components/ProgressBar'
import UpgradePrompt from '../components/UpgradePrompt'

export default function Campo3Mundo({ progress, subscription, prescriptions }) {
  const [showUpgrade, setShowUpgrade] = useState(false)
  const cp = progress.campoProgress.campo3
  const prescribedIds = (prescriptions?.activeForChild || [])
    .flatMap((p) => (p.program?.activities || []).map((a) => a.activityId))

  return (
    <div style={styles.container} className="animate-fade-in">
      {showUpgrade && (
        <UpgradePrompt onClose={() => setShowUpgrade(false)} feature="activity" />
      )}

      <header style={styles.header}>
        <span style={styles.icon}>🌍</span>
        <div>
          <h1 style={styles.title}>O Mundo</h1>
          <p style={styles.subtitle}>Conhecimento e Descoberta</p>
        </div>
      </header>

      <p style={styles.description}>
        O futebol é jogado em todo o planeta. Cada equipa vem de um lugar,
        cada lugar tem uma história.
      </p>

      <div style={styles.progressSection}>
        <div style={styles.progressLabel}>
          <span>Progresso</span>
          <span style={styles.progressCount}>
            {cp.completed}/{cp.total}
          </span>
        </div>
        <ProgressBar value={cp.completed} max={cp.total} color="var(--color-campo3)" />
      </div>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Actividades</h2>
        <div style={styles.activityList}>
          {CAMPO3_ACTIVITIES.map((a) => (
            <ActivityCard
              key={a.id}
              activity={a}
              basePath="/campo/3"
              completed={progress.activitiesCompleted[a.id]}
              locked={subscription?.isActivityLocked(a.id, 'campo3')}
              onLockedClick={() => setShowUpgrade(true)}
              prescribed={prescribedIds.includes(a.id)}
            />
          ))}
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
    color: 'var(--color-campo3)',
  },
  subtitle: {
    fontSize: 'var(--font-size-base)',
    color: 'var(--color-text-secondary)',
  },
  description: {
    fontSize: 'var(--font-size-base)',
    color: 'var(--color-text-secondary)',
    lineHeight: 1.6,
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
    color: 'var(--color-campo3)',
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
}
