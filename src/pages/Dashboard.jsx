import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { VOCABULARY_WORDS, VOCABULARY_CATEGORIES } from '../data/vocabulary'
import { WORKSHEETS } from '../data/worksheets'
import { COMPETENCY_AREAS, MASTERY_LEVELS, PHASES, getCompetencySummary, getCampoPhases, idToLevel, getPhase } from '../data/competencies'
import { PROFESSIONAL_TYPES, PROGRAM_TEMPLATES, getProfessionalType, getTemplatesForProfessional } from '../data/therapyTypes'

/**
 * Parent/Therapist Dashboard — real progress monitoring, worksheet review,
 * and therapy program management for professionals.
 * Accessible from settings page. Shows data, not simulations.
 */
export default function Dashboard({ profile, progress, reviewWorksheet, addEncouragement, prescriptions, subscription }) {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('resumo')
  const [reviewingSubmission, setReviewingSubmission] = useState(null)
  const [reviewStars, setReviewStars] = useState(2)
  const [reviewFeedback, setReviewFeedback] = useState('')
  const [creatingProgram, setCreatingProgram] = useState(false)
  const [programName, setProgramName] = useState('')
  const [programActivities, setProgramActivities] = useState([])
  const [programGoals, setProgramGoals] = useState('')

  const isTherapist = subscription?.tierId === 'therapist'
  const isParentView = subscription?.isParentView
  const canManagePrograms = subscription?.canCreatePrograms
  const professionalType = profile?.professionalType || 'generic'
  const profInfo = getProfessionalType(professionalType)
  const templates = getTemplatesForProfessional(professionalType)

  const submissions = profile?.worksheetSubmissions || []
  const pendingSubmissions = submissions.filter((s) => s.status === 'pending')
  const reviewedSubmissions = submissions.filter((s) => s.status === 'reviewed')

  const wordsLearned = progress?.wordsLearned || []
  const activitiesCompleted = progress?.activitiesCompleted || {}
  const totalStars = progress?.totalStars || 0
  const totalActivities = Object.keys(activitiesCompleted).length

  // Category breakdown of learned words
  const wordsByCategory = VOCABULARY_CATEGORIES.map((cat) => {
    const catWords = VOCABULARY_WORDS.filter((w) => w.category === cat.id)
    const learned = catWords.filter((w) => wordsLearned.includes(w.id))
    return { ...cat, total: catWords.length, learned: learned.length }
  })

  // Campo progress
  const campos = [
    { id: 'campo1', name: 'Linguagem', color: '#1565C0', icon: '🗣️' },
    { id: 'campo2', name: 'Matemática', color: '#E65100', icon: '🔢' },
    { id: 'campo3', name: 'Descoberta', color: '#2E7D32', icon: '🌍' },
    { id: 'campo4', name: 'Autonomia', color: '#6A1B9A', icon: '🤝' },
  ]

  const handleExportReport = useCallback(() => {
    const name = profile?.name || 'Aluno'
    const date = new Date().toLocaleDateString('pt')
    const areas = (profile?.learningNeeds?.areas || []).join(', ') || 'Nenhuma'
    const goals = (profile?.goals || []).join(', ') || 'Nenhum'

    const campoLines = campos.map((c) => {
      const cp = progress?.campoProgress?.[c.id] || { completed: 0, total: 20 }
      const pct = Math.min(100, Math.round((cp.completed / cp.total) * 100))
      return `  ${c.icon} ${c.name}: ${pct}% (${cp.completed}/${cp.total})`
    }).join('\n')

    const vocabLines = wordsByCategory.map((cat) => {
      return `  ${cat.icon} ${cat.label}: ${cat.learned}/${cat.total}`
    }).join('\n')

    // Competency phases for report
    const campoPhases = getCampoPhases(progress, profile?.competencyLevels)
    const campoMeta = [
      { id: 'campo1', name: 'Linguagem', icon: '🗣️' },
      { id: 'campo2', name: 'Matemática', icon: '🔢' },
      { id: 'campo3', name: 'Descoberta', icon: '🌍' },
      { id: 'campo4', name: 'Autonomia', icon: '🤝' },
    ]
    const phaseLines = campoMeta.map((c) => {
      const cp = campoPhases[c.id]
      return `  ${c.icon} ${c.name}: ${cp.phase.emoji} ${cp.phase.reportText} (Nv. ${cp.averageLevel}/10)`
    }).join('\n')

    const report = `
========================================
PITCH - Relatório de Progresso
========================================
Aluno: ${name}
Idade: ${profile?.age || '?'} anos
Data do relatório: ${date}
Universo: ${profile?.universe || 'football'}
Preenchido por: ${profile?.filledBy || 'pai/mãe'}

--- Resumo ---
Estrelas: ${totalStars}
Actividades completadas: ${totalActivities}/20
Palavras aprendidas: ${wordsLearned.length}/${VOCABULARY_WORDS.length}
Dias consecutivos: ${progress?.streakDays || 0}
Troféus: ${progress?.trophies?.length || 0}

--- Fases de Competência ---
${phaseLines}

  Legenda:
  🌱 Germinar (1-3) — Exploração, tentativa, curiosidade
  🌿 Estruturar (4-6) — Competência a formar-se
  🌸 Florescer (7-8) — Autonomia emergente
  🌳 Sustentar (9-10) — Autonomia consolidada

--- Progresso por Área ---
${campoLines}

--- Vocabulário por Categoria ---
${vocabLines}

--- Perfil de Aprendizagem ---
Áreas de apoio: ${areas}
Nível de leitura: ${profile?.learningNeeds?.readingLevel || '?'}
Nível de apoio: ${profile?.learningNeeds?.supportLevel || '?'}
Objectivos: ${goals}

--- Sessões ---
Duração: ${profile?.attention?.sessionLength || 15} minutos
Sensibilidade à frustração: ${profile?.attention?.frustrationSensitivity || 'moderada'}
Lembrete de pausa: ${profile?.attention?.breakReminder ? 'Sim' : 'Não'}

--- Fichas ---
Submetidas: ${submissions.length}
Pendentes: ${pendingSubmissions.length}
Avaliadas: ${reviewedSubmissions.length}
${reviewedSubmissions.length > 0 ? 'Média estrelas: ' + (reviewedSubmissions.reduce((s, r) => s + (r.stars || 0), 0) / reviewedSubmissions.length).toFixed(1) : ''}

========================================
Gerado automaticamente por PITCH
========================================
`.trim()

    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `PITCH_Relatório_${name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [profile, progress, totalStars, totalActivities, wordsLearned, submissions, pendingSubmissions, reviewedSubmissions, wordsByCategory, campos])

  const handleSubmitReview = () => {
    if (!reviewingSubmission) return
    reviewWorksheet?.(reviewingSubmission.id, reviewStars, reviewFeedback.trim() || null)
    setReviewingSubmission(null)
    setReviewStars(2)
    setReviewFeedback('')
  }

  // Review modal
  if (reviewingSubmission) {
    const ws = WORKSHEETS.find((w) => w.id === reviewingSubmission.worksheetId)
    return (
      <div style={styles.container} className="animate-fade-in">
        <button style={styles.backBtn} onClick={() => setReviewingSubmission(null)}>← Voltar</button>

        <h2 style={styles.pageTitle}>Avaliar Ficha</h2>
        <p style={styles.pageDesc}>{ws?.title || reviewingSubmission.worksheetId}</p>
        <p style={styles.dateText}>
          Enviada: {new Date(reviewingSubmission.date).toLocaleDateString('pt')}
        </p>

        {reviewingSubmission.photoData && (
          <img
            src={reviewingSubmission.photoData}
            alt="Ficha do aluno"
            style={styles.reviewPhoto}
          />
        )}

        {!reviewingSubmission.photoData && (
          <div style={styles.noPhotoBox}>
            <span style={styles.noPhotoEmoji}>📝</span>
            <p style={styles.noPhotoText}>Ficha completada sem foto</p>
          </div>
        )}

        <div style={styles.ratingSection}>
          <p style={styles.ratingLabel}>Avaliação:</p>
          <div style={styles.starsRow}>
            {[1, 2, 3].map((s) => (
              <button
                key={s}
                style={{
                  ...styles.starBtn,
                  opacity: s <= reviewStars ? 1 : 0.3,
                }}
                onClick={() => setReviewStars(s)}
              >
                ⭐
              </button>
            ))}
          </div>
          <p style={styles.ratingHint}>
            {reviewStars === 1 ? 'Precisa de praticar mais' : reviewStars === 2 ? 'Bom trabalho!' : 'Excelente!'}
          </p>
        </div>

        <div style={styles.feedbackSection}>
          <label style={styles.feedbackLabel}>Mensagem (opcional):</label>
          <textarea
            style={styles.feedbackInput}
            value={reviewFeedback}
            onChange={(e) => setReviewFeedback(e.target.value)}
            placeholder="Escrita muito bonita! Continua assim..."
            rows={3}
            maxLength={200}
          />
        </div>

        <button style={styles.submitReviewBtn} onClick={handleSubmitReview}>
          Enviar Avaliação
        </button>
      </div>
    )
  }

  return (
    <div style={styles.container} className="animate-fade-in">
      <header style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate('/definicoes')}>
          ← Voltar
        </button>
        <div style={styles.headerRow}>
          <div>
            <h1 style={styles.pageTitle}>{isTherapist ? 'Painel do Terapeuta' : 'Painel Familiar'}</h1>
            <p style={styles.pageDesc}>Progresso do {profile?.name || 'aluno'}</p>
          </div>
          <button
            style={styles.exportBtn}
            onClick={handleExportReport}
            aria-label="Exportar relatório"
          >
            📄 Exportar
          </button>
        </div>
      </header>

      <div style={styles.tabs}>
        {[
          { id: 'resumo', label: 'Resumo', icon: '📊' },
          { id: 'fichas', label: `Fichas (${pendingSubmissions.length})`, icon: '📬' },
          ...(canManagePrograms ? [{ id: 'programas', label: isTherapist ? 'Programas' : 'Planos', icon: isTherapist ? '🩺' : '📋' }] : []),
          { id: 'palavras', label: 'Vocabulário', icon: '🗣️' },
          { id: 'competencias', label: 'Competências', icon: '🌱' },
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

      {activeTab === 'resumo' && (
        <div style={styles.section} className="animate-fade-in">
          {/* Summary cards */}
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <span style={styles.statEmoji}>⭐</span>
              <span style={styles.statNumber}>{totalStars}</span>
              <span style={styles.statLabel}>Estrelas</span>
            </div>
            <div style={styles.statCard}>
              <span style={styles.statEmoji}>🏆</span>
              <span style={styles.statNumber}>{totalActivities}</span>
              <span style={styles.statLabel}>Actividades</span>
            </div>
            <div style={styles.statCard}>
              <span style={styles.statEmoji}>🗣️</span>
              <span style={styles.statNumber}>{wordsLearned.length}</span>
              <span style={styles.statLabel}>Palavras</span>
            </div>
            <div style={styles.statCard}>
              <span style={styles.statEmoji}>🔥</span>
              <span style={styles.statNumber}>{progress?.streakDays || 0}</span>
              <span style={styles.statLabel}>Dias seguidos</span>
            </div>
          </div>

          {/* Campo progress */}
          <h3 style={styles.subTitle}>Progresso por Área</h3>
          <div style={styles.campoList}>
            {campos.map((campo) => {
              const cp = progress?.campoProgress?.[campo.id] || { completed: 0, total: 20 }
              const pct = Math.min(100, Math.round((cp.completed / cp.total) * 100))
              return (
                <div key={campo.id} style={styles.campoCard}>
                  <div style={styles.campoHeader}>
                    <span>{campo.icon} {campo.name}</span>
                    <span style={styles.campoPct}>{pct}%</span>
                  </div>
                  <div style={styles.campoBar}>
                    <div style={{ ...styles.campoFill, width: `${pct}%`, backgroundColor: campo.color }} />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Strengths and areas for improvement */}
          <h3 style={styles.subTitle}>Observações</h3>
          <div style={styles.observationsList}>
            {wordsLearned.length >= 20 && (
              <div style={styles.obsCard}>
                <span style={styles.obsIcon}>💪</span>
                <p style={styles.obsText}>Forte em vocabulário — {wordsLearned.length} palavras aprendidas!</p>
              </div>
            )}
            {totalActivities > 0 && totalStars / totalActivities >= 2.5 && (
              <div style={styles.obsCard}>
                <span style={styles.obsIcon}>🌟</span>
                <p style={styles.obsText}>Média alta de estrelas ({(totalStars / totalActivities).toFixed(1)} por actividade)</p>
              </div>
            )}
            {totalActivities > 0 && totalStars / totalActivities < 2 && (
              <div style={styles.obsCard}>
                <span style={styles.obsIcon}>📌</span>
                <p style={styles.obsText}>Pode beneficiar de repetir actividades para consolidar</p>
              </div>
            )}
            {(progress?.streakDays || 0) === 0 && (
              <div style={styles.obsCard}>
                <span style={styles.obsIcon}>📅</span>
                <p style={styles.obsText}>Encorajar uso diário para criar rotina</p>
              </div>
            )}
            {pendingSubmissions.length > 0 && (
              <div style={{ ...styles.obsCard, backgroundColor: '#FFF3E0', borderColor: '#FFB74D' }}>
                <span style={styles.obsIcon}>📬</span>
                <p style={styles.obsText}>{pendingSubmissions.length} ficha(s) a aguardar avaliação</p>
              </div>
            )}
            {totalActivities === 0 && (
              <div style={styles.obsCard}>
                <span style={styles.obsIcon}>🌱</span>
                <p style={styles.obsText}>Ainda não completou actividades. O início da jornada!</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'fichas' && (
        <div style={styles.section} className="animate-fade-in">
          <h3 style={styles.subTitle}>Fichas Pendentes</h3>
          {pendingSubmissions.length === 0 ? (
            <div style={styles.emptyState}>
              <span style={styles.emptyEmoji}>✅</span>
              <p style={styles.emptyText}>Não há fichas pendentes de avaliação.</p>
            </div>
          ) : (
            <div style={styles.submissionList}>
              {pendingSubmissions.map((sub) => {
                const ws = WORKSHEETS.find((w) => w.id === sub.worksheetId)
                return (
                  <button
                    key={sub.id}
                    style={styles.submissionCard}
                    onClick={() => setReviewingSubmission(sub)}
                  >
                    <div style={styles.subInfo}>
                      <span style={styles.subTitle2}>{ws?.title || sub.worksheetId}</span>
                      <span style={styles.subDate}>
                        {new Date(sub.date).toLocaleDateString('pt')}
                      </span>
                    </div>
                    <span style={styles.subAction}>Avaliar →</span>
                  </button>
                )
              })}
            </div>
          )}

          {reviewedSubmissions.length > 0 && (
            <>
              <h3 style={{ ...styles.subTitle, marginTop: 'var(--space-lg)' }}>Histórico</h3>
              <div style={styles.submissionList}>
                {reviewedSubmissions
                  .sort((a, b) => new Date(b.reviewedAt) - new Date(a.reviewedAt))
                  .slice(0, 10)
                  .map((sub) => {
                    const ws = WORKSHEETS.find((w) => w.id === sub.worksheetId)
                    return (
                      <div key={sub.id} style={styles.reviewedCard}>
                        <div style={styles.subInfo}>
                          <span style={styles.subTitle2}>{ws?.title || sub.worksheetId}</span>
                          <span style={styles.subDate}>
                            {new Date(sub.reviewedAt).toLocaleDateString('pt')}
                          </span>
                        </div>
                        <div style={styles.reviewedStars}>
                          {[1, 2, 3].map((n) => (
                            <span key={n} style={{ opacity: n <= sub.stars ? 1 : 0.2 }}>⭐</span>
                          ))}
                        </div>
                      </div>
                    )
                  })}
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === 'programas' && canManagePrograms && (
        <div style={styles.section} className="animate-fade-in">
          {isTherapist ? (
            <div style={styles.profHeader}>
              <span style={styles.profIcon}>{profInfo?.icon || '👤'}</span>
              <div>
                <h3 style={styles.subTitle}>{profInfo?.name || 'Profissional'}</h3>
                <p style={styles.profDesc}>{profInfo?.description || ''}</p>
              </div>
            </div>
          ) : (
            <div style={styles.profHeader}>
              <span style={styles.profIcon}>👩‍👧</span>
              <div>
                <h3 style={styles.subTitle}>Planos Caseiros</h3>
                <p style={styles.profDesc}>Crie planos de actividades para praticar em casa.</p>
              </div>
            </div>
          )}

          {/* Existing programs */}
          <h4 style={styles.programsSubtitle}>{isTherapist ? 'Programas Activos' : 'Planos Activos'}</h4>
          {(prescriptions?.programs || []).length === 0 ? (
            <div style={styles.emptyState}>
              <span style={styles.emptyEmoji}>📋</span>
              <p style={styles.emptyText}>Ainda não criou programas de terapia.</p>
            </div>
          ) : (
            <div style={styles.programList}>
              {(prescriptions?.programs || []).map((prog) => (
                <div key={prog.id} style={styles.programCard}>
                  <div style={styles.programHeader}>
                    <span style={styles.programName}>{prog.name}</span>
                    <span style={{
                      ...styles.programStatus,
                      color: prog.status === 'active' ? '#2E7D32' : '#757575',
                    }}>
                      {prog.status === 'active' ? 'Activo' : 'Pausado'}
                    </span>
                  </div>
                  <div style={styles.programActivities}>
                    {(prog.activities || []).map((act, i) => (
                      <span key={i} style={styles.programActivity}>
                        {act.activityId} · {act.frequency}
                        {act.notes && ` · ${act.notes}`}
                      </span>
                    ))}
                  </div>
                  <div style={styles.programActions}>
                    <button
                      style={styles.programActionBtn}
                      onClick={() => {
                        prescriptions.prescribe(prog.id, profile?.id)
                      }}
                    >
                      Prescrever a {profile?.name || 'criança'}
                    </button>
                    <button
                      style={{ ...styles.programActionBtn, color: '#D32F2F', borderColor: '#FFCDD2' }}
                      onClick={() => prescriptions.deleteProgram(prog.id)}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Create from template */}
          {!creatingProgram && (
            <>
              <h4 style={styles.programsSubtitle}>Criar Programa</h4>
              {templates.length > 0 && (
                <>
                  <p style={styles.templateHint}>Modelos sugeridos para {profInfo?.name}:</p>
                  <div style={styles.templateList}>
                    {templates.map((tmpl) => (
                      <button
                        key={tmpl.id}
                        style={styles.templateCard}
                        onClick={() => {
                          const created = prescriptions.createProgram({
                            name: tmpl.name,
                            professionalType,
                            professionalName: profile?.name || 'Profissional',
                            activities: tmpl.activities,
                            goals: tmpl.goals,
                          })
                          if (created && profile?.id) {
                            prescriptions.prescribe(created.id, profile.id)
                          }
                        }}
                      >
                        <span style={styles.templateName}>{tmpl.name}</span>
                        <span style={styles.templateDetail}>
                          {tmpl.activities.length} actividades · {tmpl.goals.length} objectivos
                        </span>
                        <span style={styles.templateGoals}>
                          {tmpl.goals.slice(0, 2).join(', ')}
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              )}
              <button
                style={styles.createProgramBtn}
                onClick={() => setCreatingProgram(true)}
              >
                + Criar Programa Personalizado
              </button>
            </>
          )}

          {/* Custom program creation form */}
          {creatingProgram && (
            <div style={styles.createForm}>
              <h4 style={styles.programsSubtitle}>Novo Programa</h4>
              <input
                style={styles.formInput}
                type="text"
                placeholder="Nome do programa (ex: Articulação — Semana 1)"
                value={programName}
                onChange={(e) => setProgramName(e.target.value)}
              />

              <p style={styles.formLabel}>Actividades recomendadas:</p>
              <div style={styles.activityPicker}>
                {(profInfo?.recommendedActivities || []).map((actId) => {
                  const isSelected = programActivities.some((a) => a.activityId === actId)
                  return (
                    <button
                      key={actId}
                      style={{
                        ...styles.activityPickerItem,
                        ...(isSelected ? styles.activityPickerSelected : {}),
                      }}
                      onClick={() => {
                        if (isSelected) {
                          setProgramActivities((prev) => prev.filter((a) => a.activityId !== actId))
                        } else {
                          setProgramActivities((prev) => [
                            ...prev,
                            { activityId: actId, frequency: 'daily', notes: '', targetLevel: 2 },
                          ])
                        }
                      }}
                    >
                      {isSelected ? '✓ ' : ''}{actId.replace(/-/g, ' ')}
                    </button>
                  )
                })}
              </div>

              {/* Frequency per selected activity */}
              {programActivities.length > 0 && (
                <div style={styles.freqList}>
                  {programActivities.map((act, idx) => (
                    <div key={act.activityId} style={styles.freqRow}>
                      <span style={styles.freqName}>{act.activityId.replace(/-/g, ' ')}</span>
                      <select
                        style={styles.freqSelect}
                        value={act.frequency}
                        onChange={(e) => {
                          const updated = [...programActivities]
                          updated[idx] = { ...updated[idx], frequency: e.target.value }
                          setProgramActivities(updated)
                        }}
                      >
                        <option value="daily">Diário</option>
                        <option value="3x-week">3x/semana</option>
                        <option value="weekly">Semanal</option>
                      </select>
                    </div>
                  ))}
                </div>
              )}

              <textarea
                style={styles.formTextarea}
                placeholder="Objectivos (um por linha)"
                value={programGoals}
                onChange={(e) => setProgramGoals(e.target.value)}
                rows={3}
              />

              <div style={styles.formBtns}>
                <button
                  style={styles.createProgramBtn}
                  disabled={!programName.trim() || programActivities.length === 0}
                  onClick={() => {
                    const created = prescriptions.createProgram({
                      name: programName.trim(),
                      professionalType,
                      professionalName: profile?.name || 'Profissional',
                      activities: programActivities,
                      goals: programGoals.split('\n').filter((g) => g.trim()),
                    })
                    if (created && profile?.id) {
                      prescriptions.prescribe(created.id, profile.id)
                    }
                    setProgramName('')
                    setProgramActivities([])
                    setProgramGoals('')
                    setCreatingProgram(false)
                  }}
                >
                  Criar e Prescrever
                </button>
                <button
                  style={styles.cancelBtn}
                  onClick={() => {
                    setCreatingProgram(false)
                    setProgramName('')
                    setProgramActivities([])
                    setProgramGoals('')
                  }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'palavras' && (
        <div style={styles.section} className="animate-fade-in">
          <h3 style={styles.subTitle}>Vocabulário por Categoria</h3>
          <p style={styles.sectionDesc}>
            {wordsLearned.length} de {VOCABULARY_WORDS.length} palavras aprendidas
          </p>
          <div style={styles.vocabList}>
            {wordsByCategory.map((cat) => {
              const pct = Math.round((cat.learned / cat.total) * 100) || 0
              return (
                <div key={cat.id} style={styles.vocabCard}>
                  <div style={styles.vocabHeader}>
                    <span>{cat.icon} {cat.label}</span>
                    <span style={styles.vocabCount}>{cat.learned}/{cat.total}</span>
                  </div>
                  <div style={styles.vocabBar}>
                    <div style={{ ...styles.vocabFill, width: `${pct}%`, backgroundColor: cat.color }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
      {activeTab === 'competencias' && (
        <div style={styles.section} className="animate-fade-in">
          <h3 style={styles.subTitle}>Mapa de Competências</h3>
          <p style={styles.sectionDesc}>
            10 níveis progressivos — a criança avança quando domina, não por idade.
          </p>

          {/* Phase overview — the therapist/parent communication layer */}
          {(() => {
            const campoPhases = getCampoPhases(progress, profile?.competencyLevels)
            const campoMeta = [
              { id: 'campo1', name: 'Linguagem', icon: '🗣️' },
              { id: 'campo2', name: 'Matemática', icon: '🔢' },
              { id: 'campo3', name: 'Descoberta', icon: '🌍' },
              { id: 'campo4', name: 'Autonomia', icon: '🤝' },
            ]
            return (
              <div style={styles.phaseOverview}>
                <p style={styles.phaseOverviewTitle}>Fases por área</p>
                <div style={styles.phaseGrid}>
                  {campoMeta.map((c) => {
                    const cp = campoPhases[c.id]
                    return (
                      <div key={c.id} style={styles.phaseCard}>
                        <span style={styles.phaseCardIcon}>{c.icon}</span>
                        <span style={styles.phaseCardName}>{c.name}</span>
                        <span style={{
                          ...styles.phaseBadge,
                          backgroundColor: cp.phase.color,
                        }}>
                          {cp.phase.emoji} {cp.phase.label}
                        </span>
                        <span style={styles.phaseCardLevel}>Nv. {cp.averageLevel}</span>
                      </div>
                    )
                  })}
                </div>
                {/* Phase legend */}
                <div style={styles.phaseLegend}>
                  {PHASES.map((p) => (
                    <div key={p.id} style={styles.phaseLegendItem}>
                      <span style={{ ...styles.phaseLegendDot, backgroundColor: p.color }} />
                      <span style={styles.phaseLegendText}>
                        {p.emoji} {p.label} ({p.range[0]}-{p.range[1]}) — {p.description}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })()}

          {Object.entries(getCompetencySummary(progress, profile?.competencyLevels)).map(([campoId, competencies]) => {
            const campo = COMPETENCY_AREAS[campoId]
            return (
              <div key={campoId} style={styles.compCampo}>
                <h4 style={styles.compCampoTitle}>{campo.icon} {campo.name}</h4>
                {competencies.map((comp) => {
                  const numLevel = comp.numericLevel
                  const level = MASTERY_LEVELS[numLevel - 1]
                  const phase = comp.phase
                  return (
                    <div key={comp.id} style={styles.compCard}>
                      <div style={styles.compHeader}>
                        <span style={styles.compName}>{comp.name}</span>
                        <span style={styles.compLevel}>{level.emoji} Nv. {numLevel} — {level.label}</span>
                      </div>
                      <div style={styles.compPhaseRow}>
                        <span style={{ ...styles.compPhaseBadge, backgroundColor: phase.color }}>
                          {phase.emoji} {phase.label}
                        </span>
                        <span style={styles.compPhaseDesc}>{phase.description}</span>
                      </div>
                      <p style={styles.compDesc}>{comp.description}</p>

                      {/* 10-level progress bar with phase colors */}
                      <div style={styles.compProgressTrack}>
                        <div style={{
                          ...styles.compProgressFill,
                          width: `${(numLevel / 10) * 100}%`,
                          backgroundColor: phase.color,
                        }} />
                        <div style={styles.compProgressMarkers}>
                          {Array.from({ length: 10 }, (_, i) => (
                            <div
                              key={i}
                              style={{
                                ...styles.compProgressDot,
                                backgroundColor: i < numLevel ? phase.color : 'var(--color-border)',
                              }}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Current & next milestone */}
                      <div style={styles.compCurrentMilestone}>
                        <span>{level.emoji}</span>
                        <span style={styles.compMilestoneText}>{comp.milestones[level.id]}</span>
                      </div>
                      {numLevel < 10 && (
                        <div style={{ ...styles.compCurrentMilestone, opacity: 0.5 }}>
                          <span>{MASTERY_LEVELS[numLevel].emoji}</span>
                          <span style={styles.compMilestoneText}>
                            Próximo: {comp.milestones[MASTERY_LEVELS[numLevel].id]}
                          </span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )
          })}
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
    flexDirection: 'column',
    gap: 'var(--space-sm)',
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exportBtn: {
    padding: 'var(--space-sm) var(--space-md)',
    backgroundColor: '#E3F2FD',
    color: '#1565C0',
    border: '1px solid #90CAF9',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    fontWeight: 700,
    fontFamily: 'inherit',
    fontSize: 'var(--font-size-sm)',
    whiteSpace: 'nowrap',
  },
  backBtn: {
    alignSelf: 'flex-start',
    padding: 'var(--space-sm) var(--space-md)',
    color: 'var(--color-text-secondary)',
    fontWeight: 600,
    fontSize: 'var(--font-size-base)',
    cursor: 'pointer',
    border: 'none',
    background: 'none',
    fontFamily: 'inherit',
  },
  pageTitle: {
    fontSize: 'var(--font-size-xl)',
    fontWeight: 700,
    color: 'var(--color-text)',
  },
  pageDesc: {
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-text-secondary)',
  },
  dateText: {
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-text-secondary)',
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
  sectionDesc: {
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-text-secondary)',
    marginTop: '-8px',
  },
  subTitle: {
    fontSize: 'var(--font-size-lg)',
    fontWeight: 700,
    color: 'var(--color-text)',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 'var(--space-sm)',
  },
  statCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    padding: 'var(--space-md)',
    backgroundColor: 'var(--color-bg)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--color-border)',
  },
  statEmoji: {
    fontSize: '1.5rem',
  },
  statNumber: {
    fontSize: 'var(--font-size-2xl)',
    fontWeight: 700,
    color: 'var(--color-primary)',
  },
  statLabel: {
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-text-secondary)',
    fontWeight: 500,
  },
  campoList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-sm)',
  },
  campoCard: {
    padding: 'var(--space-md)',
    backgroundColor: 'var(--color-bg)',
    borderRadius: 'var(--radius-md)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-xs)',
  },
  campoHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 'var(--font-size-sm)',
    fontWeight: 600,
  },
  campoPct: {
    color: 'var(--color-text-secondary)',
  },
  campoBar: {
    height: '6px',
    backgroundColor: 'var(--color-border)',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  campoFill: {
    height: '100%',
    borderRadius: '3px',
    transition: 'width 0.6s ease',
  },
  observationsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-sm)',
  },
  obsCard: {
    display: 'flex',
    gap: 'var(--space-sm)',
    padding: 'var(--space-md)',
    backgroundColor: '#E8F5E9',
    borderRadius: 'var(--radius-md)',
    border: '1px solid #A5D6A7',
    alignItems: 'flex-start',
  },
  obsIcon: {
    fontSize: '1.2rem',
    flexShrink: 0,
  },
  obsText: {
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-text)',
    lineHeight: 1.4,
  },
  // Fichas review
  submissionList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-sm)',
  },
  submissionCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 'var(--space-md)',
    backgroundColor: '#FFF3E0',
    borderRadius: 'var(--radius-md)',
    border: '2px solid #FFB74D',
    cursor: 'pointer',
    fontFamily: 'inherit',
    textAlign: 'left',
  },
  subInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  subTitle2: {
    fontWeight: 700,
    fontSize: 'var(--font-size-base)',
    color: 'var(--color-text)',
  },
  subDate: {
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-text-secondary)',
  },
  subAction: {
    fontWeight: 700,
    color: '#E65100',
    fontSize: 'var(--font-size-sm)',
  },
  reviewedCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 'var(--space-md)',
    backgroundColor: 'var(--color-bg)',
    borderRadius: 'var(--radius-md)',
  },
  reviewedStars: {
    display: 'flex',
    gap: '2px',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'var(--space-md)',
    padding: 'var(--space-xl)',
  },
  emptyEmoji: {
    fontSize: '3rem',
  },
  emptyText: {
    textAlign: 'center',
    color: 'var(--color-text-secondary)',
  },
  // Review form
  reviewPhoto: {
    width: '100%',
    maxWidth: '400px',
    borderRadius: 'var(--radius-md)',
    border: '3px solid var(--color-primary)',
    alignSelf: 'center',
  },
  noPhotoBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'var(--space-sm)',
    padding: 'var(--space-lg)',
    backgroundColor: 'var(--color-bg)',
    borderRadius: 'var(--radius-md)',
  },
  noPhotoEmoji: {
    fontSize: '3rem',
  },
  noPhotoText: {
    color: 'var(--color-text-secondary)',
  },
  ratingSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'var(--space-sm)',
  },
  ratingLabel: {
    fontWeight: 700,
    fontSize: 'var(--font-size-base)',
  },
  starsRow: {
    display: 'flex',
    gap: 'var(--space-md)',
  },
  starBtn: {
    fontSize: '2.5rem',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    padding: 'var(--space-xs)',
    transition: 'transform 0.2s',
  },
  ratingHint: {
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-text-secondary)',
    fontStyle: 'italic',
  },
  feedbackSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-xs)',
  },
  feedbackLabel: {
    fontWeight: 600,
    fontSize: 'var(--font-size-sm)',
  },
  feedbackInput: {
    padding: 'var(--space-md)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    fontFamily: 'inherit',
    fontSize: 'var(--font-size-base)',
    outline: 'none',
    resize: 'vertical',
  },
  submitReviewBtn: {
    padding: 'var(--space-md)',
    backgroundColor: 'var(--color-primary)',
    color: 'white',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    fontWeight: 700,
    fontFamily: 'inherit',
    fontSize: 'var(--font-size-base)',
  },
  // Vocabulary
  vocabList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-sm)',
  },
  vocabCard: {
    padding: 'var(--space-md)',
    backgroundColor: 'var(--color-bg)',
    borderRadius: 'var(--radius-md)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-xs)',
  },
  vocabHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 'var(--font-size-sm)',
    fontWeight: 600,
  },
  vocabCount: {
    color: 'var(--color-text-secondary)',
  },
  vocabBar: {
    height: '6px',
    backgroundColor: 'var(--color-border)',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  vocabFill: {
    height: '100%',
    borderRadius: '3px',
    transition: 'width 0.6s ease',
  },
  // Phases overview
  phaseOverview: {
    padding: 'var(--space-md)',
    backgroundColor: 'var(--color-bg)',
    borderRadius: 'var(--radius-lg)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-md)',
    border: '1px solid var(--color-border)',
  },
  phaseOverviewTitle: {
    fontSize: 'var(--font-size-sm)',
    fontWeight: 700,
    color: 'var(--color-text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  phaseGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 'var(--space-sm)',
  },
  phaseCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    padding: 'var(--space-md)',
    backgroundColor: 'var(--color-surface)',
    borderRadius: 'var(--radius-md)',
  },
  phaseCardIcon: { fontSize: '1.5rem' },
  phaseCardName: {
    fontSize: 'var(--font-size-sm)',
    fontWeight: 600,
  },
  phaseBadge: {
    padding: '2px 10px',
    borderRadius: 'var(--radius-sm)',
    color: 'white',
    fontSize: 'var(--font-size-sm)',
    fontWeight: 700,
  },
  phaseCardLevel: {
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-text-secondary)',
  },
  phaseLegend: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    borderTop: '1px solid var(--color-border)',
    paddingTop: 'var(--space-sm)',
  },
  phaseLegendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-xs)',
  },
  phaseLegendDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  phaseLegendText: {
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-text-secondary)',
    lineHeight: 1.3,
  },
  // Competencies
  compCampo: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-sm)',
    marginBottom: 'var(--space-md)',
  },
  compCampoTitle: {
    fontSize: 'var(--font-size-base)',
    fontWeight: 700,
    color: 'var(--color-text)',
    borderBottom: '2px solid var(--color-border)',
    paddingBottom: 'var(--space-xs)',
  },
  compCard: {
    padding: 'var(--space-md)',
    backgroundColor: 'var(--color-bg)',
    borderRadius: 'var(--radius-md)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-xs)',
  },
  compHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '4px',
  },
  compName: {
    fontWeight: 700,
    fontSize: 'var(--font-size-base)',
  },
  compLevel: {
    fontSize: 'var(--font-size-sm)',
    fontWeight: 600,
    padding: '2px 8px',
    backgroundColor: '#E8F5E9',
    borderRadius: 'var(--radius-sm)',
  },
  compPhaseRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-xs)',
    marginTop: '2px',
  },
  compPhaseBadge: {
    padding: '1px 8px',
    borderRadius: 'var(--radius-sm)',
    color: 'white',
    fontSize: 'var(--font-size-sm)',
    fontWeight: 600,
    flexShrink: 0,
  },
  compPhaseDesc: {
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-text-secondary)',
    fontStyle: 'italic',
  },
  compDesc: {
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-text-secondary)',
  },
  compProgressTrack: {
    position: 'relative',
    height: '8px',
    backgroundColor: 'var(--color-border)',
    borderRadius: '4px',
    overflow: 'hidden',
    marginTop: 'var(--space-xs)',
  },
  compProgressFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    backgroundColor: 'var(--color-primary)',
    borderRadius: '4px',
    transition: 'width 0.6s ease',
  },
  compProgressMarkers: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 1px',
  },
  compProgressDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    transition: 'background-color 0.3s',
  },
  compCurrentMilestone: {
    display: 'flex',
    gap: 'var(--space-xs)',
    alignItems: 'flex-start',
    fontSize: 'var(--font-size-sm)',
    marginTop: '2px',
  },
  compMilestoneText: {
    lineHeight: 1.3,
  },
  // Programs tab
  profHeader: {
    display: 'flex',
    gap: 'var(--space-md)',
    alignItems: 'center',
    padding: 'var(--space-md)',
    backgroundColor: '#E3F2FD',
    borderRadius: 'var(--radius-md)',
    border: '1px solid #90CAF9',
  },
  profIcon: {
    fontSize: '2.5rem',
  },
  profDesc: {
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-text-secondary)',
    marginTop: '2px',
  },
  programsSubtitle: {
    fontSize: 'var(--font-size-base)',
    fontWeight: 700,
    marginTop: 'var(--space-sm)',
  },
  programList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-sm)',
  },
  programCard: {
    padding: 'var(--space-md)',
    backgroundColor: 'var(--color-bg)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--color-border)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-sm)',
  },
  programHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  programName: {
    fontWeight: 700,
    fontSize: 'var(--font-size-base)',
  },
  programStatus: {
    fontSize: 'var(--font-size-sm)',
    fontWeight: 600,
  },
  programActivities: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '4px',
  },
  programActivity: {
    fontSize: '0.7rem',
    padding: '2px 8px',
    backgroundColor: '#E8F5E9',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--color-text)',
  },
  programActions: {
    display: 'flex',
    gap: 'var(--space-sm)',
  },
  programActionBtn: {
    padding: 'var(--space-sm) var(--space-md)',
    backgroundColor: 'transparent',
    color: 'var(--color-primary)',
    border: '1px solid var(--color-primary)',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer',
    fontWeight: 600,
    fontFamily: 'inherit',
    fontSize: 'var(--font-size-sm)',
  },
  templateHint: {
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-text-secondary)',
  },
  templateList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-sm)',
  },
  templateCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    padding: 'var(--space-md)',
    backgroundColor: '#FFF8E1',
    border: '2px solid #FFE082',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    fontFamily: 'inherit',
    textAlign: 'left',
  },
  templateName: {
    fontWeight: 700,
    fontSize: 'var(--font-size-base)',
    color: '#E65100',
  },
  templateDetail: {
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-text-secondary)',
  },
  templateGoals: {
    fontSize: '0.7rem',
    color: '#757575',
    fontStyle: 'italic',
  },
  createProgramBtn: {
    padding: 'var(--space-md)',
    backgroundColor: 'var(--color-primary)',
    color: 'white',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    fontWeight: 700,
    fontFamily: 'inherit',
    fontSize: 'var(--font-size-base)',
  },
  cancelBtn: {
    padding: 'var(--space-sm) var(--space-md)',
    backgroundColor: 'transparent',
    color: 'var(--color-text-secondary)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: 'var(--font-size-sm)',
  },
  createForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-sm)',
    padding: 'var(--space-md)',
    backgroundColor: 'var(--color-bg)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--color-border)',
  },
  formInput: {
    padding: 'var(--space-md)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    fontFamily: 'inherit',
    fontSize: 'var(--font-size-base)',
    outline: 'none',
  },
  formLabel: {
    fontSize: 'var(--font-size-sm)',
    fontWeight: 600,
    marginTop: 'var(--space-xs)',
  },
  formTextarea: {
    padding: 'var(--space-md)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    fontFamily: 'inherit',
    fontSize: 'var(--font-size-base)',
    outline: 'none',
    resize: 'vertical',
  },
  formBtns: {
    display: 'flex',
    gap: 'var(--space-sm)',
  },
  activityPicker: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
  },
  activityPickerItem: {
    padding: 'var(--space-sm) var(--space-md)',
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: 'var(--font-size-sm)',
    textTransform: 'capitalize',
  },
  activityPickerSelected: {
    backgroundColor: '#C8E6C9',
    borderColor: '#4CAF50',
    color: '#1B5E20',
    fontWeight: 700,
  },
  freqList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  freqRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '4px 8px',
    backgroundColor: 'var(--color-surface)',
    borderRadius: 'var(--radius-sm)',
  },
  freqName: {
    fontSize: 'var(--font-size-sm)',
    fontWeight: 600,
    textTransform: 'capitalize',
  },
  freqSelect: {
    padding: '4px 8px',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-sm)',
    fontFamily: 'inherit',
    fontSize: 'var(--font-size-sm)',
    outline: 'none',
  },
}
