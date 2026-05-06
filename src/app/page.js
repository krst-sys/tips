import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Calculator,
  CalendarCheck,
  Check,
  ChevronRight,
  CircleDollarSign,
  ClipboardList,
  Gauge,
  LineChart,
  LockKeyhole,
  PieChart,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Trophy,
  WalletCards,
} from "lucide-react";

const menuItems = [
  { label: "Início", href: "#" },
  { label: "Ferramentas", href: "#ferramentas" },
  { label: "Gestão de Banca", href: "#gestao" },
  { label: "Métodos", href: "#metodos" },
  { label: "Resultados", href: "#resultados" },
  { label: "FAQ", href: "#faq" },
];

const quickBenefits = [
  {
    title: "Gestão de Banca",
    desc: "Controle entradas, lucros e prejuízos",
    icon: WalletCards,
  },
  {
    title: "Ferramentas Exclusivas",
    desc: "Calculadoras, métodos e análises práticas",
    icon: Calculator,
  },
  {
    title: "Mais Controle",
    desc: "Decisões menos emocionais e mais estratégicas",
    icon: Gauge,
  },
];

const panelTools = [
  {
    title: "Gestão de Banca",
    desc: "Registre sua banca, entradas, stakes, lucro e prejuízo em um só lugar.",
    icon: WalletCards,
  },
  {
    title: "Calculadora de Stake",
    desc: "Defina valores de entrada com base na sua banca e no seu perfil de risco.",
    icon: Calculator,
  },
  {
    title: "Histórico de Apostas",
    desc: "Acompanhe suas entradas, mercados, odds e desempenho ao longo do tempo.",
    icon: ClipboardList,
  },
  {
    title: "Métodos Exclusivos",
    desc: "Acesse estratégias e modelos práticos para diferentes tipos de apostas.",
    icon: Target,
  },
];

const withoutPanel = [
  "Apostas desorganizadas",
  "Sem controle da banca",
  "Decisões por emoção",
  "Não sabe onde está errando",
  "Dificuldade para medir resultados",
];

const withPanel = [
  "Controle total da banca",
  "Entradas registradas",
  "Métodos organizados",
  "Análise de lucro/prejuízo",
  "Evolução acompanhada",
];

const extraResources = [
  {
    title: "Controle Diário",
    desc: "Registre suas apostas e acompanhe sua evolução dia após dia.",
    icon: CalendarCheck,
  },
  {
    title: "Análise de Desempenho",
    desc: "Veja onde você está lucrando, perdendo e quais mercados performam melhor.",
    icon: BarChart3,
  },
  {
    title: "Biblioteca de Métodos",
    desc: "Acesse métodos exclusivos organizados para consulta rápida.",
    icon: Trophy,
  },
  {
    title: "Área de Planejamento",
    desc: "Monte sua rotina, defina metas e acompanhe sua disciplina.",
    icon: PieChart,
  },
];

const testimonials = [
  {
    initials: "MR",
    name: "Matheus R.",
    city: "São Paulo, SP",
    text: "Antes eu apostava sem controle. Agora consigo ver minha banca, minhas entradas e onde estou errando.",
  },
  {
    initials: "CA",
    name: "Camila A.",
    city: "Rio de Janeiro, RJ",
    text: "O painel me ajudou a organizar minha rotina e parar de apostar no impulso.",
  },
  {
    initials: "LS",
    name: "Lucas S.",
    city: "Belo Horizonte, MG",
    text: "A calculadora de stake e o histórico de apostas fizeram muita diferença na minha gestão.",
  },
];

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-3" aria-label="KRST Tips">
      <span className="relative grid h-11 w-11 place-items-center overflow-hidden rounded-[14px] border border-lime-300/30 bg-[#a8ff2f] text-[24px] font-black italic text-[#061006] shadow-[0_12px_26px_rgba(0,0,0,0.28)]">
        <span className="absolute inset-0 bg-[radial-gradient(circle_at_28%_18%,rgba(255,255,255,0.72),transparent_28%)]" />
        <span className="relative">A</span>
      </span>
      <span className="text-[20px] font-black tracking-[-0.04em] text-white">
        KRST <span className="text-lime-300">TIPS</span>
      </span>
    </Link>
  );
}

function Badge({ children }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-lime-300/22 bg-lime-300/[0.08] px-4 py-2 text-[11px] font-black uppercase tracking-[0.12em] text-lime-300">
      <span className="h-2 w-2 rounded-full bg-lime-300" />
      {children}
    </div>
  );
}

function PrimaryButton({ children, className = "" }) {
  return (
    <Link
      href="/login"
      style={{ color: "#061006", WebkitTextFillColor: "#061006" }}
      className={`inline-flex min-h-14 items-center justify-center gap-2 rounded-[14px] border border-lime-100/40 bg-lime-300 px-8 py-4 text-[14px] font-black uppercase tracking-[0.025em] !text-[#061006] shadow-[0_16px_34px_rgba(0,0,0,0.36),0_0_0_1px_rgba(163,230,53,0.12)] transition duration-300 [text-shadow:none] hover:-translate-y-0.5 hover:bg-[#bef264] hover:shadow-[0_20px_44px_rgba(0,0,0,0.42),0_0_28px_rgba(163,230,53,0.18)] [&_*]:!text-[#061006] ${className}`}
    >
      {children}
      <ArrowRight size={18} strokeWidth={3} />
    </Link>
  );
}

function StatCard({ label, value, accent = "text-white" }) {
  return (
    <div className="rounded-[16px] border border-white/8 bg-white/[0.035] p-4 backdrop-blur sm:rounded-[18px] sm:p-5">
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 sm:text-[11px]">
        {label}
      </p>
      <p
        className={`mt-2 text-[21px] font-black tracking-[-0.04em] sm:text-[27px] ${accent}`}
      >
        {value}
      </p>
    </div>
  );
}

function DashboardMockup() {
  return (
    <div className="relative mx-auto min-h-[920px] w-full max-w-[720px] sm:min-h-[720px] lg:ml-auto lg:min-h-[625px]">
      <div className="absolute inset-0 rounded-[42px] bg-[#0b1623]/65 blur-[54px]" />
      <div className="absolute left-[8%] top-[8%] h-24 w-24 rounded-full border-[7px] border-white/65 bg-[radial-gradient(circle_at_35%_32%,#f7fff1,#bac7b6_55%,#0d120e_56%)] opacity-30 shadow-[0_22px_62px_rgba(0,0,0,0.44)]" />
      <div className="absolute bottom-[16%] right-[2%] h-20 w-20 rounded-full bg-[#d87824] opacity-35 shadow-[inset_-16px_-12px_0_rgba(0,0,0,0.24),0_24px_58px_rgba(0,0,0,0.42)]">
        <span className="absolute inset-y-0 left-1/2 w-[2px] -translate-x-1/2 bg-black/30" />
        <span className="absolute inset-x-0 top-1/2 h-[2px] -translate-y-1/2 bg-black/30" />
      </div>

      <div className="absolute inset-x-0 top-6 overflow-hidden rounded-[30px] border border-white/12 bg-[linear-gradient(145deg,rgba(17,28,41,0.99),rgba(5,10,17,0.98))] p-5 shadow-[0_36px_90px_rgba(0,0,0,0.46)] sm:p-6">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),transparent_36%)]" />

        <div className="relative z-10 flex items-center justify-between gap-5 border-b border-white/8 pb-5">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-lime-300">
              KRST Dashboard
            </p>
            <h3 className="mt-1 text-[23px] font-black tracking-[-0.04em] text-white">
              Área do Apostador
            </h3>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-lime-300/24 bg-lime-300/10 px-3 py-1.5 text-[11px] font-black text-lime-300">
            <span className="h-1.5 w-1.5 rounded-full bg-lime-300" />
            Online
          </div>
        </div>

        <div className="relative z-10 mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatCard label="Banca atual" value="R$ 1.840" accent="text-lime-300" />
          <StatCard label="Resultado do mês" value="+12,8%" accent="text-lime-300" />
          <StatCard label="Taxa de acerto" value="64%" />
        </div>

        <div className="relative z-10 mt-5 grid gap-4 lg:grid-cols-[1fr_210px]">
          <div className="rounded-[24px] border border-white/8 bg-black/20 p-5 sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-400">
                  Últimos 30 dias
                </p>
                <h4 className="mt-1 text-[20px] font-black text-white">
                  Evolução da banca
                </h4>
              </div>
              <LineChart size={24} className="text-lime-300" />
            </div>

            <div className="relative h-[255px] overflow-hidden rounded-[20px] border border-white/8 bg-[#06110d]">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:44px_34px]" />
              <svg
                className="absolute inset-0 h-full w-full"
                viewBox="0 0 420 150"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path
                  d="M0 116 C42 108 48 86 88 92 C128 98 130 58 172 66 C214 74 212 38 258 44 C304 50 304 23 348 28 C382 32 394 20 420 17"
                  fill="none"
                  stroke="#a8ff2f"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
                <path
                  d="M0 116 C42 108 48 86 88 92 C128 98 130 58 172 66 C214 74 212 38 258 44 C304 50 304 23 348 28 C382 32 394 20 420 17 L420 150 L0 150 Z"
                  fill="url(#chartFill)"
                />
                <defs>
                  <linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#a8ff2f" stopOpacity="0.28" />
                    <stop offset="100%" stopColor="#a8ff2f" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-x-4 bottom-3 flex items-center justify-between text-[11px] font-semibold text-slate-500">
                <span>Dia 1</span>
                <span>Dia 15</span>
                <span>Dia 30</span>
              </div>
            </div>

          </div>

          <div className="grid gap-2.5 sm:grid-cols-3 lg:grid-cols-1">
            {[
              ["Stake média", "R$ 18,40", Calculator],
              ["Entradas registradas", "32", ClipboardList],
              ["Métodos ativos", "8", Target],
            ].map(([label, value, Icon]) => (
              <div
                key={label}
                className="flex items-center gap-3 rounded-[16px] border border-white/8 bg-white/[0.035] px-3.5 py-3"
              >
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-[11px] bg-lime-300/10 text-lime-300">
                  <Icon size={18} />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-400">{label}</p>
                  <p className="mt-0.5 text-[15px] font-black text-white">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ title, desc, icon: Icon }) {
  return (
    <article className="group rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,28,40,0.86),rgba(7,12,19,0.97))] p-6 text-left shadow-[0_22px_62px_rgba(0,0,0,0.24)] transition duration-300 hover:-translate-y-1.5 hover:border-lime-300/35">
      <div className="grid h-16 w-16 place-items-center rounded-[18px] border border-lime-300/20 bg-lime-300/10 text-lime-300 transition group-hover:bg-lime-300 group-hover:text-[#061006]">
        <Icon size={31} strokeWidth={2.2} />
      </div>
      <h3 className="mt-7 text-[21px] font-black text-white">{title}</h3>
      <p className="mt-3 text-[14px] leading-[1.7] text-slate-400">{desc}</p>
    </article>
  );
}

function ComparisonCard({ title, items, badge, positive = false }) {
  return (
    <div
      className={`rounded-[26px] border p-6 shadow-[0_22px_65px_rgba(0,0,0,0.24)] ${
        positive
          ? "border-lime-300/48 bg-[linear-gradient(180deg,rgba(19,39,20,0.84),rgba(6,17,13,0.96))]"
          : "border-red-400/20 bg-[linear-gradient(180deg,rgba(32,20,22,0.72),rgba(12,16,23,0.96))]"
      }`}
    >
      <div
        className={`inline-flex rounded-full px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.08em] ${
          positive
            ? "bg-lime-300/14 text-lime-300"
            : "bg-red-500/12 text-red-300"
        }`}
      >
        {title}
      </div>
      <ul className="mt-6 space-y-4">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-3 text-slate-300">
            <span
              className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full ${
                positive
                  ? "bg-lime-300 text-[#061006]"
                  : "bg-red-500/14 text-red-300"
              }`}
            >
              <Check size={15} strokeWidth={3.2} />
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <div
        className={`mt-7 rounded-full px-4 py-2 text-center text-[12px] font-black ${
          positive
            ? "bg-lime-300 text-[#061006]"
            : "bg-red-500/14 text-red-300"
        }`}
      >
        {badge}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#03070d] text-white">
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_16%_6%,rgba(168,255,47,0.055),transparent_30%),radial-gradient(circle_at_88%_14%,rgba(47,144,255,0.055),transparent_28%),linear-gradient(180deg,#06101b_0%,#03070d_44%,#04080e_100%)]" />

      <header className="sticky top-0 z-50 border-b border-white/8 bg-[#050b12]/88 backdrop-blur-xl">
        <div className="mx-auto flex h-[78px] max-w-[1220px] items-center justify-between gap-5 px-5 lg:px-8">
          <Logo />

          <nav className="hidden items-center gap-7 text-[13px] font-bold text-white/70 lg:flex">
            {menuItems.map((item) => (
              <a key={item.label} href={item.href} className="transition hover:text-lime-300">
                {item.label}
              </a>
            ))}
          </nav>

          <PrimaryButton className="hidden min-h-12 px-5 text-[12px] md:inline-flex">
            Acessar painel
          </PrimaryButton>
        </div>
      </header>

      <section className="relative z-10 border-b border-white/8">
        <div className="mx-auto grid max-w-[1300px] items-center gap-12 px-5 py-14 md:py-18 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14 lg:px-8 lg:py-18 xl:gap-18">
          <div className="max-w-[590px]">
            <Badge>Painel completo para apostadores</Badge>

            <h1 className="mt-6 text-[40px] font-black uppercase italic leading-[0.98] tracking-[-0.05em] text-white sm:text-[58px] lg:text-[66px] xl:text-[72px]">
              Aposte com{" "}
              <span className="block text-lime-300">mais controle</span>
            </h1>

            <p className="mt-5 max-w-[540px] text-[16px] leading-[1.7] text-slate-300 sm:text-[17px]">
              Ferramentas, gestão de banca, métodos exclusivos e histórico de
              apostas em um só lugar para você tomar decisões melhores.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3 lg:gap-3 xl:gap-4">
              {quickBenefits.map(({ title, desc, icon: Icon }) => (
                <div
                  key={title}
                  className="group rounded-[18px] border border-white/10 bg-white/[0.05] p-5 shadow-[0_16px_34px_rgba(0,0,0,0.20)] transition duration-300 hover:-translate-y-1 hover:border-lime-300/28 hover:bg-white/[0.07] lg:p-4 xl:p-5"
                >
                  <div className="mb-5 grid h-12 w-12 place-items-center rounded-[14px] border border-lime-300/16 bg-lime-300/10 text-lime-300 transition group-hover:bg-lime-300 group-hover:text-[#061006]">
                    <Icon size={23} strokeWidth={2.4} />
                  </div>
                  <h3 className="text-[16px] font-black leading-tight text-white">
                    {title}
                  </h3>
                  <p className="mt-2 text-[13px] leading-[1.5] text-slate-400">
                    {desc}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <PrimaryButton className="w-full px-8 sm:w-auto">
                Quero acessar o painel
              </PrimaryButton>
              <p className="flex items-center gap-2 text-[13px] font-semibold text-slate-400">
                <LockKeyhole size={17} className="text-lime-300" />
                Acesso imediato • Painel online • Atualizações constantes
              </p>
            </div>
          </div>

          <DashboardMockup />
        </div>
      </section>

      <section id="ferramentas" className="relative z-10 py-20">
        <div className="mx-auto max-w-[1220px] px-5 text-center lg:px-8">
          <Badge>Ferramentas do painel</Badge>
          <h2 className="mx-auto mt-5 max-w-[840px] text-[34px] font-black italic leading-[1.04] tracking-[-0.045em] sm:text-[48px]">
            Tudo que Você Precisa para Apostar com{" "}
            <span className="text-lime-300">Mais Controle</span>
          </h2>
          <p className="mx-auto mt-4 max-w-[650px] text-[16px] leading-[1.65] text-slate-400">
            Recursos práticos para organizar sua rotina, analisar suas apostas e
            melhorar sua gestão.
          </p>

          <div className="mt-11 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {panelTools.map((tool) => (
              <FeatureCard key={tool.title} {...tool} />
            ))}
          </div>
        </div>
      </section>

      <section id="gestao" className="relative z-10 overflow-hidden border-y border-white/8 bg-[#050b12] py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(168,255,47,0.08),transparent_26%),radial-gradient(circle_at_82%_38%,rgba(168,255,47,0.06),transparent_24%)]" />
        <div className="relative mx-auto max-w-[1120px] px-5 lg:px-8">
          <div className="mx-auto max-w-[720px] text-center">
            <Badge>Gestão e clareza</Badge>
            <h2 className="mt-5 text-[35px] font-black italic leading-[1.04] tracking-[-0.045em] sm:text-[50px]">
              Pare de Apostar no <span className="text-lime-300">Escuro</span>
            </h2>
          </div>

          <div className="mt-11 grid items-stretch gap-5 lg:grid-cols-[1fr_auto_1fr]">
            <ComparisonCard
              title="Sem painel"
              items={withoutPanel}
              badge="Pouco controle"
            />

            <div className="hidden place-items-center lg:grid">
              <div className="grid h-14 w-14 place-items-center rounded-full border border-lime-300/32 bg-lime-300/12 text-lime-300 shadow-[0_0_34px_rgba(168,255,47,0.18)]">
                <ChevronRight size={34} strokeWidth={3} />
              </div>
            </div>

            <ComparisonCard
              title="Com painel"
              items={withPanel}
              badge="Mais clareza e estratégia"
              positive
            />
          </div>
        </div>
      </section>

      <section id="metodos" className="relative z-10 overflow-hidden py-20">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,11,18,0)_0%,rgba(8,15,23,0.50)_48%,rgba(5,11,18,0)_100%)]" />

        <div className="relative mx-auto max-w-[1220px] px-5 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
            <div className="pt-2">
              <Badge>Rotina organizada</Badge>

              <h2 className="mt-5 max-w-[470px] text-[35px] font-black italic leading-[1.04] tracking-[-0.05em] text-white sm:text-[48px]">
                Organize sua operação com mais critério
              </h2>

              <p className="mt-5 max-w-[440px] text-[16px] leading-[1.75] text-slate-400">
                Centralize as informações da sua rotina de apostas em um
                ambiente mais fácil de acompanhar, revisar e ajustar.
              </p>

              <div className="mt-8 space-y-4 border-l border-white/10 pl-5">
                {[
                  "Banca, entradas e desempenho no mesmo contexto.",
                  "Métodos e critérios disponíveis antes de cada decisão.",
                  "Histórico para revisar padrões sem depender de memória.",
                ].map((item) => (
                  <p key={item} className="text-[14px] leading-[1.6] text-slate-300">
                    {item}
                  </p>
                ))}
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[34px] border border-white/10 bg-[linear-gradient(145deg,rgba(13,22,34,0.92),rgba(4,8,14,0.98))] shadow-[0_28px_80px_rgba(0,0,0,0.32)]">
              <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(163,230,53,0.38),transparent)]" />
              <div className="absolute right-[-120px] top-[-120px] h-[280px] w-[280px] rounded-full bg-lime-300/7 blur-3xl" />

              <div className="relative z-10 border-b border-white/8 px-6 py-5 lg:px-7">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.14em] text-lime-300">
                      Resumo da operação
                    </p>
                    <h3 className="mt-2 text-[24px] font-black tracking-[-0.04em] text-white">
                      Painel do apostador
                    </h3>
                  </div>

                  <div className="flex gap-2 text-[11px] font-bold text-slate-400">
                    <span className="rounded-full bg-white/[0.055] px-3 py-1.5">
                      Hoje
                    </span>
                    <span className="rounded-full bg-lime-300 px-3 py-1.5 text-[#061006]">
                      Em controle
                    </span>
                  </div>
                </div>
              </div>

              <div className="relative z-10 grid lg:grid-cols-[1fr_260px]">
                <div className="px-6 py-6 lg:px-7">
                  <div className="grid gap-6 md:grid-cols-3">
                    {[
                      ["Banca", "R$ 1.840", "saldo atualizado"],
                      ["Entradas", "32", "registradas"],
                      ["Métodos", "6", "em uso"],
                    ].map(([label, value, note]) => (
                      <div key={label}>
                        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
                          {label}
                        </p>
                        <p className="mt-2 text-[26px] font-black tracking-[-0.05em] text-white">
                          {value}
                        </p>
                        <p className="mt-1 text-[12px] text-lime-300">{note}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-7 overflow-hidden rounded-[22px] border border-white/8 bg-black/20">
                    {[
                      [
                        "Gestão de banca centralizada",
                        "Saldo, movimentações e resultado ficam conectados.",
                      ],
                      [
                        "Histórico com contexto",
                        "Mercado, odd, stake, método e observações no registro.",
                      ],
                      [
                        "Decisão mais consistente",
                        "Critérios e desempenho ficam visíveis antes da próxima entrada.",
                      ],
                    ].map(([title, desc], index) => (
                      <div
                        key={title}
                        className={`flex gap-4 px-5 py-4 ${
                          index !== 0 ? "border-t border-white/8" : ""
                        }`}
                      >
                        <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-lime-300" />
                        <div>
                          <h4 className="text-[15px] font-black text-white">
                            {title}
                          </h4>
                          <p className="mt-1.5 text-[13px] leading-[1.6] text-slate-400">
                            {desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-white/8 bg-white/[0.025] px-6 py-6 lg:border-l lg:border-t-0">
                  <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">
                    Próxima revisão
                  </p>

                  <div className="mt-5 space-y-4">
                    {[
                      ["Stake média", "1,2%"],
                      ["Mercado foco", "Over/BTTS"],
                      ["Última análise", "Hoje"],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <p className="text-[12px] text-slate-500">{label}</p>
                        <p className="mt-1 text-[17px] font-black text-white">
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-7 rounded-[18px] bg-lime-300/[0.08] p-4">
                    <p className="text-[13px] font-bold leading-[1.6] text-slate-200">
                      A ideia não é apostar mais. É acompanhar melhor o que já
                      faz parte da sua rotina.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 border-y border-white/8 bg-[#050b12] py-20">
        <div className="mx-auto max-w-[1220px] px-5 lg:px-8">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <Badge>Rotina do apostador</Badge>
              <h2 className="mt-5 max-w-[780px] text-[34px] font-black italic leading-[1.04] tracking-[-0.045em] sm:text-[48px]">
                Recursos que Ajudam na{" "}
                <span className="text-lime-300">Rotina do Apostador</span>
              </h2>
            </div>
            <p className="max-w-[390px] text-[15px] leading-[1.65] text-slate-400">
              Organização, histórico e análise para transformar informação em
              decisões mais planejadas.
            </p>
          </div>

          <div className="mt-11 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {extraResources.map((resource) => (
              <FeatureCard key={resource.title} {...resource} />
            ))}
          </div>
        </div>
      </section>

      <section id="resultados" className="relative z-10 py-20">
        <div className="mx-auto max-w-[1220px] px-5 text-center lg:px-8">
          <Badge>Resultados com clareza</Badge>
          <h2 className="mx-auto mt-5 max-w-[820px] text-[34px] font-black italic leading-[1.04] tracking-[-0.045em] sm:text-[48px]">
            Quem Usa o Painel Tem{" "}
            <span className="text-lime-300">Mais Clareza nas Apostas</span>
          </h2>

          <div className="mt-11 grid gap-4 lg:grid-cols-3">
            {testimonials.map((item) => (
              <article
                key={item.name}
                className="rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,27,39,0.86),rgba(8,13,20,0.96))] p-6 text-left shadow-[0_22px_60px_rgba(0,0,0,0.22)] transition duration-300 hover:-translate-y-1 hover:border-lime-300/28"
              >
                <div className="flex items-center gap-4">
                  <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full border border-lime-200/25 bg-lime-300 text-[17px] font-black text-[#061006]">
                    {item.initials}
                  </div>
                  <div>
                    <h3 className="text-[18px] font-black text-white">
                      {item.name}
                    </h3>
                    <p className="text-[13px] text-slate-500">{item.city}</p>
                  </div>
                </div>
                <div className="mt-5 flex gap-1 text-amber-400">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} size={17} fill="currentColor" />
                  ))}
                </div>
                <p className="mt-5 text-[15px] leading-[1.75] text-slate-300">
                  “{item.text}”
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="relative z-10 px-5 pb-16 lg:px-8">
        <div className="mx-auto grid max-w-[1160px] gap-8 overflow-hidden rounded-[30px] border border-lime-300/38 bg-[linear-gradient(135deg,rgba(14,34,17,0.86),rgba(5,11,18,0.98)_50%,rgba(11,21,31,0.96))] p-7 shadow-[0_0_86px_rgba(168,255,47,0.11)] lg:grid-cols-[1fr_320px] lg:p-10">
          <div>
            <Badge>Área do apostador</Badge>
            <h2 className="mt-5 text-[34px] font-black italic leading-[1.04] tracking-[-0.045em] sm:text-[50px]">
              Pronto para Apostar com{" "}
              <span className="text-lime-300">Mais Controle?</span>
            </h2>
            <p className="mt-4 max-w-[670px] text-[16px] leading-[1.7] text-slate-300">
              Tenha acesso ao painel completo e organize sua banca, métodos e
              resultados em um só lugar.
            </p>
            <PrimaryButton className="mt-7 w-full sm:w-auto">
              Acessar painel agora
            </PrimaryButton>
            <p className="mt-4 text-[13px] font-semibold text-slate-400">
              Acesso imediato • Painel online • Atualizações constantes
            </p>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-black/24 p-6">
            <div className="grid h-14 w-14 place-items-center rounded-[18px] bg-lime-300/12 text-lime-300">
              <ShieldCheck size={31} strokeWidth={2.2} />
            </div>
            <h3 className="mt-6 text-[24px] font-black text-white">
              Acesso ao Painel
            </h3>
            <p className="mt-3 text-[15px] leading-[1.65] text-slate-400">
              Comece a organizar suas apostas hoje mesmo
            </p>
            <div className="mt-7 flex items-center gap-2 rounded-[16px] border border-lime-300/18 bg-lime-300/8 px-4 py-3 text-[13px] font-bold text-lime-200">
              <Sparkles size={17} />
              Dashboard liberado na hora
            </div>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/8 bg-[#03070d] py-7">
        <div className="mx-auto flex max-w-[1220px] flex-col items-center justify-between gap-5 px-5 text-[13px] text-slate-500 lg:flex-row lg:px-8">
          <Logo />
          <p>© 2024 KRST Tips. Todos os direitos reservados.</p>
          <div className="flex gap-6">
            <a href="#" className="transition hover:text-lime-300">
              Termos de Uso
            </a>
            <a href="#" className="transition hover:text-lime-300">
              Política de Privacidade
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
