/**
 * Public landing page — the first thing visitors see.
 * Core narrative: "De pais para pais" — universal platform, individual for each child.
 */
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

const FEATURES = [
  {
    icon: '🌍',
    title: 'Universal',
    desc: 'Uma plataforma para qualquer criança, em qualquer país. Conteúdo global, sem centrismo cultural. Do Maputo a Lisboa, de Lagos a São Paulo.',
  },
  {
    icon: '🧩',
    title: 'Individual',
    desc: 'Cada criança tem a SUA escola. Perfil único, níveis independentes por campo, dificuldade adaptada, universo temático escolhido.',
  },
  {
    icon: '💚',
    title: 'Gentil',
    desc: 'Detecção de frustração, pausas guiadas com respiração, animações suaves. Zero pressão, zero punição. O erro é parte de aprender.',
  },
  {
    icon: '📊',
    title: 'Competência, não idade',
    desc: 'Avança quando domina. Sem comparações, sem anos escolares. 10 níveis de crescimento, do Semente à Floresta.',
  },
  {
    icon: '🔊',
    title: 'Voz e Áudio',
    desc: 'Instruções por voz, efeitos sonoros sintetizados, reconhecimento de fala. Tudo funciona offline, sem ficheiros externos.',
  },
  {
    icon: '👨‍👩‍👧‍👦',
    title: 'Família Conectada',
    desc: 'Pais enviam mensagens do telemóvel, a criança vê no tablet. Terapeuta acompanha progresso remotamente. Comunidade entre famílias opcional.',
  },
  {
    icon: '📴',
    title: 'Offline-first',
    desc: 'Funciona sem internet. PWA instalável no telemóvel. Sincroniza automaticamente quando volta online.',
  },
]

const CAMPOS = [
  { icon: '📚', name: 'Linguagem', color: '#1565C0', desc: 'Vocabulário, fonética, leitura, cores' },
  { icon: '🔢', name: 'Matemática', color: '#E65100', desc: 'Cálculo, relógio, padrões, lógica' },
  { icon: '🌎', name: 'Descoberta', color: '#2E7D32', desc: 'Bandeiras, corpo, clima, natureza' },
  { icon: '🏠', name: 'Autonomia', color: '#6A1B9A', desc: 'Rotinas, saúde, resolução de problemas' },
  { icon: '🎨', name: 'Criatividade', color: '#00838F', desc: 'Histórias, música, desenho, padrões' },
  { icon: '💚', name: 'Social', color: '#AD1457', desc: 'Emoções, comunicação, auto-regulação' },
]

const PHASES = [
  { emoji: '🌱', name: 'Germinar', levels: '1-3', desc: 'Exploração e curiosidade' },
  { emoji: '🌿', name: 'Estruturar', levels: '4-6', desc: 'Competência a formar-se' },
  { emoji: '🌸', name: 'Florescer', levels: '7-8', desc: 'Autonomia emergente' },
  { emoji: '🌳', name: 'Sustentar', levels: '9-10', desc: 'Autonomia consolidada' },
]

const TESTIMONIALS = [
  {
    quote: 'Construímos o PITCH porque nenhuma ferramenta existente funcionava para o nosso filho. Agora ele pede para estudar.',
    author: 'Fundadores do PITCH',
    avatar: '👨‍👩‍👦',
  },
  {
    quote: 'O meu filho tem TDAH e sempre se frustrava com apps educativas. Com o PITCH, ele finalmente termina as actividades com orgulho.',
    author: 'Mãe, criança de 9 anos',
    avatar: '👩',
  },
  {
    quote: 'Cada aluno tem o seu próprio ritmo e perfil. O PITCH é a primeira ferramenta que realmente respeita isso na prática.',
    author: 'Terapeuta Educacional',
    avatar: '🧑‍⚕️',
  },
]

export default function Landing({ onStart, auth, onLoginSync, syncStatus }) {
  const navigate = useNavigate()
  const [authMode, setAuthMode] = useState(null) // null | 'login' | 'register' | 'professional' | 'share-code'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [authMsg, setAuthMsg] = useState(null)
  const [authLoading, setAuthLoading] = useState(false)
  const [shareCode, setShareCode] = useState('')

  const handlePasswordReset = async () => {
    if (!auth?.configured || !email.trim()) {
      setAuthMsg('Escreva o email primeiro.')
      return
    }
    setAuthLoading(true)
    setAuthMsg(null)
    const result = await auth.resetPassword?.(email.trim())
    if (result?.error) {
      setAuthMsg(result.error)
    } else {
      setAuthMsg('Email de recuperação enviado! Verifique a sua caixa de correio.')
    }
    setAuthLoading(false)
  }

  const handleAuth = async () => {
    if (!auth?.configured || !email.trim()) return
    setAuthLoading(true)
    setAuthMsg(null)

    let result
    if (authMode === 'register' || authMode === 'professional') {
      result = await auth.signUp(email.trim(), password)
      if (!result.error) {
        setAuthMsg('Conta criada! Verifica o email para confirmar.')
      }
    } else {
      if (password) {
        result = await auth.signIn(email.trim(), password)
        if (!result.error && onLoginSync) {
          setAuthMsg('A sincronizar dados da cloud...')
          await onLoginSync()
          setAuthMsg('Sincronizado! Os teus perfis foram recuperados.')
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
    <div style={styles.page}>
      {/* Header / Navigation */}
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div style={styles.headerLogo}>
            <img src="/logos/pitch-robo.png" alt="" style={styles.headerLogoImg} />
            <span style={styles.headerLogoText}>PITCH</span>
          </div>
          <nav style={styles.headerNav}>
            <button style={styles.headerLink} onClick={() => navigate('/planos')}>Planos</button>
            <button style={styles.headerLink} onClick={() => navigate('/faq')}>FAQ</button>
            <button style={styles.headerLink} onClick={() => navigate('/suporte')}>Suporte</button>
            <button style={styles.headerCta} onClick={onStart || (() => navigate('/'))}>
              Começar
            </button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section style={styles.hero}>
        <div style={styles.heroInner}>
          <img src="/logos/pitch-robo.png" alt="PITCH mascot" style={styles.heroMascot} />
          <p style={styles.heroBadge}>De pais para pais</p>
          <h1 style={styles.heroTitle}>
            Uma plataforma universal que trata cada criança como única.
          </h1>
          <p style={styles.heroSubtitle}>
            <strong>P</strong>lay. <strong>I</strong>nteract. <strong>T</strong>hink. <strong>C</strong>hallenge. <strong>H</strong>one.
          </p>
          <p style={styles.heroDesc}>
            Nasceu de uma necessidade real: o nosso filho precisava de uma escola que se adaptasse a ele, não o contrário. Não encontrámos. Então construímos.
          </p>
          {/* Auth: primary action for families */}
          {auth?.configured && !auth?.user && !authMode && (
            <div style={landingAuthStyles.primaryAuth}>
              <div style={landingAuthStyles.primaryAuthBtns}>
                <button style={styles.heroPrimary} onClick={() => setAuthMode('register')}>
                  Criar Conta da Família
                </button>
                <button style={styles.heroSecondary} onClick={() => setAuthMode('login')}>
                  Já Tenho Conta
                </button>
              </div>
              <p style={landingAuthStyles.familyHint}>
                Uma conta, toda a família. Mãe, pai, terapeuta — todos acedem ao mesmo perfil, de qualquer dispositivo.
              </p>
              <div style={landingAuthStyles.proRow}>
                <button style={landingAuthStyles.proBtn} onClick={() => setAuthMode('professional')}>
                  Sou Profissional
                </button>
                <button style={landingAuthStyles.proBtn} onClick={() => setAuthMode('share-code')}>
                  Tenho um Código
                </button>
              </div>
            </div>
          )}

          {/* Auth form */}
          {auth?.configured && !auth?.user && authMode && authMode !== 'share-code' && (
            <div style={landingAuthStyles.form}>
              <p style={landingAuthStyles.formTitle}>
                {authMode === 'register' ? 'Criar conta da família' :
                 authMode === 'professional' ? 'Conta profissional' :
                 'Entrar na minha conta'}
              </p>
              <p style={landingAuthStyles.formHint}>
                {authMode === 'register'
                  ? 'Depois de criar conta, vai configurar o perfil da criança.'
                  : authMode === 'professional'
                  ? 'Terapeuta, educador ou psicólogo? Crie conta para gerir programas de terapia e acompanhar crianças.'
                  : 'Entra para aceder aos perfis da tua família.'}
              </p>
              {authMode === 'professional' && (
                <div style={landingAuthStyles.proInfo}>
                  <span style={landingAuthStyles.proInfoIcon}>🩺</span>
                  <div>
                    <p style={landingAuthStyles.proInfoText}>
                      Com a conta profissional (plano Floresta) pode:
                    </p>
                    <ul style={landingAuthStyles.proInfoList}>
                      <li>Criar programas de terapia personalizados</li>
                      <li>Prescrever actividades a cada criança</li>
                      <li>Acompanhar progresso de até 20 perfis</li>
                      <li>Aceitar códigos de partilha das famílias</li>
                    </ul>
                  </div>
                </div>
              )}
              <input
                style={landingAuthStyles.input}
                type="email"
                placeholder={authMode === 'professional' ? 'Email profissional' : 'Email'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
              <div style={landingAuthStyles.passwordWrap}>
                <input
                  style={landingAuthStyles.passwordInput}
                  type={showPassword ? 'text' : 'password'}
                  placeholder={authMode === 'login' ? 'Password (ou vazio para magic link)' : 'Escolha uma password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={authMode === 'register' || authMode === 'professional' ? 'new-password' : 'current-password'}
                />
                <button
                  type="button"
                  style={landingAuthStyles.eyeBtn}
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
                  style={landingAuthStyles.forgotBtn}
                  onClick={handlePasswordReset}
                >
                  Esqueceu a password?
                </button>
              )}
              {authMsg && <p style={landingAuthStyles.msg}>{authMsg}</p>}
              <button
                style={landingAuthStyles.submitBtn}
                onClick={handleAuth}
                disabled={authLoading || !email.trim()}
              >
                {authLoading ? 'A processar...' :
                 authMode === 'register' ? 'Criar Conta' :
                 authMode === 'professional' ? 'Criar Conta Profissional' :
                 'Entrar'}
              </button>
              <button
                style={landingAuthStyles.backBtn}
                onClick={() => { setAuthMode(null); setAuthMsg(null) }}
              >
                Cancelar
              </button>
            </div>
          )}

          {/* Share code form — therapist accepts a family's share code */}
          {auth?.configured && !auth?.user && authMode === 'share-code' && (
            <div style={landingAuthStyles.form}>
              <p style={landingAuthStyles.formTitle}>Inserir Código de Partilha</p>
              <p style={landingAuthStyles.formHint}>
                Recebeu um código de uma família? Insira-o aqui para aceder ao perfil da criança.
                Precisa de conta para continuar.
              </p>
              <input
                style={{...landingAuthStyles.input, textAlign: 'center', fontSize: '1.5rem', letterSpacing: '4px', fontFamily: 'monospace'}}
                type="text"
                placeholder="CÓDIGO"
                value={shareCode}
                onChange={(e) => setShareCode(e.target.value.toUpperCase())}
                maxLength={8}
              />
              {authMsg && <p style={landingAuthStyles.msg}>{authMsg}</p>}
              <p style={landingAuthStyles.formHint}>
                Primeiro faça login, depois insira o código nas Definições da app.
              </p>
              <button
                style={landingAuthStyles.submitBtn}
                onClick={() => {
                  setAuthMode('login')
                  setAuthMsg('Faça login primeiro. Depois vá a Definições para inserir o código.')
                }}
              >
                Fazer Login
              </button>
              <button
                style={landingAuthStyles.backBtn}
                onClick={() => { setAuthMode(null); setAuthMsg(null); setShareCode('') }}
              >
                Cancelar
              </button>
            </div>
          )}

          {/* Logged in — show status and proceed */}
          {auth?.configured && auth?.user && (
            <div style={landingAuthStyles.loggedInBox}>
              <span style={landingAuthStyles.loggedInText}>
                {syncStatus === 'pulling' ? '🔄 A sincronizar perfis...' : `Bem-vindo(a)! ${auth.user.email}`}
              </span>
              <button style={styles.heroPrimary} onClick={onStart || (() => navigate('/'))}>
                Criar o Perfil da Criança
              </button>
              <button style={landingAuthStyles.signOutBtn} onClick={auth.signOut}>Sair da conta</button>
            </div>
          )}

          {/* No Supabase: offline mode */}
          {!auth?.configured && (
            <div style={styles.heroBtns}>
              <button style={styles.heroPrimary} onClick={onStart || (() => navigate('/'))}>
                Criar a Escola do Meu Filho
              </button>
              <button style={styles.heroSecondary} onClick={() => {
                document.getElementById('nossa-historia')?.scrollIntoView({ behavior: 'smooth' })
              }}>
                A Nossa História
              </button>
            </div>
          )}

          {/* Offline note when no auth */}
          {!auth?.configured && (
            <p style={styles.heroNote}>
              Plano grátis disponível. Sem publicidade. Sem dados vendidos.
            </p>
          )}

          {/* Try without account link */}
          {auth?.configured && !auth?.user && !authMode && (
            <button
              style={landingAuthStyles.tryWithoutBtn}
              onClick={onStart || (() => navigate('/'))}
            >
              Experimentar sem conta (dados ficam só neste dispositivo)
            </button>
          )}
        </div>
      </section>

      {/* Our Story */}
      <section id="nossa-historia" style={styles.storySection}>
        <div style={styles.storyInner}>
          <div style={styles.storyQuote}>
            <p style={styles.storyText}>
              O nosso filho está no espectro autista. Tentámos dezenas de aplicações educativas. Nenhuma respeitava o ritmo dele. Nenhuma entendia que ele pode estar no nível 7 em linguagem e no nível 3 em matemática — ao mesmo tempo. Nenhuma detectava que ele estava frustrado e precisava de uma pausa.
            </p>
            <p style={styles.storyText}>
              Então decidimos: se a escola que o nosso filho precisa não existe, vamos construí-la. Não só para ele — para todas as crianças que aprendem de forma diferente, em qualquer parte do mundo.
            </p>
            <p style={styles.storySignature}>
              — Fundadores do PITCH
            </p>
          </div>
        </div>
      </section>

      {/* Social Proof Bar */}
      <section style={styles.socialBar}>
        <div style={styles.socialInner}>
          <div style={styles.socialStat}>
            <span style={styles.socialNumber}>800+</span>
            <span style={styles.socialLabel}>Exercícios</span>
          </div>
          <div style={styles.socialDivider} />
          <div style={styles.socialStat}>
            <span style={styles.socialNumber}>30</span>
            <span style={styles.socialLabel}>Tipos de Actividade</span>
          </div>
          <div style={styles.socialDivider} />
          <div style={styles.socialStat}>
            <span style={styles.socialNumber}>10</span>
            <span style={styles.socialLabel}>Níveis</span>
          </div>
          <div style={styles.socialDivider} />
          <div style={styles.socialStat}>
            <span style={styles.socialNumber}>5</span>
            <span style={styles.socialLabel}>Mundos</span>
          </div>
          <div style={styles.socialDivider} />
          <div style={styles.socialStat}>
            <span style={styles.socialNumber}>♾️</span>
            <span style={styles.socialLabel}>Combinações</span>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="como-funciona" style={styles.section}>
        <div style={styles.sectionInner}>
          <h2 style={styles.sectionTitle}>Como Funciona</h2>
          <p style={styles.sectionSubtitle}>
            Três passos para começar a aprender ao seu ritmo.
          </p>
          <div style={styles.stepsGrid}>
            <div style={styles.step}>
              <div style={{ ...styles.stepCircle, backgroundColor: '#E8F5E9', borderColor: '#4CAF50' }}>
                <span style={styles.stepNumber}>1</span>
              </div>
              <h3 style={styles.stepTitle}>Cria a Escola</h3>
              <p style={styles.stepDesc}>
                Nome, idade, interesses, necessidades específicas. Cada perfil é único.
              </p>
            </div>
            <div style={styles.step}>
              <div style={{ ...styles.stepCircle, backgroundColor: '#E3F2FD', borderColor: '#1565C0' }}>
                <span style={styles.stepNumber}>2</span>
              </div>
              <h3 style={styles.stepTitle}>Avaliação Inicial</h3>
              <p style={styles.stepDesc}>
                12 perguntas diagnósticas. A plataforma detecta o nível em cada campo.
              </p>
            </div>
            <div style={styles.step}>
              <div style={{ ...styles.stepCircle, backgroundColor: '#FFF3E0', borderColor: '#E65100' }}>
                <span style={styles.stepNumber}>3</span>
              </div>
              <h3 style={styles.stepTitle}>Aprende e Evolui</h3>
              <p style={styles.stepDesc}>
                Actividades adaptadas, progresso visível, sem pressão. Cada vitória conta.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6 Campos */}
      <section style={{ ...styles.section, backgroundColor: '#F5F5F5' }}>
        <div style={styles.sectionInner}>
          <h2 style={styles.sectionTitle}>6 Campos de Aprendizagem</h2>
          <p style={styles.sectionSubtitle}>
            Currículo completo organizado por áreas de competência, não por disciplinas.
          </p>
          <div style={styles.campoGrid}>
            {CAMPOS.map((campo) => (
              <div key={campo.name} style={{ ...styles.campoCard, borderLeftColor: campo.color }}>
                <span style={styles.campoIcon}>{campo.icon}</span>
                <div>
                  <h3 style={{ ...styles.campoName, color: campo.color }}>{campo.name}</h3>
                  <p style={styles.campoDesc}>{campo.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section style={styles.section}>
        <div style={styles.sectionInner}>
          <h2 style={styles.sectionTitle}>Universal e Individual</h2>
          <p style={styles.sectionSubtitle}>
            Uma plataforma para qualquer criança, que trata cada uma como única.
          </p>
          <div style={styles.featGrid}>
            {FEATURES.map((feat) => (
              <div key={feat.title} style={styles.featCard}>
                <span style={styles.featIcon}>{feat.icon}</span>
                <h3 style={styles.featTitle}>{feat.title}</h3>
                <p style={styles.featDesc}>{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Competency Framework */}
      <section style={{ ...styles.section, backgroundColor: '#E8F5E9' }}>
        <div style={styles.sectionInner}>
          <h2 style={styles.sectionTitle}>Crescimento por Fases</h2>
          <p style={styles.sectionSubtitle}>
            Comunicação elegante com pais e terapeutas. Cada criança está numa fase — sem rótulos, com narrativa.
          </p>
          <div style={styles.phaseTimeline}>
            {PHASES.map((phase, i) => (
              <div key={phase.name} style={styles.phaseItem}>
                <div style={styles.phaseEmoji}>{phase.emoji}</div>
                <div style={styles.phaseInfo}>
                  <h3 style={styles.phaseName}>{phase.name}</h3>
                  <span style={styles.phaseLevels}>Níveis {phase.levels}</span>
                  <p style={styles.phaseDesc}>{phase.desc}</p>
                </div>
                {i < PHASES.length - 1 && <div style={styles.phaseConnector} />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Universes */}
      <section style={styles.section}>
        <div style={styles.sectionInner}>
          <h2 style={styles.sectionTitle}>5 Universos Temáticos</h2>
          <p style={styles.sectionSubtitle}>
            O mesmo currículo, contextualizado pelo interesse da criança.
          </p>
          <div style={styles.universeRow}>
            {[
              { emoji: '⚽', name: 'Futebol' },
              { emoji: '🦕', name: 'Dinossauros' },
              { emoji: '🚀', name: 'Espaço' },
              { emoji: '🐾', name: 'Animais' },
              { emoji: '🎵', name: 'Música' },
            ].map((u) => (
              <div key={u.name} style={styles.universeCard}>
                <span style={styles.universeEmoji}>{u.emoji}</span>
                <span style={styles.universeName}>{u.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ ...styles.section, backgroundColor: '#FFF8E1' }}>
        <div style={styles.sectionInner}>
          <h2 style={styles.sectionTitle}>Vozes de Quem Usa</h2>
          <div style={styles.testimonialGrid}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} style={styles.testimonialCard}>
                <p style={styles.testimonialQuote}>"{t.quote}"</p>
                <div style={styles.testimonialAuthor}>
                  <span style={styles.testimonialAvatar}>{t.avatar}</span>
                  <span style={styles.testimonialName}>{t.author}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Accessibility */}
      <section style={styles.section}>
        <div style={styles.sectionInner}>
          <h2 style={styles.sectionTitle}>Acessibilidade em Primeiro</h2>
          <div style={styles.a11yGrid}>
            <div style={styles.a11yItem}>
              <span style={styles.a11yIcon}>👆</span>
              <span style={styles.a11yText}>Touch targets 44x44px (WCAG)</span>
            </div>
            <div style={styles.a11yItem}>
              <span style={styles.a11yIcon}>🔤</span>
              <span style={styles.a11yText}>Fonte dyslexia-friendly (Quicksand)</span>
            </div>
            <div style={styles.a11yItem}>
              <span style={styles.a11yIcon}>🎭</span>
              <span style={styles.a11yText}>Animações reduzidas (prefers-reduced-motion)</span>
            </div>
            <div style={styles.a11yItem}>
              <span style={styles.a11yIcon}>🌗</span>
              <span style={styles.a11yText}>Alto contraste (forced-colors)</span>
            </div>
            <div style={styles.a11yItem}>
              <span style={styles.a11yIcon}>📴</span>
              <span style={styles.a11yText}>Funciona offline (PWA)</span>
            </div>
            <div style={styles.a11yItem}>
              <span style={styles.a11yIcon}>🔇</span>
              <span style={styles.a11yText}>Perfil sensorial configurável</span>
            </div>
          </div>
        </div>
      </section>

      {/* Community */}
      <section style={{ ...styles.section, backgroundColor: '#F3E5F5' }}>
        <div style={styles.sectionInner}>
          <h2 style={styles.sectionTitle}>Família e Comunidade</h2>
          <p style={styles.sectionSubtitle}>
            A aprendizagem não é só da criança — é de toda a família.
          </p>
          <div style={styles.stepsGrid}>
            <div style={styles.step}>
              <div style={{ ...styles.stepCircle, backgroundColor: '#F3E5F5', borderColor: '#6A1B9A' }}>
                <span style={{ fontSize: '1.5rem' }}>💌</span>
              </div>
              <h3 style={styles.stepTitle}>Mural Familiar</h3>
              <p style={styles.stepDesc}>
                Pais e terapeutas enviam mensagens de encorajamento do seu próprio dispositivo.
              </p>
            </div>
            <div style={styles.step}>
              <div style={{ ...styles.stepCircle, backgroundColor: '#F3E5F5', borderColor: '#6A1B9A' }}>
                <span style={{ fontSize: '1.5rem' }}>🏆</span>
              </div>
              <h3 style={styles.stepTitle}>Conquistas Partilhadas</h3>
              <p style={styles.stepDesc}>
                A família recebe notificações quando a criança completa actividades e alcança objectivos.
              </p>
            </div>
            <div style={styles.step}>
              <div style={{ ...styles.stepCircle, backgroundColor: '#F3E5F5', borderColor: '#6A1B9A' }}>
                <span style={{ fontSize: '1.5rem' }}>🤝</span>
              </div>
              <h3 style={styles.stepTitle}>Social Opcional</h3>
              <p style={styles.stepDesc}>
                Comunidade entre famílias, rankings gentis — tudo opt-in. Quem não quiser, não participa.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section style={styles.ctaSection}>
        <div style={styles.sectionInner}>
          <h2 style={styles.ctaTitle}>Cada criança merece uma escola que a entenda.</h2>
          <p style={styles.ctaDesc}>
            Construído por pais, para pais. Plano grátis com 6 actividades completas (1 por campo), 10 níveis cada, conteúdo que nunca se repete. Sem publicidade, sem dados vendidos. Em menos de 2 minutos, a escola do teu filho está pronta.
          </p>
          <button style={styles.ctaBtn} onClick={onStart || (() => navigate('/'))}>
            Criar a Escola do Meu Filho
          </button>
          <div style={styles.ctaLinks}>
            <button style={styles.ctaLink} onClick={() => navigate('/faq')}>
              Perguntas Frequentes
            </button>
            <span style={styles.ctaLinkSep}>|</span>
            <button style={styles.ctaLink} onClick={() => navigate('/suporte')}>
              Contacto e Suporte
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerInner}>
          <div style={styles.footerLogo}>
            <img src="/logos/pitch-robo.png" alt="" style={styles.footerLogoImg} />
            <span style={styles.footerLogoText}>PITCH</span>
          </div>
          <p style={styles.footerTagline}>
            Play. Interact. Think. Challenge. Hone.
          </p>
          <div style={styles.footerLinks}>
            <button style={styles.footerLink} onClick={() => navigate('/planos')}>Planos</button>
            <button style={styles.footerLink} onClick={() => navigate('/faq')}>FAQ</button>
            <button style={styles.footerLink} onClick={() => navigate('/suporte')}>Suporte</button>
            <button style={styles.footerLink} onClick={() => navigate('/landing')}>Sobre</button>
          </div>
          <p style={styles.footerCopy}>
            PITCH — Plataforma de aprendizagem inclusiva para crianças neurodivergentes.
          </p>
        </div>
      </footer>
    </div>
  )
}

const styles = {
  page: {
    width: '100%',
    minHeight: '100vh',
    backgroundColor: '#FFFFFF',
    fontFamily: "'Quicksand', sans-serif",
  },

  // Header
  header: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(8px)',
    borderBottom: '1px solid #E0E0E0',
  },
  headerInner: {
    maxWidth: '960px',
    margin: '0 auto',
    padding: '12px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLogo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  headerLogoImg: {
    width: '32px',
    height: '32px',
    objectFit: 'contain',
  },
  headerLogoText: {
    fontWeight: 700,
    fontSize: '1.25rem',
    color: '#1B5E20',
    letterSpacing: '2px',
  },
  headerNav: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  headerLink: {
    fontFamily: 'inherit',
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#616161',
    cursor: 'pointer',
    padding: '8px',
    minHeight: '44px',
    display: 'flex',
    alignItems: 'center',
  },
  headerCta: {
    fontFamily: 'inherit',
    fontSize: '0.875rem',
    fontWeight: 700,
    color: 'white',
    backgroundColor: '#2E7D32',
    padding: '10px 20px',
    borderRadius: '24px',
    cursor: 'pointer',
    minHeight: '44px',
    transition: 'all 0.2s',
  },

  // Hero
  hero: {
    background: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 50%, #A5D6A7 100%)',
    padding: '60px 24px 48px',
  },
  heroInner: {
    maxWidth: '640px',
    margin: '0 auto',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
  },
  heroMascot: {
    width: '140px',
    height: '140px',
    objectFit: 'contain',
    filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.1))',
  },
  heroTitle: {
    fontSize: 'clamp(1.75rem, 5vw, 2.5rem)',
    fontWeight: 700,
    color: '#1B5E20',
    lineHeight: 1.2,
  },
  heroSubtitle: {
    fontSize: '1rem',
    color: '#2E7D32',
    fontWeight: 500,
    letterSpacing: '1px',
  },
  heroDesc: {
    fontSize: '1rem',
    color: '#37474F',
    lineHeight: 1.6,
    maxWidth: '480px',
  },
  heroBtns: {
    display: 'flex',
    gap: '12px',
    marginTop: '8px',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  heroPrimary: {
    fontFamily: 'inherit',
    fontSize: '1.1rem',
    fontWeight: 700,
    color: 'white',
    backgroundColor: '#2E7D32',
    padding: '14px 32px',
    borderRadius: '32px',
    cursor: 'pointer',
    minHeight: '44px',
    boxShadow: '0 4px 16px rgba(46, 125, 50, 0.3)',
    transition: 'all 0.2s',
  },
  heroSecondary: {
    fontFamily: 'inherit',
    fontSize: '1rem',
    fontWeight: 600,
    color: '#2E7D32',
    backgroundColor: 'rgba(255,255,255,0.8)',
    padding: '14px 28px',
    borderRadius: '32px',
    cursor: 'pointer',
    minHeight: '44px',
    border: '2px solid #2E7D32',
  },
  heroBadge: {
    fontSize: '0.8rem',
    fontWeight: 700,
    color: '#1B5E20',
    backgroundColor: 'rgba(255,255,255,0.7)',
    padding: '6px 16px',
    borderRadius: '20px',
    textTransform: 'uppercase',
    letterSpacing: '1.5px',
  },
  heroNote: {
    fontSize: '0.8rem',
    color: '#558B2F',
    fontWeight: 600,
    marginTop: '4px',
  },

  // Our Story
  storySection: {
    padding: '48px 24px',
    backgroundColor: '#FFFFFF',
  },
  storyInner: {
    maxWidth: '640px',
    margin: '0 auto',
  },
  storyQuote: {
    padding: '32px',
    backgroundColor: '#F5F5F5',
    borderRadius: '20px',
    borderLeft: '4px solid #2E7D32',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  storyText: {
    fontSize: '1rem',
    color: '#37474F',
    lineHeight: 1.7,
  },
  storySignature: {
    fontSize: '0.9rem',
    fontWeight: 700,
    color: '#1B5E20',
    fontStyle: 'italic',
  },

  // Social proof bar
  socialBar: {
    backgroundColor: '#1B5E20',
    padding: '20px 24px',
  },
  socialInner: {
    maxWidth: '640px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  socialStat: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
  },
  socialNumber: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: 'white',
  },
  socialLabel: {
    fontSize: '0.7rem',
    color: '#A5D6A7',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  socialDivider: {
    width: '1px',
    height: '32px',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },

  // Section
  section: {
    padding: '48px 24px',
  },
  sectionInner: {
    maxWidth: '800px',
    margin: '0 auto',
  },
  sectionTitle: {
    fontSize: 'clamp(1.5rem, 4vw, 2rem)',
    fontWeight: 700,
    color: '#1B5E20',
    textAlign: 'center',
    marginBottom: '8px',
  },
  sectionSubtitle: {
    fontSize: '1rem',
    color: '#616161',
    textAlign: 'center',
    lineHeight: 1.5,
    marginBottom: '32px',
  },

  // Steps
  stepsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '24px',
  },
  step: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '12px',
  },
  stepCircle: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    border: '3px solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumber: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#1B5E20',
  },
  stepTitle: {
    fontSize: '1.1rem',
    fontWeight: 700,
    color: '#212121',
  },
  stepDesc: {
    fontSize: '0.9rem',
    color: '#616161',
    lineHeight: 1.5,
  },

  // Campos
  campoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '16px',
  },
  campoCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    backgroundColor: 'white',
    borderLeft: '4px solid',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  campoIcon: {
    fontSize: '2rem',
    flexShrink: 0,
  },
  campoName: {
    fontWeight: 700,
    fontSize: '1rem',
  },
  campoDesc: {
    fontSize: '0.85rem',
    color: '#616161',
    lineHeight: 1.4,
    marginTop: '2px',
  },

  // Features
  featGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '20px',
  },
  featCard: {
    padding: '24px',
    backgroundColor: '#FAFAFA',
    borderRadius: '16px',
    border: '1px solid #E0E0E0',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  featIcon: {
    fontSize: '2rem',
  },
  featTitle: {
    fontSize: '1.1rem',
    fontWeight: 700,
    color: '#212121',
  },
  featDesc: {
    fontSize: '0.9rem',
    color: '#616161',
    lineHeight: 1.5,
  },

  // Phases
  phaseTimeline: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0',
    maxWidth: '400px',
    margin: '0 auto',
  },
  phaseItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
    position: 'relative',
    paddingBottom: '24px',
  },
  phaseEmoji: {
    fontSize: '2rem',
    flexShrink: 0,
    width: '48px',
    height: '48px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: '50%',
    border: '2px solid #A5D6A7',
    zIndex: 1,
  },
  phaseInfo: {
    flex: 1,
    paddingTop: '4px',
  },
  phaseName: {
    fontSize: '1.1rem',
    fontWeight: 700,
    color: '#1B5E20',
  },
  phaseLevels: {
    fontSize: '0.8rem',
    color: '#4CAF50',
    fontWeight: 600,
  },
  phaseDesc: {
    fontSize: '0.9rem',
    color: '#37474F',
    marginTop: '2px',
  },
  phaseConnector: {
    position: 'absolute',
    left: '23px',
    top: '48px',
    width: '2px',
    height: '24px',
    backgroundColor: '#A5D6A7',
  },

  // Universes
  universeRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: '16px',
    flexWrap: 'wrap',
  },
  universeCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    padding: '16px 20px',
    backgroundColor: '#FAFAFA',
    borderRadius: '16px',
    border: '1px solid #E0E0E0',
    minWidth: '100px',
  },
  universeEmoji: {
    fontSize: '2.5rem',
  },
  universeName: {
    fontSize: '0.85rem',
    fontWeight: 700,
    color: '#212121',
  },

  // Testimonials
  testimonialGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '16px',
  },
  testimonialCard: {
    padding: '20px',
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  testimonialQuote: {
    fontSize: '0.95rem',
    color: '#37474F',
    lineHeight: 1.5,
    fontStyle: 'italic',
  },
  testimonialAuthor: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  testimonialAvatar: {
    fontSize: '1.5rem',
  },
  testimonialName: {
    fontSize: '0.85rem',
    fontWeight: 600,
    color: '#616161',
  },

  // Accessibility
  a11yGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '12px',
  },
  a11yItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 16px',
    backgroundColor: '#FAFAFA',
    borderRadius: '12px',
    border: '1px solid #E0E0E0',
  },
  a11yIcon: {
    fontSize: '1.3rem',
    flexShrink: 0,
  },
  a11yText: {
    fontSize: '0.85rem',
    fontWeight: 600,
    color: '#37474F',
  },

  // Final CTA
  ctaSection: {
    background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #4CAF50 100%)',
    padding: '48px 24px',
    textAlign: 'center',
  },
  ctaTitle: {
    fontSize: 'clamp(1.5rem, 4vw, 2rem)',
    fontWeight: 700,
    color: 'white',
    marginBottom: '12px',
  },
  ctaDesc: {
    fontSize: '1rem',
    color: '#C8E6C9',
    lineHeight: 1.5,
    maxWidth: '480px',
    margin: '0 auto 24px',
  },
  ctaBtn: {
    fontFamily: 'inherit',
    fontSize: '1.1rem',
    fontWeight: 700,
    color: '#1B5E20',
    backgroundColor: 'white',
    padding: '14px 40px',
    borderRadius: '32px',
    cursor: 'pointer',
    minHeight: '44px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
    transition: 'all 0.2s',
  },
  ctaLinks: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '12px',
    marginTop: '20px',
  },
  ctaLink: {
    fontFamily: 'inherit',
    fontSize: '0.85rem',
    fontWeight: 600,
    color: '#C8E6C9',
    cursor: 'pointer',
    padding: '8px',
    minHeight: '44px',
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'underline',
  },
  ctaLinkSep: {
    color: 'rgba(255,255,255,0.3)',
  },

  // Footer
  footer: {
    backgroundColor: '#0D3C10',
    padding: '32px 24px',
    textAlign: 'center',
  },
  footerInner: {
    maxWidth: '640px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
  },
  footerLogo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  footerLogoImg: {
    width: '24px',
    height: '24px',
    objectFit: 'contain',
    opacity: 0.8,
  },
  footerLogoText: {
    fontWeight: 700,
    fontSize: '1rem',
    color: '#A5D6A7',
    letterSpacing: '2px',
  },
  footerTagline: {
    fontSize: '0.8rem',
    color: '#81C784',
    fontWeight: 500,
  },
  footerLinks: {
    display: 'flex',
    gap: '16px',
  },
  footerLink: {
    fontFamily: 'inherit',
    fontSize: '0.8rem',
    fontWeight: 600,
    color: '#A5D6A7',
    cursor: 'pointer',
    padding: '8px',
    minHeight: '44px',
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'underline',
  },
  footerCopy: {
    fontSize: '0.7rem',
    color: 'rgba(255,255,255,0.4)',
    marginTop: '8px',
  },
}

const landingAuthStyles = {
  primaryAuth: {
    width: '100%',
    maxWidth: '400px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    marginTop: '8px',
  },
  primaryAuthBtns: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '100%',
  },
  familyHint: {
    fontSize: '0.85rem',
    color: '#37474F',
    fontWeight: 600,
    textAlign: 'center',
    lineHeight: 1.5,
    padding: '0 12px',
  },
  tryWithoutBtn: {
    fontFamily: 'inherit',
    fontSize: '0.85rem',
    fontWeight: 600,
    color: '#616161',
    cursor: 'pointer',
    padding: '8px',
    textDecoration: 'underline',
    minHeight: '44px',
    display: 'inline-flex',
    alignItems: 'center',
    marginTop: '-4px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    padding: '24px',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: '16px',
    border: '2px solid #A5D6A7',
    width: '100%',
    maxWidth: '360px',
  },
  formTitle: {
    fontWeight: 700,
    fontSize: '1.1rem',
    color: '#1B5E20',
    textAlign: 'center',
  },
  formHint: {
    fontSize: '0.85rem',
    color: '#616161',
    textAlign: 'center',
    lineHeight: 1.4,
  },
  input: {
    padding: '12px 14px',
    border: '2px solid #C8E6C9',
    borderRadius: '10px',
    fontFamily: 'inherit',
    fontSize: '1rem',
    outline: 'none',
    minHeight: '44px',
  },
  passwordWrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  passwordInput: {
    padding: '12px 48px 12px 14px',
    border: '2px solid #C8E6C9',
    borderRadius: '10px',
    fontFamily: 'inherit',
    fontSize: '1rem',
    outline: 'none',
    minHeight: '44px',
    width: '100%',
    boxSizing: 'border-box',
  },
  eyeBtn: {
    position: 'absolute',
    right: '4px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1.2rem',
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
    color: '#1565C0',
    fontFamily: 'inherit',
    fontSize: '0.85rem',
    fontWeight: 600,
    cursor: 'pointer',
    padding: '4px',
    textDecoration: 'underline',
    alignSelf: 'flex-end',
    marginTop: '-4px',
  },
  msg: {
    fontSize: '0.85rem',
    color: '#E65100',
    fontWeight: 600,
    textAlign: 'center',
  },
  submitBtn: {
    padding: '12px',
    backgroundColor: '#2E7D32',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: 700,
    fontFamily: 'inherit',
    fontSize: '1rem',
    minHeight: '48px',
  },
  backBtn: {
    padding: '8px',
    backgroundColor: 'transparent',
    border: 'none',
    color: '#616161',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: '0.85rem',
    textDecoration: 'underline',
    minHeight: '44px',
  },
  loggedInBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    width: '100%',
    maxWidth: '360px',
    padding: '20px',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: '16px',
    border: '2px solid #A5D6A7',
  },
  loggedInText: {
    fontSize: '0.9rem',
    fontWeight: 600,
    color: '#1B5E20',
    textAlign: 'center',
  },
  // Professional entry
  proRow: {
    display: 'flex',
    gap: '12px',
    marginTop: '4px',
  },
  proBtn: {
    fontFamily: 'inherit',
    fontSize: '0.85rem',
    fontWeight: 600,
    color: '#6A1B9A',
    backgroundColor: 'rgba(243, 229, 245, 0.8)',
    padding: '10px 16px',
    borderRadius: '20px',
    cursor: 'pointer',
    border: '1px solid #CE93D8',
    minHeight: '44px',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.2s',
  },
  proInfo: {
    display: 'flex',
    gap: '10px',
    padding: '12px',
    backgroundColor: '#F3E5F5',
    borderRadius: '12px',
    border: '1px solid #CE93D8',
    textAlign: 'left',
  },
  proInfoIcon: {
    fontSize: '1.5rem',
    flexShrink: 0,
  },
  proInfoText: {
    fontSize: '0.85rem',
    fontWeight: 600,
    color: '#4A148C',
    marginBottom: '4px',
  },
  proInfoList: {
    fontSize: '0.8rem',
    color: '#6A1B9A',
    lineHeight: 1.6,
    paddingLeft: '16px',
    margin: 0,
  },
  signOutBtn: {
    padding: '4px 10px',
    backgroundColor: 'transparent',
    border: '1px solid #616161',
    borderRadius: '6px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: '0.8rem',
    color: '#616161',
    minHeight: '44px',
    display: 'flex',
    alignItems: 'center',
  },
}
