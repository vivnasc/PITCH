import { useNavigate } from 'react-router-dom'
import { CAMPO_INFO } from '../data/activities'
import { getCurrentChallenges, getDaysUntilReset } from '../data/challenges'
import { AVATARS } from '../hooks/useProfile'
import ProgressBar from '../components/ProgressBar'

export default function Home({ progress, profile, adaptive, planner, subscription, prescriptions }) {
  const navigate = useNavigate()
  const totalWords = progress.wordsLearned.length
  const totalStars = progress.totalStars
  const playerName = profile?.name || 'Jogador'
  const avatarEmoji = AVATARS.find((a) => a.id === profile?.avatar)?.emoji || '⭐'
  const challenges = getCurrentChallenges()
  const daysLeft = getDaysUntilReset()

  const universe = adaptive?.universe
  const prioritised = adaptive?.prioritisedCampos || ['campo1', 'campo2', 'campo3', 'campo4']

  // Merge campo info with universe-specific naming
  const campos = CAMPO_INFO.map((campo) => {
    const uCampo = universe?.campos?.[campo.id]
    return {
      ...campo,
      name: uCampo?.name || campo.name,
      subtitle: uCampo?.subtitle || campo.subtitle,
      isPriority: prioritised.includes(campo.id),
    }
  })

  // Sort: prioritised goals first
  const sortedCampos = [
    ...campos.filter((c) => c.isPriority),
    ...campos.filter((c) => !c.isPriority),
  ]

  // Show needs summary if goals are set
  const hasGoals = (profile?.goals || []).length > 0
  const needsAreas = profile?.learningNeeds?.areas || []

  const isParentOrTherapist = subscription?.isParentView || subscription?.isTherapistView
  const viewLabel = subscription?.isTherapistView ? 'Terapeuta' : subscription?.isParentView ? 'Pai/Mãe' : null
  const todayTasks = prescriptions?.todayTasks || []
  const pendingTherapy = todayTasks.filter((t) => !t.done)

  return (
    <div style={styles.container} className="animate-fade-in">
      {/* The school belongs to the child */}
      <div style={styles.schoolBanner}>
        <img src="/logos/pitch-robo.png" alt="PITCH" style={styles.schoolLogo} />
        <div>
          <h1 style={styles.schoolTitle}>A Escola do {playerName}</h1>
          <p style={styles.schoolWorld}>{universe?.icon} {universe?.name || 'Futebol'}</p>
        </div>
      </div>

      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={{
            ...styles.avatarCircle,
            borderColor: universe?.color || 'var(--color-primary)',
          }}>
            {avatarEmoji}
          </div>
          <div>
            <p style={styles.greeting}>
              {isParentOrTherapist ? `Bem-vindo(a)` : `Olá, ${playerName}!`}
            </p>
            {viewLabel && (
              <p style={styles.viewBadge}>{viewLabel}</p>
            )}
          </div>
        </div>
        <button
          style={styles.streakBadge}
          onClick={() => navigate('/progresso')}
          aria-label={`${progress.streakDays} dias seguidos`}
        >
          <span style={styles.streakNumber}>{progress.streakDays}</span>
          <span style={styles.streakLabel}>dias</span>
        </button>
      </header>

      {/* Parent/Therapist: quick dashboard access */}
      {isParentOrTherapist && (
        <button
          style={styles.dashboardBanner}
          onClick={() => navigate('/dashboard')}
        >
          <span style={styles.dashboardBannerIcon}>
            {subscription?.isTherapistView ? '🩺' : '📊'}
          </span>
          <div style={styles.dashboardBannerText}>
            <span style={styles.dashboardBannerTitle}>
              {subscription?.isTherapistView ? 'Painel do Terapeuta' : 'Painel Familiar'}
            </span>
            <span style={styles.dashboardBannerDesc}>
              Ver progresso, fichas e competências
            </span>
          </div>
          <span style={styles.todayGo}>→</span>
        </button>
      )}

      {/* Parent/Therapist: pending therapy tasks summary */}
      {isParentOrTherapist && pendingTherapy.length > 0 && (
        <section style={styles.therapyBanner}>
          <div style={styles.therapyBannerHeader}>
            <span style={styles.therapyBannerTitle}>
              Terapias Hoje
            </span>
            <span style={styles.therapyBannerCount}>
              {pendingTherapy.length} pendente{pendingTherapy.length !== 1 ? 's' : ''}
            </span>
          </div>
          {pendingTherapy.slice(0, 3).map((task) => (
            <div key={task.activityId} style={styles.therapyBannerItem}>
              <span>🩺</span>
              <span style={styles.therapyBannerName}>
                {task.activityId.replace(/-/g, ' ')}
              </span>
              <span style={styles.therapyBannerFreq}>{task.frequency}</span>
            </div>
          ))}
          <button
            style={styles.therapyBannerMore}
            onClick={() => navigate('/planner')}
          >
            Ver plano completo →
          </button>
        </section>
      )}

      {/* Today's Plan — the main focus for the child */}
      {planner && (
        <section style={styles.todayPlan}>
          {planner.todayPlan ? (
            <>
              <div style={styles.todayPlanHeader}>
                <h2 style={styles.todayPlanTitle}>Plano de Hoje</h2>
                <span style={styles.todayPlanCount}>
                  {planner.todayPlan.activities.filter((a) => a.completed).length}/
                  {planner.todayPlan.activities.length}
                </span>
              </div>
              <div style={styles.todayPlanList}>
                {planner.todayPlan.activities.map((act) => (
                  <button
                    key={act.activityId}
                    style={{
                      ...styles.todayPlanItem,
                      ...(act.completed ? styles.todayPlanItemDone : {}),
                    }}
                    onClick={() => !act.completed && navigate(act.path)}
                    disabled={act.completed}
                  >
                    <span>{act.icon}</span>
                    <span style={styles.todayPlanName}>{act.name}</span>
                    {act.completed ? (
                      <span style={styles.todayCheck}>✓</span>
                    ) : (
                      <span style={styles.todayGo}>→</span>
                    )}
                  </button>
                ))}
              </div>
              <button
                style={styles.todayPlanMore}
                onClick={() => navigate('/planner')}
              >
                Ver plano completo →
              </button>
            </>
          ) : (
            <button
              style={styles.todayPlanGenerate}
              onClick={() => {
                planner.generateToday()
                navigate('/planner')
              }}
            >
              <span style={styles.todayPlanGenerateIcon}>📋</span>
              <div>
                <span style={styles.todayPlanGenerateTitle}>Plano do Dia</span>
                <span style={styles.todayPlanGenerateDesc}>
                  Gera o plano de actividades para hoje
                </span>
              </div>
              <span style={styles.todayGo}>→</span>
            </button>
          )}
        </section>
      )}

      {/* Weekly Challenge Preview */}
      <section style={styles.challengePreview}>
        <div style={styles.challengeHeader}>
          <h2 style={styles.challengeTitle}>Desafio da Semana</h2>
          <span style={styles.challengeTimer}>{daysLeft} dias</span>
        </div>
        {challenges.slice(0, 2).map((c) => (
          <div key={c.id} style={styles.challengeRow}>
            <span style={styles.challengeIcon}>{c.icon}</span>
            <span style={styles.challengeName}>{c.name}</span>
            <span style={styles.challengeReward}>+{c.reward} ⭐</span>
          </div>
        ))}
        <button style={styles.challengeMoreBtn} onClick={() => navigate('/desafios')}>
          Ver todos os desafios →
        </button>
      </section>

      {/* Campos — compact row */}
      <section style={styles.campos}>
        <h2 style={styles.sectionTitle}>Explorar</h2>
        <div style={styles.campoCompactGrid}>
          {sortedCampos.map((campo) => (
            <button
              key={campo.id}
              style={{ ...styles.campoCompactBtn, borderColor: campo.color }}
              className="btn-press"
              onClick={() => navigate(campo.path)}
            >
              <span style={styles.campoCompactIcon}>{campo.icon}</span>
              <span style={styles.campoCompactName}>{campo.name}</span>
            </button>
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
    gap: 'var(--space-lg)',
  },
  schoolBanner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--space-sm)',
    padding: 'var(--space-sm)',
  },
  schoolLogo: {
    width: '40px',
    height: '40px',
    objectFit: 'contain',
  },
  schoolTitle: {
    fontSize: 'var(--font-size-lg)',
    fontWeight: 700,
    color: 'var(--color-primary-dark)',
    letterSpacing: '1px',
  },
  schoolWorld: {
    fontSize: '0.7rem',
    color: 'var(--color-text-secondary)',
    fontWeight: 500,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-sm)',
  },
  avatarCircle: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: '#E8F5E9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.8rem',
    border: '2px solid',
  },
  greeting: {
    fontSize: 'var(--font-size-base)',
    fontWeight: 700,
    color: 'var(--color-primary-dark)',
  },
  viewBadge: {
    fontSize: '0.6rem',
    fontWeight: 700,
    color: 'white',
    backgroundColor: 'var(--color-primary)',
    padding: '1px 8px',
    borderRadius: 'var(--radius-sm)',
    display: 'inline-block',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  // Dashboard banner for parent/therapist
  dashboardBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-sm)',
    padding: 'var(--space-md)',
    backgroundColor: '#E3F2FD',
    border: '2px solid #90CAF9',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    fontFamily: 'inherit',
    width: '100%',
    textAlign: 'left',
  },
  dashboardBannerIcon: {
    fontSize: '1.5rem',
  },
  dashboardBannerText: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  dashboardBannerTitle: {
    fontWeight: 700,
    fontSize: 'var(--font-size-sm)',
    color: '#1565C0',
  },
  dashboardBannerDesc: {
    fontSize: '0.7rem',
    color: 'var(--color-text-secondary)',
  },
  // Therapy tasks banner
  therapyBanner: {
    padding: 'var(--space-md)',
    backgroundColor: '#FFF3E0',
    borderRadius: 'var(--radius-md)',
    border: '1px solid #FFB74D',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-xs)',
  },
  therapyBannerHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  therapyBannerTitle: {
    fontWeight: 700,
    fontSize: 'var(--font-size-base)',
    color: '#E65100',
  },
  therapyBannerCount: {
    fontSize: 'var(--font-size-sm)',
    fontWeight: 600,
    color: '#BF360C',
    backgroundColor: '#FFCCBC',
    padding: '2px 8px',
    borderRadius: 'var(--radius-sm)',
  },
  therapyBannerItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-sm)',
    padding: 'var(--space-xs)',
    backgroundColor: 'white',
    borderRadius: 'var(--radius-sm)',
  },
  therapyBannerName: {
    flex: 1,
    fontWeight: 600,
    fontSize: 'var(--font-size-sm)',
    textTransform: 'capitalize',
  },
  therapyBannerFreq: {
    fontSize: '0.65rem',
    color: 'var(--color-text-secondary)',
    fontWeight: 500,
  },
  therapyBannerMore: {
    alignSelf: 'center',
    padding: '4px var(--space-md)',
    backgroundColor: 'transparent',
    color: '#E65100',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 600,
    fontFamily: 'inherit',
    fontSize: 'var(--font-size-sm)',
  },
  subtitle: {
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-text-secondary)',
    fontWeight: 500,
  },
  streakBadge: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: 'var(--space-sm)',
    backgroundColor: '#FFF8E1',
    borderRadius: 'var(--radius-md)',
    border: '2px solid #FFD54F',
    cursor: 'pointer',
    minWidth: '56px',
  },
  streakNumber: {
    fontSize: 'var(--font-size-xl)',
    fontWeight: 700,
    color: '#F57F17',
  },
  streakLabel: {
    fontSize: '0.6rem',
    color: '#F57F17',
    fontWeight: 600,
    textTransform: 'uppercase',
  },
  statsRow: {
    display: 'flex',
    justifyContent: 'space-around',
    padding: 'var(--space-md)',
    backgroundColor: 'var(--color-surface)',
    borderRadius: 'var(--radius-md)',
    boxShadow: 'var(--shadow-sm)',
  },
  stat: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 'var(--font-size-lg)',
    fontWeight: 700,
    color: 'var(--color-primary)',
  },
  statLabel: {
    fontSize: '0.65rem',
    color: 'var(--color-text-secondary)',
    textTransform: 'uppercase',
  },
  // Goals recommendation card
  goalsCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-sm)',
    padding: 'var(--space-md)',
    backgroundColor: '#E3F2FD',
    borderRadius: 'var(--radius-md)',
    borderLeft: '4px solid #1565C0',
  },
  goalsIcon: { fontSize: '1.5rem', flexShrink: 0 },
  goalsTitle: { fontWeight: 700, fontSize: 'var(--font-size-sm)', color: '#1565C0' },
  goalsText: { fontSize: 'var(--font-size-sm)', color: 'var(--color-text)', lineHeight: 1.3, marginTop: '2px' },
  // Quick Actions
  quickActions: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 'var(--space-sm)',
  },
  quickBtn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    padding: 'var(--space-sm)',
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontFamily: 'inherit',
  },
  quickIcon: { fontSize: '1.5rem' },
  quickLabel: {
    fontSize: '0.6rem',
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
    textTransform: 'uppercase',
  },
  // Challenge Preview
  challengePreview: {
    padding: 'var(--space-md)',
    backgroundColor: '#FFF8E1',
    borderRadius: 'var(--radius-md)',
    border: '1px solid #FFD54F',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-sm)',
  },
  challengeHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  challengeTitle: {
    fontSize: 'var(--font-size-base)',
    fontWeight: 700,
    color: '#F57F17',
  },
  challengeTimer: {
    fontSize: 'var(--font-size-sm)',
    fontWeight: 600,
    color: '#C62828',
    backgroundColor: '#FFEBEE',
    padding: '2px 8px',
    borderRadius: 'var(--radius-sm)',
  },
  challengeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-sm)',
  },
  challengeIcon: { fontSize: '1.2rem' },
  challengeName: { flex: 1, fontWeight: 500, fontSize: 'var(--font-size-sm)' },
  challengeReward: { fontSize: 'var(--font-size-sm)', fontWeight: 700, color: '#F57F17' },
  challengeMoreBtn: {
    alignSelf: 'center',
    padding: 'var(--space-xs) var(--space-md)',
    backgroundColor: '#F57F17',
    color: 'white',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer',
    fontWeight: 600,
    fontFamily: 'inherit',
    fontSize: 'var(--font-size-sm)',
    marginTop: 'var(--space-xs)',
  },
  // Campos
  campos: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-md)',
  },
  sectionTitle: {
    fontSize: 'var(--font-size-lg)',
    fontWeight: 700,
    color: 'var(--color-text)',
  },
  campoCompactGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 'var(--space-sm)',
  },
  campoCompactBtn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    padding: 'var(--space-sm)',
    backgroundColor: 'var(--color-surface)',
    border: '2px solid',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  campoCompactIcon: { fontSize: '1.5rem' },
  campoCompactName: {
    fontSize: '0.6rem',
    fontWeight: 700,
    color: 'var(--color-text)',
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  // Today's Plan
  todayPlan: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-sm)',
    padding: 'var(--space-md)',
    backgroundColor: '#E8F5E9',
    borderRadius: 'var(--radius-md)',
    border: '1px solid #A5D6A7',
  },
  todayPlanHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  todayPlanTitle: {
    fontSize: 'var(--font-size-base)',
    fontWeight: 700,
    color: 'var(--color-primary-dark)',
  },
  todayPlanCount: {
    fontSize: 'var(--font-size-sm)',
    fontWeight: 700,
    color: 'var(--color-primary)',
    backgroundColor: 'white',
    padding: '2px 8px',
    borderRadius: 'var(--radius-sm)',
  },
  todayPlanList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  todayPlanItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-sm)',
    padding: 'var(--space-sm)',
    backgroundColor: 'white',
    borderRadius: 'var(--radius-sm)',
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'inherit',
    width: '100%',
    textAlign: 'left',
  },
  todayPlanItemDone: {
    opacity: 0.5,
    textDecoration: 'line-through',
    cursor: 'default',
  },
  todayPlanName: {
    flex: 1,
    fontWeight: 600,
    fontSize: 'var(--font-size-sm)',
  },
  todayCheck: {
    color: 'var(--color-primary)',
    fontWeight: 700,
  },
  todayGo: {
    color: 'var(--color-primary)',
    fontWeight: 700,
    fontSize: 'var(--font-size-lg)',
  },
  todayPlanMore: {
    alignSelf: 'center',
    padding: '4px var(--space-md)',
    backgroundColor: 'transparent',
    color: 'var(--color-primary)',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 600,
    fontFamily: 'inherit',
    fontSize: 'var(--font-size-sm)',
  },
  todayPlanGenerate: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-sm)',
    padding: 'var(--space-md)',
    backgroundColor: 'white',
    border: '2px dashed var(--color-primary)',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    fontFamily: 'inherit',
    width: '100%',
    textAlign: 'left',
  },
  todayPlanGenerateIcon: {
    fontSize: '1.5rem',
  },
  todayPlanGenerateTitle: {
    fontWeight: 700,
    fontSize: 'var(--font-size-sm)',
    display: 'block',
    color: 'var(--color-primary-dark)',
  },
  todayPlanGenerateDesc: {
    fontSize: '0.7rem',
    color: 'var(--color-text-secondary)',
    display: 'block',
  },
}
