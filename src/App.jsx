import { BrowserRouter, Routes, Route, useLocation, useParams, useNavigate } from 'react-router-dom'
import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import Layout from './components/Layout'
import Home from './pages/Home'
import Welcome from './pages/Welcome'
import Landing from './pages/Landing'
import FAQ from './pages/FAQ'
import Suporte from './pages/Suporte'
import Campo1Bancada from './pages/Campo1Bancada'
import Campo2Marcador from './pages/Campo2Marcador'
import Campo3Mundo from './pages/Campo3Mundo'
import Campo4Vida from './pages/Campo4Vida'
import Campo5Expressao from './pages/Campo5Expressao'
import Campo6Social from './pages/Campo6Social'
import Campo7Biblioteca from './pages/Campo7Biblioteca'
import Progress from './pages/Progress'
import Intake from './pages/Intake'
import Fichas from './pages/Fichas'
import Noticias from './pages/Noticias'
import Comunidade from './pages/Comunidade'
import Loja from './pages/Loja'
import Desafios from './pages/Desafios'
import Definicoes from './pages/Definicoes'
import Dashboard from './pages/Dashboard'
import Planner from './pages/Planner'
import BancoDaCalma from './components/BancoDaCalma'
import BreakReminder from './components/BreakReminder'
import VocabularyMatch from './activities/campo1/VocabularyMatch'
import DressThePlayer from './activities/campo1/DressThePlayer'
import ColorKit from './activities/campo1/ColorKit'
import ReadScore from './activities/campo1/ReadScore'
import GoalMath from './activities/campo2/GoalMath'
import ClockReader from './activities/campo2/ClockReader'
import TeamDivision from './activities/campo2/TeamDivision'
import TicketShop from './activities/campo2/TicketShop'
import FlagMatch from './activities/campo3/FlagMatch'
import WorldExplorer from './activities/campo3/WorldExplorer'
import BodyScience from './activities/campo3/BodyScience'
import WeatherMatch from './activities/campo3/WeatherMatch'
import DailyRoutine from './activities/campo4/DailyRoutine'
import RealWorld from './activities/campo4/RealWorld'
import Phonics from './activities/campo1/Phonics'
import SyllableBuilder from './activities/campo1/SyllableBuilder'
import SentenceBuilder from './activities/campo1/SentenceBuilder'
import ListeningQuest from './activities/campo1/ListeningQuest'
import Patterns from './activities/campo2/Patterns'
import NatureLab from './activities/campo3/NatureLab'
import ProblemSolving from './activities/campo4/ProblemSolving'
import HealthyChoices from './activities/campo4/HealthyChoices'
import TimePlanner from './activities/campo4/TimePlanner'
import StoryBuilder from './activities/campo5/StoryBuilder'
import MusicMaker from './activities/campo5/MusicMaker'
import ColorCanvas from './activities/campo5/ColorCanvas'
import PatternArt from './activities/campo5/PatternArt'
import SoundStory from './activities/campo5/SoundStory'
import EmotionCards from './activities/campo6/EmotionCards'
import FairPlay from './activities/campo6/FairPlay'
import SocialDetective from './activities/campo6/SocialDetective'
import TurnTalk from './activities/campo6/TurnTalk'
import CalmToolkit from './activities/campo6/CalmToolkit'
import ContoVivo from './activities/campo7/ContoVivo'
import PoesiaSonora from './activities/campo7/PoesiaSonora'
import TeatroVozes from './activities/campo7/TeatroVozes'
import FabulasMundo from './activities/campo7/FabulasMundo'
import MeuConto from './activities/campo7/MeuConto'
import Planos from './pages/Planos'
import SharedProfile from './pages/SharedProfile'
import { useProgress } from './hooks/useProgress'
import { useProfile } from './hooks/useProfile'
import { useFrustration } from './hooks/useFrustration'
import { useAdaptive } from './hooks/useAdaptive'
import { usePlanner } from './hooks/usePlanner'
import { useAuth } from './hooks/useAuth'
import { useSync } from './hooks/useSync'
import { useSubscription } from './hooks/useSubscription'
import { usePrescriptions } from './hooks/usePrescriptions'
import { isActivityAvailable } from './data/tiers'
import { useProfileSharing } from './hooks/useProfileSharing'
import { setTTSMode } from './hooks/useTTS'
import UpgradePrompt from './components/UpgradePrompt'

// Public routes accessible without a profile
const PUBLIC_PATHS = ['/landing', '/faq', '/suporte', '/planos']

function SharedProfileRoute({ sharing }) {
  const { shareId } = useParams()
  const share = sharing?.sharedWithMe?.find(s => s.id === shareId) || null
  return (
    <SharedProfile
      share={share}
      onRefresh={() => sharing?.refreshSharedProfiles?.()}
    />
  )
}

/**
 * Route-level subscription guard.
 * Prevents free-tier users from accessing locked activities via direct URL.
 */
function LockedRoute({ activityId, campoId, subscription, children }) {
  const navigate = useNavigate()
  const [showUpgrade, setShowUpgrade] = useState(false)
  const tierId = subscription?.tierId || 'free'
  const locked = !isActivityAvailable(activityId, campoId, tierId)

  if (locked) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '48px 24px', textAlign: 'center' }}>
        <span style={{ fontSize: '4rem' }}>🔒</span>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Actividade bloqueada</h2>
        <p style={{ color: '#757575', fontSize: '0.9rem', maxWidth: '320px', lineHeight: 1.5 }}>
          Esta actividade faz parte do plano pago. Faz upgrade para desbloquear todas as actividades!
        </p>
        <button
          onClick={() => setShowUpgrade(true)}
          style={{ padding: '12px 24px', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, fontFamily: 'inherit', fontSize: '1rem', cursor: 'pointer' }}
        >
          Ver Planos
        </button>
        <button
          onClick={() => navigate(-1)}
          style={{ padding: '8px 16px', backgroundColor: 'transparent', border: '1px solid var(--color-border)', borderRadius: '8px', cursor: 'pointer', fontFamily: 'inherit', color: 'var(--color-text-secondary)' }}
        >
          ← Voltar
        </button>
        {showUpgrade && <UpgradePrompt onClose={() => setShowUpgrade(false)} />}
      </div>
    )
  }

  return children
}

function PlansPreview({ onViewPlans, onContinue, profileName }) {
  const previewStyles = {
    overlay: { position: 'fixed', inset: 0, zIndex: 1000, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' },
    card: { backgroundColor: 'white', borderRadius: '16px', padding: '24px', maxWidth: '420px', width: '100%', display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'center', maxHeight: '90vh', overflowY: 'auto' },
    title: { fontSize: '1.3rem', fontWeight: 700, color: '#1B5E20' },
    desc: { fontSize: '0.9rem', color: '#616161', lineHeight: 1.6 },
    tierRow: { display: 'flex', gap: '8px' },
    tierCard: { flex: 1, padding: '12px', borderRadius: '12px', border: '2px solid', display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' },
    tierFree: { borderColor: '#A5D6A7', backgroundColor: '#E8F5E9' },
    tierPaid: { borderColor: '#FFD54F', backgroundColor: '#FFF8E1' },
    tierEmoji: { fontSize: '1.5rem' },
    tierName: { fontWeight: 700, fontSize: '0.85rem' },
    tierPrice: { fontSize: '0.75rem', color: '#757575' },
    tierDetail: { fontSize: '0.7rem', color: '#9E9E9E', lineHeight: 1.3 },
    currentBadge: { fontSize: '0.65rem', fontWeight: 700, color: '#2E7D32', backgroundColor: '#C8E6C9', padding: '2px 8px', borderRadius: '8px' },
    highlight: { fontSize: '0.85rem', color: '#424242', lineHeight: 1.5, padding: '12px', backgroundColor: '#F5F5F5', borderRadius: '8px' },
    primaryBtn: { padding: '14px', backgroundColor: '#2E7D32', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, fontFamily: 'inherit', fontSize: '1rem', cursor: 'pointer', minHeight: '48px' },
    secondaryBtn: { padding: '10px', backgroundColor: 'transparent', border: 'none', color: '#757575', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.9rem', textDecoration: 'underline', minHeight: '44px' },
  }

  return (
    <div style={previewStyles.overlay}>
      <div style={previewStyles.card}>
        <span style={{ fontSize: '2.5rem' }}>🎉</span>
        <p style={previewStyles.title}>Perfil criado com sucesso!</p>
        <p style={previewStyles.desc}>
          {profileName ? `A Escola do ${profileName} está pronta.` : 'A escola está pronta.'} Antes de começar, conhece os nossos planos:
        </p>

        <div style={previewStyles.tierRow}>
          <div style={{ ...previewStyles.tierCard, ...previewStyles.tierFree }}>
            <span style={previewStyles.tierEmoji}>🌱</span>
            <span style={previewStyles.tierName}>Semente</span>
            <span style={previewStyles.tierPrice}>Grátis</span>
            <span style={previewStyles.currentBadge}>Plano actual</span>
            <span style={previewStyles.tierDetail}>7 actividades (1 por campo) com 10 níveis completos</span>
          </div>
          <div style={{ ...previewStyles.tierCard, ...previewStyles.tierPaid }}>
            <span style={previewStyles.tierEmoji}>🌸</span>
            <span style={previewStyles.tierName}>Flor</span>
            <span style={previewStyles.tierPrice}>5,99 / mês</span>
            <span style={previewStyles.tierDetail}>35 actividades, 5 universos, até 5 perfis</span>
          </div>
          <div style={{ ...previewStyles.tierCard, ...previewStyles.tierPaid }}>
            <span style={previewStyles.tierEmoji}>🌲</span>
            <span style={previewStyles.tierName}>Floresta</span>
            <span style={previewStyles.tierPrice}>14,99 / mês</span>
            <span style={previewStyles.tierDetail}>Tudo + dashboard terapeuta + 20 perfis</span>
          </div>
        </div>

        <p style={previewStyles.highlight}>
          O plano grátis funciona de verdade — 7 actividades completas com todos os 10 níveis, TTS, acessibilidade e Banco da Calma incluídos.
        </p>

        <button style={previewStyles.primaryBtn} onClick={onViewPlans}>
          Ver Planos em Detalhe
        </button>
        <button style={previewStyles.secondaryBtn} onClick={onContinue}>
          Começar com o plano grátis
        </button>
      </div>
    </div>
  )
}

function AccountNudge({ auth, onLoginSync, onDismiss }) {
  const [mode, setMode] = useState(null) // null | 'register' | 'login'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!email.trim()) return
    setLoading(true)
    setMsg(null)

    let result
    if (mode === 'register') {
      result = await auth.signUp(email.trim(), password)
      if (!result.error) {
        setMsg('Conta criada! Verifica o email para confirmar.')
        setTimeout(onDismiss, 3000)
      }
    } else {
      if (password) {
        result = await auth.signIn(email.trim(), password)
        if (!result.error && onLoginSync) {
          setMsg('A sincronizar...')
          await onLoginSync()
          onDismiss()
        }
      } else {
        result = await auth.signInWithMagicLink(email.trim())
        if (!result.error) {
          setMsg('Link enviado! Verifica o email.')
          setTimeout(onDismiss, 3000)
        }
      }
    }

    if (result?.error) setMsg(result.error)
    setLoading(false)
  }

  const nudgeStyles = {
    overlay: { position: 'fixed', inset: 0, zIndex: 1000, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' },
    card: { backgroundColor: 'white', borderRadius: '16px', padding: '24px', maxWidth: '400px', width: '100%', display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'center' },
    title: { fontSize: '1.2rem', fontWeight: 700, color: '#1B5E20' },
    desc: { fontSize: '0.9rem', color: '#616161', lineHeight: 1.5 },
    btns: { display: 'flex', gap: '8px' },
    primaryBtn: { flex: 1, padding: '12px', backgroundColor: '#2E7D32', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, fontFamily: 'inherit', fontSize: '0.95rem', cursor: 'pointer', minHeight: '44px' },
    secondaryBtn: { flex: 1, padding: '12px', backgroundColor: 'white', color: '#2E7D32', border: '2px solid #2E7D32', borderRadius: '10px', fontWeight: 700, fontFamily: 'inherit', fontSize: '0.95rem', cursor: 'pointer', minHeight: '44px' },
    input: { padding: '12px', border: '2px solid #C8E6C9', borderRadius: '10px', fontFamily: 'inherit', fontSize: '1rem', outline: 'none', width: '100%', boxSizing: 'border-box' },
    skipBtn: { padding: '8px', backgroundColor: 'transparent', border: 'none', color: '#9E9E9E', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.85rem', textDecoration: 'underline', minHeight: '44px' },
    msg: { fontSize: '0.85rem', color: '#E65100', fontWeight: 600 },
  }

  return (
    <div style={nudgeStyles.overlay}>
      <div style={nudgeStyles.card}>
        {!mode ? (
          <>
            <p style={nudgeStyles.title}>Perfil criado!</p>
            <p style={nudgeStyles.desc}>
              Cria uma conta para que a mãe, o pai e o terapeuta possam aceder ao mesmo perfil, de qualquer dispositivo.
            </p>
            <div style={nudgeStyles.btns}>
              <button style={nudgeStyles.primaryBtn} onClick={() => setMode('register')}>
                Criar Conta
              </button>
              <button style={nudgeStyles.secondaryBtn} onClick={() => setMode('login')}>
                Já Tenho Conta
              </button>
            </div>
            <button style={nudgeStyles.skipBtn} onClick={onDismiss}>
              Continuar sem conta (dados só neste dispositivo)
            </button>
          </>
        ) : (
          <>
            <p style={nudgeStyles.title}>
              {mode === 'register' ? 'Criar conta da família' : 'Entrar'}
            </p>
            <input
              style={nudgeStyles.input}
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
            <input
              style={nudgeStyles.input}
              type="password"
              placeholder={mode === 'login' ? 'Password (ou vazio para magic link)' : 'Password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
            />
            {msg && <p style={nudgeStyles.msg}>{msg}</p>}
            <button
              style={nudgeStyles.primaryBtn}
              onClick={handleSubmit}
              disabled={loading || !email.trim()}
            >
              {loading ? 'A processar...' : mode === 'register' ? 'Criar Conta' : 'Entrar'}
            </button>
            <button style={nudgeStyles.skipBtn} onClick={() => setMode(null)}>
              Voltar
            </button>
          </>
        )}
      </div>
    </div>
  )
}

function AppContent() {
  const location = useLocation()
  const navigate = useNavigate()
  const [showCalma, setShowCalma] = useState(false)
  const [showIntake, setShowIntake] = useState(false)
  const progressData = useProgress()
  const profileData = useProfile()
  const auth = useAuth()
  const sync = useSync(
    auth.user,
    profileData.profiles,
    progressData.progress,
    profileData.activeId,
  )

  // Pull from cloud on login — bidirectional sync
  const prevUserRef = useRef(null)
  useEffect(() => {
    const wasLoggedOut = !prevUserRef.current
    const isLoggedIn = !!auth.user
    prevUserRef.current = auth.user

    if (wasLoggedOut && isLoggedIn) {
      sync.syncOnLogin().then((cloudData) => {
        if (cloudData) {
          profileData.importFromCloud(cloudData.profiles, cloudData.active_profile_id)
          progressData.importFromCloud(cloudData.progress)
        }
      })
    }
  }, [auth.user]) // eslint-disable-line react-hooks/exhaustive-deps

  // Manual sync trigger for Welcome/Landing login flows
  const handleLoginSync = useCallback(async () => {
    const cloudData = await sync.syncOnLogin()
    if (cloudData) {
      profileData.importFromCloud(cloudData.profiles, cloudData.active_profile_id)
      progressData.importFromCloud(cloudData.progress)
    }
  }, [sync, profileData, progressData])
  const adaptive = useAdaptive(profileData.profile)
  const prescriptions = usePrescriptions(profileData.profile?.id)

  // Collect prescribed activity IDs so they bypass tier locks
  const prescribedActivityIds = useMemo(() => {
    const ids = new Set()
    ;(prescriptions?.todayTasks || []).forEach((t) => ids.add(t.activityId))
    ;(prescriptions?.activeForChild || []).forEach(({ program }) => {
      ;(program?.activities || []).forEach((a) => ids.add(a.activityId))
    })
    return ids
  }, [prescriptions?.todayTasks, prescriptions?.activeForChild])

  const subscription = useSubscription(profileData.profile, auth.user, prescribedActivityIds)
  const sharing = useProfileSharing(
    auth.user,
    profileData.profiles,
    progressData.progress,
  )
  const plannerData = usePlanner(
    profileData.profile?.id,
    adaptive.prioritisedCampos,
    progressData.progress,
  )

  // Dynamic title
  useEffect(() => {
    const name = profileData.profile?.name
    if (name) {
      document.title = `PITCH - A Escola do ${name}`
    } else {
      document.title = 'PITCH - Aprendizagem Inclusiva'
    }
  }, [profileData.profile?.name])

  // Sync TTS mode from profile to module-level config
  useEffect(() => {
    const mode = profileData.profile?.sensory?.ttsMode || 'auto'
    setTTSMode(mode)
  }, [profileData.profile?.sensory?.ttsMode])

  const handleFrustration = useCallback(() => {
    if (!showIntake) setShowCalma(true)
  }, [showIntake])

  const { registerClick, registerError, registerSuccess, calmDown } =
    useFrustration(handleFrustration, { paused: showIntake })

  const handleCloseCalma = useCallback(() => {
    setShowCalma(false)
    calmDown()
  }, [calmDown])

  // New profile: show intake wizard (or skip for founder)
  const handleNewProfile = useCallback(() => {
    setShowIntake(true)
  }, [])


  // Switch to existing profile
  const handleSwitchProfile = useCallback((id) => {
    profileData.switchProfile(id)
  }, [profileData])

  // Post-onboarding nudge for account creation and plans preview
  const [showAccountNudge, setShowAccountNudge] = useState(false)
  const [showPlansPreview, setShowPlansPreview] = useState(false)
  const [newProfileName, setNewProfileName] = useState(null)

  const handleOnboardingComplete = useCallback((data) => {
    profileData.completeOnboarding(data)
    setShowIntake(false)
    setShowCalma(false)
    calmDown()
    // Show plans preview for free-tier users
    if (!data.subscriptionTier || data.subscriptionTier === 'free') {
      setNewProfileName(data.name || null)
      setShowPlansPreview(true)
    } else if (auth.configured && !auth.user) {
      setShowAccountNudge(true)
    }
  }, [profileData, calmDown, auth.configured, auth.user])

  // Reset profile (from settings page)
  const handleResetProfile = useCallback((type) => {
    if (type === 'intake') {
      setShowIntake(true)
    } else if (type === 'switch') {
      profileData.switchProfile(null)
    } else {
      profileData.resetAll()
      progressData.resetAll()
    }
  }, [profileData, progressData])

  // Wrap completeActivity to also mark done in planner
  const handleCompleteActivity = useCallback((activityId, stars) => {
    progressData.completeActivity(activityId, stars)
    plannerData.markDone(activityId)
  }, [progressData, plannerData])

  const soundEnabled = profileData.profile?.sensory?.soundEnabled !== false

  // Handle PayPal subscription activation
  const handleSubscribed = useCallback((data) => {
    profileData.updateProfile({
      subscriptionTier: data.tierId,
      paypalSubscriptionId: data.subscriptionId,
      subscriptionActivatedAt: data.activatedAt,
    })
  }, [profileData])

  const activityProps = {
    ...progressData,
    completeActivity: handleCompleteActivity,
    registerClick,
    registerError,
    registerSuccess,
    adaptive,
    soundEnabled,
    subscription,
    prescriptions,
  }

  // Shared profile route — accessible with or without active profile
  const isSharedRoute = location.pathname.startsWith('/shared/')
  if (isSharedRoute) {
    return (
      <Routes>
        <Route path="/shared/:shareId" element={
          <SharedProfileRoute sharing={sharing} />
        } />
      </Routes>
    )
  }

  // Public routes: always accessible without a profile
  const isPublicRoute = PUBLIC_PATHS.includes(location.pathname)
  if (isPublicRoute) {
    return (
      <Routes>
        <Route path="/landing" element={<Landing />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/suporte" element={<Suporte />} />
        <Route path="/planos" element={<Planos currentTier={profileData.profile?.subscriptionTier} onSubscribed={handleSubscribed} />} />
      </Routes>
    )
  }

  // Show Landing for first-time visitors (no profiles), Welcome for returning users
  if (!profileData.profile && !showIntake) {
    const hasProfiles = profileData.profiles && profileData.profiles.length > 0
    if (!hasProfiles) {
      return <Landing onStart={handleNewProfile} auth={auth} onLoginSync={handleLoginSync} syncStatus={sync.syncStatus} />
    }
    return (
      <Welcome
        onNewProfile={handleNewProfile}
        profiles={profileData.profiles}
        onSwitchProfile={handleSwitchProfile}
        auth={auth}
        sharing={sharing}
        onLoginSync={handleLoginSync}
        syncStatus={sync.syncStatus}
      />
    )
  }

  // Show Intake wizard (new profile or redo)
  if (showIntake) {
    return <Intake onComplete={handleOnboardingComplete} onCancel={() => setShowIntake(false)} />
  }

  return (
    <>
      {showCalma && <BancoDaCalma onClose={handleCloseCalma} />}
      {showPlansPreview && (
        <PlansPreview
          profileName={newProfileName}
          onViewPlans={() => {
            setShowPlansPreview(false)
            navigate('/planos')
          }}
          onContinue={() => {
            setShowPlansPreview(false)
            // After plans preview, offer account creation if Supabase is configured
            if (auth.configured && !auth.user) {
              setShowAccountNudge(true)
            }
          }}
        />
      )}
      {showAccountNudge && (
        <AccountNudge
          auth={auth}
          onLoginSync={handleLoginSync}
          onDismiss={() => setShowAccountNudge(false)}
        />
      )}
      {adaptive.showBreakReminder && (
        <BreakReminder
          name={profileData.profile.name}
          onDismiss={adaptive.dismissBreak}
          onEnd={adaptive.dismissBreak}
        />
      )}
      <Routes>
        {/* Public routes also accessible from within the app */}
        <Route path="/landing" element={<Landing />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/suporte" element={<Suporte />} />

        <Route element={<Layout profile={profileData.profile} adaptive={adaptive} />}>
          <Route index element={
            <Home
              progress={progressData.progress}
              profile={profileData.profile}
              adaptive={adaptive}
              planner={plannerData}
              subscription={subscription}
              prescriptions={prescriptions}
            />
          } />
          <Route path="/campo/1" element={<Campo1Bancada {...activityProps} />} />
          <Route path="/campo/2" element={<Campo2Marcador {...activityProps} />} />
          <Route path="/campo/3" element={<Campo3Mundo {...activityProps} />} />
          <Route path="/campo/4" element={<Campo4Vida {...activityProps} />} />
          <Route path="/campo/5" element={<Campo5Expressao {...activityProps} />} />
          <Route path="/campo/6" element={<Campo6Social {...activityProps} />} />
          <Route path="/campo/7" element={<Campo7Biblioteca {...activityProps} />} />
          <Route path="/progresso" element={
            <Progress
              progress={progressData.progress}
              profile={profileData.profile}
            />
          } />
          <Route path="/fichas" element={
            <Fichas
              profile={profileData.profile}
              progress={progressData.progress}
              submitWorksheet={profileData.submitWorksheet}
            />
          } />
          <Route path="/noticias" element={
            <Noticias profile={profileData.profile} />
          } />
          <Route path="/comunidade" element={
            <Comunidade
              profile={profileData.profile}
              progress={progressData.progress}
              addEncouragement={profileData.addEncouragement}
            />
          } />
          <Route path="/loja" element={
            <Loja
              profile={profileData.profile}
              progress={progressData.progress}
              purchaseItem={profileData.purchaseItem}
              equipItem={profileData.equipItem}
              claimRealReward={profileData.claimRealReward}
            />
          } />
          <Route path="/desafios" element={
            <Desafios
              profile={profileData.profile}
              progress={progressData.progress}
            />
          } />
          <Route path="/definicoes" element={
            <Definicoes
              profile={profileData.profile}
              profiles={profileData.profiles}
              updateProfile={profileData.updateProfile}
              resetProfile={handleResetProfile}
              deleteProfile={profileData.deleteProfile}
              addRealReward={profileData.addRealReward}
              removeRealReward={profileData.removeRealReward}
              subscription={subscription}
              sharing={sharing}
              auth={auth}
            />
          } />

          <Route path="/planos" element={
            <Planos currentTier={subscription.tierId} onSubscribed={handleSubscribed} />
          } />

          <Route path="/planner" element={
            <Planner
              profile={profileData.profile}
              progress={progressData.progress}
              planner={plannerData}
              adaptive={adaptive}
              prescriptions={prescriptions}
            />
          } />

          <Route path="/dashboard" element={
            <Dashboard
              profile={profileData.profile}
              progress={progressData.progress}
              reviewWorksheet={profileData.reviewWorksheet}
              addEncouragement={profileData.addEncouragement}
              prescriptions={prescriptions}
              subscription={subscription}
            />
          } />

          {/* Campo 1 activities */}
          <Route path="/campo/1/vocab-match" element={<LockedRoute activityId="vocab-match" campoId="campo1" subscription={subscription}><VocabularyMatch {...activityProps} /></LockedRoute>} />
          <Route path="/campo/1/dress-player" element={<LockedRoute activityId="dress-player" campoId="campo1" subscription={subscription}><DressThePlayer {...activityProps} /></LockedRoute>} />
          <Route path="/campo/1/color-kit" element={<LockedRoute activityId="color-kit" campoId="campo1" subscription={subscription}><ColorKit {...activityProps} /></LockedRoute>} />
          <Route path="/campo/1/read-score" element={<LockedRoute activityId="read-score" campoId="campo1" subscription={subscription}><ReadScore {...activityProps} /></LockedRoute>} />
          <Route path="/campo/1/phonics" element={<LockedRoute activityId="phonics" campoId="campo1" subscription={subscription}><Phonics {...activityProps} /></LockedRoute>} />
          <Route path="/campo/1/syllable-builder" element={<LockedRoute activityId="syllable-builder" campoId="campo1" subscription={subscription}><SyllableBuilder {...activityProps} /></LockedRoute>} />
          <Route path="/campo/1/sentence-builder" element={<LockedRoute activityId="sentence-builder" campoId="campo1" subscription={subscription}><SentenceBuilder {...activityProps} /></LockedRoute>} />
          <Route path="/campo/1/listening-quest" element={<LockedRoute activityId="listening-quest" campoId="campo1" subscription={subscription}><ListeningQuest {...activityProps} /></LockedRoute>} />

          {/* Campo 2 activities */}
          <Route path="/campo/2/goal-math" element={<LockedRoute activityId="goal-math" campoId="campo2" subscription={subscription}><GoalMath {...activityProps} /></LockedRoute>} />
          <Route path="/campo/2/clock-reader" element={<LockedRoute activityId="clock-reader" campoId="campo2" subscription={subscription}><ClockReader {...activityProps} /></LockedRoute>} />
          <Route path="/campo/2/team-division" element={<LockedRoute activityId="team-division" campoId="campo2" subscription={subscription}><TeamDivision {...activityProps} /></LockedRoute>} />
          <Route path="/campo/2/ticket-shop" element={<LockedRoute activityId="ticket-shop" campoId="campo2" subscription={subscription}><TicketShop {...activityProps} /></LockedRoute>} />
          <Route path="/campo/2/patterns" element={<LockedRoute activityId="patterns" campoId="campo2" subscription={subscription}><Patterns {...activityProps} /></LockedRoute>} />

          {/* Campo 3 activities */}
          <Route path="/campo/3/flag-match" element={<LockedRoute activityId="flag-match" campoId="campo3" subscription={subscription}><FlagMatch {...activityProps} /></LockedRoute>} />
          <Route path="/campo/3/world-explorer" element={<LockedRoute activityId="world-explorer" campoId="campo3" subscription={subscription}><WorldExplorer {...activityProps} /></LockedRoute>} />
          <Route path="/campo/3/body-science" element={<LockedRoute activityId="body-science" campoId="campo3" subscription={subscription}><BodyScience {...activityProps} /></LockedRoute>} />
          <Route path="/campo/3/weather-match" element={<LockedRoute activityId="weather-match" campoId="campo3" subscription={subscription}><WeatherMatch {...activityProps} /></LockedRoute>} />
          <Route path="/campo/3/nature-lab" element={<LockedRoute activityId="nature-lab" campoId="campo3" subscription={subscription}><NatureLab {...activityProps} /></LockedRoute>} />

          {/* Campo 4 activities */}
          <Route path="/campo/4/daily-routine" element={<LockedRoute activityId="daily-routine" campoId="campo4" subscription={subscription}><DailyRoutine {...activityProps} /></LockedRoute>} />
          <Route path="/campo/4/real-world" element={<LockedRoute activityId="real-world" campoId="campo4" subscription={subscription}><RealWorld {...activityProps} /></LockedRoute>} />
          <Route path="/campo/4/problem-solving" element={<LockedRoute activityId="problem-solving" campoId="campo4" subscription={subscription}><ProblemSolving {...activityProps} /></LockedRoute>} />
          <Route path="/campo/4/healthy-choices" element={<LockedRoute activityId="healthy-choices" campoId="campo4" subscription={subscription}><HealthyChoices {...activityProps} /></LockedRoute>} />
          <Route path="/campo/4/time-planner" element={<LockedRoute activityId="time-planner" campoId="campo4" subscription={subscription}><TimePlanner {...activityProps} /></LockedRoute>} />

          {/* Campo 5 activities */}
          <Route path="/campo/5/story-builder" element={<LockedRoute activityId="story-builder" campoId="campo5" subscription={subscription}><StoryBuilder {...activityProps} /></LockedRoute>} />
          <Route path="/campo/5/music-maker" element={<LockedRoute activityId="music-maker" campoId="campo5" subscription={subscription}><MusicMaker {...activityProps} /></LockedRoute>} />
          <Route path="/campo/5/color-canvas" element={<LockedRoute activityId="color-canvas" campoId="campo5" subscription={subscription}><ColorCanvas {...activityProps} /></LockedRoute>} />
          <Route path="/campo/5/pattern-art" element={<LockedRoute activityId="pattern-art" campoId="campo5" subscription={subscription}><PatternArt {...activityProps} /></LockedRoute>} />
          <Route path="/campo/5/sound-story" element={<LockedRoute activityId="sound-story" campoId="campo5" subscription={subscription}><SoundStory {...activityProps} /></LockedRoute>} />

          {/* Campo 6 activities */}
          <Route path="/campo/6/emotion-cards" element={<LockedRoute activityId="emotion-cards" campoId="campo6" subscription={subscription}><EmotionCards {...activityProps} /></LockedRoute>} />
          <Route path="/campo/6/fair-play" element={<LockedRoute activityId="fair-play" campoId="campo6" subscription={subscription}><FairPlay {...activityProps} /></LockedRoute>} />
          <Route path="/campo/6/social-detective" element={<LockedRoute activityId="social-detective" campoId="campo6" subscription={subscription}><SocialDetective {...activityProps} /></LockedRoute>} />
          <Route path="/campo/6/turn-talk" element={<LockedRoute activityId="turn-talk" campoId="campo6" subscription={subscription}><TurnTalk {...activityProps} /></LockedRoute>} />
          <Route path="/campo/6/calm-toolkit" element={<LockedRoute activityId="calm-toolkit" campoId="campo6" subscription={subscription}><CalmToolkit {...activityProps} /></LockedRoute>} />

          {/* Campo 7 activities */}
          <Route path="/campo/7/contos-vivos" element={<LockedRoute activityId="contos-vivos" campoId="campo7" subscription={subscription}><ContoVivo {...activityProps} /></LockedRoute>} />
          <Route path="/campo/7/poesia-sonora" element={<LockedRoute activityId="poesia-sonora" campoId="campo7" subscription={subscription}><PoesiaSonora {...activityProps} /></LockedRoute>} />
          <Route path="/campo/7/teatro-vozes" element={<LockedRoute activityId="teatro-vozes" campoId="campo7" subscription={subscription}><TeatroVozes {...activityProps} /></LockedRoute>} />
          <Route path="/campo/7/fabulas-mundo" element={<LockedRoute activityId="fabulas-mundo" campoId="campo7" subscription={subscription}><FabulasMundo {...activityProps} /></LockedRoute>} />
          <Route path="/campo/7/meu-conto" element={<LockedRoute activityId="meu-conto" campoId="campo7" subscription={subscription}><MeuConto {...activityProps} /></LockedRoute>} />
        </Route>
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}
