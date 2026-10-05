import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, updateProfile } from 'firebase/auth'
import {
  Activity, ArrowDownRight, ArrowLeft, ArrowRight, ArrowUpRight, Ban, Bell, BookOpen, Box, Boxes, Building2, Cpu,
  CalendarDays, Camera, Check, ChevronDown, CircleCheck, Clock3, Cloud,
  Construction, Download, Droplets, Ellipsis, ExternalLink, FileText, FolderOpen,
  Gauge, GraduationCap,
  LayoutDashboard, Leaf, Menu, Moon, Plus, Radio, Recycle, Search,
  RefreshCw, Settings, ShieldCheck, SlidersHorizontal, Sparkles, Sun, Trash2, Upload, Users, Zap,
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
import { firebaseAuth, firebaseFunctions, googleProvider } from './firebase'
import { httpsCallable } from 'firebase/functions'
import { agusRoles, getAgusRoleLabel } from './auth/roles'

const PilotBuildingScene = lazy(() => import('./components/PilotBuildingScene').then(module => ({ default: module.PilotBuildingScene })))

const mascotSequence = [agusMascot, mascotOne, mascotTwo, mascotThree]
const onboardingMascots = [mascotOne, mascotTwo, mascotThree]

type NavItem = { label: string; icon: LucideIcon }

const navGroups: { title: string; items: NavItem[] }[] = [
  { title: 'WORKSPACE', items: [
    { label: 'Dashboard', icon: LayoutDashboard },
    { label: 'Projects', icon: Building2 },
    { label: 'Assessment', icon: ClipboardCheck },
    { label: 'Rating Tools', icon: Gauge },
    { label: 'Green Building', icon: Building2 },
    { label: 'Bangunan Cerdas', icon: Cpu },
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
    { label: 'AGUS AI', icon: Sparkles }, { label: 'CMS Panel', icon: Users }, { label: 'Settings', icon: Settings },
    { label: 'Tentang aplikasi', icon: Info },
  ] },
]

const energyData = [
  { day: '01', actual: 620, baseline: 760 }, { day: '05', actual: 580, baseline: 740 },
  { day: '09', actual: 690, baseline: 780 }, { day: '13', actual: 540, baseline: 750 },
  { day: '17', actual: 610, baseline: 790 }, { day: '21', actual: 490, baseline: 730 },
  { day: '25', actual: 560, baseline: 770 }, { day: '30', actual: 450, baseline: 750 },
]

const pilotProjects = [
  {
    name: 'Adhi Green Building – Head Office',
    location: 'JAKARTA · GEDUNG KANTOR',
    phase: 'Operasional & optimasi',
    score: 78.6,
    scoreChange: '+4.2 poin bulan ini',
    completion: 82,
    energy: '42.8',
    energyDelta: '12.4%',
    water: '612',
    waterDelta: '8.2%',
    waste: '71',
    wasteDelta: '5.6%',
    carbon: '284',
    categories: [
      { name: 'Site & accessibility', value: 85, tint: 'mint' },
      { name: 'Energy efficiency', value: 72, tint: 'lime' },
      { name: 'Water conservation', value: 88, tint: 'blue' },
      { name: 'Materials & resources', value: 76, tint: 'orange' },
      { name: 'Indoor health & comfort', value: 81, tint: 'mint' },
    ],
    energySeries: energyData,
    milestones: [
      { title: 'Audit energi & baseline', date: 'Selesai · 12 Sep', status: 'done' },
      { title: 'Optimasi sistem HVAC', date: 'Berjalan · 18 Okt', status: 'current' },
      { title: 'Verifikasi pasca-retrofit', date: 'Target · 04 Nov', status: 'upcoming' },
    ],
    activity: [
      { initials: 'RA', name: 'Rizky Adinata', action: 'memperbarui audit energi', detail: 'HVAC · Tower A', time: '09:42', tone: 'green' },
      { initials: 'NS', name: 'Nadia Sari', action: 'mengunggah bukti material', detail: 'Low-VOC coating · 3 dokumen', time: '08:16', tone: 'blue' },
      { initials: 'BP', name: 'Bima Pratama', action: 'menutup tindak lanjut', detail: 'Kebocoran air · Zona C', time: 'Kemarin', tone: 'amber' },
    ],
    floors: 7,
    visual: 'head-office',
  },
  {
    name: 'Cibubur Transit Village',
    location: 'CIBUBUR · KAWASAN MIXED-USE',
    phase: 'Konstruksi & commissioning',
    score: 69.4,
    scoreChange: '+2.8 poin bulan ini',
    completion: 61,
    energy: '68.2',
    energyDelta: '7.1%',
    water: '1,248',
    waterDelta: '11.3%',
    waste: '64',
    wasteDelta: '8.9%',
    carbon: '416',
    categories: [
      { name: 'Site & accessibility', value: 91, tint: 'mint' },
      { name: 'Energy efficiency', value: 63, tint: 'lime' },
      { name: 'Water conservation', value: 74, tint: 'blue' },
      { name: 'Materials & resources', value: 58, tint: 'orange' },
      { name: 'Indoor health & comfort', value: 61, tint: 'mint' },
    ],
    energySeries: [
      { day: '01', actual: 840, baseline: 910 }, { day: '05', actual: 790, baseline: 900 },
      { day: '09', actual: 875, baseline: 920 }, { day: '13', actual: 760, baseline: 905 },
      { day: '17', actual: 820, baseline: 930 }, { day: '21', actual: 710, baseline: 900 },
      { day: '25', actual: 748, baseline: 920 }, { day: '30', actual: 690, baseline: 910 },
    ],
    milestones: [
      { title: 'Mobilisasi & perlindungan tapak', date: 'Selesai · 08 Sep', status: 'done' },
      { title: 'Pemasangan sistem air daur ulang', date: 'Berjalan · 22 Okt', status: 'current' },
      { title: 'Commissioning kawasan', date: 'Target · 16 Des', status: 'upcoming' },
    ],
    activity: [
      { initials: 'DM', name: 'Dewi Maharani', action: 'mencatat inspeksi limpasan', detail: 'Zona lanskap · 2 temuan', time: '10:12', tone: 'green' },
      { initials: 'AF', name: 'Arif Firmansyah', action: 'memverifikasi material daur ulang', detail: 'Struktur · 4 dokumen', time: '09:03', tone: 'blue' },
      { initials: 'LS', name: 'Lina Safitri', action: 'menjadwalkan uji sistem air', detail: 'Utilitas kawasan · 22 Okt', time: 'Kemarin', tone: 'amber' },
    ],
    floors: 5,
    visual: 'transit-village',
  },
  {
    name: 'Surabaya Office Park',
    location: 'SURABAYA · KOMPLEKS PERKANTORAN',
    phase: 'Perencanaan teknis',
    score: 54.2,
    scoreChange: '+6.1 poin bulan ini',
    completion: 38,
    energy: '31.6',
    energyDelta: '4.8%',
    water: '428',
    waterDelta: '6.4%',
    waste: '52',
    wasteDelta: '3.2%',
    carbon: '197',
    categories: [
      { name: 'Site & accessibility', value: 67, tint: 'mint' },
      { name: 'Energy efficiency', value: 79, tint: 'lime' },
      { name: 'Water conservation', value: 49, tint: 'blue' },
      { name: 'Materials & resources', value: 43, tint: 'orange' },
      { name: 'Indoor health & comfort', value: 55, tint: 'mint' },
    ],
    energySeries: [
      { day: '01', actual: 510, baseline: 620 }, { day: '05', actual: 480, baseline: 610 },
      { day: '09', actual: 525, baseline: 630 }, { day: '13', actual: 455, baseline: 620 },
      { day: '17', actual: 470, baseline: 615 }, { day: '21', actual: 430, baseline: 605 },
      { day: '25', actual: 445, baseline: 625 }, { day: '30', actual: 402, baseline: 610 },
    ],
    milestones: [
      { title: 'Analisis tapak & mobilitas', date: 'Selesai · 14 Sep', status: 'done' },
      { title: 'Koordinasi desain pasif', date: 'Berjalan · 27 Okt', status: 'current' },
      { title: 'Penyelesaian dokumen teknis', date: 'Target · 20 Nov', status: 'upcoming' },
    ],
    activity: [
      { initials: 'PW', name: 'Putra Wijaya', action: 'memperbarui studi orientasi', detail: 'Blok Timur · revisi 2', time: '11:05', tone: 'green' },
      { initials: 'MT', name: 'Maya Tanjung', action: 'meninjau spesifikasi kaca', detail: 'Fasad · menunggu persetujuan', time: '09:38', tone: 'blue' },
      { initials: 'RS', name: 'Rendi Saputra', action: 'menambahkan target konservasi air', detail: 'Perencanaan · 3 indikator', time: 'Kemarin', tone: 'amber' },
    ],
    floors: 4,
    visual: 'surabaya-park',
  },
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

function WelcomeFlow({ stage, slideIndex, mascotIndex, onNext, onPrevious, onSkip, onSkipSequence, onAbout, onAccount, onOnboarding, onAuthenticated, onGuestAccess }: { stage: Exclude<WelcomeStage, 'complete'>; slideIndex: number; mascotIndex: number; onNext: (index?: number) => void; onPrevious: () => void; onSkip: () => void; onSkipSequence: () => void; onAbout: () => void; onAccount: () => void; onOnboarding: () => void; onAuthenticated: () => void; onGuestAccess: () => void }) {
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
      <header className="account-header"><a className="onboarding-brand" href="#account" aria-label="AGUS"><img src={agusIcon} alt="AGUS" /><span>GREEN INTELLIGENCE</span></a><div className="account-header-actions"><button className="about-header-link" onClick={onOnboarding}><ArrowLeft size={15} /> Ke onboarding</button><button className="about-header-link" onClick={onAbout}><BookOpen size={15} /> Tentang AGUS</button></div></header>
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
          <button className="guest-access-button" type="button" onClick={onGuestAccess}>Akses sebagai tamu <ArrowRight size={15} /></button>
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
        <div className="visual-illustration"><img className="visual-mascot" src={onboardingMascots[slideIndex % onboardingMascots.length]} alt={`Maskot Agus seri ${slideIndex % onboardingMascots.length + 1}`} /><div className="visual-icon"><SlideIcon size={23} strokeWidth={1.6} /></div><span className="visual-coordinate">SUSTAINABILITY / {String(slideIndex + 1).padStart(2, '0')}</span></div>
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
  'CMS Panel': { eyebrow: 'SYSTEM ADMINISTRATION', title: 'Manajemen pengguna', description: 'Kelola akun, status, dan peran akses AGUS. Perubahan peran berlaku setelah pengguna masuk kembali.', stats: [], rows: [] },
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

type ManagedUser = {
  uid: string
  email: string | null
  displayName: string | null
  role: string
  disabled: boolean
  createdAt: string | null
  lastSignInAt: string | null
}

type ManagedUsersPage = { users: ManagedUser[]; nextPageToken: string | null }

function CmsPanel() {
  const [users, setUsers] = useState<ManagedUser[]>([])
  const [nextPageToken, setNextPageToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [busyUid, setBusyUid] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const currentUid = firebaseAuth?.currentUser?.uid

  async function loadUsers(pageToken?: string, append = false) {
    if (!firebaseFunctions) {
      setError('Firebase belum dikonfigurasi. Atur .env.local dan deploy Firebase Functions untuk menggunakan CMS.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const listUsers = httpsCallable<{ pageToken?: string }, ManagedUsersPage>(firebaseFunctions, 'listManagedUsers')
      const result = await listUsers(pageToken ? { pageToken } : {})
      setUsers(current => append ? [...current, ...result.data.users] : result.data.users)
      setNextPageToken(result.data.nextPageToken)
    } catch (caught) {
      const code = (caught as { code?: string }).code
      setError(code === 'functions/permission-denied'
        ? 'Akses ditolak. CMS Panel hanya tersedia bagi akun Super Admin.'
        : 'Pengguna tidak dapat dimuat. Periksa koneksi Firebase dan pastikan Cloud Functions sudah di-deploy.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void loadUsers() }, [])

  async function runUserAction(uid: string, action: 'role' | 'enabled' | 'delete', value?: string | boolean) {
    if (!firebaseFunctions) {
      setError('Firebase Functions belum dikonfigurasi.')
      return
    }
    setBusyUid(uid)
    setError('')
    setMessage('')
    try {
      if (action === 'role') {
        const updateRole = httpsCallable<{ uid: string; role: string }, { success: boolean }>(firebaseFunctions, 'setManagedUserRole')
        await updateRole({ uid, role: String(value) })
      } else if (action === 'enabled') {
        const updateStatus = httpsCallable<{ uid: string; disabled: boolean }, { success: boolean }>(firebaseFunctions, 'setManagedUserDisabled')
        await updateStatus({ uid, disabled: !Boolean(value) })
      } else {
        const deleteUser = httpsCallable<{ uid: string }, { success: boolean }>(firebaseFunctions, 'deleteManagedUser')
        await deleteUser({ uid })
      }
      setMessage(action === 'delete' ? 'Akun pengguna telah dihapus.' : 'Perubahan akun berhasil disimpan.')
      await loadUsers()
    } catch (caught) {
      const code = (caught as { code?: string }).code
      setError(code === 'functions/failed-precondition'
        ? (caught as Error).message
        : code === 'functions/permission-denied'
          ? 'Akses ditolak. Hanya Super Admin yang dapat melakukan perubahan.'
          : 'Perubahan gagal. Periksa koneksi, lalu coba lagi.')
    } finally {
      setBusyUid(null)
    }
  }

  const filteredUsers = users.filter(user => `${user.email ?? ''} ${user.displayName ?? ''}`.toLowerCase().includes(query.toLowerCase()))

  return <section className="cms-panel">
    <div className="cms-panel-heading">
      <div><span className="panel-kicker">CMS · AKSES SISTEM</span><h2>Pengguna terdaftar</h2><p>Role disimpan sebagai custom claim Firebase dan diverifikasi oleh Cloud Functions. Pengguna perlu masuk kembali agar perubahan role diterapkan.</p></div>
      <button className="button" type="button" onClick={() => void loadUsers()} disabled={loading}><RefreshCw size={14} className={loading ? 'cms-refreshing' : ''} /> Muat ulang</button>
    </div>
    <div className="cms-toolbar"><label className="cms-search"><Search size={15} /><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Cari nama atau email" aria-label="Cari pengguna" /></label><span className="cms-user-count"><Users size={14} /> {filteredUsers.length} pengguna</span></div>
    {error && <p className="cms-feedback cms-feedback-error" role="alert">{error}</p>}
    {message && <p className="cms-feedback cms-feedback-success" role="status">{message}</p>}
    <div className="cms-table-wrap">
      <table className="cms-users-table">
        <thead><tr><th>Pengguna</th><th>Peran</th><th>Status</th><th>Terakhir masuk</th><th>Aksi</th></tr></thead>
        <tbody>{filteredUsers.map(user => {
          const isSelf = user.uid === currentUid
          const protectedAdmin = user.role === 'super_admin'
          const isBusy = busyUid === user.uid
          return <tr key={user.uid}>
            <td><div className="cms-user-cell"><span className="cms-avatar">{(user.displayName || user.email || '?').slice(0, 1).toUpperCase()}</span><span><strong>{user.displayName || 'Tanpa nama'}</strong><small>{user.email || user.uid}</small></span></div></td>
            <td><select className="cms-role-select" value={user.role} disabled={isBusy || isSelf} aria-label={`Peran ${user.email || user.uid}`} onChange={event => void runUserAction(user.uid, 'role', event.target.value)}>{Object.entries(agusRoles).map(([role, definition]) => <option key={role} value={role}>{definition.label}</option>)}</select></td>
            <td><span className={`cms-status ${user.disabled ? 'cms-status-disabled' : 'cms-status-enabled'}`}><i />{user.disabled ? 'Nonaktif' : 'Aktif'}</span></td>
            <td>{user.lastSignInAt ? new Date(user.lastSignInAt).toLocaleDateString('id-ID') : 'Belum pernah'}</td>
            <td><div className="cms-actions"><button className="icon-button cms-action-button" type="button" aria-label={user.disabled ? `Aktifkan ${user.email || user.uid}` : `Nonaktifkan ${user.email || user.uid}`} title={user.disabled ? 'Aktifkan akun' : 'Nonaktifkan akun'} disabled={isBusy || isSelf || protectedAdmin} onClick={() => void runUserAction(user.uid, 'enabled', user.disabled)}>{user.disabled ? <CircleCheck size={15} /> : <Ban size={15} />}</button><button className="icon-button cms-action-button cms-delete-button" type="button" aria-label={`Hapus ${user.email || user.uid}`} title="Hapus akun" disabled={isBusy || isSelf || protectedAdmin} onClick={() => { if (window.confirm(`Hapus akun ${user.email || user.uid}? Tindakan ini tidak dapat dibatalkan.`)) void runUserAction(user.uid, 'delete') }}><Trash2 size={15} /></button></div></td>
          </tr>
        })}</tbody>
      </table>
      {loading && users.length === 0 && <p className="cms-empty">Memuat akun Firebase...</p>}
      {!loading && filteredUsers.length === 0 && <p className="cms-empty">{users.length ? 'Tidak ada pengguna yang cocok dengan pencarian.' : 'Belum ada akun yang ditemukan.'}</p>}
    </div>
    {nextPageToken && <div className="cms-pagination"><span>Daftar pengguna memakai halaman 50 akun.</span><button className="button" type="button" disabled={loading} onClick={() => void loadUsers(nextPageToken, true)}>Muat berikutnya <ArrowRight size={14} /></button></div>}
    <p className="cms-security-note"><ShieldCheck size={14} /> Penghapusan akun Super Admin dan perubahan peran pada akun yang sedang aktif diblokir untuk mencegah kehilangan akses.</p>
  </section>
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

const ratingCategoryDescriptions: Record<string, string> = {
  ASD: 'Menilai pemilihan dan pengelolaan tapak, akses bagi pengguna, ruang hijau, serta pengendalian dampak air hujan dan iklim mikro.',
  EEC: 'Menilai kinerja dan pemantauan energi gedung, efisiensi sistem, pemanfaatan kondisi alami, serta peluang energi terbarukan.',
  WAC: 'Menilai pengukuran dan penghematan konsumsi air, pemanfaatan kembali air, sumber alternatif, serta efisiensi penggunaan air di lansekap.',
  MRC: 'Menilai pemilihan dan sumber material, penggunaan kembali, dampak refrigeran, serta dukungan terhadap rantai pasok yang bertanggung jawab.',
  IHC: 'Menilai kualitas udara dalam ruang dan kenyamanan penghuni, termasuk aspek visual, termal, akustik, serta pengendalian polutan.',
  BEM: 'Menilai tata kelola kinerja lingkungan sepanjang proyek, dari tim dan konstruksi hingga komisioning, serah terima, dan masukan penghuni.',
}

const ratingCriterionDescriptions: Record<string, string> = {
  ASD1: 'Meninjau kesesuaian lokasi proyek dengan kondisi dan peruntukan tapak, serta upaya menghindari lokasi yang berisiko atau bernilai ekologis penting.',
  ASD2: 'Meninjau kemudahan akses dari dan ke fasilitas umum di sekitar gedung bagi penghuni maupun komunitas.',
  ASD3: 'Menilai ketersediaan akses menuju layanan transportasi umum untuk mengurangi ketergantungan pada kendaraan pribadi.',
  ASD4: 'Meninjau dukungan bagi pengguna sepeda melalui fasilitas yang aman dan layak di area gedung.',
  ASD5: 'Menilai penyediaan dan kualitas area hijau, termasuk pemilihan vegetasi dan pengelolaan lahan terbuka.',
  ASD6: 'Meninjau upaya mengurangi efek panas pada area luar melalui desain tapak, peneduhan, dan elemen lansekap.',
  ASD7: 'Menilai pengelolaan limpasan hujan di dalam tapak agar volume dan dampak aliran ke luar lahan dapat dikendalikan.',
  EEC1: 'Menilai upaya pengurangan konsumsi energi melalui efisiensi sistem gedung, pemantauan, dan pembuktian kinerja operasional.',
  EEC2: 'Meninjau pemanfaatan cahaya matahari di ruang dalam dengan tetap memperhatikan kenyamanan dan kebutuhan pencahayaan.',
  EEC3: 'Menilai dukungan desain terhadap ventilasi dan kenyamanan ruang dengan mempertimbangkan kondisi serta fungsi ruang.',
  EEC4: 'Meninjau pertimbangan risiko dan dampak perubahan iklim terhadap rancangan maupun kinerja gedung.',
  EEC5: 'Menilai pemanfaatan energi terbarukan yang dihasilkan atau digunakan di dalam area proyek. Kredit ini dicatat sebagai bonus.',
  WAC1: 'Menilai pengurangan kebutuhan air bersih melalui pemantauan konsumsi dan penggunaan perlengkapan yang efisien.',
  WAC2: 'Meninjau efisiensi penggunaan air pada fitur atau elemen air di lingkungan gedung.',
  WAC3: 'Menilai pengolahan dan pemanfaatan kembali air bekas agar dapat digunakan untuk kebutuhan yang sesuai.',
  WAC4: 'Meninjau pemanfaatan sumber air selain air bersih utama, sesuai mutu dan kebutuhan penggunaannya.',
  WAC5: 'Menilai penangkapan dan penyimpanan air hujan untuk pemanfaatan yang sesuai di dalam proyek.',
  WAC6: 'Meninjau pengurangan kebutuhan irigasi melalui rancangan lansekap dan metode penyiraman yang efisien.',
  MRC1: 'Meninjau pemanfaatan kembali gedung atau material yang sudah ada untuk mengurangi kebutuhan material baru dan limbah.',
  MRC2: 'Menilai penggunaan material dengan karakteristik atau bukti dampak lingkungan yang lebih baik sesuai kriteria acuan.',
  MRC3: 'Meninjau pemilihan refrigeran pada sistem gedung dengan mempertimbangkan potensi penipisan lapisan ozon.',
  MRC4: 'Menilai penggunaan kayu yang asal-usul dan pengelolaannya didukung sertifikasi atau bukti legalitas yang relevan.',
  MRC5: 'Meninjau pemanfaatan komponen prafabrikasi yang dapat mendukung efisiensi material dan mengurangi sisa konstruksi.',
  MRC6: 'Menilai penggunaan material dari sumber regional sesuai ketentuan jarak dan pembuktian pada dokumen acuan.',
  IHC1: 'Meninjau pemantauan kadar CO₂ sebagai salah satu indikator kecukupan udara segar dan kondisi ruang.',
  IHC2: 'Menilai kebijakan dan pengaturan area untuk mencegah paparan asap rokok pada penghuni dan pengunjung.',
  IHC3: 'Meninjau pemilihan dan pengendalian bahan atau produk yang berpotensi melepaskan polutan kimia ke dalam ruang.',
  IHC4: 'Menilai ketersediaan akses visual penghuni ke lingkungan luar dari ruang yang digunakan.',
  IHC5: 'Meninjau kualitas pencahayaan ruang untuk mendukung kenyamanan dan aktivitas visual penghuni.',
  IHC6: 'Menilai upaya menyediakan kondisi suhu ruang yang nyaman dan sesuai dengan fungsi ruang.',
  IHC7: 'Meninjau pengendalian kebisingan untuk menjaga kenyamanan akustik di ruang dalam.',
  BEM1: 'Meninjau keterlibatan Green Professional (GP) dalam tim proyek untuk mendukung integrasi tujuan green building.',
  BEM2: 'Menilai langkah pengendalian dampak lingkungan selama konstruksi, seperti debu, limpasan, dan gangguan di sekitar proyek.',
  BEM3: 'Meninjau pemilahan, pengurangan, dan penyaluran sampah operasional agar dapat digunakan kembali atau didaur ulang.',
  BEM4: 'Menilai proses pemeriksaan, pengujian, dan dokumentasi agar sistem gedung berfungsi sesuai rancangan dan kebutuhan.',
  BEM5: 'Meninjau kelengkapan informasi dan dokumen kinerja green building yang diserahkan untuk mendukung pengoperasian gedung.',
  BEM6: 'Menilai pengaturan pekerjaan fit out penyewa agar tetap sejalan dengan ketentuan dan kinerja lingkungan gedung.',
  BEM7: 'Meninjau pengumpulan masukan penghuni mengenai kenyamanan dan kinerja gedung sebagai dasar evaluasi.',
}

const ratingTiers = [
  { name: 'Platinum', minimumPoints: 74 },
  { name: 'Gold', minimumPoints: 58 },
  { name: 'Silver', minimumPoints: 46 },
  { name: 'Bronze', minimumPoints: 35 },
] as const

function createRatingPlan(targetPoints: number) {
  const allocations = ratingCategories.map((category, index) => {
    const exactPoints = targetPoints * category.points / 101
    return { code: category.code, points: Math.floor(exactPoints), remainder: exactPoints % 1, index }
  })
  const remainingPoints = targetPoints - allocations.reduce((sum, allocation) => sum + allocation.points, 0)

  allocations
    .slice()
    .sort((a, b) => b.remainder - a.remainder || a.index - b.index)
    .slice(0, remainingPoints)
    .forEach(allocation => { allocations[allocation.index].points += 1 })

  return Object.fromEntries(allocations.map(({ code, points }) => [code, points]))
}

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

function RatingToolsPage({ onBack }: { onBack: () => void }) {
  const [selectedCategory, setSelectedCategory] = useState('ASD')
  const [expandedCriterion, setExpandedCriterion] = useState<string | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
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
  const plannedTier = ratingTiers.find(tier => tier.name === selectedPlan)
  const plannedPoints = plannedTier ? createRatingPlan(plannedTier.minimumPoints) : null
  const predictedTier = prerequisitesReady ? ratingTiers.find(tier => earnedCredits >= tier.minimumPoints) : null
  const predictionLabel = !prerequisitesReady ? 'Prasyarat belum lengkap' : predictedTier?.name ?? 'Belum Bronze'

  function setStatus(setter: (update: (current: Record<string, CheckStatus>) => Record<string, CheckStatus>) => void, code: string, value: CheckStatus) {
    setter(current => ({ ...current, [code]: value }))
  }

  function updateScore(code: string, max: number, value: string) {
    const parsed = value === '' ? null : Math.max(0, Math.min(max, Math.floor(Number(value))))
    setScores(current => ({ ...current, [code]: parsed }))
  }

  return <>
    <div className="page-heading module-heading rating-heading"><div><div className="overline"><span className="live-pulse" /> RATING TOOLS · GBCI NB V1.2</div><h1>Analisis GREENSHIP New Building<span className="heading-period">.</span></h1><p>Input status prasyarat dan poin tolok ukur untuk membuat simulasi internal Final Assessment.</p></div><div className="heading-actions"><button className="button" onClick={onBack}><ArrowLeft size={14} /> Kembali ke halaman utama</button><a className="button button-learning" href="https://gbcindonesia.org/files/resource/9b552832-b500-4b73-8c0e-acfaa1434731/Summary%20GREENSHIP%20New%20Building%20V1.2.pdf" target="_blank" rel="noreferrer"><FileText size={14} /> Dokumen acuan <ExternalLink size={13} /></a></div></div>
    <div className="module-disclaimer rating-disclaimer"><ShieldCheck size={16} /><span>Alat bantu analisis internal berdasarkan Ringkasan Kriteria GREENSHIP NB V1.2 (GBC Indonesia, April 2013). Bukan alat penilaian resmi, tidak menentukan tingkat Bronze/Silver/Gold/Platinum, dan bukan sertifikasi. Konfirmasi versi serta persyaratan terkini kepada GBCI.</span></div>

    <section className="rating-summary" aria-label="Ringkasan simulasi internal">
      <article className="rating-total"><span>POIN KREDIT INTERNAL</span><strong>{prerequisitesReady ? earnedCredits : '—'}<small> / 101</small></strong><div className="rating-meter"><span style={{ width: prerequisitesReady ? `${Math.min(percentage, 100)}%` : '0%' }} /></div><small>{prerequisitesReady ? `${percentage}% dari maksimum Final Assessment, belum termasuk bonus` : 'Tandai semua 8 prasyarat terpenuhi untuk membuka penilaian poin'}</small></article>
      <article><span>POIN BONUS</span><strong>{prerequisitesReady ? earnedBonus : '—'}<small> / 5</small></strong><small>Energi terbarukan dalam tapak</small></article>
      <article><span>KRITERIA DIINPUT</span><strong>{assessedCriteria}<small> / 37</small></strong><small>Kredit dan bonus; prasyarat terpisah</small></article>
      <article><span>PRASYARAT TERPENUHI</span><strong>{metPrerequisites}<small> / 8</small></strong><small>{prerequisitesReady ? 'Semua prasyarat ditandai terpenuhi' : 'Skor belum memenuhi gerbang prasyarat'}</small></article>
      <article className="rating-prediction"><span>PREDIKSI PERINGKAT INTERNAL</span><strong>{predictionLabel}</strong><small>{prerequisitesReady ? `${earnedCredits} poin kredit internal` : 'Lengkapi semua prasyarat untuk melihat prediksi'}</small></article>
    </section>

    <section className="rating-plan panel" aria-label="Simulasi target peringkat internal">
      <div className="rating-section-heading"><div><span className="panel-kicker">SIMULASI INTERNAL · MAKSIMUM 101 POIN</span><h2>Rencana target peringkat</h2></div><span className="rating-gate">Bonus tidak dihitung</span></div>
      <p className="rating-help">Pilih tombol Rencana untuk melihat pembagian target poin proporsional berdasarkan bobot enam kategori. Angka ini simulasi perencanaan, bukan hasil penilaian atau jaminan sertifikasi.</p>
      <div className="rating-tier-list" aria-label="Pilih target peringkat">
        {ratingTiers.map(tier => <button className={`rating-tier-option ${selectedPlan === tier.name ? 'rating-tier-active' : ''}`} key={tier.name} type="button" aria-pressed={selectedPlan === tier.name} onClick={() => setSelectedPlan(tier.name)}>
          <span><strong>{tier.name}</strong><small>Minimum {tier.minimumPoints} poin</small></span><span className="rating-tier-action">{selectedPlan === tier.name ? 'Dipilih' : 'Rencana'} <ArrowRight size={13} /></span>
        </button>)}
      </div>
      {plannedTier && plannedPoints && <div className="rating-plan-detail" aria-live="polite">
        <div className="rating-plan-detail-heading"><div><span className="panel-kicker">TARGET {plannedTier.name.toUpperCase()}</span><h3>Rencana pembagian poin</h3></div><strong>{plannedTier.minimumPoints}<small> / 101 poin</small></strong></div>
        <div className="rating-plan-columns"><span>KATEGORI</span><span>RENCANA</span><span>INPUT</span><span>TAMBAHAN</span></div>
        {ratingCategories.map(item => {
          const target = plannedPoints[item.code] ?? 0
          const current = item.criteria.filter(criterion => !criterion.bonus).reduce((sum, criterion) => sum + (scores[criterion.code] ?? 0), 0)
          return <div className="rating-plan-row" key={item.code}><span><b>{item.code}</b>{item.title}</span><strong>{target} <small>/ {item.points}</small></strong><span>{prerequisitesReady ? current : '—'}</span><span className="rating-plan-gap">{prerequisitesReady ? `+${Math.max(0, target - current)}` : 'Lengkapi prasyarat'}</span></div>
        })}
        <p className="rating-plan-note">{prerequisitesReady ? `Simulasi Anda: ${earnedCredits} / ${plannedTier.minimumPoints} poin target (${Math.max(0, plannedTier.minimumPoints - earnedCredits)} poin lagi menuju minimum ${plannedTier.name}).` : 'Pembagian target dapat dilihat, tetapi poin internal baru dapat dibandingkan setelah seluruh prasyarat ditandai terpenuhi.'}</p>
      </div>}
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
        <p className="rating-category-description">{ratingCategoryDescriptions[category.code]}</p>
        <div className="rating-criteria-header"><span>KODE</span><span>KRITERIA</span><span>POIN</span></div>
        {category.criteria.map(criterion => {
          const isExpanded = expandedCriterion === criterion.code
          const guidanceId = `rating-guidance-${criterion.code}`
          return <div className={`rating-criterion-row ${!prerequisitesReady ? 'rating-criterion-locked' : ''}`} key={criterion.code}>
            <span className="rating-criterion-code">{criterion.code}{criterion.bonus && <i>BONUS</i>}</span>
            <div className="rating-criterion-main">
              <span className="rating-criterion-title">{criterion.title}</span>
              <button className="rating-guidance-toggle" type="button" aria-expanded={isExpanded} aria-controls={guidanceId} onClick={() => setExpandedCriterion(isExpanded ? null : criterion.code)}>{isExpanded ? 'Tutup panduan' : 'Lihat panduan kriteria'} <ChevronDown size={13} /></button>
              {isExpanded && <p className="rating-criterion-description" id={guidanceId}>{ratingCriterionDescriptions[criterion.code]}</p>}
            </div>
            <label className="rating-points-input"><input type="number" min="0" max={criterion.points} step="1" value={scores[criterion.code] ?? ''} placeholder="0" disabled={!prerequisitesReady} onChange={event => updateScore(criterion.code, criterion.points, event.target.value)} aria-label={`Poin internal ${criterion.code}, maksimum ${criterion.points}`} /><span>/ {criterion.points}</span></label>
          </div>
        })}
        {category.code === 'EEC' && <p className="rating-bonus-note">EEC5 merupakan bonus sampai 5 poin dan dilaporkan terpisah dari maksimum 101 poin kredit.</p>}
      </div>
    </section>

    <section className="rating-source-note"><span>SUMBER</span><p>GREENSHIP untuk Bangunan Baru Versi 1.2 · Ringkasan Kriteria dan Tolok Ukur · GBC Indonesia · April 2013. Deskripsi di atas merupakan ringkasan penjelas internal, bukan kutipan atau pengganti butir teknis resmi. Nilai yang dimasukkan pengguna belum diverifikasi oleh GBCI.</p><a href="https://gbcindonesia.org/files/resource/9b552832-b500-4b73-8c0e-acfaa1434731/Summary%20GREENSHIP%20New%20Building%20V1.2.pdf" target="_blank" rel="noreferrer">Buka PDF acuan <ExternalLink size={13} /></a></section>
  </>
}

function App() {
  const [welcomeStage, setWelcomeStage] = useState<WelcomeStage>(() => window.localStorage.getItem('agus-intro-v2-complete') === 'true' ? 'account' : 'splash')
  const [slideIndex, setSlideIndex] = useState(0)
  const [mascotIndex, setMascotIndex] = useState(0)
  const [activePage, setActivePage] = useState('Dashboard')
  const [period, setPeriod] = useState('Monthly')
  const [project, setProject] = useState('Adhi Green Building – Head Office')
  const pilot = pilotProjects.find(item => item.name === project) ?? pilotProjects[0]
  const [isDark, setIsDark] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [checks, setChecks] = useState(initialChecks)
  const [notice, setNotice] = useState('')
  const [accountName, setAccountName] = useState('Andi Prasetyo')
  const [accountRole, setAccountRole] = useState('Pengguna')
  const [readingScale, setReadingScale] = useState(() => {
    try {
      const storedScale = Number(window.localStorage.getItem('agus-reading-scale'))
      return [90, 100, 110, 120, 130, 140, 150].includes(storedScale) ? storedScale : 100
    } catch {
      return 100
    }
  })
  const uploadRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    try {
      window.localStorage.setItem('agus-reading-scale', String(readingScale))
    } catch {
      setNotice('Preferensi ukuran teks hanya berlaku selama sesi ini karena penyimpanan browser tidak tersedia.')
    }
  }, [readingScale])

  useEffect(() => {
    if (!firebaseAuth) return
    return onAuthStateChanged(firebaseAuth, async user => {
      if (user) {
        setAccountName(user.displayName || user.email?.split('@')[0] || 'Pengguna AGUS')
        try {
          if (!firebaseFunctions) throw new Error('Firebase Functions belum dikonfigurasi.')
          const ensureRole = httpsCallable<Record<string, unknown>, { role: string }>(firebaseFunctions, 'ensureMemberRole')
          await ensureRole({})
          await user.getIdToken(true)
          const token = await user.getIdTokenResult()
          setAccountRole(getAgusRoleLabel(token.claims.agusRole as string | undefined))
        } catch (error) {
          setAccountRole('Pengguna')
          setNotice(error instanceof Error ? `Peran akun belum dapat diverifikasi: ${error.message}` : 'Peran akun belum dapat diverifikasi oleh server.')
        }
        setWelcomeStage('complete')
      } else {
        setAccountRole('Pengguna')
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

  function enterAsGuest() {
    setAccountName('Tamu AGUS')
    setAccountRole('Akses tamu')
    setActivePage('Dashboard')
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

  function returnToOnboarding() {
    setSlideIndex(0)
    setWelcomeStage('onboarding')
  }

  function skipMascotSequence() {
    setWelcomeStage('brand-poster')
  }

  function selectPage(label: string) {
    setActivePage(label)
    setMobileNavOpen(false)
  }

  function adjustReadingScale(direction: -1 | 1) {
    setReadingScale(current => Math.max(90, Math.min(150, current + direction * 10)))
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
    return <WelcomeFlow stage={welcomeStage} slideIndex={slideIndex} mascotIndex={mascotIndex} onNext={advanceSlide} onPrevious={previousSlide} onSkip={openAccount} onSkipSequence={skipMascotSequence} onAbout={() => setWelcomeStage('about')} onAccount={openAccount} onOnboarding={returnToOnboarding} onAuthenticated={completeAuthentication} onGuestAccess={enterAsGuest} />
  }

  return (
    <div className={`app-shell ${isDark ? 'theme-dark' : 'theme-light'} reading-scale-${readingScale}`}>
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
            {group.items.filter(item => item.label !== 'CMS Panel' || accountRole === 'Super Admin').map(item => <button key={item.label} onClick={() => selectPage(item.label)} className={`nav-link ${activePage === item.label ? 'nav-link-active' : ''}`}>
              <item.icon size={17} strokeWidth={1.8} /><span>{item.label}</span>{item.label === 'Corrective actions' && <span className="nav-count">3</span>}
            </button>)}
          </div>)}
        </nav>
        <div className="sidebar-bottom">
          <div className="project-health"><div className="health-top"><span>PROJECT HEALTH</span><span className="health-dot" /></div><strong>On track</strong><div className="health-track"><span /></div><small>Updated 12 min ago</small></div>
          <button className="profile-row" onClick={() => selectPage('Settings')}><span className="profile-avatar">{accountName.split(' ').map(part => part[0]).slice(0, 2).join('').toUpperCase()}</span><span className="profile-copy"><strong>{accountName}</strong><small>{accountRole}</small></span><Ellipsis size={17} /></button>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <button className="icon-button mobile-menu" aria-label="Open navigation" onClick={() => setMobileNavOpen(true)}><Menu size={20} /></button>
          <div className="crumb"><span>Workspace</span><span className="crumb-slash">/</span><strong>{activePage}</strong></div>
          <div className="topbar-actions">
            <div className="search-box"><Search size={16} /><input aria-label="Search" placeholder="Search anything..." /><kbd>⌘ K</kbd></div>
            <div className="text-size-controls" role="group" aria-label="Pengaturan ukuran teks materi">
              <button type="button" aria-label="Perkecil ukuran teks materi" title="Perkecil teks" disabled={readingScale === 90} onClick={() => adjustReadingScale(-1)}>A−</button>
              <span aria-live="polite">{readingScale}%</span>
              <button type="button" aria-label="Perbesar ukuran teks materi" title="Perbesar teks" disabled={readingScale === 150} onClick={() => adjustReadingScale(1)}>A+</button>
            </div>
            <button className="icon-button theme-button" aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'} onClick={() => setIsDark(value => !value)}>{isDark ? <Sun size={18} /> : <Moon size={18} />}</button>
            <button className="icon-button notification-button" aria-label="Notifications" onClick={() => setNotice('You are all caught up')}><Bell size={18} /><i /></button>
            <div className="top-avatar">AP</div>
          </div>
        </header>

        <div className="page-content">
          {activePage === 'CMS Panel' && accountRole === 'Super Admin' ? <CmsPanel /> : activePage === 'Green Building' ? <GreenBuildingPage onNavigate={selectPage} /> : activePage === 'Bangunan Cerdas' ? <SmartBuildingPage onNavigate={selectPage} /> : activePage === 'Dashboard' ? <>
            <div className="page-heading dashboard-heading">
              <div><div className="overline"><span className="live-pulse" /> PROJECT OVERVIEW <span className="heading-divider">/</span> DATA DEMO · OKTOBER 2026</div><h1>Selamat datang, {accountName.split(' ')[0]}<span className="heading-period">.</span></h1><p>Monitoring pilot project: {pilot.name}.</p></div>
              <div className="heading-actions">
                <label className="select-wrap project-select"><Building2 size={15} /><select value={project} onChange={event => setProject(event.target.value)} aria-label="Pilih pilot project">{pilotProjects.map(item => <option key={item.name} value={item.name}>{item.name}</option>)}</select><ChevronDown size={14} /></label>
                <button className="button button-learning" onClick={() => selectPage('Sesi Pembelajaran')}><BookOpen size={15} /> Sesi pembelajaran</button>
                <button className="button button-primary" onClick={() => selectPage('Inspection')}><Plus size={16} /> New inspection</button>
              </div>
            </div>

            <section className="summary-strip" aria-label="Project sustainability indicators">
              <Metric icon={Zap} label="ENERGY THIS MONTH" value={pilot.energy} unit="MWh" delta={pilot.energyDelta} positive />
              <Metric icon={Droplets} label="WATER CONSUMED" value={pilot.water} unit="m³" delta={pilot.waterDelta} positive />
              <Metric icon={Recycle} label="WASTE DIVERTED" value={pilot.waste} unit="%" delta={`+${pilot.wasteDelta}`} positive />
              <Metric icon={Cloud} label="CARBON TO DATE" value={pilot.carbon} unit="tCO₂e" delta="Demo data" positive />
            </section>

            <section className="pilot-monitor panel" aria-label={`Monitoring progres ${pilot.name}`}>
              <div className="pilot-monitor-heading"><div><span className="panel-kicker">PILOT PROJECT · MONITORING</span><h2>{pilot.name}</h2><p>{pilot.location} <span>·</span> {pilot.phase}</p></div><span className="pilot-demo-tag"><span /> DATA ILUSTRASI</span></div>
              <div className="pilot-monitor-grid">
                <div className="pilot-model-wrap">
                  <div className="pilot-model-label"><span><Building2 size={13} /> MODEL 3D · KONSEP</span><span>VISUALISASI DEMO</span></div>
                  <Suspense fallback={<div className="pilot-three-fallback" role="status">Memuat visualisasi 3D…</div>}>
                    <PilotBuildingScene variant={pilot.visual} floors={pilot.floors} projectName={pilot.name} />
                  </Suspense>
                  <div className="pilot-model-caption"><span>{pilot.name}</span><span>3D CONCEPT · NOT TO SCALE</span></div>
                </div>
                <div className="pilot-progress-panel">
                  <div className="pilot-progress-top"><div><span className="panel-kicker">PROGRES KESELURUHAN</span><p>Target pelaksanaan proyek</p></div><div className="pilot-progress-donut" style={{ background: `conic-gradient(#b7e36e ${pilot.completion}%, #344139 ${pilot.completion}% 100%)` }}><span>{pilot.completion}<small>%</small></span></div></div>
                  <div className="pilot-progress-track" role="progressbar" aria-label="Progres pilot project" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pilot.completion}><span style={{ width: `${pilot.completion}%` }} /></div>
                  <div className="pilot-progress-meta"><span>CAPAIAN</span><strong>{pilot.completion}%</strong><span>·</span><span>Fase aktif: {pilot.phase}</span></div>
                  <div className="pilot-milestones"><span className="panel-kicker">MILESTONE PROYEK</span>{pilot.milestones.map(milestone => <div className={`pilot-milestone pilot-milestone-${milestone.status}`} key={milestone.title}><span className="pilot-milestone-node">{milestone.status === 'done' ? <Check size={11} /> : <i />}</span><span className="pilot-milestone-copy"><strong>{milestone.title}</strong><small>{milestone.date}</small></span><span className="pilot-milestone-status">{milestone.status === 'done' ? 'SELESAI' : milestone.status === 'current' ? 'BERJALAN' : 'RENCANA'}</span></div>)}</div>
                </div>
              </div>
            </section>

            <section className="dashboard-grid dashboard-top-grid">
              <article className="panel score-panel">
                <div className="panel-heading"><div><span className="panel-kicker">PROJECT PERFORMANCE</span><h2>Green score</h2></div><button className="icon-button subtle-icon" aria-label="Score details" onClick={() => selectPage('Assessment')}><Ellipsis size={19} /></button></div>
                <div className="score-content">
                  <div className="score-ring" style={{ background: `conic-gradient(from 216deg, #b7e36e 0 ${pilot.score}%, #323f34 ${pilot.score}% 100%)` }}><div className="score-ring-center"><span className="score-value">{pilot.score.toFixed(1).split('.')[0]}<span>.{pilot.score.toFixed(1).split('.')[1]}</span></span><span className="score-outof">OUT OF 100</span></div></div>
                  <div className="score-copy"><span className="internal-tag"><span /> INTERNAL ASSESSMENT</span><h3>{pilot.score >= 75 ? <>Good progress,<br />room to improve.</> : pilot.score >= 60 ? <>Building momentum,<br />keep closing gaps.</> : <>Design phase,<br />strong potential ahead.</>}</h3><p>{pilot.scoreChange}</p><button className="text-link" onClick={() => selectPage('Assessment')}>View assessment <ArrowUpRight size={14} /></button></div>
                </div>
                <div className="score-footnote"><ShieldCheck size={14} /><span>AGUS internal score · not an official certification</span></div>
              </article>

              <article className="panel energy-panel">
                <div className="panel-heading energy-heading"><div><span className="panel-kicker">RESOURCE PERFORMANCE</span><h2>Energy consumption</h2></div><label className="select-wrap period-select"><select value={period} onChange={event => setPeriod(event.target.value)} aria-label="Select chart period"><option>Monthly</option><option>Weekly</option><option>Daily</option></select><ChevronDown size={14} /></label></div>
                <div className="chart-summary"><strong>{pilot.energy} <small>MWh</small></strong><span className="delta-label"><ArrowDownRight size={14} /> {pilot.energyDelta} <em>vs baseline</em></span></div>
                <div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><AreaChart data={pilot.energySeries} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
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
                  {pilot.categories.map(category => <Category key={category.name} name={category.name} value={category.value} tint={category.tint} />)}
                </div>
                <div className="category-note"><span className="note-mark">i</span> Framework-specific weights and thresholds apply.</div>
              </article>

              <article className="panel activity-panel">
                <div className="panel-heading"><div><span className="panel-kicker">ON THE GROUND</span><h2>Recent activity</h2></div><button className="icon-button subtle-icon" aria-label="More activity options" onClick={() => selectPage('Inspection')}><Ellipsis size={19} /></button></div>
                <div className="activity-list">{pilot.activity.map(row => <div className="activity-row" key={row.name}>
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
          </> : activePage === 'Sesi Pembelajaran' ? <LearningPage /> : activePage === 'Green construction' ? <GreenConstructionPage onNavigate={selectPage} /> : activePage === 'Rating Tools' ? <RatingToolsPage onBack={() => selectPage('Dashboard')} /> : activePage === 'Tentang aplikasi' ? <AboutInformation onSettings={() => selectPage('Settings')} /> : <ModulePage pageName={activePage} page={page} currentRole={accountRole} onUpload={() => uploadRef.current?.click()} onExport={exportReport} onNavigate={selectPage} />}
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

const constructionLessons = [
  {
    code: '01',
    title: 'Pengelolaan lingkungan & rencana kerja',
    icon: ClipboardCheck,
    summary: 'Siapkan rencana pengelolaan lingkungan sebelum pekerjaan dimulai, tentukan penanggung jawab, area berisiko, dan cara menanggapi temuan.',
    actions: ['Petakan pekerjaan yang berpotensi berdampak pada lingkungan sekitar.', 'Tetapkan penanggung jawab, jalur pelaporan, dan jadwal inspeksi.', 'Sosialisasikan prosedur tanggap darurat dan keluhan kepada pekerja.'],
    evidence: 'Rencana pengelolaan lingkungan, daftar penanggung jawab, catatan toolbox meeting, dan log keluhan.',
  },
  {
    code: '02',
    title: 'Pengendalian debu & kualitas udara',
    icon: Activity,
    summary: 'Kurangi debu dari pembongkaran, pemotongan, jalan proyek, dan pemindahan material agar tidak menyebar ke area kerja maupun lingkungan sekitar.',
    actions: ['Gunakan penyiraman atau penutup pada sumber debu sesuai kondisi pekerjaan.', 'Tutup muatan dan simpan material berdebu di area yang terlindungi.', 'Periksa batas tapak dan jalur kendaraan; tindak lanjuti debu yang terlihat.'],
    evidence: 'Checklist inspeksi debu, foto tindakan pengendalian, log penyiraman, dan catatan keluhan atau tindak lanjut.',
  },
  {
    code: '03',
    title: 'Kebisingan & getaran',
    icon: Activity,
    summary: 'Rencanakan pekerjaan bising, komunikasikan jadwalnya, dan pantau gangguan yang berpotensi memengaruhi pekerja maupun tetangga proyek.',
    actions: ['Identifikasi mesin dan pekerjaan dengan tingkat kebisingan atau getaran tinggi.', 'Atur waktu kerja dan gunakan penghalang atau perawatan peralatan bila sesuai.', 'Catat hasil pemantauan, keluhan, dan tindakan korektif.'],
    evidence: 'Jadwal pekerjaan bising, log pengukuran bila dilakukan, foto penghalang, dan register keluhan.',
  },
  {
    code: '04',
    title: 'Air hujan, erosi & limpasan',
    icon: Droplets,
    summary: 'Kendalikan tanah terbuka, sedimen, dan limpasan agar tidak membawa lumpur atau pencemar ke saluran dan lahan sekitar.',
    actions: ['Periksa saluran sementara, inlet, dan batas area tanah terbuka sebelum hujan.', 'Sediakan pengendali sedimen yang sesuai dengan kondisi tapak dan rawat secara berkala.', 'Periksa saluran keluar setelah hujan dan bersihkan sedimen dengan aman.'],
    evidence: 'Peta titik limpasan, checklist sebelum/sesudah hujan, foto pengendali sedimen, dan log pembersihan.',
  },
  {
    code: '05',
    title: 'Limbah & material konstruksi',
    icon: Recycle,
    summary: 'Kurangi limbah sejak perencanaan, pisahkan material di sumbernya, lalu catat alur penggunaan kembali, daur ulang, dan pembuangan.',
    actions: ['Sediakan area dan label pemilahan yang mudah dipahami pekerja.', 'Lindungi material agar tidak rusak oleh cuaca, air, atau penyimpanan yang kurang tepat.', 'Verifikasi tujuan pengangkutan dan simpan catatan kuantitas setiap aliran limbah.'],
    evidence: 'Rencana pengelolaan limbah, log berat/volume, bukti serah terima, serta foto pemilahan dan penyimpanan.',
  },
  {
    code: '06',
    title: 'Energi, air & perlindungan pekerja',
    icon: Zap,
    summary: 'Pantau sumber daya sementara di lokasi dan pastikan pengendalian lingkungan berjalan bersama praktik kerja yang aman.',
    actions: ['Catat penggunaan energi dan air sementara secara berkala dengan satuan yang konsisten.', 'Periksa kebocoran, pemakaian tidak perlu, dan penempatan bahan bakar atau bahan kimia.', 'Koordinasikan pengendalian lingkungan dengan prosedur keselamatan kerja di lokasi.'],
    evidence: 'Catatan meter, log inspeksi, bukti perawatan, daftar briefing, dan laporan tindak lanjut.',
  },
]

const smartBuildingTopics = [
  {
    code: '01',
    title: 'Konsep bangunan cerdas',
    icon: Building2,
    summary: 'Bangunan cerdas menghubungkan kebutuhan pengguna, sistem bangunan, dan informasi operasional agar kinerja dapat dipantau dan dikelola secara lebih terpadu.',
    details: ['Tentukan tujuan bangunan dan kebutuhan penggunanya sejak tahap perencanaan.', 'Petakan sistem dan pihak yang perlu berkoordinasi selama perancangan, pembangunan, dan operasi.', 'Gunakan indikator yang terukur untuk mengevaluasi hasil; hindari klaim kinerja tanpa data.'],
  },
  {
    code: '02',
    title: 'Desain terintegrasi',
    icon: Boxes,
    summary: 'Koordinasi lintas disiplin membantu memastikan rancangan arsitektur, struktur, utilitas, dan teknologi bekerja menuju kebutuhan proyek yang sama.',
    details: ['Libatkan perwakilan desain, konstruksi, operasi, dan pengguna dalam koordinasi kebutuhan.', 'Dokumentasikan antarmuka sistem, tanggung jawab, serta kebutuhan ruang dan utilitas.', 'Tinjau konsistensi keputusan desain dan rencana pengujian sebelum konstruksi.'],
  },
  {
    code: '03',
    title: 'Sistem dan otomasi gedung',
    icon: Cpu,
    summary: 'Sistem teknis dapat dipantau dan dikendalikan dengan otomasi yang sesuai fungsi bangunan, prioritas layanan, serta kemampuan pengelola.',
    details: ['Inventarisasi sistem yang dikelola dan data yang diperlukan untuk operasi.', 'Tetapkan fungsi kontrol, kondisi operasi, prioritas alarm, dan penanggung jawabnya.', 'Pastikan antarmuka antar sistem diuji dan proses kendali manual tetap dipahami operator.'],
  },
  {
    code: '04',
    title: 'Energi dan sumber daya',
    icon: Zap,
    summary: 'Pengukuran dan tinjauan berkala membantu tim memahami pemakaian energi dan sumber daya serta mengidentifikasi peluang perbaikan.',
    details: ['Tetapkan baseline, periode pelaporan, satuan, dan batas pengukuran yang konsisten.', 'Pantau pemakaian terhadap jadwal dan fungsi ruang; telusuri anomali sebelum mengambil tindakan.', 'Hubungkan perubahan operasi dengan evaluasi dampak dan catatan tindak lanjut.'],
  },
  {
    code: '05',
    title: 'Pemantauan dan data',
    icon: Radio,
    summary: 'Data sensor dan sistem membantu menyajikan kondisi bangunan, asalkan kualitas, konteks, dan akses datanya dikelola dengan baik.',
    details: ['Catat asal data, satuan, interval pembacaan, lokasi sensor, dan batas keandalannya.', 'Tentukan prosedur penanganan data hilang, nilai tidak wajar, dan gangguan komunikasi.', 'Batasi akses berdasarkan tanggung jawab serta simpan perubahan konfigurasi yang penting.'],
  },
  {
    code: '06',
    title: 'Kenyamanan dan operasi',
    icon: Activity,
    summary: 'Teknologi perlu mendukung kenyamanan, keselamatan, aksesibilitas, dan kemudahan operasi—bukan menambah kerumitan bagi penghuni maupun pengelola.',
    details: ['Libatkan kebutuhan penghuni dan operator ketika menentukan skenario operasi.', 'Rencanakan commissioning, serah terima informasi, pelatihan, dan pemeliharaan sistem.', 'Tinjau umpan balik pengguna dan kinerja aktual untuk perbaikan berkelanjutan.'],
  },
]

const greenBuildingTopics = [
  {
    code: '01',
    title: 'Pengertian BGH',
    icon: Leaf,
    summary: 'Bangunan Gedung Hijau (BGH) adalah bangunan yang memenuhi Standar Teknis Bangunan Gedung dan memiliki kinerja terukur dalam penghematan energi, air, serta sumber daya lain sesuai fungsi, klasifikasi, dan tahap penyelenggaraannya.',
    details: ['Penilaian memperhatikan kinerja dan pemenuhan standar teknis, bukan sekadar penggunaan label “hijau”.', 'Prinsip BGH perlu diterapkan sesuai fungsi bangunan dan tahap penyelenggaraannya.', 'Permen PUPR No. 21 Tahun 2021 juga mengatur H2M dan Kawasan Hijau dengan lingkup penilaian tersendiri.'],
  },
  {
    code: '02',
    title: 'Ordo dan kategori penilaian',
    icon: Building2,
    summary: 'Peraturan membedakan objek berdasarkan bangunan baru atau yang sudah ada, kategori wajib atau disarankan, serta objek H2M dan Kawasan Hijau.',
    details: ['Ordo meliputi bangunan baru dan bangunan yang sudah ada—masing-masing kategori wajib (mandatory) atau disarankan (recommended).', 'H2M, Kawasan Hijau baru, dan Kawasan Hijau yang sudah ada juga memiliki daftar penilaian tersendiri.', 'Kategori wajib berlaku untuk klasifikasi dan ambang luas tertentu; pastikan klasifikasi, luas, dan ketentuan Pasal 2 diperiksa sebelum menentukan ordo proyek.'],
  },
  {
    code: '03',
    title: 'Tahap penyelenggaraan',
    icon: CalendarDays,
    summary: 'Tahap yang dinilai bergantung pada objek. Bangunan baru dan bangunan yang sudah ada tidak menggunakan urutan maupun daftar simak yang sama.',
    details: ['Bangunan baru dinilai pada perencanaan teknis, pelaksanaan konstruksi, pemanfaatan, dan pembongkaran.', 'Bangunan yang sudah ada dinilai pada pemanfaatan dan pembongkaran; penilaian pemanfaatan mencakup perencanaan teknis serta konstruksi pengubahsuaian (retrofitting).', 'H2M dan Kawasan Hijau mengikuti tahapan penilaian masing-masing sebagaimana diatur dalam Pasal 19 dan Pasal 20.'],
  },
  {
    code: '04',
    title: 'Aspek bangunan baru',
    icon: SlidersHorizontal,
    summary: 'Contoh bobot berikut secara khusus adalah daftar simak tahap perencanaan teknis untuk bangunan gedung baru; bukan bobot universal untuk semua ordo atau tahap.',
    details: ['Pengelolaan tapak — 38 poin.', 'Efisiensi penggunaan energi — 46 poin; efisiensi penggunaan air — 22 poin.', 'Kualitas udara dalam ruang — 19 poin; penggunaan material ramah lingkungan — 21 poin.', 'Pengelolaan sampah — 7 poin; pengelolaan air limbah — 12 poin.', 'Jumlah daftar simak perencanaan teknis bangunan baru tersebut adalah 165 poin. Kriteria dan poin tahap lain harus memakai daftar simak yang sesuai.'],
  },
  {
    code: '05',
    title: 'Peringkat kinerja BGH',
    icon: Gauge,
    summary: 'Lampiran penilaian menggunakan tiga peringkat sertifikat: Pratama, Madya, dan Utama. Ambang persentasenya harus dibaca bersama daftar simak dan konteks penilaian yang berlaku.',
    details: ['Pratama: 45%–65%.', 'Madya: lebih dari 65% sampai dengan 80%.', 'Utama: lebih dari 80% sampai dengan 100%.', 'Persentase bukan skor universal yang dapat langsung diterapkan pada semua objek dan tahap. Periksa ordo, tahap, parameter, serta daftar simak resmi yang relevan.'],
  },
  {
    code: '06',
    title: 'Penilaian dan bukti',
    icon: ClipboardCheck,
    summary: 'Penilaian dilakukan secara kuantitatif terhadap pemenuhan Standar Teknis BGH dengan parameter dan kriteria yang ditetapkan. Bukti perlu sesuai dengan tahap penilaian.',
    details: ['Pemilik atau pengelola dapat melakukan penilaian mandiri dengan pendampingan Tim Profesi Ahli (TPA) untuk ordo yang disarankan.', 'Verifikasi independen dilakukan oleh perseorangan atau badan usaha yang memiliki kompetensi dan sertifikat terkait.', 'Gunakan daftar simak dan dokumen tahap yang tepat; simpan gambar, laporan, catatan operasi, hasil pemeriksaan, dan bukti lain yang diminta.', 'Penilaian internal AGUS tidak menggantikan verifikasi, penetapan peringkat, atau sertifikat dari pihak berwenang.'],
  },
]

function GreenBuildingPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [selectedTopic, setSelectedTopic] = useState(0)
  const topic = greenBuildingTopics[selectedTopic]
  const TopicIcon = topic.icon
  const regulations = [
    {
      title: 'Permen PUPR No. 21 Tahun 2021',
      description: 'Penilaian Kinerja Bangunan Gedung Hijau',
      reference: 'Berita Negara Republik Indonesia Tahun 2021 Nomor 313',
      url: 'https://peraturan.bpk.go.id/Read/211361/Permen%20PUPR_21_2021.pdf',
    },
  ]

  return <>
    <div className="page-heading module-heading smart-building-heading green-building-heading">
      <div><div className="overline"><span className="live-pulse" /> GREEN BUILDING · MATERI REGULASI</div><h1>Memahami kinerja Bangunan Gedung Hijau<span className="heading-period">.</span></h1><p>Ringkasan pembelajaran berdasarkan Permen PUPR No. 21 Tahun 2021.</p></div>
      <div className="heading-actions"><button className="button" onClick={() => onNavigate('Dashboard')}><ArrowLeft size={14} /> Kembali ke halaman utama</button><a className="button button-primary" href="#green-building-regulations"><FileText size={14} /> Daftar peraturan <ArrowDownRight size={13} /></a></div>
    </div>
    <div className="module-disclaimer green-building-disclaimer"><ShieldCheck size={16} /><span>Materi ini merupakan ringkasan edukasi, bukan kutipan lengkap, penetapan kepatuhan, atau sertifikat BGH. Ketentuan, ambang, dan daftar simak dapat berbeda menurut objek serta tahap penilaian. Periksa naskah resmi dan konfirmasi ketentuan terkini kepada instansi berwenang.</span></div>
    <section className="panel green-building-regulations" id="green-building-regulations" aria-labelledby="green-building-regulations-title">
      <div className="green-building-regulations-heading"><div><span className="panel-kicker">RUJUKAN RESMI</span><h2 id="green-building-regulations-title">Peraturan &amp; dokumen acuan</h2><p>Pilih tombol untuk membuka naskah peraturan pada Database Peraturan JDIH BPK.</p></div><span className="green-building-regulation-count">{regulations.length} peraturan</span></div>
      <div className="green-building-regulation-list">{regulations.map(regulation => <article className="green-building-regulation" key={regulation.title}>
        <span className="green-building-regulation-icon"><FileText size={18} /></span>
        <div className="green-building-regulation-copy"><span className="panel-kicker">PERATURAN UTAMA</span><h3>{regulation.title}</h3><p>{regulation.description}</p><small>{regulation.reference} · Sumber: JDIH BPK</small></div>
        <a className="button green-building-regulation-button" href={regulation.url} target="_blank" rel="noreferrer">Buka peraturan <ExternalLink size={14} /></a>
      </article>)}</div>
      <div className="green-building-regulations-note"><ShieldCheck size={14} /><span>Daftar ini memuat peraturan yang dirujuk pada materi AGUS. Periksa status, perubahan, dan ketentuan terbaru langsung pada JDIH BPK sebelum digunakan sebagai acuan proyek.</span></div>
    </section>
    <section className="construction-overview" aria-label="Ringkasan materi Green Building">
      <article><span>TOPIK REGULASI</span><strong>{greenBuildingTopics.length}</strong><small>Menu materi belajar</small></article>
      <article><span>CONTOH DAFTAR SIMAK</span><strong>165 poin</strong><small>Bangunan baru · perencanaan teknis</small></article>
      <article><span>ACUAN</span><strong>Permen PUPR 21/2021</strong><small>Penilaian kinerja BGH</small></article>
    </section>
    <section className="smart-building-layout" aria-label="Materi Green Building">
      <nav className="panel construction-menu" aria-label="Menu materi Green Building">
        <div className="construction-menu-heading"><span className="panel-kicker">MENU MATERI</span><h2>Topik belajar</h2><p>Pilih topik untuk membaca ringkasan dan poin rujukannya.</p></div>
        <div className="construction-lesson-list">{greenBuildingTopics.map((item, index) => {
          const ItemIcon = item.icon
          return <button key={item.code} className={`construction-lesson ${selectedTopic === index ? 'construction-lesson-active' : ''}`} aria-current={selectedTopic === index ? 'page' : undefined} onClick={() => setSelectedTopic(index)}>
            <span className="construction-lesson-index">{item.code}</span><span className="construction-lesson-copy"><strong>{item.title}</strong><small>Permen PUPR 21/2021</small></span><ItemIcon size={15} />
          </button>
        })}</div>
        <div className="construction-menu-footer"><BookOpen size={14} /><span>BGH · Permen PUPR 21/2021</span></div>
      </nav>
      <article className="panel smart-building-detail">
        <div className="construction-detail-top"><span className="construction-topic-icon"><TopicIcon size={18} /></span><span className="learning-tag">TOPIK {topic.code}</span></div>
        <h2>{topic.title}</h2><p className="construction-summary">{topic.summary}</p>
        <span className="panel-kicker construction-action-label">RINGKASAN RUJUKAN</span>
        <ul className="smart-building-points">{topic.details.map(point => <li key={point}><span><Check size={12} /></span>{point}</li>)}</ul>
      </article>
    </section>
    <div className="construction-footer-note"><ShieldCheck size={15} /><span>Skor atau ringkasan di AGUS bukan keputusan sertifikasi resmi. Untuk penerapan proyek, cocokkan kategori, tahap, klasifikasi, dan luas bangunan dengan daftar simak resmi serta regulasi yang berlaku.</span></div>
  </>
}

function SmartBuildingPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [selectedTopic, setSelectedTopic] = useState(0)
  const topic = smartBuildingTopics[selectedTopic]
  const TopicIcon = topic.icon

  return <>
    <div className="page-heading module-heading smart-building-heading">
      <div><div className="overline"><span className="live-pulse" /> BANGUNAN CERDAS · MATERI PENGANTAR</div><h1>Bangunan yang terhubung dan responsif<span className="heading-period">.</span></h1><p>Menu belajar untuk memahami integrasi sistem, data, dan operasi bangunan.</p></div>
      <div className="heading-actions"><button className="button" onClick={() => onNavigate('Dashboard')}><ArrowLeft size={14} /> Kembali ke halaman utama</button><a className="button button-primary" href="https://ikn.go.id/storage/pedoman-bangunan-cerdas-nusantara.pdf" target="_blank" rel="noreferrer"><FileText size={14} /> Buka pedoman IKN <ExternalLink size={13} /></a></div>
    </div>
    <div className="module-disclaimer smart-building-disclaimer"><ShieldCheck size={16} /><span>Ringkasan ini adalah materi pengantar AGUS, bukan kutipan atau daftar persyaratan resmi. Akses otomatis ke PDF sumber sedang dibatasi; verifikasi setiap kriteria, ukuran teknis, dan ketentuan langsung pada <a href="https://ikn.go.id/storage/pedoman-bangunan-cerdas-nusantara.pdf" target="_blank" rel="noreferrer">Pedoman Bangunan Cerdas Nusantara dari IKN</a> sebelum digunakan sebagai acuan proyek.</span></div>
    <section className="construction-overview" aria-label="Ringkasan materi Bangunan Cerdas">
      <article><span>TOPIK PENGANTAR</span><strong>{smartBuildingTopics.length}</strong><small>Menu materi belajar</small></article>
      <article><span>CAKUPAN</span><strong>Sistem · Data · Operasi</strong><small>Perspektif umum bangunan cerdas</small></article>
      <article><span>SUMBER UTAMA</span><strong>Pedoman IKN</strong><small>Dokumen resmi untuk verifikasi</small></article>
    </section>
    <section className="smart-building-layout">
      <nav className="panel construction-menu" aria-label="Menu materi Bangunan Cerdas">
        <div className="construction-menu-heading"><span className="panel-kicker">MENU MATERI</span><h2>Topik belajar</h2><p>Pilih topik untuk membaca ringkasan pengantar.</p></div>
        <div className="construction-lesson-list">{smartBuildingTopics.map((item, index) => {
          const ItemIcon = item.icon
          return <button key={item.code} className={`construction-lesson ${selectedTopic === index ? 'construction-lesson-active' : ''}`} aria-current={selectedTopic === index ? 'page' : undefined} onClick={() => setSelectedTopic(index)}>
            <span className="construction-lesson-index">{item.code}</span><span className="construction-lesson-copy"><strong>{item.title}</strong><small>Materi pengantar</small></span><ItemIcon size={15} />
          </button>
        })}</div>
        <div className="construction-menu-footer"><BookOpen size={14} /><span>Bangunan cerdas · AGUS</span></div>
      </nav>
      <article className="panel smart-building-detail">
        <div className="construction-detail-top"><span className="construction-topic-icon"><TopicIcon size={18} /></span><span className="learning-tag">TOPIK {topic.code}</span></div>
        <h2>{topic.title}</h2><p className="construction-summary">{topic.summary}</p>
        <span className="panel-kicker construction-action-label">POIN PEMBELAJARAN</span>
        <ul className="smart-building-points">{topic.details.map(point => <li key={point}><span><Check size={12} /></span>{point}</li>)}</ul>
        <div className="construction-evidence smart-building-source"><span><FileText size={15} /> DOKUMEN RUJUKAN</span><p>Pedoman Bangunan Cerdas Nusantara — Otorita Ibu Kota Nusantara. Gunakan dokumen resmi untuk memeriksa isi, ruang lingkup, dan ketentuan teknis.</p><a className="button" href="https://ikn.go.id/storage/pedoman-bangunan-cerdas-nusantara.pdf" target="_blank" rel="noreferrer"><ExternalLink size={14} /> Buka PDF resmi</a></div>
      </article>
    </section>
    <div className="construction-footer-note"><ShieldCheck size={15} /><span>Materi ini bersifat pengantar dan tidak menetapkan spesifikasi, ambang kinerja, atau kepatuhan. Gunakan versi pedoman resmi yang berlaku serta koordinasikan persyaratan proyek dengan tenaga ahli terkait.</span></div>
  </>
}

function GreenConstructionPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [selectedLesson, setSelectedLesson] = useState(0)
  const [completedActions, setCompletedActions] = useState<string[]>([])
  const lesson = constructionLessons[selectedLesson]
  const LessonIcon = lesson.icon
  const completedCount = constructionLessons.reduce((sum, item) => sum + item.actions.filter(action => completedActions.includes(`${item.code}:${action}`)).length, 0)
  const totalActions = constructionLessons.reduce((sum, item) => sum + item.actions.length, 0)

  function toggleAction(action: string) {
    const actionId = `${lesson.code}:${action}`
    setCompletedActions(current => current.includes(actionId)
      ? current.filter(completedAction => completedAction !== actionId)
      : [...current, actionId])
  }

  return <>
    <div className="page-heading module-heading construction-heading">
      <div><div className="overline"><span className="live-pulse" /> GREEN CONSTRUCTION · PANDUAN LAPANGAN</div><h1>Praktik konstruksi yang bertanggung jawab<span className="heading-period">.</span></h1><p>Materi kerja lapangan untuk mengurangi dampak lingkungan dan menata bukti pelaksanaan.</p></div>
      <div className="heading-actions"><button className="button" onClick={() => onNavigate('Dashboard')}><ArrowLeft size={14} /> Kembali ke halaman utama</button><button className="button button-primary" onClick={() => onNavigate('Inspection')}><Camera size={15} /> Buka inspeksi</button></div>
    </div>
    <div className="module-disclaimer construction-disclaimer"><ShieldCheck size={16} /><span>Materi ini merupakan panduan pembelajaran internal. Sesuaikan tindakan dengan metode kerja, risiko, persetujuan proyek, serta regulasi dan panduan resmi terkini yang berlaku di lokasi.</span></div>
    <section className="construction-overview" aria-label="Ringkasan materi Green Construction">
      <article><span>TOPIK LAPANGAN</span><strong>{constructionLessons.length}</strong><small>Menu materi praktis</small></article>
      <article><span>LANGKAH TINDAKAN</span><strong>{completedCount}<small> / {totalActions}</small></strong><small>Checklist materi yang ditandai</small></article>
      <article><span>BUKTI PELAKSANAAN</span><strong>Foto · Log · Inspeksi</strong><small>Catat bukti sesuai kegiatan proyek</small></article>
    </section>
    <section className="construction-layout">
      <nav className="panel construction-menu" aria-label="Menu materi Green Construction">
        <div className="construction-menu-heading"><span className="panel-kicker">MENU MATERI</span><h2>Topik lapangan</h2><p>Pilih topik untuk melihat langkah dan bukti yang disarankan.</p></div>
        <div className="construction-lesson-list">{constructionLessons.map((item, index) => {
          const TopicIcon = item.icon
          const done = item.actions.every(action => completedActions.includes(`${item.code}:${action}`))
          return <button key={item.code} className={`construction-lesson ${selectedLesson === index ? 'construction-lesson-active' : ''}`} aria-current={selectedLesson === index ? 'page' : undefined} onClick={() => setSelectedLesson(index)}>
            <span className={`construction-lesson-index ${done ? 'construction-lesson-done' : ''}`}>{done ? <Check size={13} /> : item.code}</span><span className="construction-lesson-copy"><strong>{item.title}</strong><small>{item.actions.filter(action => completedActions.includes(`${item.code}:${action}`)).length} / {item.actions.length} langkah ditandai</small></span><TopicIcon size={15} />
          </button>
        })}</div>
        <div className="construction-menu-footer"><BookOpen size={14} /><span>Materi pembelajaran AGUS</span></div>
      </nav>
      <article className="panel construction-detail">
        <div className="construction-detail-top"><span className="construction-topic-icon"><LessonIcon size={18} /></span><span className="learning-tag">TOPIK {lesson.code}</span></div>
        <h2>{lesson.title}</h2><p className="construction-summary">{lesson.summary}</p>
        <span className="panel-kicker construction-action-label">LANGKAH TINDAKAN</span>
        <div className="construction-action-list">{lesson.actions.map(action => {
          const actionId = `${lesson.code}:${action}`
          const done = completedActions.includes(actionId)
          return <button key={action} className={`construction-action ${done ? 'construction-action-done' : ''}`} aria-pressed={done} onClick={() => toggleAction(action)}><span className="construction-action-check">{done && <Check size={12} strokeWidth={3} />}</span><span>{action}</span></button>
        })}</div>
        <div className="construction-evidence"><span><FileText size={15} /> BUKTI YANG DISARANKAN</span><p>{lesson.evidence}</p><button className="button" onClick={() => onNavigate('Evidence')}><FolderOpen size={14} /> Buka evidence</button></div>
      </article>
    </section>
    <div className="construction-footer-note"><ShieldCheck size={15} /><span>Gunakan hasil inspeksi dan catatan lapangan untuk tindak lanjut. Panduan ini tidak menetapkan ambang kepatuhan atau menggantikan ketentuan resmi.</span></div>
  </>
}

function ModulePage({ pageName, page, currentRole, onUpload, onExport, onNavigate }: { pageName: string; page?: { eyebrow: string; title: string; description: string; stats: string[]; rows: string[] }; currentRole: string; onUpload: () => void; onExport: () => void; onNavigate: (page: string) => void }) {
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
    {pageName === 'Settings' && <section className="role-management"><div className="role-management-heading"><div><span className="panel-kicker">AKSES WORKSPACE</span><h2>Empat peran pengguna</h2><p>Hak akses diambil dari custom claims Firebase dan ditegakkan oleh Firestore Rules.</p></div><span className="role-current">Peran Anda: {currentRole}</span></div><div className="role-card-grid">{Object.entries(agusRoles).map(([role, definition]) => <article className={`role-card ${role === 'super_admin' ? 'role-card-super' : ''}`} key={role}><span className="role-code">{role.replace(/_/g, ' ')}</span><h3>{definition.label}</h3><p>{definition.description}</p></article>)}</div></section>}
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