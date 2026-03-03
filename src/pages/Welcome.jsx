/**
 * Welcome screen — shown when no active profile.
 * Shows existing profiles for switching, plus new profile creation.
 * When Supabase is configured, shows login/register for cloud sync.
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AVATARS } from '../hooks/useProfile'

export default function Welcome({ onNewProfile, profiles, onSwitchProfile, auth, sharing, onLoginSync, syncStatus }) {
  const navigate = useNavigate()
  const hasProfiles = profiles && profiles.length > 0

  const [authMode, setAuthMode] = useState(null) // null | 'login' | 'register'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [authMsg, setAuthMsg] = useState(null)
  const [authLoading, setAuthLoading] = useState(false)
  const [showShareCode, setShowShareCode] = useState(false)
  const [shareCodeInput, setShareCodeInput] = useState('')
  const [shareMsg, setShareMsg] = useState(null)
  const [shareLoading, setShareLoading] = useState(false)

  const handlePasswordReset = async () => {
    if (!email.trim()) {
      setAuthMsg('Escreva o email primeiro.')
      return
    }
    setAuthLoading(true)
    setAuthMsg(null)
    const result = await auth?.resetPassword?.(email.trim())
    if (result?.error) {
      setAuthMsg(result.error)
    } else {
      setAuthMsg('Email de recuperação enviado! Verifique a sua caixa de correio.')
    }
    setAuthLoading(false)
  }

  const handleAuth = async () => {
    if (!email.trim()) return
    setAuthLoading(true)
    setAuthMsg(null)

    let result
    if (authMode === 'register') {
      result = await auth.signUp(email.trim(), password)
      if (!result.error) {
        setAuthMsg('Conta criada! Verifica o email para confirmar.')
      }
    } else {
      if (password) {
        result = await auth.signIn(email.trim(), password)
        // On successful login, pull profiles from cloud
        if (!result.error && onLoginSync) {
          setAuthMsg('A sincronizar dados da cloud...')
          await onLoginSync()
          setAuthMsg('Sincronizado!')
        }
      } else {
        result = await auth.signInWithMagicLink(email.trim())
        if (!result.error) {
          setAuthMsg('Link enviado! Verifica o email.')
        }
      }
    }

    if (result?.error) {
      setAuthMsg(result.error)
    }
    setAuthLoading(false)
  }

  return (
    <div style={styles.container} className="animate-fade-in">
      <div style={styles.content}>
        <img
          src="/logos/pitch-robo.png"
          alt="PITCH Robot"
          style={styles.mascot}
        />

        <img
          src="/logos/pitch-completo.png"
          alt="PITCH - Plataforma de Aprendizagem Inclusiva"
          style={styles.logo}
        />

        <p style={styles.tagline}>
          Play. Interact. Think. Challenge. Hone.
        </p>

        {/* Existing profiles */}
        {hasProfiles && (
          <div style={styles.profilesSection}>
            <p style={styles.profilesTitle}>Escolas existentes:</p>
            <div style={styles.profilesList}>
              {profiles.map((p) => {
                const avatar = AVATARS.find((a) => a.id === p.avatar)
                return (
                  <button
                    key={p.id}
                    style={styles.profileBtn}
                    className="interactive-card"
                    onClick={() => onSwitchProfile(p.id)}
                  >
                    <span style={styles.profileAvatar}>{avatar?.emoji || '⭐'}</span>
                    <div>
                      <span style={styles.profileName}>A Escola do {p.name}</span>
                      <span style={styles.profileAge}>{p.age} anos</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Shared profiles (from therapists/families who shared with me) */}
        {sharing?.sharedWithMe?.length > 0 && (
          <div style={styles.profilesSection}>
            <p style={styles.profilesTitle}>Perfis partilhados comigo:</p>
            <div style={styles.profilesList}>
              {sharing.sharedWithMe.map((share) => {
                const p = share.profile_data
                const avatar = AVATARS.find((a) => a.id === p?.avatar)
                return (
                  <button
                    key={share.id}
                    style={styles.sharedProfileBtn}
                    className="interactive-card"
                    onClick={() => navigate('/shared/' + share.id)}
                  >
                    <span style={styles.profileAvatar}>{avatar?.emoji || '⭐'}</span>
                    <div style={{ flex: 1 }}>
                      <span style={styles.profileName}>A Escola do {p?.name || '?'}</span>
                      <span style={styles.profileAge}>{p?.age} anos</span>
                    </div>
                    <span style={styles.sharedBadge}>partilhado</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        <div style={styles.actions}>
          <button
            style={styles.newBtn}
            className="interactive-card"
            onClick={onNewProfile}
          >
            <span style={styles.newBtnIcon}>🌟</span>
            <div>
              <span style={styles.newBtnTitle}>
                {hasProfiles ? 'Criar outra escola' : 'Criar a minha escola'}
              </span>
              <span style={styles.newBtnSub}>Personalizar para {hasProfiles ? 'outra' : 'uma'} criança</span>
            </div>
          </button>

          {/* Accept share code — only when authenticated */}
          {auth?.configured && auth?.user && (
            <>
              {!showShareCode ? (
                <button
                  style={styles.shareCodeBtn}
                  onClick={() => setShowShareCode(true)}
                >
                  <span style={styles.shareCodeBtnIcon}>🔗</span>
                  <div>
                    <span style={styles.shareCodeBtnTitle}>Tenho um código de partilha</span>
                    <span style={styles.newBtnSub}>Aceder a um perfil partilhado por uma família</span>
                  </div>
                </button>
              ) : (
                <div style={styles.shareCodeForm}>
                  <p style={styles.shareCodeFormTitle}>Código de partilha</p>
                  <p style={styles.shareCodeFormHint}>
                    Insira o código de 6 caracteres que a família lhe deu.
                  </p>
                  <input
                    style={styles.shareCodeInput}
                    type="text"
                    value={shareCodeInput}
                    onChange={(e) => setShareCodeInput(e.target.value.toUpperCase().slice(0, 6))}
                    placeholder="Ex: A3K7N2"
                    maxLength={6}
                    autoComplete="off"
                  />
                  {shareMsg && <p style={styles.shareCodeMsg}>{shareMsg}</p>}
                  <button
                    style={{
                      ...styles.shareCodeSubmitBtn,
                      ...(shareCodeInput.length !== 6 || shareLoading ? { opacity: 0.5 } : {}),
                    }}
                    onClick={async () => {
                      if (shareCodeInput.length !== 6 || shareLoading) return
                      setShareLoading(true)
                      setShareMsg(null)
                      const result = await sharing.acceptShareCode(shareCodeInput)
                      if (result) {
                        setShareMsg('Perfil partilhado aceite!')
                        setShareCodeInput('')
                        setTimeout(() => {
                          setShowShareCode(false)
                          setShareMsg(null)
                        }, 2000)
                      } else {
                        setShareMsg(sharing.error || 'Código inválido.')
                      }
                      setShareLoading(false)
                    }}
                    disabled={shareCodeInput.length !== 6 || shareLoading}
                  >
                    {shareLoading ? 'A verificar...' : 'Aceitar'}
                  </button>
                  <button
                    style={styles.authBackBtn}
                    onClick={() => { setShowShareCode(false); setShareMsg(null); setShareCodeInput('') }}
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Auth: primary for family access */}
        {auth?.configured && !auth?.user && (
          <div style={styles.authSection}>
            {!authMode ? (
              <>
                <p style={styles.authTitle}>Acesso familiar</p>
                <p style={styles.authHint}>
                  Entra na tua conta para que toda a família aceda aos mesmos perfis, de qualquer dispositivo.
                </p>
                <div style={styles.authBtns}>
                  <button style={styles.authLoginBtn} onClick={() => setAuthMode('login')}>
                    Entrar
                  </button>
                  <button style={styles.authRegBtn} onClick={() => setAuthMode('register')}>
                    Criar conta
                  </button>
                </div>
              </>
            ) : (
              <div style={styles.authForm}>
                <p style={styles.authFormTitle}>
                  {authMode === 'register' ? 'Criar conta da família' : 'Entrar na conta'}
                </p>
                <p style={styles.authFormHint}>
                  {authMode === 'register'
                    ? 'Mãe, pai e terapeuta podem usar a mesma conta para aceder aos perfis.'
                    : 'Entra para recuperar os perfis guardados na cloud.'}
                </p>
                <input
                  style={styles.authInput}
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
                <div style={styles.passwordWrap}>
                  <input
                    style={styles.passwordInput}
                    type={showPassword ? 'text' : 'password'}
                    placeholder={authMode === 'login' ? 'Password (ou vazio para magic link)' : 'Escolha uma password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete={authMode === 'register' ? 'new-password' : 'current-password'}
                  />
                  <button
                    type="button"
                    style={styles.eyeBtn}
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Esconder password' : 'Mostrar password'}
                    tabIndex={-1}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
                {authMode === 'login' && (
                  <button
                    type="button"
                    style={styles.forgotBtn}
                    onClick={handlePasswordReset}
                  >
                    Esqueceu a password?
                  </button>
                )}
                {authMsg && <p style={styles.authMsg}>{authMsg}</p>}
                <button
                  style={styles.authSubmitBtn}
                  onClick={handleAuth}
                  disabled={authLoading || !email.trim()}
                >
                  {authLoading ? 'A processar...' : authMode === 'register' ? 'Criar Conta' : 'Entrar'}
                </button>
                <button
                  style={styles.authBackBtn}
                  onClick={() => { setAuthMode(null); setAuthMsg(null) }}
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>
        )}

        {auth?.configured && auth?.user && (
          <div style={styles.authSynced}>
            <span>
              {syncStatus === 'pulling' ? '🔄' : syncStatus === 'pushing' ? '📤' : '☁️'}{' '}
              {syncStatus === 'pulling' ? 'A sincronizar...' : `Conta: ${auth.user.email}`}
            </span>
            <button style={styles.authSignOutBtn} onClick={auth.signOut}>Sair</button>
          </div>
        )}

        {/* Public page links */}
        <div style={styles.publicLinks}>
          <button style={styles.publicLink} onClick={() => navigate('/landing')}>
            Sobre o PITCH
          </button>
          <span style={styles.publicLinkSep}>|</span>
          <button style={styles.publicLink} onClick={() => navigate('/planos')}>
            Planos
          </button>
          <span style={styles.publicLinkSep}>|</span>
          <button style={styles.publicLink} onClick={() => navigate('/faq')}>
            FAQ
          </button>
          <span style={styles.publicLinkSep}>|</span>
          <button style={styles.publicLink} onClick={() => navigate('/suporte')}>
            Suporte
          </button>
        </div>

        <p style={styles.footer}>
          Plataforma de aprendizagem inclusiva para crianças neurodivergentes
        </p>
      </div>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    maxWidth: '480px',
    margin: '0 auto',
    backgroundColor: 'var(--color-surface)',
    justifyContent: 'center',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'var(--space-lg)',
    padding: 'var(--space-xl)',
    textAlign: 'center',
  },
  mascot: {
    width: '180px',
    height: '180px',
    objectFit: 'contain',
  },
  logo: {
    width: '240px',
    maxWidth: '80%',
    objectFit: 'contain',
  },
  tagline: {
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-text-secondary)',
    fontWeight: 500,
    letterSpacing: '0.5px',
  },
  profilesSection: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-sm)',
  },
  profilesTitle: {
    fontSize: 'var(--font-size-sm)',
    fontWeight: 700,
    color: 'var(--color-text-secondary)',
    textAlign: 'left',
  },
  profilesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-sm)',
  },
  profileBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-md)',
    padding: 'var(--space-md) var(--space-lg)',
    backgroundColor: '#E3F2FD',
    border: '2px solid var(--color-primary)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-sm)',
    cursor: 'pointer',
    fontFamily: 'inherit',
    textAlign: 'left',
  },
  profileAvatar: {
    fontSize: '2rem',
    flexShrink: 0,
  },
  profileName: {
    display: 'block',
    fontSize: 'var(--font-size-base)',
    fontWeight: 700,
    color: 'var(--color-primary-dark)',
  },
  profileAge: {
    display: 'block',
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-text-secondary)',
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-md)',
    width: '100%',
    marginTop: 'var(--space-md)',
  },
  newBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-md)',
    padding: 'var(--space-md) var(--space-lg)',
    backgroundColor: 'var(--color-surface)',
    border: '2px solid var(--color-border)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-sm)',
    cursor: 'pointer',
    fontFamily: 'inherit',
    textAlign: 'left',
  },
  newBtnIcon: {
    fontSize: '2rem',
    flexShrink: 0,
  },
  newBtnTitle: {
    display: 'block',
    fontSize: 'var(--font-size-base)',
    fontWeight: 700,
    color: 'var(--color-text)',
  },
  newBtnSub: {
    display: 'block',
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-text-secondary)',
    marginTop: '2px',
  },
  publicLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-sm)',
    marginTop: 'var(--space-md)',
  },
  publicLink: {
    fontSize: 'var(--font-size-sm)',
    fontWeight: 600,
    color: 'var(--color-primary)',
    cursor: 'pointer',
    fontFamily: 'inherit',
    padding: '4px',
    textDecoration: 'underline',
  },
  publicLinkSep: {
    color: 'var(--color-border)',
    fontSize: 'var(--font-size-sm)',
  },
  footer: {
    fontSize: '0.7rem',
    color: 'var(--color-text-secondary)',
    marginTop: 'var(--space-sm)',
    lineHeight: 1.4,
  },
  // Shared profile styles
  sharedProfileBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-md)',
    padding: 'var(--space-md) var(--space-lg)',
    backgroundColor: '#F3E5F5',
    border: '2px solid #6A1B9A',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-sm)',
    cursor: 'pointer',
    fontFamily: 'inherit',
    textAlign: 'left',
  },
  sharedBadge: {
    padding: '2px 8px',
    backgroundColor: '#6A1B9A',
    color: 'white',
    borderRadius: 'var(--radius-sm)',
    fontSize: '0.6rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    flexShrink: 0,
  },
  shareCodeBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-md)',
    padding: 'var(--space-md) var(--space-lg)',
    backgroundColor: '#F3E5F5',
    border: '2px solid #6A1B9A',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-sm)',
    cursor: 'pointer',
    fontFamily: 'inherit',
    textAlign: 'left',
  },
  shareCodeBtnIcon: {
    fontSize: '2rem',
    flexShrink: 0,
  },
  shareCodeBtnTitle: {
    display: 'block',
    fontSize: 'var(--font-size-base)',
    fontWeight: 700,
    color: '#4A148C',
  },
  shareCodeForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-sm)',
    padding: 'var(--space-lg)',
    backgroundColor: '#F3E5F5',
    borderRadius: 'var(--radius-lg)',
    border: '2px solid #6A1B9A',
  },
  shareCodeFormTitle: {
    fontWeight: 700,
    fontSize: 'var(--font-size-base)',
    color: '#4A148C',
  },
  shareCodeFormHint: {
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-text-secondary)',
    lineHeight: 1.4,
  },
  shareCodeInput: {
    padding: 'var(--space-md)',
    border: '2px solid #6A1B9A',
    borderRadius: 'var(--radius-md)',
    fontFamily: 'monospace',
    fontSize: '1.5rem',
    fontWeight: 800,
    textAlign: 'center',
    letterSpacing: '4px',
    outline: 'none',
    textTransform: 'uppercase',
  },
  shareCodeMsg: {
    fontSize: 'var(--font-size-sm)',
    color: '#6A1B9A',
    fontWeight: 600,
    textAlign: 'center',
  },
  shareCodeSubmitBtn: {
    padding: 'var(--space-sm)',
    backgroundColor: '#6A1B9A',
    color: 'white',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    fontWeight: 700,
    fontFamily: 'inherit',
    fontSize: 'var(--font-size-base)',
  },
  // Auth styles
  authSection: {
    width: '100%',
    padding: 'var(--space-lg)',
    backgroundColor: '#E3F2FD',
    borderRadius: 'var(--radius-lg)',
    border: '2px solid var(--color-primary)',
  },
  authTitle: {
    fontWeight: 700,
    fontSize: 'var(--font-size-base)',
    color: 'var(--color-primary-dark)',
    textAlign: 'center',
    marginBottom: '4px',
  },
  authHint: {
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-text-secondary)',
    marginBottom: 'var(--space-sm)',
    textAlign: 'center',
    lineHeight: 1.4,
  },
  authFormHint: {
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-text-secondary)',
    textAlign: 'center',
    lineHeight: 1.4,
  },
  authBtns: {
    display: 'flex',
    gap: 'var(--space-sm)',
  },
  authLoginBtn: {
    flex: 1,
    padding: 'var(--space-sm)',
    backgroundColor: 'var(--color-bg)',
    border: '1px solid var(--color-primary)',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    fontWeight: 600,
    fontFamily: 'inherit',
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-primary)',
  },
  authRegBtn: {
    flex: 1,
    padding: 'var(--space-sm)',
    backgroundColor: 'var(--color-primary)',
    border: '1px solid var(--color-primary)',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    fontWeight: 600,
    fontFamily: 'inherit',
    fontSize: 'var(--font-size-sm)',
    color: 'white',
  },
  authForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-sm)',
  },
  authFormTitle: {
    fontWeight: 700,
    fontSize: 'var(--font-size-base)',
  },
  authInput: {
    padding: 'var(--space-sm) var(--space-md)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    fontFamily: 'inherit',
    fontSize: 'var(--font-size-sm)',
    outline: 'none',
  },
  passwordWrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  passwordInput: {
    padding: 'var(--space-sm) 44px var(--space-sm) var(--space-md)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    fontFamily: 'inherit',
    fontSize: 'var(--font-size-sm)',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  },
  eyeBtn: {
    position: 'absolute',
    right: '4px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1.1rem',
    padding: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '44px',
    minHeight: '44px',
  },
  forgotBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--color-primary)',
    fontFamily: 'inherit',
    fontSize: 'var(--font-size-sm)',
    fontWeight: 600,
    cursor: 'pointer',
    padding: '4px',
    textDecoration: 'underline',
    alignSelf: 'flex-end',
    marginTop: '-4px',
  },
  authMsg: {
    fontSize: 'var(--font-size-sm)',
    color: '#E65100',
    fontWeight: 600,
    textAlign: 'center',
  },
  authSubmitBtn: {
    padding: 'var(--space-sm)',
    backgroundColor: 'var(--color-primary)',
    color: 'white',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    fontWeight: 700,
    fontFamily: 'inherit',
    fontSize: 'var(--font-size-base)',
  },
  authBackBtn: {
    padding: 'var(--space-xs)',
    backgroundColor: 'transparent',
    border: 'none',
    color: 'var(--color-text-secondary)',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: 'var(--font-size-sm)',
    textDecoration: 'underline',
  },
  authSynced: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 'var(--space-sm)',
    width: '100%',
    padding: 'var(--space-sm) var(--space-md)',
    backgroundColor: '#E8F5E9',
    borderRadius: 'var(--radius-md)',
    fontSize: 'var(--font-size-sm)',
    fontWeight: 600,
    color: 'var(--color-primary-dark)',
  },
  authSignOutBtn: {
    padding: '2px 8px',
    backgroundColor: 'transparent',
    border: '1px solid var(--color-text-secondary)',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-text-secondary)',
  },
}
