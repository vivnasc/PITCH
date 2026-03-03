import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CAMPO_INFO } from '../data/activities'
import { PROFESSIONAL_TYPES } from '../data/therapyTypes'

/**
 * Planner — daily/weekly activity calendar.
 * Shows today's recommended activities, prescribed therapy tasks,
 * and the week's history.
 * Parent/therapist can adjust the number of daily activities.
 */
export default function Planner({
  profile,
  progress,
  planner,
  adaptive,
  prescriptions,
}) {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('hoje')
  const [showSettings, setShowSettings] = useState(false)

  const playerName = profile?.name || 'Criança'
  const universe = adaptive?.universe

  // Prescribed therapy tasks
  const therapyTasks = prescriptions?.todayTasks || []
  const hasTherapy = therapyTasks.length > 0
  const therapyDone = therapyTasks.filter((t) => t.isDone).length
  const therapyTotal = therapyTasks.length

  const getProfessionalIcon = (type) => {
    const prof = PROFESSIONAL_TYPES.find((p) => p.id === type)
    return prof?.icon || '👤'
  }

  const getActivityPath = (activityId) => {
    // Map activity IDs to their campo routes
    const allActivities = CAMPO_INFO.flatMap((campo, idx) => {
      const campoNum = idx + 1
      return [{ campoNum }]
    })
    // Simple lookup: find which campo this activity belongs to
    const campoMap = {
      'syllable-builder': 1, 'sentence-builder': 1, 'listening-quest': 1, 'vocab-match': 1, 'phonics': 1, 'read-score': 1, 'dress-player': 1, 'color-kit': 1,
      'goal-math': 2, 'clock-reader': 2, 'team-division': 2, 'ticket-shop': 2, 'patterns': 2,
      'flag-match': 3, 'world-explorer': 3, 'body-science': 3, 'weather-match': 3, 'nature-lab': 3,
      'daily-routine': 4, 'real-world': 4, 'problem-solving': 4, 'healthy-choices': 4, 'time-planner': 4,
      'story-builder': 5, 'music-maker': 5, 'color-canvas': 5, 'pattern-art': 5, 'sound-story': 5,
      'emotion-cards': 6, 'fair-play': 6, 'social-detective': 6, 'turn-talk': 6, 'calm-toolkit': 6,
      'contos-vivos': 7, 'poesia-sonora': 7, 'teatro-vozes': 7, 'fabulas-mundo': 7, 'meu-conto': 7,
    }
    const campoNum = campoMap[activityId]
    return campoNum ? `/campo/${campoNum}/${activityId}` : null
  }

  const {
    todayPlan,
    generateToday,
    markDone,
    regeneratePlan,
    weekData,
    weekStats,
    preferences,
    updatePreferences,
  } = planner

  // Auto-generate if no plan for today
  const plan = todayPlan || null
  const hasPlan = !!plan

  const handleGenerate = () => {
    generateToday()
  }

  const handleActivityClick = (act) => {
    navigate(act.path)
  }

  const getCampoInfo = (campoId) => {
    return CAMPO_INFO.find((c) => c.id === campoId) || {}
  }

  const todayCompleted = plan?.activities?.filter((a) => a.completed).length || 0
  const todayTotal = plan?.activities?.length || 0
  const todayPct = todayTotal > 0 ? Math.round((todayCompleted / todayTotal) * 100) : 0

  return (
    <div style={styles.container} className="animate-fade-in">
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Plano do Dia</h1>
          <p style={styles.subtitle}>Organiza o teu dia de aprendizagem</p>
        </div>
        <button
          style={styles.settingsBtn}
          onClick={() => setShowSettings(!showSettings)}
          aria-label="Definições do plano"
        >
          {showSettings ? '✕' : '⚙️'}
        </button>
      </header>

      {/* Settings Panel */}
      {showSettings && (
        <div style={styles.settingsPanel} className="animate-fade-in">
          <h3 style={styles.settingsTitle}>Configurar Plano</h3>
          <div style={styles.settingRow}>
            <span style={styles.settingLabel}>Actividades por dia:</span>
            <div style={styles.countBtns}>
              {[2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  style={{
                    ...styles.countBtn,
                    ...(preferences.activitiesPerDay === n ? styles.countBtnActive : {}),
                  }}
                  onClick={() => updatePreferences({ activitiesPerDay: n })}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
          <p style={styles.settingHint}>
            O plano é gerado com base no perfil do {playerName} e no progresso.
            Actividades de campos prioritários aparecem mais vezes.
          </p>
        </div>
      )}

      {/* Tabs */}
      <div style={styles.tabs}>
        {[
          { id: 'hoje', label: 'Hoje', icon: '📋' },
          { id: 'semana', label: 'Semana', icon: '📅' },
        ].map((tab) => (
          <button
            key={tab.id}
            style={{
              ...styles.tab,
              ...(activeTab === tab.id ? styles.tabActive : {}),
            }}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* TODAY TAB */}
      {activeTab === 'hoje' && (
        <div style={styles.section} className="animate-fade-in">
          {!hasPlan ? (
            <div style={styles.emptyState}>
              <span style={styles.emptyEmoji}>📋</span>
              <h2 style={styles.emptyTitle}>Ainda não tens plano para hoje!</h2>
              <p style={styles.emptyText}>
                Gera o teu plano diário com actividades recomendadas para o {playerName}.
              </p>
              <button style={styles.generateBtn} onClick={handleGenerate}>
                {universe?.icon || '⚽'} Gerar Plano de Hoje
              </button>

              {/* Show therapy tasks even without a daily plan */}
              {hasTherapy && (
                <div style={{ ...styles.therapySection, marginTop: '16px', width: '100%' }}>
                  <h3 style={styles.therapySectionTitle}>
                    🩺 Terapias para Hoje
                  </h3>
                  <div style={styles.activityList}>
                    {therapyTasks.map((task) => {
                      const path = getActivityPath(task.activityId)
                      return (
                        <button
                          key={`${task.prescriptionId}-${task.activityId}`}
                          style={{
                            ...styles.activityCard,
                            ...styles.therapyCard,
                            ...(task.isDone ? styles.activityDone : {}),
                          }}
                          onClick={() => {
                            if (!task.isDone && path) {
                              prescriptions.markDone(task.prescriptionId, task.activityId)
                              navigate(path)
                            }
                          }}
                          disabled={task.isDone}
                        >
                          <div style={styles.activityOrder}>
                            {task.isDone ? (
                              <span style={styles.checkMark}>✓</span>
                            ) : (
                              <span style={{ fontSize: '1rem' }}>
                                {getProfessionalIcon(task.professionalType)}
                              </span>
                            )}
                          </div>
                          <div style={styles.activityInfo}>
                            <span style={styles.activityName}>
                              {task.activityId.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                            </span>
                            <span style={styles.therapyMeta}>
                              {task.programName}
                              {task.professionalName && ` · ${task.professionalName}`}
                            </span>
                          </div>
                          {!task.isDone && path && (
                            <span style={styles.goArrow}>→</span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Progress ring */}
              <div style={styles.todayProgress}>
                <div style={styles.progressCircle}>
                  <svg width="80" height="80" viewBox="0 0 80 80">
                    <circle
                      cx="40" cy="40" r="34"
                      fill="none"
                      stroke="var(--color-border)"
                      strokeWidth="6"
                    />
                    <circle
                      cx="40" cy="40" r="34"
                      fill="none"
                      stroke="var(--color-primary)"
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 34}`}
                      strokeDashoffset={`${2 * Math.PI * 34 * (1 - todayPct / 100)}`}
                      transform="rotate(-90 40 40)"
                      style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                    />
                  </svg>
                  <span style={styles.progressText}>{todayPct}%</span>
                </div>
                <div>
                  <p style={styles.progressLabel}>
                    {todayCompleted === todayTotal
                      ? 'Parabéns! Plano completo!'
                      : `${todayCompleted} de ${todayTotal} feitas`}
                  </p>
                  <p style={styles.progressHint}>
                    {todayCompleted === todayTotal
                      ? 'Grande trabalho, campeão!'
                      : 'Continua assim!'}
                  </p>
                </div>
              </div>

              {/* Activity List */}
              <div style={styles.activityList}>
                {plan.activities.map((act, idx) => {
                  const campo = getCampoInfo(act.campo)
                  return (
                    <button
                      key={act.activityId}
                      style={{
                        ...styles.activityCard,
                        ...(act.completed ? styles.activityDone : {}),
                        borderLeftColor: campo.color || 'var(--color-primary)',
                      }}
                      onClick={() => !act.completed && handleActivityClick(act)}
                      disabled={act.completed}
                    >
                      <div style={styles.activityOrder}>
                        {act.completed ? (
                          <span style={styles.checkMark}>✓</span>
                        ) : (
                          <span style={styles.orderNum}>{idx + 1}</span>
                        )}
                      </div>
                      <div style={styles.activityInfo}>
                        <span style={styles.activityName}>
                          {act.icon} {act.name}
                        </span>
                        <span style={styles.activityCampo}>
                          {campo.icon} {campo.name}
                        </span>
                      </div>
                      {!act.completed && (
                        <span style={styles.goArrow}>→</span>
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Prescribed Therapy Tasks */}
              {hasTherapy && (
                <div style={styles.therapySection}>
                  <h3 style={styles.therapySectionTitle}>
                    🩺 Terapias Prescritas
                  </h3>
                  <p style={styles.therapyHint}>
                    {therapyDone === therapyTotal && therapyTotal > 0
                      ? 'Todas as terapias de hoje feitas!'
                      : `${therapyDone} de ${therapyTotal} terapias feitas`}
                  </p>
                  <div style={styles.activityList}>
                    {therapyTasks.map((task) => {
                      const path = getActivityPath(task.activityId)
                      return (
                        <button
                          key={`${task.prescriptionId}-${task.activityId}`}
                          style={{
                            ...styles.activityCard,
                            ...styles.therapyCard,
                            ...(task.isDone ? styles.activityDone : {}),
                          }}
                          onClick={() => {
                            if (!task.isDone && path) {
                              prescriptions.markDone(task.prescriptionId, task.activityId)
                              navigate(path)
                            }
                          }}
                          disabled={task.isDone}
                        >
                          <div style={styles.activityOrder}>
                            {task.isDone ? (
                              <span style={styles.checkMark}>✓</span>
                            ) : (
                              <span style={{ fontSize: '1rem' }}>
                                {getProfessionalIcon(task.professionalType)}
                              </span>
                            )}
                          </div>
                          <div style={styles.activityInfo}>
                            <span style={styles.activityName}>
                              {task.activityId.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                            </span>
                            <span style={styles.therapyMeta}>
                              {task.programName}
                              {task.professionalName && ` · ${task.professionalName}`}
                            </span>
                            {task.notes && (
                              <span style={styles.therapyNotes}>
                                📝 {task.notes}
                              </span>
                            )}
                          </div>
                          {!task.isDone && path && (
                            <span style={styles.goArrow}>→</span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div style={styles.actions}>
                <button style={styles.regenerateBtn} onClick={regeneratePlan}>
                  Gerar novo plano
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* WEEK TAB */}
      {activeTab === 'semana' && (
        <div style={styles.section} className="animate-fade-in">
          {/* Week Stats */}
          <div style={styles.weekStatsRow}>
            <div style={styles.weekStat}>
              <span style={styles.weekStatValue}>{weekStats.activeDays}</span>
              <span style={styles.weekStatLabel}>dias activos</span>
            </div>
            <div style={styles.weekStat}>
              <span style={styles.weekStatValue}>{weekStats.totalCompleted}</span>
              <span style={styles.weekStatLabel}>completas</span>
            </div>
            <div style={styles.weekStat}>
              <span style={styles.weekStatValue}>
                {weekStats.totalPlanned > 0
                  ? Math.round((weekStats.totalCompleted / weekStats.totalPlanned) * 100)
                  : 0}%
              </span>
              <span style={styles.weekStatLabel}>taxa</span>
            </div>
          </div>

          {/* Calendar Row */}
          <div style={styles.calendarRow}>
            {weekData.map((day) => (
              <div
                key={day.date}
                style={{
                  ...styles.calendarDay,
                  ...(day.isToday ? styles.calendarToday : {}),
                  ...(day.completed > 0 && day.completed >= day.planned
                    ? styles.calendarComplete
                    : {}),
                }}
              >
                <span style={styles.calendarDayName}>{day.dayName}</span>
                <span style={styles.calendarDayNum}>{day.dayNum}</span>
                {day.planned > 0 ? (
                  <span style={styles.calendarDots}>
                    {day.completed}/{day.planned}
                  </span>
                ) : (
                  <span style={styles.calendarEmpty}>-</span>
                )}
              </div>
            ))}
          </div>

          {/* Day Details */}
          <div style={styles.weekDetails}>
            <h3 style={styles.weekDetailsTitle}>Detalhes da Semana</h3>
            {weekData
              .filter((d) => d.planned > 0)
              .reverse()
              .map((day) => (
                <div key={day.date} style={styles.dayCard}>
                  <div style={styles.dayHeader}>
                    <span style={styles.dayDate}>
                      {day.dayName} {day.dayNum}
                      {day.isToday && <span style={styles.todayTag}> Hoje</span>}
                    </span>
                    <span style={styles.dayScore}>
                      {day.completed}/{day.planned}
                      {day.completed >= day.planned && day.planned > 0 && ' ⭐'}
                    </span>
                  </div>
                  <div style={styles.dayActivities}>
                    {day.activities.map((act) => (
                      <span
                        key={act.activityId}
                        style={{
                          ...styles.dayActivity,
                          ...(act.completed ? styles.dayActivityDone : {}),
                        }}
                      >
                        {act.icon} {act.name}
                        {act.completed && ' ✓'}
                      </span>
                    ))}
                  </div>
                </div>
              ))}

            {weekData.every((d) => d.planned === 0) && (
              <div style={styles.emptyWeek}>
                <p style={styles.emptyWeekText}>
                  Ainda não há actividades esta semana. Gera o plano de hoje para começar!
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-md)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 'var(--font-size-xl)',
    fontWeight: 700,
    color: 'var(--color-text)',
  },
  subtitle: {
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-text-secondary)',
  },
  settingsBtn: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-bg)',
    cursor: 'pointer',
    fontSize: '1.2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'inherit',
  },
  settingsPanel: {
    padding: 'var(--space-md)',
    backgroundColor: '#E3F2FD',
    borderRadius: 'var(--radius-md)',
    border: '1px solid #90CAF9',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-sm)',
  },
  settingsTitle: {
    fontSize: 'var(--font-size-base)',
    fontWeight: 700,
  },
  settingRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 'var(--space-sm)',
  },
  settingLabel: {
    fontSize: 'var(--font-size-sm)',
    fontWeight: 600,
  },
  countBtns: {
    display: 'flex',
    gap: '4px',
  },
  countBtn: {
    width: '36px',
    height: '36px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--color-border)',
    backgroundColor: 'white',
    cursor: 'pointer',
    fontWeight: 700,
    fontFamily: 'inherit',
    fontSize: 'var(--font-size-base)',
  },
  countBtnActive: {
    backgroundColor: 'var(--color-primary)',
    color: 'white',
    borderColor: 'var(--color-primary)',
  },
  settingHint: {
    fontSize: '0.7rem',
    color: 'var(--color-text-secondary)',
    lineHeight: 1.3,
  },
  tabs: {
    display: 'flex',
    gap: 'var(--space-xs)',
  },
  tab: {
    flex: 1,
    padding: 'var(--space-sm)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'var(--color-bg)',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: 'var(--font-size-sm)',
    fontFamily: 'inherit',
    textAlign: 'center',
    transition: 'all 0.2s',
  },
  tabActive: {
    backgroundColor: 'var(--color-primary)',
    color: 'white',
    borderColor: 'var(--color-primary)',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-md)',
  },
  // Empty state
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'var(--space-md)',
    padding: 'var(--space-xl)',
    textAlign: 'center',
  },
  emptyEmoji: {
    fontSize: '4rem',
  },
  emptyTitle: {
    fontSize: 'var(--font-size-lg)',
    fontWeight: 700,
  },
  emptyText: {
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-text-secondary)',
    lineHeight: 1.4,
  },
  generateBtn: {
    padding: 'var(--space-md) var(--space-xl)',
    backgroundColor: 'var(--color-primary)',
    color: 'white',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    fontWeight: 700,
    fontFamily: 'inherit',
    fontSize: 'var(--font-size-base)',
  },
  // Today progress
  todayProgress: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-md)',
    padding: 'var(--space-md)',
    backgroundColor: 'var(--color-bg)',
    borderRadius: 'var(--radius-md)',
  },
  progressCircle: {
    position: 'relative',
    width: '80px',
    height: '80px',
    flexShrink: 0,
  },
  progressText: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontSize: 'var(--font-size-lg)',
    fontWeight: 700,
    color: 'var(--color-primary)',
  },
  progressLabel: {
    fontWeight: 700,
    fontSize: 'var(--font-size-base)',
  },
  progressHint: {
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-text-secondary)',
    marginTop: '2px',
  },
  // Activity list
  activityList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-sm)',
  },
  activityCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-sm)',
    padding: 'var(--space-md)',
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderLeft: '4px solid',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    fontFamily: 'inherit',
    textAlign: 'left',
    transition: 'all 0.2s',
    width: '100%',
  },
  activityDone: {
    opacity: 0.6,
    backgroundColor: '#E8F5E9',
    cursor: 'default',
  },
  activityOrder: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: 'var(--color-bg)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    fontWeight: 700,
  },
  checkMark: {
    color: 'var(--color-primary)',
    fontSize: '1.2rem',
    fontWeight: 700,
  },
  orderNum: {
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-text-secondary)',
  },
  activityInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  activityName: {
    fontWeight: 700,
    fontSize: 'var(--font-size-base)',
  },
  activityCampo: {
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-text-secondary)',
  },
  goArrow: {
    fontSize: 'var(--font-size-lg)',
    color: 'var(--color-primary)',
    fontWeight: 700,
  },
  // Actions
  actions: {
    display: 'flex',
    justifyContent: 'center',
    gap: 'var(--space-sm)',
  },
  regenerateBtn: {
    padding: 'var(--space-sm) var(--space-md)',
    backgroundColor: 'var(--color-bg)',
    color: 'var(--color-text-secondary)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    fontWeight: 600,
    fontFamily: 'inherit',
    fontSize: 'var(--font-size-sm)',
  },
  // Week stats
  weekStatsRow: {
    display: 'flex',
    justifyContent: 'space-around',
    padding: 'var(--space-md)',
    backgroundColor: 'var(--color-bg)',
    borderRadius: 'var(--radius-md)',
  },
  weekStat: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  weekStatValue: {
    fontSize: 'var(--font-size-xl)',
    fontWeight: 700,
    color: 'var(--color-primary)',
  },
  weekStatLabel: {
    fontSize: '0.65rem',
    color: 'var(--color-text-secondary)',
    textTransform: 'uppercase',
  },
  // Calendar row
  calendarRow: {
    display: 'flex',
    gap: '4px',
    justifyContent: 'space-between',
  },
  calendarDay: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
    padding: 'var(--space-xs)',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
  },
  calendarToday: {
    borderColor: 'var(--color-primary)',
    borderWidth: '2px',
    backgroundColor: '#E8F5E9',
  },
  calendarComplete: {
    backgroundColor: '#C8E6C9',
  },
  calendarDayName: {
    fontSize: '0.6rem',
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
    textTransform: 'uppercase',
  },
  calendarDayNum: {
    fontSize: 'var(--font-size-base)',
    fontWeight: 700,
  },
  calendarDots: {
    fontSize: '0.6rem',
    color: 'var(--color-primary)',
    fontWeight: 600,
  },
  calendarEmpty: {
    fontSize: '0.6rem',
    color: 'var(--color-text-secondary)',
  },
  // Week details
  weekDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-sm)',
  },
  weekDetailsTitle: {
    fontSize: 'var(--font-size-base)',
    fontWeight: 700,
  },
  dayCard: {
    padding: 'var(--space-sm) var(--space-md)',
    backgroundColor: 'var(--color-surface)',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--color-border)',
  },
  dayHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '4px',
  },
  dayDate: {
    fontWeight: 700,
    fontSize: 'var(--font-size-sm)',
  },
  todayTag: {
    backgroundColor: 'var(--color-primary)',
    color: 'white',
    padding: '1px 6px',
    borderRadius: 'var(--radius-sm)',
    fontSize: '0.6rem',
    fontWeight: 700,
    marginLeft: '4px',
  },
  dayScore: {
    fontWeight: 600,
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-text-secondary)',
  },
  dayActivities: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '4px',
  },
  dayActivity: {
    fontSize: '0.7rem',
    padding: '2px 8px',
    backgroundColor: 'var(--color-bg)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--color-text-secondary)',
  },
  dayActivityDone: {
    backgroundColor: '#C8E6C9',
    color: 'var(--color-text)',
  },
  emptyWeek: {
    padding: 'var(--space-xl)',
    textAlign: 'center',
  },
  emptyWeekText: {
    color: 'var(--color-text-secondary)',
    fontSize: 'var(--font-size-sm)',
  },
  // Therapy section
  therapySection: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-sm)',
    padding: 'var(--space-md)',
    backgroundColor: '#FFF3E0',
    borderRadius: 'var(--radius-md)',
    border: '1px solid #FFE0B2',
  },
  therapySectionTitle: {
    fontSize: 'var(--font-size-base)',
    fontWeight: 700,
    color: '#E65100',
  },
  therapyHint: {
    fontSize: 'var(--font-size-sm)',
    color: '#BF360C',
  },
  therapyCard: {
    borderLeftColor: '#FF9800',
    backgroundColor: '#FFF8E1',
  },
  therapyMeta: {
    fontSize: '0.7rem',
    color: '#E65100',
    fontWeight: 600,
  },
  therapyNotes: {
    fontSize: '0.7rem',
    color: 'var(--color-text-secondary)',
    fontStyle: 'italic',
    marginTop: '2px',
  },
}
