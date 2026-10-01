import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, updateProfile } from 'firebase/auth'
import {
  Activity, ArrowDownRight, ArrowLeft, ArrowRight, ArrowUpRight, Bell, BookOpen, Box, Boxes, Building2,
  CalendarDays, Camera, Check, ChevronDown, CircleCheck, Clock3, Cloud,
  Construction, Download, Droplets, Ellipsis, ExternalLink, FileText, FolderOpen,
  Gauge, GraduationCap,
  LayoutDashboard, Leaf, Menu, Moon, Plus, Radio, Recycle, Search,
  Settings, ShieldCheck, SlidersHorizontal, Sparkles, Sun, Upload, Zap,
  ClipboardCheck, ScanLine, UserRound, Info,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import agusIcon from '../assets/img/AGUS_ico.png'
import agusMascot from '../assets/img/c.png'
import agusIntroPoster from '../assets/img/bg_agus_02V.png'
import mascotOne from '../assets/img/maskot_01.png'
import mascotTwo from '../assets/img/maskot_02.png'
import mascotThree from '../assets/img/maskot_03.png'
import { firebaseAuth, googleProvider } from './firebase'

const mascotSequence = [agusMascot, mascotOne, mascotTwo, mascotThree]
const onboardingMascots = [mascotOne, mascotTwo, mascotThree]

type NavItem = { label: string; icon: LucideIcon }

const navGroups: { title: string; items: NavItem[] }[] = [
  { title: 'WORKSPACE', items: [
    { label: 'Dashboard', icon: LayoutDashboard },
    { label: 'Projects', icon: Building2 },
    { label: 'Assessment', icon: ClipboardCheck },
    { label: 'Rating Tools', icon: Gauge },
    { label: 'Green construction', icon: Construction },
  ] },
  { title: 'LEARNING', items: [
    { label: 'Sesi Pembelajaran', icon: GraduationCap },
  ] },
  { title: 'PERFORMANCE', items: [
    { label: 'Energy', icon: Zap }, { label: 'Water', icon: Droplets },
    { label: 'Waste', icon: Recycle }, { label: 'Materials', icon: Boxes },
    { label: 'Carbon', icon: Cloud },
  ] },
  { title: 'SITE & DATA', items: [
    { label: 'BIM + digital twin', icon: Box }, { label: 'Sensors', icon: Radio },
    { label: 'Evidence', icon: FolderOpen }, { label: 'Inspection', icon: ScanLine },
    { label: 'Corrective actions', icon: Activity },
  ] },
  { title: 'GOVERNANCE', items: [
    { label: 'Reports', icon: FileText }, { label: 'Standards', icon: ShieldCheck },
    { label: 'AGUS AI', icon: Sparkles }, { label: 'Settings', icon: Settings },
    { label: 'Tentang aplikasi', icon: Info },
  ] },
]

const energyData = [
  { day: '01', actual: 620, baseline: 760 }, { day: '05', actual: 580, baseline: 740 },
  { day: '09', actual: 690, baseline: 780 }, { day: '13', actual: 540, baseline: 750 },
  { day: '17', actual: 610, baseline: 790 }, { day: '21', actual: 490, baseline: 730 },
  { day: '25', actual: 560, baseline: 770 }, { day: '30', actual: 450, baseline: 750 },
]

const activityRows = [
  { initials: 'RA', name: 'Rizky Adinata', action: 'submitted a site inspection', detail: 'Dust control · Tower A, Level 04', time: '09:42', tone: 'green' },
  { initials: 'NS', name: 'Nadia Sari', action: 'uploaded material evidence', detail: 'Low-VOC coating · 3 documents', time: '08:16', tone: 'blue' },
  { initials: 'BP', name: 'Bima Pratama', action: 'closed a corrective action', detail: 'Temporary water leakage · Zone C', time: 'Yesterday', tone: 'amber' },
]

const initialChecks = [
  { label: 'Dust suppression active at site boundary', done: true },
  { label: 'Waste segregation stations clearly marked', done: true },
  { label: 'Weekly noise monitoring recorded', done: false },
  { label: 'Water meter reading submitted', done: false },
]

const onboardingSlides = [
  { eyebrow: '01 · MEMULAI DARI TUJUAN', title: 'Bangunan yang lebih baik dimulai dari keputusan yang lebih sadar.', description: 'Green Building menggabungkan kinerja lingkungan, kenyamanan pengguna, dan efisiensi sepanjang siklus hidup bangunan.', icon: Building2, metric: 'Siklus hidup', metricLabel: 'Rancang · Bangun · Operasikan', points: ['Pikirkan dampak sejak tahap perencanaan', 'Seimbangkan kinerja lingkungan dan kebutuhan pengguna'] },
  { eyebrow: '02 · TAPAK & DESAIN', title: 'Baca konteks tapak sebelum menentukan strategi.', description: 'Orientasi, akses, ruang terbuka, dan kondisi sekitar membentuk peluang serta dampak sebuah proyek.', icon: Leaf, metric: 'Konteks', metricLabel: 'Tapak · Mobilitas · Ekologi', points: ['Pahami matahari, angin, dan akses transportasi', 'Lindungi area sensitif dan kelola limpasan air'] },
  { eyebrow: '03 · KINERJA ENERGI', title: 'Kurangi kebutuhan energi, lalu ukur hasilnya.', description: 'Strategi pasif dan sistem yang efisien bekerja lebih baik saat dibandingkan dengan baseline yang jelas.', icon: Zap, metric: 'Baseline → hasil', metricLabel: 'Ukur agar bisa diperbaiki', points: ['Prioritaskan selubung dan desain pasif', 'Catat konsumsi dengan satuan dan periode konsisten'] },
  { eyebrow: '04 · PENGELOLAAN AIR', title: 'Gunakan air secara bijak di setiap tahap.', description: 'Pemetaan kebutuhan, perlengkapan efisien, pemanfaatan ulang, dan pemantauan membantu menjaga sumber daya.', icon: Droplets, metric: 'Sumber daya', metricLabel: 'Kurangi · Gunakan ulang · Pantau', points: ['Pisahkan air layak minum dan non-potabel', 'Pantau kebocoran serta potensi pemanfaatan air hujan'] },
  { eyebrow: '05 · MATERIAL & SIRKULARITAS', title: 'Pilih material dengan data, bukan asumsi.', description: 'Asal, kandungan, daya tahan, emisi, dan akhir masa pakai memberi gambaran lebih utuh tentang dampak material.', icon: Recycle, metric: 'Siklus material', metricLabel: 'Pilih · Gunakan · Pulihkan', points: ['Minta dokumen teknis dan bukti pemasok', 'Rencanakan pemilahan, guna ulang, dan daur ulang'] },
  { eyebrow: '06 · GREEN CONSTRUCTION', title: 'Kinerja hijau juga ditentukan di lapangan.', description: 'Praktik konstruksi yang bertanggung jawab mengendalikan dampak terhadap pekerja, masyarakat, dan lingkungan.', icon: Construction, metric: 'Kendali lapangan', metricLabel: 'Debu · Bising · Air · Limbah', points: ['Lakukan inspeksi dan tindak lanjut rutin', 'Catat pemantauan dan simpan bukti bertanggal'] },
  { eyebrow: '07 · BUKTI & PERBAIKAN', title: 'Jadikan data sebagai kebiasaan untuk terus berkembang.', description: 'Tetapkan tanggung jawab, kumpulkan bukti yang relevan, lalu tinjau hasil secara berkala bersama tim proyek.', icon: ClipboardCheck, metric: 'Tinjau kembali', metricLabel: 'Data → aksi → pembelajaran', points: ['Hubungkan indikator dengan pemilik dan bukti', 'Gunakan hasil untuk perbaikan, bukan klaim sertifikasi'] },
]

type WelcomeStage = 'splash' | 'mascot-sequence' | 'brand-poster' | 'onboarding' | 'about' | 'account' | 'complete'

function WelcomeFlow({ stage, slideIndex, mascotIndex, onNext, onPrevious, onSkip, onSkipSequence, onAbout, onAccount, onAuthenticated }: { stage: Exclude<WelcomeStage, 'complete'>; slideIndex: number; mascotIndex: number; onNext: (index?: number) => void; onPrevious: () => void; onSkip: () => void; onSkipSequence: () => void; onAbout: () => void; onAccount: () => void; onAuthenticated: () => void }) {
  const slide = onboardingSlides[slideIndex]
  const SlideIcon = slide.icon
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [authMessage, setAuthMessage] = useState('')
  const [authPending, setAuthPending] = useState(false)

  async function submitAuth(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!firebaseAuth) {
      setAuthMessage('Login belum siap. Isi konfigurasi Firebase pada file .env.local dan aktifkan Authentication di Firebase Console.')
      return
    }
    const formData = new FormData(event.currentTarget)
    const email = String(formData.get('email') ?? '')
    const password = String(formData.get('password') ?? '')
    setAuthMessage('')
    setAuthPending(true)
    try {
      if (authMode === 'register') {
        const credential = await createUserWithEmailAndPassword(firebaseAuth, email, password)
        const name = String(formData.get('name') ?? '').trim()
        if (name) await updateProfile(credential.user, { displayName: name })
      } else {
        await signInWithEmailAndPassword(firebaseAuth, email, password)
      }
      onAuthenticated()
    } catch (error) {
      const code = (error as { code?: string }).code
      const messages: Record<string, string> = {
        'auth/email-already-in-use': 'Email ini sudah terdaftar. Silakan masuk.',
        'auth/invalid-credential': 'Email atau kata sandi tidak sesuai.',
        'auth/weak-password': 'Gunakan kata sandi yang lebih kuat (minimal 8 karakter).',
        'auth/too-many-requests': 'Terlalu banyak percobaan. Coba lagi beberapa saat.',
        'auth/popup-closed-by-user': 'Jendela Google ditutup sebelum proses selesai.',
        'auth/popup-blocked': 'Popup diblokir browser. Izinkan popup lalu coba lagi.',
      }
      setAuthMessage(messages[code ?? ''] ?? 'Autentikasi gagal. Periksa data akun dan konfigurasi Firebase.')
    } finally {
      setAuthPending(false)
    }
  }

  async function signInWithGoogle() {
    if (!firebaseAuth) {
      setAuthMessage('Login Google belum siap. Isi konfigurasi Firebase pada file .env.local dan aktifkan Google provider di Firebase Console.')
      return
    }
    setAuthMessage('')
    setAuthPending(true)
    try {
      await signInWithPopup(firebaseAuth, googleProvider)
      onAuthenticated()
    } catch (error) {
      const code = (error as { code?: string }).code
      setAuthMessage(code === 'auth/popup-closed-by-user' ? 'Jendela Google ditutup sebelum proses selesai.' : code === 'auth/popup-blocked' ? 'Popup diblokir browser. Izinkan popup lalu coba lagi.' : 'Login Google gagal. Periksa konfigurasi Firebase dan coba lagi.')
    } finally {
      setAuthPending(false)
    }
  }

  if (stage === 'splash') {
    return <main className="welcome-screen splash-screen" aria-label="AGUS Green Building">
      <div className="splash-content"><img src={agusIcon} alt="AGUS · Adhi Green Useful Sustainability" /><span className="splash-caption">GREEN BUILDING · GREEN CONSTRUCTION</span><span className="splash-loader" aria-label="Memuat" /></div>
      <div className="mascot-preload" aria-hidden="true">{mascotSequence.map(mascot => <img key={mascot} src={mascot} alt="" />)}</div>
      <span className="splash-footer">ADHI KARYA · SUSTAINABILITY PLATFORM</span>
    </main>
  }

  if (stage === 'mascot-sequence') {
    return <main className="welcome-screen mascot-screen" aria-label={`Animasi maskot Agus ${mascotIndex + 1} dari ${mascotSequence.length}`}>
      <div className="mascot-skyline" aria-hidden="true"><span /><span /><span /><span /></div>
      <div className="mascot-sun" aria-hidden="true" />
      <div className="mascot-leaf mascot-leaf-one" aria-hidden="true" /><div className="mascot-leaf mascot-leaf-two" aria-hidden="true" /><div className="mascot-leaf mascot-leaf-three" aria-hidden="true" />
      <div className="mascot-stage-content"><div className="mascot-welcome-copy"><span className="mascot-kicker"><Leaf size={14} /> GREEN BUILDING · GREEN CONSTRUCTION</span><h1>Halo, saya Agus!</h1><p>Teman hijau untuk membangun lebih bijak, menjaga lingkungan, dan merawat setiap langkah di lapangan.</p></div><div className="mascot-image-wrap" key={mascotIndex}><span className="mascot-ground-shadow" /><img src={mascotSequence[mascotIndex]} alt={`Maskot Agus ${mascotIndex === 0 ? 'daun berhelm hijau' : `seri ${mascotIndex}`}`} /></div></div>
      <div className="mascot-bottom"><span><img src={agusIcon} alt="" /> AGUS · ADHI GREEN USEFUL SUSTAINABILITY</span><span className="mascot-sequence-count">0{mascotIndex + 1} / 04</span><button className="mascot-continue" onClick={onSkipSequence}>Lewati animasi <ArrowRight size={16} /></button></div>
      <div className="mascot-particles" aria-hidden="true"><i /><i /><i /><i /><i /><i /></div>
    </main>
  }

  if (stage === 'brand-poster') {
    return <main className="welcome-screen brand-poster-screen" aria-label="AGUS Green Building dan Green Construction">
      <div className="brand-poster-backdrop" style={{ backgroundImage: `url(${agusIntroPoster})` }} aria-hidden="true" />
      <img className="brand-poster-image" src={agusIntroPoster} alt="AGUS: Green Building, Green Construction, Masa Depan yang Lebih Hijau" />
      <span className="brand-poster-caption">BERSAMA AGUS, WUJUDKAN PEMBANGUNAN YANG LEBIH HIJAU</span>
    </main>
  }

  if (stage === 'about') {
    return <main className="welcome-screen about-screen">
      <header className="account-header"><a className="onboarding-brand" href="#about" aria-label="AGUS"><img src={agusIcon} alt="AGUS" /><span>GREEN INTELLIGENCE</span></a><div><button className="about-header-link" onClick={onAccount}>Masuk / Daftar <ArrowRight size={15} /></button></div></header>
      <AboutInformation onStart={onAccount} />
      <footer className="about-footer"><span>AGUS · Adhi Green Useful Sustainability</span><span>Pendamping keputusan keberlanjutan proyek</span></footer>
    </main>
  }

  if (stage === 'account') {
    return <main className="welcome-screen account-screen">
      <header className="account-header"><a className="onboarding-brand" href="#account" aria-label="AGUS"><img src={agusIcon} alt="AGUS" /><span>GREEN INTELLIGENCE</span></a><button className="about-header-link" onClick={onAbout}><BookOpen size={15} /> Tentang AGUS</button></header>
      <section className="account-layout" id="account">
        <div className="account-story"><span className="auth-eyebrow"><Leaf size={15} /> ADHI GREEN USEFUL SUSTAINABILITY</span><h1>Bangun lebih bijak. Tumbuh lebih berkelanjutan.</h1><p>Ruang kerja untuk menghubungkan target keberlanjutan dengan data, bukti, dan aksi nyata di proyek.</p><div className="account-benefit"><span><Check size={15} /></span> Pantau energi, air, material, dan karbon</div><div className="account-benefit"><span><Check size={15} /></span> Kelola bukti dan tindak lanjut tim</div><div className="account-story-note"><ShieldCheck size={15} /> Skor AGUS adalah penilaian internal, bukan sertifikasi resmi.</div></div>
        <div className="auth-panel">
          <div className="auth-panel-heading"><span className="auth-eyebrow">SELAMAT DATANG</span><h2>{authMode === 'login' ? 'Masuk ke akun Anda' : 'Buat akun AGUS'}</h2><p>{authMode === 'login' ? 'Lanjutkan ke ruang kerja keberlanjutan Anda.' : 'Daftar untuk mulai menjelajahi AGUS.'}</p></div>
          <div className="auth-tabs" role="tablist" aria-label="Jenis akun"><button role="tab" aria-selected={authMode === 'login'} className={authMode === 'login' ? 'auth-tab-active' : ''} onClick={() => { setAuthMode('login'); setAuthMessage('') }}>Masuk</button><button role="tab" aria-selected={authMode === 'register'} className={authMode === 'register' ? 'auth-tab-active' : ''} onClick={() => { setAuthMode('register'); setAuthMessage('') }}>Daftar</button></div>
          <form className="auth-form" onSubmit={submitAuth}>
            {authMode === 'register' && <label>Nama lengkap<input type="text" name="name" placeholder="Nama Anda" autoComplete="name" required /></label>}
            <label>Email<input type="email" name="email" placeholder="nama@gmail.com" autoComplete="email" required /></label>
            <label>Kata sandi<input type="password" name="password" placeholder="Minimal 8 karakter" autoComplete={authMode === 'login' ? 'current-password' : 'new-password'} minLength={8} required /></label>
            <button className="auth-primary auth-submit" type="submit" disabled={authPending}>{authPending ? 'Memproses...' : authMode === 'login' ? 'Masuk' : 'Buat akun'} <ArrowRight size={16} /></button>
          </form>
          <div className="auth-divider"><span>atau lanjutkan dengan</span></div>
          <button className="google-auth-button" onClick={signInWithGoogle} disabled={authPending}><span className="google-g" aria-hidden="true">G</span> Lanjutkan dengan Google</button>
          {authMessage && <p className="auth-message" role="status">{authMessage}</p>}
          <p className="auth-terms">Dengan melanjutkan, Anda memahami bahwa data workspace saat ini merupakan data demo.</p>
        </div>
      </section>
      <footer className="about-footer"><button className="about-footer-link" onClick={onAbout}>Tentang aplikasi</button><span>GREEN BUILDING · GREEN CONSTRUCTION</span></footer>
    </main>
  }

  return <main className="welcome-screen onboarding-screen" aria-label="Pengenalan AGUS">
    <header className="onboarding-header"><a className="onboarding-brand" href="#intro" aria-label="AGUS"><img src={agusIcon} alt="AGUS" /><span>GREEN INTELLIGENCE</span></a><div className="onboarding-header-right"><button className="about-header-link" onClick={onAbout}>Tentang AGUS</button><span>PENGANTAR AGUS</span><div className="onboarding-mascot-cast" aria-label="Maskot Agus">{onboardingMascots.map((mascot, index) => <img key={mascot} src={mascot} alt={`Maskot Agus seri ${index + 1}`} />)}</div><button className="onboarding-skip" onClick={onSkip}>Lewati <ArrowRight size={15} /></button></div></header>
    <div className="onboarding-progress" aria-label={`Slide ${slideIndex + 1} dari ${onboardingSlides.length}`}><span style={{ width: `${((slideIndex + 1) / onboardingSlides.length) * 100}%` }} /></div>
    <section className="onboarding-content" id="intro" aria-live="polite">
      <div className="onboarding-copy" key={slideIndex}>
        <div className="onboarding-eyebrow"><span />{slide.eyebrow}</div>
        <h1>{slide.title}</h1><p className="onboarding-description">{slide.description}</p>
        <ul className="onboarding-points">{slide.points.map(point => <li key={point}><span><Check size={13} /></span>{point}</li>)}</ul>
        <div className="onboarding-controls"><button className="onboarding-back" onClick={onPrevious} disabled={slideIndex === 0} aria-label="Slide sebelumnya"><ArrowLeft size={18} /></button><div className="onboarding-dots" aria-label="Pilih slide">{onboardingSlides.map((item, index) => <button key={item.eyebrow} className={index === slideIndex ? 'onboarding-dot onboarding-dot-active' : 'onboarding-dot'} onClick={() => onNext(index)} aria-label={`Buka slide ${index + 1}`} aria-current={index === slideIndex ? 'step' : undefined} />)}</div><span className="onboarding-count">0{slideIndex + 1}<i>/</i>07</span><button className="onboarding-next" onClick={() => onNext()}>{slideIndex === onboardingSlides.length - 1 ? 'Masuk atau daftar' : 'Lanjut'}{slideIndex === onboardingSlides.length - 1 ? <ArrowRight size={16} /> : <ArrowRight size={16} />}</button></div>
      </div>
      <aside className={`onboarding-visual onboarding-visual-${slideIndex + 1}`} aria-label={slide.metric}>
        <div className="visual-topline"><span>AGUS FIELD GUIDE</span><span>0{slideIndex + 1} / 07</span></div>
        <div className="visual-illustration"><div className="visual-sun" /><div className="visual-ground" /><div className="visual-building visual-building-back"><i /><i /><i /></div><div className="visual-building visual-building-front"><i /><i /><i /><i /></div><div className="visual-leaf visual-leaf-one" /><div className="visual-leaf visual-leaf-two" /><div className="visual-icon"><SlideIcon size={23} strokeWidth={1.6} /></div><span className="visual-coordinate">SUSTAINABILITY / {String(slideIndex + 1).padStart(2, '0')}</span></div>
        <div className="visual-summary"><div><span className="visual-summary-label">PRINSIP UTAMA</span><strong>{slide.metric}</strong><small>{slide.metricLabel}</small></div><div className="visual-mark"><span /><span /><span /></div></div>
        <div className="visual-bottomline"><span>PEMBELAJARAN INTERNAL AGUS</span><span>01—07</span></div>
      </aside>
    </section>
    <footer className="onboarding-footer"><span>Ilustrasi pengantar Green Building &amp; Green Construction</span><span>Konten pengantar · Bukan panduan sertifikasi resmi</span></footer>
  </main>
}

const moduleData: Record<string, { eyebrow: string; title: string; description: string; stats: string[]; rows: string[] }> = {
  Projects: { eyebrow: 'PORTFOLIO', title: 'Project portfolio', description: 'A clear view of sustainability performance across your active work.', stats: ['12 active projects', '8 assessments in progress', '76.4 average internal score'], rows: ['Adhi Green Building – Head Office', 'Cibubur Transit Village', 'Surabaya Office Park'] },
  Assessment: { eyebrow: 'FRAMEWORKS · 2026', title: 'Green assessment', description: 'Track criteria, evidence, ownership, and verification against a configurable framework.', stats: ['68 / 84 indicators addressed', '82% evidence readiness', '9 items need review'], rows: ['Energy efficiency and conservation', 'Water conservation', 'Material resources and cycle'] },
  'Green construction': { eyebrow: 'SITE MANAGEMENT', title: 'Construction checklist', description: 'Field controls and evidence for responsible construction operations.', stats: ['18 checks this week', '14 compliant', '4 need attention'], rows: ['Dust suppression active at site boundary', 'Waste segregation stations clearly marked', 'Weekly noise monitoring recorded', 'Water meter reading submitted'] },
  Energy: { eyebrow: 'RESOURCE PERFORMANCE', title: 'Energy management', description: 'Compare actual consumption with your project baseline and identify savings.', stats: ['42.8 MWh this month', '−12.4% vs baseline', '18.6% renewable share'], rows: ['PLN grid electricity · 34.8 MWh', 'Solar PV · 8.0 MWh', 'Generator · 1.2 MWh'] },
  Water: { eyebrow: 'RESOURCE PERFORMANCE', title: 'Water management', description: 'Monitor potable, recycled, and rainwater use at project level.', stats: ['612 m³ consumed', '24% reused', '−8.2% vs baseline'], rows: ['Potable water · 466 m³', 'Recycled water · 106 m³', 'Rainwater · 40 m³'] },
  Waste: { eyebrow: 'CIRCULARITY', title: 'Waste tracking', description: 'Follow material streams from generation through reuse, recycling, and disposal.', stats: ['38.6 tonnes generated', '71% diverted', '4.8 t to landfill'], rows: ['Concrete · 18.2 t · 82% recovered', 'Steel · 6.4 t · 96% recovered', 'Packaging · 3.8 t · 64% recovered'] },
  Materials: { eyebrow: 'RESPONSIBLE PROCUREMENT', title: 'Green materials', description: 'Review material attributes and supporting documentation across suppliers.', stats: ['42 materials tracked', '67% local content', '18 verified documents'], rows: ['Low-VOC interior coating', 'Recycled-content reinforcement steel', 'FSC-certified formwork timber'] },
  Carbon: { eyebrow: 'EMISSIONS', title: 'Carbon overview', description: 'Understand project emissions by scope and track reduction opportunities.', stats: ['284 tCO₂e to date', '6.8 kgCO₂e / m²', '−9.6% vs baseline'], rows: ['Scope 1 · 48 tCO₂e', 'Scope 2 · 96 tCO₂e', 'Scope 3 · 140 tCO₂e'] },
  'BIM + digital twin': { eyebrow: 'MODEL CONNECTION', title: 'BIM + digital twin', description: 'A connected building model can link spaces and assets to sustainability data.', stats: ['Model connection · Demo', '3 buildings mapped', '42 model properties'], rows: ['Tower A · 12 floors · model placeholder', 'HVAC plant · 8 assets · awaiting connection', 'Envelope · thermal properties not mapped'] },
  Sensors: { eyebrow: 'LIVE MONITORING', title: 'Sensor network', description: 'Sensor feeds are not connected in this prototype. Sample signals are illustrative.', stats: ['24 registered sensors', '21 reporting', '2 alerts to review'], rows: ['CO₂ · Lobby · 612 ppm · Normal', 'PM2.5 · North gate · 18 µg/m³ · Normal', 'Water meter · Zone C · Signal delayed'] },
  Evidence: { eyebrow: 'DOCUMENT CONTROL', title: 'Evidence library', description: 'Find project documentation by criterion, location, and verification state.', stats: ['246 files', '82% verified', '6 expiring soon'], rows: ['VOC test report · Interior finishes · Verified', 'Dust monitoring log · Site management · Under review', 'Rainwater tank photo · Water conservation · Verified'] },
  Inspection: { eyebrow: 'FIELD WORKFLOW', title: 'Site inspections', description: 'Capture observations and connect them to requirements and corrective actions.', stats: ['8 inspections this week', '3 open findings', '94% completion'], rows: ['Tower A weekly environmental walk · Today', 'Material receiving inspection · Yesterday', 'Water management inspection · 28 Sep'] },
  'Corrective actions': { eyebrow: 'ISSUES & FOLLOW-THROUGH', title: 'Corrective actions', description: 'Keep owners, due dates, and verification status visible from finding to closure.', stats: ['11 open actions', '3 overdue', '86% closed on time'], rows: ['Install noise barrier at east boundary · Due 02 Oct', 'Replace leaking temporary hose · Due 01 Oct', 'Add waste signage at loading bay · Due 04 Oct'] },
  Reports: { eyebrow: 'REPORTING', title: 'Green building reports', description: 'Assemble a project view for internal review and certification-readiness discussions.', stats: ['4 reports available', 'Last updated today', 'Next review · 07 Oct'], rows: ['Monthly sustainability snapshot · September', 'Internal assessment summary · Q3', 'Resource performance report · September'] },
  Standards: { eyebrow: 'FRAMEWORK MANAGER', title: 'Standards & frameworks', description: 'Framework parameters should remain versioned and configurable as source documents change.', stats: ['3 framework versions', '1 active for this project', 'Last reviewed · 12 Aug 2026'], rows: ['GBC Indonesia · project-selected version', 'Bangunan Gedung Hijau · regulatory reference', 'Adhi internal sustainability standard · v2.1'] },
  'AGUS AI': { eyebrow: 'SUSTAINABILITY COPILOT', title: 'AGUS AI assistant', description: 'Prototype workspace for evidence matching and sustainability questions.', stats: ['Reference mode · Internal', 'Document matching · Demo', 'No certification decisions'], rows: ['Explain a selected framework criterion', 'Suggest evidence for water conservation', 'Summarize open environmental findings'] },
  Settings: { eyebrow: 'WORKSPACE', title: 'Workspace settings', description: 'Organization access, preferences, and audit controls for the AGUS workspace.', stats: ['Adhi Karya · Organization', '15 workspace roles', 'Audit trail · Enabled'], rows: ['Organization and divisions', 'Users and role assignments', 'Notifications and data preferences'] },
  'Tentang aplikasi': { eyebrow: 'AGUS · ADHI GREEN USEFUL SUSTAINABILITY', title: 'Tentang aplikasi', description: 'Informasi aplikasi, tujuan, manfaat, dan pengembang AGUS.', stats: ['Green Building', 'Green Construction', 'Dani Hamdani · IT Developer'], rows: [] },
}

function AboutInformation({ onStart, onSettings }: { onStart?: () => void; onSettings?: () => void }) {
  return <section className="about-content" id="about">
    <div className="about-main-copy">
      <div className="about-intro"><span className="auth-eyebrow"><Leaf size={15} /> TENTANG AGUS</span><h1>Keputusan hijau yang lebih mudah dipahami dan dijalankan.</h1><p>AGUS (Adhi Green Useful Sustainability) adalah aplikasi digital pendamping untuk pengelolaan Green Building dan Green Construction. AGUS membantu tim proyek menghubungkan informasi lingkungan, dokumentasi, pembelajaran, dan aktivitas lapangan dalam satu ruang kerja.</p>{onStart && <button className="auth-primary" onClick={onStart}>Mulai dengan AGUS <ArrowRight size={16} /></button>}{onSettings && <button className="button about-settings-button" onClick={onSettings}><Settings size={15} /> Kembali ke Pengaturan</button>}</div>
      <div className="about-details"><article><span className="about-icon"><BookOpen size={19} /></span><div><h2>Tujuan aplikasi</h2><p>Mendorong keputusan yang lebih terukur dan bertanggung jawab sepanjang siklus hidup bangunan, dari perencanaan dan konstruksi hingga operasional. AGUS menyatukan indikator, bukti, dan tindak lanjut agar tim lebih mudah memahami kemajuan proyek.</p></div></article><article><span className="about-icon about-icon-teal"><Gauge size={19} /></span><div><h2>Tujuan dan manfaat</h2><p>Membantu memantau energi, air, material, limbah, dan karbon; menyusun dokumentasi proyek; menemukan area yang perlu diperbaiki; serta mendukung koordinasi dan pembelajaran tim berdasarkan informasi yang tertata.</p></div></article><article><span className="about-icon about-icon-orange"><ShieldCheck size={19} /></span><div><h2>Penggunaan yang bertanggung jawab</h2><p>Data proyek pada versi ini merupakan ilustrasi. Skor AGUS adalah penilaian internal, bukan sertifikasi BGH atau GBCI. Standar dan regulasi harus diperiksa pada dokumen resmi terkini.</p></div></article></div>
    </div>
    <DeveloperProfile />
  </section>
}

function DeveloperProfile() {
  return <aside className="developer-profile" aria-label="Profil pengembang aplikasi">
    <div className="developer-profile-heading"><span className="panel-kicker">PENGEMBANG APLIKASI</span><span className="developer-profile-mark"><UserRound size={16} /></span></div>
    <div className="developer-photo-placeholder" role="img" aria-label="Foto profil Dani Hamdani belum ditambahkan"><span>DH</span><small>Foto profil</small></div>
    <h2>Dani Hamdani</h2><p className="developer-role">IT Developer</p>
    <p className="developer-description">Pengembang aplikasi AGUS untuk mendukung pengelolaan informasi keberlanjutan pada proyek Green Building dan Green Construction.</p>
  </aside>
}

type RatingCriterion = { code: string; title: string; points: number; bonus?: boolean }
type RatingCategory = { code: string; title: string; english: string; points: number; prerequisites: string[]; criteria: RatingCriterion[] }
type CheckStatus = 'pending' | 'met' | 'not-met'

const ratingCategories: RatingCategory[] = [
  { code: 'ASD', title: 'Tepat Guna Lahan', english: 'Appropriate Site Development', points: 17, prerequisites: ['ASD-P'], criteria: [
    { code: 'ASD1', title: 'Pemilihan Tapak', points: 2 }, { code: 'ASD2', title: 'Aksesibilitas Komunitas', points: 2 },
    { code: 'ASD3', title: 'Transportasi Umum', points: 2 }, { code: 'ASD4', title: 'Fasilitas Pengguna Sepeda', points: 2 },
    { code: 'ASD5', title: 'Lansekap pada Lahan', points: 3 }, { code: 'ASD6', title: 'Iklim Mikro', points: 3 },
    { code: 'ASD7', title: 'Manajemen Air Limpasan Hujan', points: 3 },
  ] },
  { code: 'EEC', title: 'Efisiensi dan Konservasi Energi', english: 'Energy Efficiency and Conservation', points: 26, prerequisites: ['EEC-P1', 'EEC-P2'], criteria: [
    { code: 'EEC1', title: 'Langkah Penghematan Energi', points: 20 }, { code: 'EEC2', title: 'Pencahayaan Alami', points: 4 },
    { code: 'EEC3', title: 'Ventilasi', points: 1 }, { code: 'EEC4', title: 'Pengaruh Perubahan Iklim', points: 1 },
    { code: 'EEC5', title: 'Energi Terbarukan dalam Tapak', points: 5, bonus: true },
  ] },
  { code: 'WAC', title: 'Konservasi Air', english: 'Water Conservation', points: 21, prerequisites: ['WAC-P1', 'WAC-P2'], criteria: [
    { code: 'WAC1', title: 'Pengurangan Penggunaan Air', points: 8 }, { code: 'WAC2', title: 'Fitur Air', points: 3 },
    { code: 'WAC3', title: 'Daur Ulang Air', points: 3 }, { code: 'WAC4', title: 'Sumber Air Alternatif', points: 2 },
    { code: 'WAC5', title: 'Penampungan Air Hujan', points: 3 }, { code: 'WAC6', title: 'Efisiensi Penggunaan Air Lansekap', points: 2 },
  ] },
  { code: 'MRC', title: 'Sumber dan Siklus Material', english: 'Material Resources and Cycle', points: 14, prerequisites: ['MRC-P'], criteria: [
    { code: 'MRC1', title: 'Penggunaan Gedung dan Material Bekas', points: 2 }, { code: 'MRC2', title: 'Material Ramah Lingkungan', points: 3 },
    { code: 'MRC3', title: 'Penggunaan Refrigeran tanpa ODP', points: 2 }, { code: 'MRC4', title: 'Kayu Bersertifikat', points: 2 },
    { code: 'MRC5', title: 'Material Prafabrikasi', points: 3 }, { code: 'MRC6', title: 'Material Regional', points: 2 },
  ] },
  { code: 'IHC', title: 'Kesehatan dan Kenyamanan dalam Ruang', english: 'Indoor Health and Comfort', points: 10, prerequisites: ['IHC-P'], criteria: [
    { code: 'IHC1', title: 'Pemantauan Kadar CO₂', points: 1 }, { code: 'IHC2', title: 'Kendali Asap Rokok di Lingkungan', points: 2 },
    { code: 'IHC3', title: 'Polutan Kimia', points: 3 }, { code: 'IHC4', title: 'Pemandangan ke Luar Gedung', points: 1 },
    { code: 'IHC5', title: 'Kenyamanan Visual', points: 1 }, { code: 'IHC6', title: 'Kenyamanan Termal', points: 1 },
    { code: 'IHC7', title: 'Tingkat Kebisingan', points: 1 },
  ] },
  { code: 'BEM', title: 'Manajemen Lingkungan Bangunan', english: 'Building Environment Management', points: 13, prerequisites: ['BEM-P'], criteria: [
    { code: 'BEM1', title: 'GP sebagai Anggota Tim Proyek', points: 1 }, { code: 'BEM2', title: 'Polusi dari Aktivitas Konstruksi', points: 2 },
    { code: 'BEM3', title: 'Pengelolaan Sampah Tingkat Lanjut', points: 2 }, { code: 'BEM4', title: 'Sistem Komisioning yang Baik dan Benar', points: 3 },
    { code: 'BEM5', title: 'Penyerahan Data Green Building', points: 2 }, { code: 'BEM6', title: 'Kesepakatan Aktivitas Fit Out', points: 1 },
    { code: 'BEM7', title: 'Survei Pengguna Gedung', points: 2 },
  ] },
]

const ratingPrerequisites = [
  { code: 'ASD-P', category: 'ASD', title: 'Area Dasar Hijau' },
  { code: 'EEC-P1', category: 'EEC', title: 'Pemasangan Sub-meter' },
  { code: 'EEC-P2', category: 'EEC', title: 'Perhitungan OTTV' },
  { code: 'WAC-P1', category: 'WAC', title: 'Meteran Air' },
  { code: 'WAC-P2', category: 'WAC', title: 'Perhitungan Penggunaan Air' },
  { code: 'MRC-P', category: 'MRC', title: 'Refrigeran Fundamental' },
  { code: 'IHC-P', category: 'IHC', title: 'Introduksi Udara Luar' },
  { code: 'BEM-P', category: 'BEM', title: 'Dasar Pengelolaan Sampah' },
]

const projectEligibility = [
  { code: 'data', title: 'Kesediaan data gedung untuk diakses GBC Indonesia' },
  { code: 'land-use', title: 'Fungsi gedung sesuai peruntukan lahan berdasarkan RTRW setempat' },
  { code: 'environmental', title: 'Memiliki AMDAL dan/atau rencana UKL/UPL' },
  { code: 'fire-safety', title: 'Sesuai standar keselamatan kebakaran' },
  { code: 'earthquake', title: 'Sesuai standar ketahanan gempa' },
  { code: 'accessibility', title: 'Sesuai standar aksesibilitas difabel' },
]

function RatingToolsPage() {
  const [selectedCategory, setSelectedCategory] = useState('ASD')
  const [area, setArea] = useState('')
  const [eligibility, setEligibility] = useState<Record<string, CheckStatus>>({})
  const [prerequisites, setPrerequisites] = useState<Record<string, CheckStatus>>({})
  const [scores, setScores] = useState<Record<string, number | null>>({})
  const category = ratingCategories.find(item => item.code === selectedCategory) ?? ratingCategories[0]
  const earnedCredits = ratingCategories.reduce((sum, item) => sum + item.criteria.filter(criterion => !criterion.bonus).reduce((points, criterion) => points + (scores[criterion.code] ?? 0), 0), 0)
  const earnedBonus = ratingCategories.reduce((sum, item) => sum + item.criteria.filter(criterion => criterion.bonus).reduce((points, criterion) => points + (scores[criterion.code] ?? 0), 0), 0)
  const assessedCriteria = ratingCategories.reduce((sum, item) => sum + item.criteria.filter(criterion => !criterion.bonus && scores[criterion.code] !== undefined && scores[criterion.code] !== null).length, 0)
  const metPrerequisites = ratingPrerequisites.filter(item => prerequisites[item.code] === 'met').length
  const prerequisitesReady = metPrerequisites === ratingPrerequisites.length
  const areaEligible = Number(area) >= 2500
  const metEligibility = projectEligibility.filter(item => eligibility[item.code] === 'met').length
  const eligibilityReady = areaEligible && metEligibility === projectEligibility.length
  const percentage = Math.round((earnedCredits / 101) * 100)

  function setStatus(setter: (update: (current: Record<string, CheckStatus>) => Record<string, CheckStatus>) => void, code: string, value: CheckStatus) {
    setter(current => ({ ...current, [code]: value }))
  }

  function updateScore(code: string, max: number, value: string) {
    const parsed = value === '' ? null : Math.max(0, Math.min(max, Math.floor(Number(value))))
    setScores(current => ({ ...current, [code]: parsed }))
  }

  return <>
    <div className="page-heading module-heading rating-heading"><div><div className="overline"><span className="live-pulse" /> RATING TOOLS · GBCI NB V1.2</div><h1>Analisis GREENSHIP New Building<span className="heading-period">.</span></h1><p>Input status prasyarat dan poin tolok ukur untuk membuat simulasi internal Final Assessment.</p></div><a className="button button-learning" href="https://gbcindonesia.org/files/resource/9b552832-b500-4b73-8c0e-acfaa1434731/Summary%20GREENSHIP%20New%20Building%20V1.2.pdf" target="_blank" rel="noreferrer"><FileText size={14} /> Dokumen acuan <ExternalLink size={13} /></a></div>
    <div className="module-disclaimer rating-disclaimer"><ShieldCheck size={16} /><span>Alat bantu analisis internal berdasarkan Ringkasan Kriteria GREENSHIP NB V1.2 (GBC Indonesia, April 2013). Bukan alat penilaian resmi, tidak menentukan tingkat Bronze/Silver/Gold/Platinum, dan bukan sertifikasi. Konfirmasi versi serta persyaratan terkini kepada GBCI.</span></div>

    <section className="rating-summary" aria-label="Ringkasan simulasi internal">
      <article className="rating-total"><span>POIN KREDIT INTERNAL</span><strong>{prerequisitesReady ? earnedCredits : '—'}<small> / 101</small></strong><div className="rating-meter"><span style={{ width: prerequisitesReady ? `${Math.min(percentage, 100)}%` : '0%' }} /></div><small>{prerequisitesReady ? `${percentage}% dari maksimum Final Assessment, belum termasuk bonus` : 'Tandai semua 8 prasyarat terpenuhi untuk membuka penilaian poin'}</small></article>
      <article><span>POIN BONUS</span><strong>{prerequisitesReady ? earnedBonus : '—'}<small> / 5</small></strong><small>Energi terbarukan dalam tapak</small></article>
      <article><span>KRITERIA DIINPUT</span><strong>{assessedCriteria}<small> / 37</small></strong><small>Kredit dan bonus; prasyarat terpisah</small></article>
      <article><span>PRASYARAT TERPENUHI</span><strong>{metPrerequisites}<small> / 8</small></strong><small>{prerequisitesReady ? 'Semua prasyarat ditandai terpenuhi' : 'Skor belum memenuhi gerbang prasyarat'}</small></article>
    </section>

    <section className="rating-eligibility panel">
      <div className="rating-section-heading"><div><span className="panel-kicker">GERBANG AWAL</span><h2>Kelayakan proyek</h2></div><span className={`rating-gate ${eligibilityReady ? 'gate-met' : 'gate-pending'}`}>{eligibilityReady ? 'Seluruh butir ditandai sesuai' : 'Perlu verifikasi'}</span></div>
      <div className="rating-eligibility-area"><label htmlFor="rating-area">Luas gedung</label><div><input id="rating-area" type="number" min="0" value={area} onChange={event => setArea(event.target.value)} placeholder="Contoh: 5200" /><span>m²</span></div><small>Minimum kelayakan pada ringkasan GBCI: 2.500 m²</small></div>
      <div className="rating-check-grid">{projectEligibility.map(item => <label className="rating-check-row" key={item.code}><span>{item.title}</span><select value={eligibility[item.code] ?? 'pending'} onChange={event => setStatus(setEligibility, item.code, event.target.value as CheckStatus)} aria-label={`Status kelayakan: ${item.title}`}><option value="pending">Belum dinilai</option><option value="met">Sesuai</option><option value="not-met">Belum sesuai</option></select></label>)}</div>
    </section>

    <section className="rating-prerequisites panel">
      <div className="rating-section-heading"><div><span className="panel-kicker">8 KRITERIA WAJIB</span><h2>Prasyarat GREENSHIP</h2></div><span className={`rating-gate ${prerequisitesReady ? 'gate-met' : 'gate-pending'}`}>{prerequisitesReady ? 'Siap untuk simulasi poin' : `${ratingPrerequisites.length - metPrerequisites} belum terpenuhi`}</span></div>
      <p className="rating-help">Ringkasan GBCI menyatakan seluruh prasyarat harus dipenuhi sebelum kredit dan bonus dapat dinilai. Status di bawah ini merupakan input internal proyek.</p>
      <div className="rating-check-grid">{ratingPrerequisites.map(item => <label className="rating-check-row" key={item.code}><span><b>{item.code}</b>{item.title}</span><select value={prerequisites[item.code] ?? 'pending'} onChange={event => setStatus(setPrerequisites, item.code, event.target.value as CheckStatus)} aria-label={`Status prasyarat: ${item.title}`}><option value="pending">Belum dinilai</option><option value="met">Terpenuhi</option><option value="not-met">Belum terpenuhi</option></select></label>)}</div>
    </section>

    <section className="rating-analysis panel">
      <div className="rating-section-heading"><div><span className="panel-kicker">FINAL ASSESSMENT · MAKSIMUM 101 POIN</span><h2>Rincian per kategori</h2></div><span className="rating-gate">DR: maksimum 77 poin</span></div>
      <div className="rating-category-list" role="tablist" aria-label="Kategori GREENSHIP">
        {ratingCategories.map(item => {
          const itemScore = item.criteria.filter(criterion => !criterion.bonus).reduce((sum, criterion) => sum + (scores[criterion.code] ?? 0), 0)
          return <button className={`rating-category-tab ${selectedCategory === item.code ? 'rating-category-active' : ''}`} key={item.code} role="tab" aria-selected={selectedCategory === item.code} onClick={() => setSelectedCategory(item.code)}><span className="rating-category-code">{item.code}</span><span className="rating-category-copy"><strong>{item.title}</strong><small>{item.english}</small></span><span className="rating-category-score">{itemScore}<i>/{item.points}</i></span></button>
        })}
      </div>
      <div className="rating-category-detail" role="tabpanel">
        <div className="rating-detail-heading"><div><span className="panel-kicker">{category.code} · {category.english.toUpperCase()}</span><h3>{category.title}</h3></div><strong>{category.points}<small> poin kredit</small></strong></div>
        <div className="rating-criteria-header"><span>KODE</span><span>KRITERIA</span><span>POIN</span></div>
        {category.criteria.map(criterion => <div className={`rating-criterion-row ${!prerequisitesReady ? 'rating-criterion-locked' : ''}`} key={criterion.code}><span className="rating-criterion-code">{criterion.code}{criterion.bonus && <i>BONUS</i>}</span><span className="rating-criterion-title">{criterion.title}</span><label className="rating-points-input"><input type="number" min="0" max={criterion.points} step="1" value={scores[criterion.code] ?? ''} placeholder="0" disabled={!prerequisitesReady} onChange={event => updateScore(criterion.code, criterion.points, event.target.value)} aria-label={`Poin internal ${criterion.code}, maksimum ${criterion.points}`} /><span>/ {criterion.points}</span></label></div>)}
        {category.code === 'EEC' && <p className="rating-bonus-note">EEC5 merupakan bonus sampai 5 poin dan dilaporkan terpisah dari maksimum 101 poin kredit.</p>}
      </div>
    </section>

    <section className="rating-source-note"><span>SUMBER</span><p>GREENSHIP untuk Bangunan Baru Versi 1.2 · Ringkasan Kriteria dan Tolok Ukur · GBC Indonesia · April 2013. Nilai yang dimasukkan pengguna belum diverifikasi oleh GBCI.</p><a href="https://gbcindonesia.org/files/resource/9b552832-b500-4b73-8c0e-acfaa1434731/Summary%20GREENSHIP%20New%20Building%20V1.2.pdf" target="_blank" rel="noreferrer">Buka PDF acuan <ExternalLink size={13} /></a></section>
  </>
}

function App() {
  const [welcomeStage, setWelcomeStage] = useState<WelcomeStage>(() => window.localStorage.getItem('agus-intro-v2-complete') === 'true' ? 'account' : 'splash')
  const [slideIndex, setSlideIndex] = useState(0)
  const [mascotIndex, setMascotIndex] = useState(0)
  const [activePage, setActivePage] = useState('Dashboard')
  const [period, setPeriod] = useState('Monthly')
  const [project, setProject] = useState('Adhi Green Building – Head Office')
  const [isDark, setIsDark] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [checks, setChecks] = useState(initialChecks)
  const [notice, setNotice] = useState('')
  const [accountName, setAccountName] = useState('Andi Prasetyo')
  const uploadRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!firebaseAuth) return
    return onAuthStateChanged(firebaseAuth, user => {
      if (user) {
        setAccountName(user.displayName || user.email?.split('@')[0] || 'Pengguna AGUS')
        setWelcomeStage('complete')
      }
    })
  }, [])

  useEffect(() => {
    if (welcomeStage === 'splash') {
      const timer = window.setTimeout(() => setWelcomeStage('mascot-sequence'), 2000)
      return () => window.clearTimeout(timer)
    }
    if (welcomeStage !== 'mascot-sequence') return
    const timer = window.setTimeout(() => {
      if (mascotIndex === mascotSequence.length - 1) setWelcomeStage('brand-poster')
      else setMascotIndex(index => index + 1)
    }, 2000)
    return () => window.clearTimeout(timer)
  }, [welcomeStage, mascotIndex])

  useEffect(() => {
    if (welcomeStage !== 'brand-poster') return
    const timer = window.setTimeout(() => setWelcomeStage('onboarding'), 3000)
    return () => window.clearTimeout(timer)
  }, [welcomeStage])

  useEffect(() => {
    let favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
    if (!favicon) {
      favicon = document.createElement('link')
      favicon.rel = 'icon'
      favicon.type = 'image/png'
      document.head.appendChild(favicon)
    }
    favicon.href = agusIcon
  }, [])

  function openAccount() {
    try {
      window.localStorage.setItem('agus-intro-v2-complete', 'true')
    } catch {
      // Continue to the account screen when browser storage is unavailable.
    }
    setWelcomeStage('account')
  }

  function completeAuthentication() {
    try {
      window.localStorage.setItem('agus-intro-v2-complete', 'true')
    } catch {
      // Authentication should continue even when browser storage is unavailable.
    }
    setWelcomeStage('complete')
  }

  function advanceSlide(targetIndex?: number) {
    if (targetIndex !== undefined) {
      setSlideIndex(targetIndex)
      return
    }
    if (slideIndex === onboardingSlides.length - 1) openAccount()
    else setSlideIndex(index => index + 1)
  }

  function previousSlide() {
    setSlideIndex(index => Math.max(0, index - 1))
  }

  function skipMascotSequence() {
    setWelcomeStage('brand-poster')
  }

  function selectPage(label: string) {
    setActivePage(label)
    setMobileNavOpen(false)
  }

  function toggleCheck(index: number) {
    setChecks(current => current.map((check, i) => i === index ? { ...check, done: !check.done } : check))
  }

  function uploadEvidence(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (file) setNotice(`Evidence added: ${file.name}`)
    event.target.value = ''
  }

  function exportReport() {
    const report = [
      ['AGUS internal sustainability snapshot', project],
      ['Reporting period', 'September 2026'],
      ['Internal assessment score', '78.6 / 100'],
      ['Energy consumed', '42.8 MWh'],
      ['Water consumed', '612 m³'],
      ['Waste diverted', '71%'],
      ['Carbon emissions', '284 tCO2e'],
      ['Disclaimer', 'Illustrative data. Not an official BGH or GBCI certification.'],
    ].map(row => row.map(value => `"${value.replace(/"/g, '""')}"`).join(',')).join('\n')
    const url = URL.createObjectURL(new Blob([report], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'agus-internal-sustainability-snapshot.csv'
    link.click()
    URL.revokeObjectURL(url)
    setNotice('CSV report exported')
  }

  const page = moduleData[activePage]

  if (welcomeStage !== 'complete') {
    return <WelcomeFlow stage={welcomeStage} slideIndex={slideIndex} mascotIndex={mascotIndex} onNext={advanceSlide} onPrevious={previousSlide} onSkip={openAccount} onSkipSequence={skipMascotSequence} onAbout={() => setWelcomeStage('about')} onAccount={openAccount} onAuthenticated={completeAuthentication} />
  }

  return (
    <div className={`app-shell ${isDark ? 'theme-dark' : 'theme-light'}`}>
      {mobileNavOpen && <button className="mobile-scrim" aria-label="Close navigation" onClick={() => setMobileNavOpen(false)} />}
      <aside className={`sidebar ${mobileNavOpen ? 'sidebar-open' : ''}`}>
        <div className="brand-lockup">
          <div className="brand-mark"><img src={agusIcon} alt="" /></div>
          <div><div className="brand-name">AGUS<span>.</span></div><div className="brand-caption">GREEN INTELLIGENCE</div></div>
          <button className="icon-button mobile-close" aria-label="Close navigation" onClick={() => setMobileNavOpen(false)}><span className="close-glyph">×</span></button>
        </div>
        <button className="org-switcher" onClick={() => setNotice('Organization switcher is a prototype control')}>
          <span className="org-monogram">A</span><span className="org-copy"><strong>Adhi Karya</strong><small>Enterprise workspace</small></span><ChevronDown size={15} />
        </button>
        <nav className="side-navigation" aria-label="Main navigation">
          {navGroups.map(group => <div className="nav-group" key={group.title}>
            <div className="nav-heading">{group.title}</div>
            {group.items.map(item => <button key={item.label} onClick={() => selectPage(item.label)} className={`nav-link ${activePage === item.label ? 'nav-link-active' : ''}`}>
              <item.icon size={17} strokeWidth={1.8} /><span>{item.label}</span>{item.label === 'Corrective actions' && <span className="nav-count">3</span>}
            </button>)}
          </div>)}
        </nav>
        <div className="sidebar-bottom">
          <div className="project-health"><div className="health-top"><span>PROJECT HEALTH</span><span className="health-dot" /></div><strong>On track</strong><div className="health-track"><span /></div><small>Updated 12 min ago</small></div>
          <button className="profile-row" onClick={() => selectPage('Settings')}><span className="profile-avatar">{accountName.split(' ').map(part => part[0]).slice(0, 2).join('').toUpperCase()}</span><span className="profile-copy"><strong>{accountName}</strong><small>Sustainability manager</small></span><Ellipsis size={17} /></button>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <button className="icon-button mobile-menu" aria-label="Open navigation" onClick={() => setMobileNavOpen(true)}><Menu size={20} /></button>
          <div className="crumb"><span>Workspace</span><span className="crumb-slash">/</span><strong>{activePage}</strong></div>
          <div className="topbar-actions">
            <div className="search-box"><Search size={16} /><input aria-label="Search" placeholder="Search anything..." /><kbd>⌘ K</kbd></div>
            <button className="icon-button theme-button" aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'} onClick={() => setIsDark(value => !value)}>{isDark ? <Sun size={18} /> : <Moon size={18} />}</button>
            <button className="icon-button notification-button" aria-label="Notifications" onClick={() => setNotice('You are all caught up')}><Bell size={18} /><i /></button>
            <div className="top-avatar">AP</div>
          </div>
        </header>

        <div className="page-content">
          {activePage === 'Dashboard' ? <>
            <div className="page-heading dashboard-heading">
              <div><div className="overline"><span className="live-pulse" /> PROJECT OVERVIEW <span className="heading-divider">/</span> SEPTEMBER 2026</div><h1>Selamat datang, {accountName.split(' ')[0]}<span className="heading-period">.</span></h1><p>Ringkasan keberlanjutan untuk proyek Anda.</p></div>
              <div className="heading-actions">
                <label className="select-wrap project-select"><Building2 size={15} /><select value={project} onChange={event => setProject(event.target.value)} aria-label="Select project"><option>Adhi Green Building – Head Office</option><option>Cibubur Transit Village</option><option>Surabaya Office Park</option></select><ChevronDown size={14} /></label>
                <button className="button button-learning" onClick={() => selectPage('Sesi Pembelajaran')}><BookOpen size={15} /> Sesi pembelajaran</button>
                <button className="button button-primary" onClick={() => selectPage('Inspection')}><Plus size={16} /> New inspection</button>
              </div>
            </div>

            <section className="summary-strip" aria-label="Project sustainability indicators">
              <Metric icon={Zap} label="ENERGY THIS MONTH" value="42.8" unit="MWh" delta="12.4%" positive />
              <Metric icon={Droplets} label="WATER CONSUMED" value="612" unit="m³" delta="8.2%" positive />
              <Metric icon={Recycle} label="WASTE DIVERTED" value="71" unit="%" delta="5.6%" positive />
              <Metric icon={Cloud} label="CARBON TO DATE" value="284" unit="tCO₂e" delta="9.6%" positive />
            </section>

            <section className="dashboard-grid dashboard-top-grid">
              <article className="panel score-panel">
                <div className="panel-heading"><div><span className="panel-kicker">PROJECT PERFORMANCE</span><h2>Green score</h2></div><button className="icon-button subtle-icon" aria-label="Score details" onClick={() => selectPage('Assessment')}><Ellipsis size={19} /></button></div>
                <div className="score-content">
                  <div className="score-ring"><div className="score-ring-center"><span className="score-value">78<span>.6</span></span><span className="score-outof">OUT OF 100</span></div></div>
                  <div className="score-copy"><span className="internal-tag"><span /> INTERNAL ASSESSMENT</span><h3>Good progress,<br />room to improve.</h3><p>+4.2 points since last month</p><button className="text-link" onClick={() => selectPage('Assessment')}>View assessment <ArrowUpRight size={14} /></button></div>
                </div>
                <div className="score-footnote"><ShieldCheck size={14} /><span>AGUS internal score · not an official certification</span></div>
              </article>

              <article className="panel energy-panel">
                <div className="panel-heading energy-heading"><div><span className="panel-kicker">RESOURCE PERFORMANCE</span><h2>Energy consumption</h2></div><label className="select-wrap period-select"><select value={period} onChange={event => setPeriod(event.target.value)} aria-label="Select chart period"><option>Monthly</option><option>Weekly</option><option>Daily</option></select><ChevronDown size={14} /></label></div>
                <div className="chart-summary"><strong>42.8 <small>MWh</small></strong><span className="delta-label"><ArrowDownRight size={14} /> 12.4% <em>vs baseline</em></span></div>
                <div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><AreaChart data={energyData} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
                  <defs><linearGradient id="actualFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#a7db58" stopOpacity={0.2} /><stop offset="96%" stopColor="#a7db58" stopOpacity={0} /></linearGradient></defs>
                  <CartesianGrid stroke="var(--chart-grid)" vertical={false} strokeDasharray="3 5" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted)', fontSize: 10 }} dy={8} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--muted)', fontSize: 10 }} tickFormatter={value => `${value}`} />
                  <Tooltip contentStyle={{ background: 'var(--tooltip)', border: '1px solid var(--border)', borderRadius: 7, color: 'var(--text)', fontSize: 12 }} />
                  <Area type="monotone" dataKey="baseline" stroke="#697771" strokeWidth={1.5} strokeDasharray="4 5" fill="none" name="Baseline (kWh)" />
                  <Area type="monotone" dataKey="actual" stroke="#b5e56c" strokeWidth={2.5} fill="url(#actualFill)" name="Actual (kWh)" activeDot={{ r: 4, fill: '#b5e56c', stroke: 'var(--panel)' }} />
                </AreaChart></ResponsiveContainer></div>
                <div className="chart-legend"><span><i className="legend-dot actual-dot" /> Actual</span><span><i className="legend-line" /> Baseline</span><button onClick={() => selectPage('Energy')}>Full report <ArrowUpRight size={13} /></button></div>
              </article>
            </section>

            <section className="dashboard-grid dashboard-bottom-grid">
              <article className="panel category-panel">
                <div className="panel-heading"><div><span className="panel-kicker">ASSESSMENT FRAMEWORK</span><h2>Category progress</h2></div><button className="text-link compact-link" onClick={() => selectPage('Assessment')}>All categories <ArrowUpRight size={13} /></button></div>
                <div className="category-list">
                  <Category name="Site & accessibility" value={85} tint="mint" />
                  <Category name="Energy efficiency" value={72} tint="lime" />
                  <Category name="Water conservation" value={88} tint="blue" />
                  <Category name="Materials & resources" value={76} tint="orange" />
                  <Category name="Indoor health & comfort" value={81} tint="mint" />
                </div>
                <div className="category-note"><span className="note-mark">i</span> Framework-specific weights and thresholds apply.</div>
              </article>

              <article className="panel activity-panel">
                <div className="panel-heading"><div><span className="panel-kicker">ON THE GROUND</span><h2>Recent activity</h2></div><button className="icon-button subtle-icon" aria-label="More activity options" onClick={() => selectPage('Inspection')}><Ellipsis size={19} /></button></div>
                <div className="activity-list">{activityRows.map(row => <div className="activity-row" key={row.name}>
                  <div className={`activity-avatar avatar-${row.tone}`}>{row.initials}</div><div className="activity-copy"><p><strong>{row.name}</strong> {row.action}</p><span>{row.detail}</span></div><time>{row.time}</time>
                </div>)}</div>
                <button className="activity-footer" onClick={() => selectPage('Inspection')}>View all activity <ArrowUpRight size={13} /></button>
              </article>

              <article className="panel site-panel">
                <div className="panel-heading"><div><span className="panel-kicker">SITE OPERATIONS</span><h2>Weekly green checks</h2></div><span className="completion-pill">{checks.filter(check => check.done).length}/{checks.length} DONE</span></div>
                <div className="checklist">{checks.map((check, index) => <button className={`check-row ${check.done ? 'is-checked' : ''}`} key={check.label} onClick={() => toggleCheck(index)}><span className="check-box">{check.done && <Check size={12} strokeWidth={3} />}</span><span>{check.label}</span></button>)}</div>
                <button className="activity-footer" onClick={() => selectPage('Green construction')}>Open site checklist <ArrowUpRight size={13} /></button>
              </article>

              <article className="panel action-panel">
                <div className="panel-heading"><div><span className="panel-kicker">NEEDS ATTENTION</span><h2>Open actions</h2></div><span className="action-count">03</span></div>
                <div className="action-item"><span className="priority-mark priority-high" /><div><strong>Install east boundary noise barrier</strong><span><Clock3 size={12} /> Due 02 Oct <i>·</i> Site management</span></div></div>
                <div className="action-item"><span className="priority-mark priority-medium" /><div><strong>Verify low-VOC product submittal</strong><span><Clock3 size={12} /> Due 04 Oct <i>·</i> Materials</span></div></div>
                <div className="action-item"><span className="priority-mark priority-low" /><div><strong>Update rainwater tank measurement</strong><span><Clock3 size={12} /> Due 06 Oct <i>·</i> Water</span></div></div>
                <button className="activity-footer" onClick={() => selectPage('Corrective actions')}>Manage actions <ArrowUpRight size={13} /></button>
              </article>
            </section>

            <div className="compliance-banner"><ShieldCheck size={16} /><p><strong>Assessment disclaimer</strong> · AGUS supports assessment and improvement. Scores are internal and do not represent official BGH or GBCI certification. Always verify requirements against current official documents.</p><button aria-label="Dismiss disclaimer" onClick={event => event.currentTarget.parentElement?.remove()}>×</button></div>
            <div className="dashboard-quick-actions"><span>QUICK ACCESS</span><button onClick={() => uploadRef.current?.click()}><Upload size={14} /> Add evidence</button><button onClick={() => selectPage('Reports')}><Download size={14} /> Export report</button><button onClick={() => selectPage('Inspection')}><Camera size={14} /> Log inspection</button></div>
          </> : activePage === 'Sesi Pembelajaran' ? <LearningPage /> : activePage === 'Rating Tools' ? <RatingToolsPage /> : activePage === 'Tentang aplikasi' ? <AboutInformation onSettings={() => selectPage('Settings')} /> : <ModulePage pageName={activePage} page={page} onUpload={() => uploadRef.current?.click()} onExport={exportReport} onNavigate={selectPage} />}
          <input ref={uploadRef} className="visually-hidden" type="file" accept="image/*,.pdf,.xlsx,.xls,.csv,.doc,.docx" onChange={uploadEvidence} />
          {notice && <div role="status" className="toast"><CircleCheck size={16} />{notice}<button aria-label="Dismiss notification" onClick={() => setNotice('')}>×</button></div>}
          <footer className="page-footer"><span>AGUS <b>·</b> Adhi Green Useful Sustainability</span><span>Illustrative demo data <b>·</b> Updated 30 Sep 2026</span></footer>
        </div>
      </main>
    </div>
  )
}

function Metric({ icon: Icon, label, value, unit, delta, positive }: { icon: LucideIcon; label: string; value: string; unit: string; delta: string; positive: boolean }) {
  return <article className="metric-item"><div className="metric-icon"><Icon size={16} strokeWidth={1.8} /></div><div className="metric-main"><span className="metric-label">{label}</span><div className="metric-value">{value}<small>{unit}</small></div></div><span className={`metric-delta ${positive ? 'delta-positive' : ''}`}><ArrowDownRight size={13} />{delta}</span></article>
}

function Category({ name, value, tint }: { name: string; value: number; tint: string }) {
  return <div className="category-row"><div className="category-title"><span className={`category-bullet bullet-${tint}`} /><span>{name}</span><strong>{value}%</strong></div><div className="category-track"><span className={`track-${tint}`} style={{ width: `${value}%` }} /></div></div>
}

const learningModules = [
  { title: 'Dasar Green Building', duration: '8 menit', summary: 'Kenali prinsip bangunan hijau dan kaitannya dengan siklus hidup bangunan.', points: ['Kinerja lingkungan sepanjang siklus hidup', 'Peran tim desain, konstruksi, dan operasi', 'Bedakan praktik baik, regulasi, dan sistem rating'] },
  { title: 'Mengenal GREENSHIP', duration: '12 menit', summary: 'Pahami fungsi sistem rating GREENSHIP dan kategori penilaian secara umum.', points: ['Rating tool bergantung pada tipe proyek dan versi', 'Kategori dan kriteria perlu dibaca dari dokumen resmi', 'Assessment AGUS bukan keputusan sertifikasi GBCI'] },
  { title: 'Green Construction di Lapangan', duration: '10 menit', summary: 'Terapkan pengendalian dampak lingkungan selama pekerjaan konstruksi.', points: ['Kendalikan debu, kebisingan, dan limpasan air', 'Pisahkan serta catat aliran limbah konstruksi', 'Simpan foto, hasil ukur, dan catatan inspeksi sebagai bukti'] },
  { title: 'Energi, Air, dan Material', duration: '11 menit', summary: 'Hubungkan pencatatan sumber daya proyek dengan peluang perbaikan yang terukur.', points: ['Tetapkan baseline dan satuan pengukuran yang konsisten', 'Catat sumber energi dan air secara terpisah', 'Gunakan data produk dan dokumen pendukung material'] },
  { title: 'Kebijakan Bangunan Hijau Jakarta', duration: '8 menit', summary: 'Pelajari bagaimana kebijakan Jakarta mengaitkan efisiensi energi, air, dan material dengan upaya mengurangi emisi dan dampak lingkungan bangunan.', points: ['Lihat bangunan sebagai bagian dari solusi perubahan iklim perkotaan', 'Hubungkan efisiensi sumber daya dengan desain dan pengelolaan bangunan', 'Periksa regulasi serta panduan terbaru yang berlaku untuk jenis bangunan dan wilayah proyek'] },
  { title: 'Bangunan Hijau di Indonesia', duration: '9 menit', summary: 'Pahami perkembangan konsep bangunan hijau di Indonesia dan bagaimana efisiensi sumber daya diterapkan sepanjang siklus hidup bangunan.', points: ['Tinjau enam aspek: tapak, energi, air, material, kesehatan dan kenyamanan ruang, serta manajemen lingkungan bangunan', 'Kenali peran kebijakan pemerintah dan sistem penilaian dalam mendorong penerapan', 'Gunakan artikel ini sebagai pengantar; verifikasi regulasi dan kriteria terkini pada dokumen resmi'] },
]

const gbciTrainings = [
  { title: 'Greenship Associate Training · Batch X', date: '02–08 Oktober 2026', href: 'https://gbcindonesia.org/training/cb139b5728a042378a5235f4c4994e2eY2NXuaOuVbQ' },
  { title: 'Workshop Smart Green Building', date: '10 Oktober 2026', href: 'https://gbcindonesia.org/training/626423d26aec47d39fb43cfb3bb76062FnNu6tWfiqF' },
  { title: 'EDGE EXPERT Training', date: '20 Oktober 2026', href: 'https://gbcindonesia.org/training/055c3bd53c4042ba8c99410ff96e98b6Knimbvpg9Tr' },
  { title: 'Greenship Associate Training · Batch XI', date: '06–12 November 2026', href: 'https://gbcindonesia.org/training/a3467df26a6c4ca6894ca406bc306a49lr31V5ZbzfV' },
]

function LearningPage() {
  const [selectedModule, setSelectedModule] = useState(0)
  const [completedModules, setCompletedModules] = useState<number[]>([])
  const selected = learningModules[selectedModule]
  const progress = Math.round((completedModules.length / learningModules.length) * 100)

  function toggleCompleted() {
    setCompletedModules(current => current.includes(selectedModule)
      ? current.filter(index => index !== selectedModule)
      : [...current, selectedModule])
  }

  return <>
    <div className="page-heading module-heading learning-heading"><div><div className="overline"><span className="live-pulse" /> AGUS LEARNING · GREEN BUILDING</div><h1>Sesi pembelajaran<span className="heading-period">.</span></h1><p>Bangun pemahaman praktis tentang Green Building dan Green Construction.</p></div>
      <div className="learning-progress"><span>JALUR DASAR AGUS</span><strong>{completedModules.length} / {learningModules.length} sesi</strong><div className="category-track"><span className="track-lime" style={{ width: `${progress}%` }} /></div></div>
    </div>
    <section className="learning-layout">
      <article className="panel learning-course-panel">
        <div className="panel-heading"><div><span className="panel-kicker">MULAI BELAJAR</span><h2>Green Building essentials</h2></div><span className="learning-course-mark"><GraduationCap size={18} /></span></div>
        <div className="learning-module-list">{learningModules.map((module, index) => <button key={module.title} className={`learning-module ${selectedModule === index ? 'learning-module-active' : ''}`} onClick={() => setSelectedModule(index)}><span className={`learning-index ${completedModules.includes(index) ? 'learning-index-done' : ''}`}>{completedModules.includes(index) ? <Check size={13} /> : `0${index + 1}`}</span><span className="learning-module-copy"><strong>{module.title}</strong><small>{module.duration} · AGUS internal learning</small></span><ArrowUpRight size={14} /></button>)}</div>
        <div className="learning-course-footer"><span><BookOpen size={14} /> 6 sesi · sekitar 58 menit</span><span>Materi pengantar AGUS</span></div>
      </article>
      <article className="panel learning-detail-panel">
        <div className="learning-detail-top"><span className="panel-kicker">SESI 0{selectedModule + 1} · {selected.duration.toUpperCase()}</span><span className="learning-tag">PENGANTAR</span></div>
        <h2>{selected.title}</h2><p>{selected.summary}</p>
        <div className="learning-points">{selected.points.map(point => <div key={point}><CircleCheck size={15} /><span>{point}</span></div>)}</div>
        <button className={`button ${completedModules.includes(selectedModule) ? 'button-learning-complete' : 'button-primary'}`} onClick={toggleCompleted}>{completedModules.includes(selectedModule) ? <><Check size={15} /> Sesi selesai · batalkan</> : <><Check size={15} /> Tandai sesi selesai</>}</button>
        <div className="learning-note"><ShieldCheck size={15} /><span>Materi ini adalah pengantar internal. Gunakan regulasi dan panduan resmi terbaru sebagai acuan; AGUS tidak menerbitkan sertifikasi.</span></div>
      </article>
    </section>
    <section className="panel gbci-section">
      <div className="policy-reference green-network-reference"><div className="policy-reference-copy"><span className="panel-kicker">BAHAN BACAAN · GREEN NETWORK ASIA</span><h2>Mengenal Bangunan Hijau dan Perkembangannya di Indonesia</h2><p>Ikhtisar ini menjelaskan konsep bangunan hijau sepanjang siklus hidup, enam aspek yang umum digunakan sebagai tolok ukur, serta perkembangan regulasi dan penerapannya di Indonesia.</p><small>Abul Muamar · 4 Desember 2023 · Artikel pengantar, bukan pengganti regulasi atau dokumen penilaian resmi.</small></div><a className="button button-network" href="https://greennetwork.id/ikhtisar/mengenal-bangunan-hijau-dan-bagaimana-perkembangannya-di-indonesia/" target="_blank" rel="noreferrer">Baca artikel <ExternalLink size={14} /></a></div>
      <div className="policy-reference"><div className="policy-reference-copy"><span className="panel-kicker">REFERENSI KEBIJAKAN</span><h2>Kebijakan Bangunan Hijau Jakarta</h2><p>Pemprov DKI Jakarta menjelaskan peran efisiensi energi, air, dan material dalam mengurangi emisi serta dampak lingkungan bangunan. Tinjau bagian regulasi dan panduan penerapan di sumber resminya.</p><small>Sumber: Pemerintah Provinsi DKI Jakarta · diakses sebagai bahan belajar, bukan penetapan persyaratan proyek.</small></div><a className="button button-policy" href="https://www.jakarta.go.id/kebijakan-bangunan-hijau" target="_blank" rel="noreferrer">Buka kebijakan Jakarta <ExternalLink size={14} /></a></div>
      <div className="gbci-section-heading"><div><span className="panel-kicker">RUJUKAN EKSTERNAL</span><h2>Belajar lebih lanjut bersama GBCI</h2><p>Green Building Council Indonesia memiliki program Training and Education serta sumber resmi GREENSHIP.</p></div><a className="button button-learning" href="https://gbcindonesia.org/resource" target="_blank" rel="noreferrer">Sumber GBCI <ExternalLink size={14} /></a></div>
      <div className="gbci-training-heading"><CalendarDays size={15} /><span>Jadwal pelatihan GBCI yang tercantum di situs resmi</span></div>
      <div className="gbci-training-list">{gbciTrainings.map(training => <a className="gbci-training" href={training.href} target="_blank" rel="noreferrer" key={training.title}><span><strong>{training.title}</strong><small>{training.date}</small></span><ExternalLink size={14} /></a>)}</div>
      <div className="gbci-footnote"><ShieldCheck size={14} /> Jadwal, ketersediaan, dan persyaratan dapat berubah. Konfirmasi detail terbaru langsung pada GBCI. Referensi GBCI tidak berarti AGUS menerbitkan atau menjamin sertifikasi.</div>
    </section>
  </>
}

function ModulePage({ pageName, page, onUpload, onExport, onNavigate }: { pageName: string; page?: { eyebrow: string; title: string; description: string; stats: string[]; rows: string[] }; onUpload: () => void; onExport: () => void; onNavigate: (page: string) => void }) {
  const [activeTab, setActiveTab] = useState('Overview')
  const [filter, setFilter] = useState('All status')
  if (!page) return null
  const isChecklist = pageName === 'Green construction'
  const isReadinessCaveat = ['Assessment', 'Standards', 'Reports'].includes(pageName)
  return <>
    <div className="page-heading module-heading"><div><div className="overline"><span className="live-pulse" /> {page.eyebrow}</div><h1>{page.title}<span className="heading-period">.</span></h1><p>{page.description}</p></div>
      <div className="heading-actions">{pageName === 'Reports' ? <button className="button button-primary" onClick={onExport}><Download size={15} /> Export CSV</button> : <button className="button button-primary" onClick={() => isChecklist ? onNavigate('Inspection') : onUpload()}><Plus size={16} /> {isChecklist ? 'New inspection' : pageName === 'Evidence' ? 'Add evidence' : 'Add record'}</button>}</div>
    </div>
    {isReadinessCaveat && <div className="module-disclaimer"><ShieldCheck size={16} /><span>Framework references and readiness indicators are for internal use. Verify current requirements with official sources; AGUS does not issue certifications.</span></div>}
    {pageName === 'Settings' && <section className="settings-about-link"><div><span className="panel-kicker">INFORMASI</span><h2>Tentang AGUS</h2><p>Lihat deskripsi aplikasi, tujuan, manfaat, dan informasi pengembang.</p></div><button className="button button-primary" onClick={() => onNavigate('Tentang aplikasi')}><Info size={15} /> Tentang aplikasi <ArrowRight size={14} /></button></section>}
    <div className="module-stat-grid">{page.stats.map((stat, index) => <div className="module-stat" key={stat}><span className="module-stat-index">0{index + 1}</span><strong>{stat}</strong><span>{index === 0 ? 'CURRENT PROJECT' : index === 1 ? 'DEMO DATA' : 'LAST UPDATED TODAY'}</span></div>)}</div>
    <section className="module-workspace panel">
      <div className="module-toolbar"><div className="tab-list">{['Overview', 'Records', 'Activity'].map(tab => <button key={tab} className={activeTab === tab ? 'tab-active' : ''} onClick={() => setActiveTab(tab)}>{tab}</button>)}</div><div className="toolbar-controls"><label className="select-wrap filter-select"><SlidersHorizontal size={14} /><select value={filter} onChange={event => setFilter(event.target.value)} aria-label="Filter records"><option>All status</option><option>Needs attention</option><option>Verified</option></select><ChevronDown size={13} /></label><button className="icon-button subtle-icon" aria-label="Calendar view"><CalendarDays size={17} /></button></div></div>
      <div className="module-table-head"><span>{activeTab === 'Activity' ? 'RECENT ACTIVITY' : pageName === 'Green construction' ? 'FIELD CHECK' : 'RECORD / INDICATOR'}</span><span>PROJECT AREA</span><span>STATUS</span><span>UPDATED</span></div>
      <div className="module-records">{page.rows.map((row, index) => <div className="module-record" key={row}><div className="record-name"><span className={`record-icon record-${index % 4}`}>{isChecklist ? <ClipboardCheck size={16} /> : <FileText size={16} />}</span><div><strong>{row}</strong><small>{isChecklist ? 'Assigned to site team · Evidence required' : `${pageName} · ${projectLabel(pageName, index)}`}</small></div></div><span className="record-area">{['Tower A · L04', 'Project-wide', 'North zone', 'Site office'][index % 4]}</span><span className={`record-status status-${index === 1 ? 'review' : index === 2 ? 'attention' : 'verified'}`}><i />{index === 1 ? 'In review' : index === 2 ? 'In progress' : 'On track'}</span><span className="record-updated">{index === 0 ? 'Today, 09:42' : index === 1 ? 'Yesterday' : '28 Sep 2026'}</span></div>)}</div>
      <div className="module-table-footer"><span>Showing {page.rows.length} of {page.rows.length} demo records</span><div><button disabled>Previous</button><button className="page-number">1</button><button disabled>Next</button></div></div>
    </section>
    {isChecklist && <section className="module-extra panel"><div><span className="panel-kicker">FIELD CAPTURE</span><h2>Ready for the next walkthrough?</h2><p>Start a site inspection to collect timestamped findings, photos, and assigned actions.</p></div><button className="button button-primary" onClick={() => onNavigate('Inspection')}><Camera size={15} /> Start inspection</button></section>}
    {pageName === 'BIM + digital twin' && <div className="twin-placeholder"><div className="twin-grid-lines" /><div className="twin-building"><div /><div /><div /><div /><div /><div /><div /><div /><div /><div /><div /><div /></div><div className="twin-caption"><span className="live-pulse" /> MODEL VIEWER PLACEHOLDER <span>·</span> Connect an IFC-compatible viewer to explore building performance.</div></div>}
    {pageName === 'AGUS AI' && <div className="assistant-composer panel"><Sparkles size={19} /><input placeholder="Ask about a criterion, evidence, or project trend..." aria-label="Ask AGUS AI" /><button className="button button-primary" onClick={() => window.alert('AI responses are not connected in this prototype.')}>Ask AGUS <ArrowUpRight size={14} /></button></div>}
    <div className="module-shortcuts"><span>RELATED WORKFLOWS</span><button onClick={() => onNavigate('Assessment')}>Assessment <ArrowUpRight size={13} /></button><button onClick={() => onNavigate('Evidence')}>Evidence library <ArrowUpRight size={13} /></button><button onClick={() => onNavigate('Corrective actions')}>Corrective actions <ArrowUpRight size={13} /></button></div>
  </>
}

function projectLabel(pageName: string, index: number) {
  if (pageName === 'Energy') return ['42.8 MWh', '34.8 MWh', '8.0 MWh'][index % 3]
  if (pageName === 'Water') return ['612 m³', '466 m³', '106 m³'][index % 3]
  if (pageName === 'Waste') return ['18.2 tonnes', '6.4 tonnes', '3.8 tonnes'][index % 3]
  return ['Internal tracking', 'Evidence review', 'Project record'][index % 3]
}

export default App