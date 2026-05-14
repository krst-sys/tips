import Link from "next/link";
import AnimatedNumber from "@/components/AnimatedNumber";
import LandingReveal from "@/components/LandingReveal";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import {
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  CalendarDays,
  Check,
  ChevronDown,
  ClipboardList,
  CreditCard,
  Gem,
  Home as HomeIcon,
  LineChart,
  Mail,
  PieChart,
  Play,
  ShieldCheck,
  TrendingUp,
  Users,
  WalletCards,
} from "lucide-react";

const navItems = ["Produto", "Recursos", "Comunidade", "Planos", "FAQ"];

const modules = [
  {
    title: "Dashboard",
    desc: "Visão geral do desempenho e da sua jornada.",
    icon: HomeIcon,
    featured: true,
  },
  {
    title: "Banca",
    desc: "Controle e evolução da sua banca.",
    icon: WalletCards,
  },
  {
    title: "Estatísticas",
    desc: "Métricas que importam para suas decisões.",
    icon: BarChart3,
  },
  {
    title: "Próximos Jogos",
    desc: "Acompanhe jogos e oportunidades.",
    icon: CalendarDays,
  },
  {
    title: "Progressão",
    desc: "Simule cenários e planeje sua evolução.",
    icon: TrendingUp,
  },
];

const plans = [
  {
    title: "Grátis",
    note: "Para testar a plataforma.",
    price: "R$ 0,00",
    period: "",
    sub: "Sem custo inicial",
    button: "Começar grátis",
  },
  {
    title: "Mensal",
    note: "Acesso completo, sem fidelidade.",
    price: "R$ 9,99",
    period: "/mês",
    button: "Escolher plano",
  },
  {
    title: "Anual",
    note: "Melhor custo-benefício.",
    price: "R$ 89,99",
    period: "/ano",
    sub: "R$ 7,50 /mês",
    button: "Escolher plano",
    featured: true,
  },
];

const faqs = [
  {
    question: "O que é o Filtto?",
    answer:
      "O Filtto é uma plataforma de gestão para apostadores esportivos. Ele ajuda você a controlar sua banca, registrar entradas, acompanhar métricas e organizar sua evolução em um só lugar.",
  },
  {
    question: "Meus dados e resultados são seguros?",
    answer:
      "Sim. Seus registros ficam dentro da sua conta e são usados para organizar seu próprio painel. Você decide o que acompanha e o que deseja compartilhar publicamente.",
  },
  {
    question: "Posso cancelar minha assinatura quando quiser?",
    answer:
      "Sim. Os planos não têm fidelidade. Você pode cancelar quando quiser e continuar usando os recursos disponíveis conforme as regras do plano ativo.",
  },
  {
    question: "Como funciona o resultado público?",
    answer:
      "O resultado público é uma página visual para apresentar seu desempenho de forma mais profissional, com lucro, banca inicial, banca final, ROI, odd média e evolução do período.",
  },
];

function Logo({ compact = false }) {
  return (
    <Link href="/" className="flex items-center gap-3">
      <div className="relative h-8 w-7 text-[#087f32]">
        <span className="absolute left-0 top-0 h-2.5 w-7 skew-x-[-24deg] rounded-[2px] bg-current" />
        <span className="absolute left-0 top-3 h-2.5 w-5 skew-x-[-24deg] rounded-[2px] bg-current" />
        <span className="absolute left-0 top-6 h-2.5 w-3 skew-x-[-24deg] rounded-[2px] bg-current" />
      </div>
      <span
        className={`font-black tracking-[-0.04em] text-[#171a17] ${
          compact ? "text-[23px]" : "text-[35px]"
        }`}
      >
        Filtto
      </span>
    </Link>
  );
}

function PrimaryButton({ children, className = "", href = "/login?mode=register" }) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center gap-3 rounded-[8px] bg-[#007f2f] px-7 py-4 text-[15px] font-black tracking-[-0.01em] !text-white shadow-[0_14px_26px_rgba(0,127,47,0.18)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#006d29] hover:shadow-[0_18px_30px_rgba(0,127,47,0.22)] ${className}`}
    >
      {children}
      <ArrowRight size={18} strokeWidth={2.2} />
    </Link>
  );
}

function SecondaryButton({ children, className = "" }) {
  return (
    <Link
      href="#produto"
      className={`inline-flex items-center justify-center gap-3 rounded-[8px] border border-[#087f32]/70 bg-[#ffffff]/70 px-7 py-4 text-[15px] font-bold tracking-[-0.01em] !text-[#1d3524] shadow-[0_10px_24px_rgba(22,28,20,0.05)] transition duration-200 hover:-translate-y-0.5 hover:border-[#087f32] hover:bg-[#ffffff] ${className}`}
    >
      <span className="flex h-5 w-5 items-center justify-center rounded-full border border-[#087f32]">
        <Play size={10} fill="currentColor" strokeWidth={0} />
      </span>
      {children}
    </Link>
  );
}

function SectionLabel({ children }) {
  return (
    <p className="text-[12px] font-black uppercase tracking-[0.08em] text-[#087f32]">
      {children}
    </p>
  );
}

function SerifTitle({ children, className = "" }) {
  return (
    <h2
      className={`font-normal tracking-[-0.055em] text-[#161916] ${className}`}
      style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
    >
      {children}
    </h2>
  );
}

function TinyLineChart({ className = "", stroke = "#087f32" }) {
  return (
    <svg
      viewBox="0 0 260 90"
      className={`filtto-animate-when-visible h-full w-full overflow-visible ${className}`}
      fill="none"
      aria-hidden="true"
    >
      <path
        className="filtto-line-path"
        d="M4 72C25 66 33 52 51 57C68 62 73 32 91 43C107 53 116 28 133 34C151 41 158 18 178 24C197 29 198 49 218 36C237 24 238 16 256 12"
        stroke={stroke}
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        className="filtto-line-fill"
        d="M4 72C25 66 33 52 51 57C68 62 73 32 91 43C107 53 116 28 133 34C151 41 158 18 178 24C197 29 198 49 218 36C237 24 238 16 256 12V90H4V72Z"
        fill="url(#lineFill)"
      />
      <circle className="filtto-line-dot" cx="256" cy="12" r="4.5" fill={stroke} />
      <defs>
        <linearGradient id="lineFill" x1="130" x2="130" y1="12" y2="90">
          <stop stopColor={stroke} stopOpacity="0.22" />
          <stop offset="1" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function DonutChart() {
  return (
    <div className="filtto-animate-when-visible relative mx-auto h-[114px] w-[114px]">
      <div className="filtto-donut absolute inset-0 rounded-full" />
      <div className="absolute inset-[15px] rounded-full bg-[#ffffff]" />
      <div className="absolute inset-0 flex items-center justify-center text-[21px] font-black text-[#087f32]">
        <AnimatedNumber value={68} suffix="%" duration={1350} />
      </div>
    </div>
  );
}

function HeroMockup() {
  const menu = [
    ["Dashboard", HomeIcon, true],
    ["Banca", CreditCard],
    ["Estatísticas", LineChart],
    ["Próximos Jogos", CalendarDays],
    ["Progressão", TrendingUp],
    ["Comunidade", Users],
  ];

  return (
    <div className="filtto-mockup-enter relative mx-auto h-[620px] w-full max-w-[720px] lg:max-w-none">
      <div className="filtto-mockup-sidebar filtto-fade-up filtto-premium-card absolute left-[8%] top-[86px] h-[424px] w-[370px] rounded-[22px] border border-[#dfddd5] bg-[#ffffff] p-7 shadow-[0_26px_70px_rgba(38,39,34,0.12)]">
        <Logo compact />
        <nav className="mt-8 space-y-1.5 text-[13px] font-bold text-[#4f5650]">
          {menu.map(([label, Icon, active]) => (
            <div
              key={label}
              className={`filtto-sidebar-item flex items-center gap-3 rounded-[8px] px-4 py-3 ${
                active ? "bg-[#eaf3e9] !text-[#087f32]" : ""
              }`}
            >
              <Icon size={16} strokeWidth={2} />
              <span>{label}</span>
            </div>
          ))}
        </nav>
      </div>

      <div className="filtto-mockup-summary filtto-fade-up filtto-fade-up-delay-1 filtto-premium-card absolute right-[3%] top-[24px] w-[450px] rounded-[18px] border border-[#e3ded4] bg-[#ffffff] p-7 shadow-[0_24px_68px_rgba(35,37,32,0.12)]">
        <div className="flex items-start justify-between">
          <h3 className="text-[14px] font-black tracking-[-0.02em] text-[#171a17]">
            Resumo da banca
          </h3>
          <button className="inline-flex items-center gap-1 rounded-[6px] border border-[#e6e2d9] px-3 py-1.5 text-[10px] font-bold text-[#747a73]">
            Este mês <ChevronDown size={12} />
          </button>
        </div>

        <div className="mt-8 grid grid-cols-[168px_1fr] gap-6">
          <div>
            <p className="text-[12px] font-bold text-[#7e857e]">Lucro</p>
            <p className="mt-3 whitespace-nowrap text-[25px] font-black tracking-[-0.04em] text-[#087f32] tabular-nums xl:text-[27px]">
              <AnimatedNumber
                value={1942.5}
                prefix="R$"
                decimals={2}
                duration={1750}
                locale="pt-BR"
                className="gap-1.5"
              />
            </p>
            <p className="mt-3 inline-flex rounded-full bg-[#e8f4e8] px-2.5 py-1 text-[10px] font-black text-[#087f32] tabular-nums">
              <AnimatedNumber
                value={10.6}
                prefix="+"
                suffix="%"
                decimals={1}
                duration={1750}
                locale="pt-BR"
              />
            </p>
            <p className="mt-2 text-[11px] font-medium text-[#858a84]">
              vs. período anterior
            </p>
          </div>
          <div className="border-l border-[#e9e5dd] pl-8">
            <p className="text-[12px] font-black text-[#555d56]">
              Evolução da banca
            </p>
            <div className="mt-4 h-[112px]">
              <TinyLineChart />
            </div>
          </div>
        </div>
      </div>

      <div className="filtto-mockup-games filtto-fade-up filtto-fade-up-delay-2 filtto-premium-card absolute left-[33%] top-[318px] w-[320px] rounded-[16px] border border-[#e5e0d7] bg-[#ffffff] p-6 shadow-[0_22px_56px_rgba(35,37,32,0.12)]">
        <h3 className="text-[15px] font-black tracking-[-0.02em] text-[#171a17]">
          Próximos jogos
        </h3>
        <div className="mt-5 space-y-4 text-[12px]">
          {[
            ["Hoje", "19:00", "Manchester City", "Arsenal", "1.72"],
            ["Hoje", "21:30", "Real Madrid", "Villarreal", "1.65"],
            ["Amanhã", "16:00", "Inter", "Milan", "1.90"],
          ].map(([day, time, home, away, odd], index) => (
            <div
              key={`${home}-${away}`}
              className="filtto-game-row grid grid-cols-[62px_1fr_38px] items-center gap-3 rounded-[8px] border-b border-[#ece8e0] px-2 py-1.5 pb-3 -mx-2 transition-colors duration-200 hover:bg-[#f5f9f2] last:border-0 last:pb-1.5"
              style={{ animationDelay: `${520 + index * 110}ms` }}
            >
              <div className="text-[#8a9088]">
                <p>{day}</p>
                <p>{time}</p>
              </div>
              <div className="truncate font-bold text-[#303630]">
                {home} <span className="text-[#a4aaa3]">x</span> {away}
              </div>
              <div className="text-right font-black text-[#202620]">{odd}</div>
            </div>
          ))}
        </div>
        <Link
          href="#"
          className="filtto-arrow-link mt-5 flex items-center justify-between text-[12px] font-black !text-[#087f32]"
        >
          Ver todos os jogos <ArrowRight size={15} />
        </Link>
      </div>

      <div className="filtto-mockup-performance filtto-fade-up filtto-fade-up-delay-3 filtto-premium-card absolute right-[6%] top-[350px] w-[160px] rounded-[16px] border border-[#e5e0d7] bg-[#ffffff] px-5 py-7 text-center shadow-[0_22px_54px_rgba(35,37,32,0.11)]">
        <h3 className="text-[13px] font-black text-[#363b36]">Performance</h3>
        <div className="mt-5">
          <DonutChart />
        </div>
        <p className="mt-5 text-[12px] font-bold text-[#6d746d]">ROI</p>
        <p className="mt-1 text-[19px] font-black tracking-[-0.04em] text-[#171a17] tabular-nums">
          <AnimatedNumber
            value={12.7}
            suffix="%"
            decimals={1}
            duration={1350}
            locale="pt-BR"
          />
        </p>
      </div>
    </div>
  );
}

function BenefitStrip() {
  const items = [
    {
      icon: WalletCards,
      title: "Controle de banca",
      desc: "Gerencie sua banca com disciplina e total visibilidade.",
    },
    {
      icon: BarChart3,
      title: "Análise de resultados",
      desc: "Dados que revelam padrões e orientam melhores decisões.",
    },
    {
      icon: Gem,
      title: "Recursos premium",
      desc: "Ferramentas e conteúdos exclusivos para acelerar sua evolução.",
    },
  ];

  return (
    <div className="mx-auto -mt-4 max-w-[1620px] px-5 pb-9 sm:px-8">
      <div className="filtto-reveal filtto-reveal-delay-1 grid overflow-hidden rounded-[16px] border border-[#e2ded5] bg-[#ffffff]/82 shadow-[0_18px_44px_rgba(31,32,28,0.06)] backdrop-blur md:grid-cols-3">
        {items.map(({ icon: Icon, title, desc }, index) => (
          <div
            key={title}
            className={`filtto-benefit-item flex items-center gap-5 px-6 py-7 sm:gap-7 sm:px-12 sm:py-8 ${
              index ? "border-t border-[#e8e3db] md:border-l md:border-t-0" : ""
            }`}
            style={{ transitionDelay: `${index * 90}ms` }}
          >
            <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full bg-[#e7f3e7] text-[#087f32]">
              <Icon size={30} strokeWidth={1.8} />
            </div>
            <div>
              <h3 className="text-[18px] font-black tracking-[-0.03em] text-[#171a17]">
                {title}
              </h3>
              <p className="mt-2 max-w-[260px] text-[14px] leading-[1.55] text-[#697069]">
                {desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ModuleCard({ module, index = 0 }) {
  const Icon = module.icon;

  return (
    <div
      className={`filtto-premium-card rounded-[14px] border border-[#e2ded5] bg-[#ffffff] p-6 shadow-[0_16px_36px_rgba(33,34,30,0.05)] ${
        module.featured ? "row-span-2 min-h-[290px]" : "min-h-[142px]"
      }`}
      style={{ transitionDelay: `${index * 90}ms` }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-[17px] font-black tracking-[-0.03em] text-[#171a17]">
            {module.title}
          </h3>
          <p className="mt-2 max-w-[220px] text-[13px] leading-[1.45] text-[#727970]">
            {module.desc}
          </p>
        </div>
        <Icon size={20} className="text-[#087f32]" strokeWidth={1.9} />
      </div>

      {module.title === "Dashboard" && (
        <div className="mt-6 rounded-[10px] border border-[#e8e4dc] p-4">
          <div className="grid grid-cols-2 border-b border-[#e8e4dc] pb-3 text-[12px]">
            <div>
              <p className="text-[#8a9088]">Lucro</p>
              <p className="mt-1 font-black text-[#087f32]">R$ 1.942,50</p>
            </div>
            <div>
              <p className="text-[#8a9088]">ROI</p>
              <p className="mt-1 font-black text-[#171a17]">12,7%</p>
            </div>
          </div>
          <div className="mt-4 h-[92px]">
            <TinyLineChart />
          </div>
        </div>
      )}

      {module.title === "Banca" && (
        <div className="mt-6 h-[48px]">
          <TinyLineChart />
        </div>
      )}

      {module.title === "Estatísticas" && (
        <div className="mt-5 flex h-[58px] items-end gap-3">
          {[28, 48, 36, 70].map((height, index) => (
            <span
              key={height}
              className={`w-5 rounded-t-[4px] ${
                index === 2 ? "bg-[#087f32]" : "bg-[#e0e6dd]"
              }`}
              style={{ height }}
            />
          ))}
        </div>
      )}

      {module.title === "Próximos Jogos" && (
        <div className="mt-6 flex items-center gap-2">
          {["M", "R", "I", "A"].map((team, index) => (
            <span
              key={team}
              className="flex h-7 w-7 items-center justify-center rounded-full border border-[#d9d5cd] bg-[#f8f6f0] text-[10px] font-black text-[#4b534c]"
              style={{ marginLeft: index ? -6 : 0 }}
            >
              {team}
            </span>
          ))}
          <span className="ml-1 text-[12px] font-black text-[#838a82]">
            +12
          </span>
        </div>
      )}

      {module.title === "Progressão" && (
        <div className="mt-7 flex items-center gap-2">
          {[1, 2, 3, 4].map((step, index) => (
            <div key={step} className="flex flex-1 items-center">
              <span className="flex h-6 w-6 items-center justify-center rounded-full border border-[#087f32] text-[11px] font-black text-[#087f32]">
                {step}
              </span>
              {index < 3 && <span className="h-px flex-1 bg-[#a5cda8]" />}
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

function PublicResultCard() {
  const metrics = [
    ["Lucro", "R$ 3.258,40", true],
    ["Banca inicial", "R$ 5.000,00"],
    ["Banca final", "R$ 8.258,40"],
    ["ROI", "65,17%", true],
    ["Odd média", "1,78"],
  ];

  return (
    <div className="filtto-premium-card rounded-[16px] border border-[#e1ddd4] bg-[#ffffff] p-7 shadow-[0_20px_50px_rgba(31,32,28,0.06)]">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h3 className="text-[17px] font-black tracking-[-0.03em] text-[#171a17]">
            Resultado público
          </h3>
          <span className="rounded-full bg-[#e8f4e8] px-3 py-1 text-[10px] font-black text-[#087f32]">
            ● Público
          </span>
        </div>
        <button className="hidden items-center gap-1 rounded-[8px] border border-[#e6e2d9] px-3 py-2 text-[11px] font-bold text-[#70766f] sm:inline-flex">
          Últimos 12 meses <ChevronDown size={13} />
        </button>
      </div>

      <div className="mt-7 grid gap-4 border-b border-[#e8e4dc] pb-6 sm:grid-cols-5">
        {metrics.map(([label, value, green]) => (
          <div
            key={label}
            className="border-[#e8e4dc] sm:border-r sm:last:border-r-0"
          >
            <p className="text-[12px] font-bold text-[#868c84]">{label}</p>
            <p
              className={`mt-2 text-[19px] font-black tracking-[-0.04em] ${
                green ? "text-[#087f32]" : "text-[#171a17]"
              }`}
            >
              {value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-[12px] border border-[#e8e4dc] bg-[#fdfcf9] px-4 py-5">
        <div className="h-[176px]">
          <TinyLineChart />
        </div>
        <div className="mt-3 grid grid-cols-12 text-center text-[11px] font-bold text-[#8a9088]">
          {["Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez", "Jan", "Fev", "Mar", "Abr"].map(
            (month) => (
              <span key={month}>{month}</span>
            )
          )}
        </div>
      </div>
    </div>
  );
}

function PricingCard({ plan, index = 0 }) {
  return (
    <div
      className={`filtto-premium-card relative flex h-full min-h-[440px] flex-col rounded-[14px] border bg-[#ffffff] p-7 shadow-[0_16px_38px_rgba(31,32,28,0.05)] ${
        plan.featured ? "border-[#087f32]" : "border-[#e1ddd4]"
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      {plan.featured && (
        <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-b-[7px] rounded-t-[7px] bg-[#087f32] px-7 py-2 text-[11px] font-black !text-white">
          Mais escolhido
        </div>
      )}

      <div className="min-h-[64px]">
        <h3 className="text-[18px] font-black tracking-[-0.03em] text-[#171a17]">
          {plan.title}
        </h3>
        <p className="mt-2 text-[13px] font-medium leading-[1.45] text-[#737971]">
          {plan.note}
        </p>
      </div>

      <div className="mt-7 flex min-h-[44px] items-end gap-2">
        <span className="text-[32px] font-black tracking-[-0.06em] text-[#171a17]">
          {plan.price}
        </span>
        {plan.period ? (
          <span className="pb-1 text-[13px] font-black text-[#3c443c]">
            {plan.period}
          </span>
        ) : null}
      </div>

      <p
        className={`mt-2 min-h-[18px] text-[12px] font-black ${
          plan.sub ? "text-[#087f32]" : "text-transparent"
        }`}
      >
        {plan.sub || "Sem informação"}
      </p>

      <Link
        href="/login?mode=register"
        className={`mt-8 flex h-12 items-center justify-center rounded-[7px] border text-[13px] font-black transition ${
          plan.featured
            ? "border-[#087f32] bg-[#087f32] !text-white hover:bg-[#006e2a]"
            : "border-[#087f32] bg-[#ffffff] !text-[#087f32] hover:bg-[#edf7ed]"
        }`}
      >
        {plan.button}
      </Link>

      <ul className="mt-7 space-y-3 text-[13px] font-medium text-[#4d554d]">
        {["Acesso completo à plataforma", "Comunidade Filtto", "Suporte prioritário"].map(
          (item) => (
            <li key={item} className="flex items-center gap-3">
              <Check size={15} className="text-[#087f32]" strokeWidth={2.3} />
              {item}
            </li>
          )
        )}
      </ul>
    </div>
  );
}

export default function Home() {
  return (
    <main className="filtto-landing min-h-screen bg-[#fbfaf7] text-[#171a17]">
      <LandingReveal />
      <header className="sticky top-0 z-50 border-b border-[#e8e3da] bg-[#fbfaf7]/92 backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-[1620px] items-center justify-between px-5 sm:h-[88px] sm:px-8">
          <Logo />

          <nav className="hidden items-center gap-14 text-[14px] font-bold text-[#232923] lg:flex">
            {navItems.map((item) => (
              <a key={item} href="#" className="transition hover:text-[#087f32]">
                {item}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3 sm:gap-5">
            <LanguageSwitcher light />
            <Link
              href="/login"
              className="hidden text-[14px] font-bold !text-[#171a17] transition hover:!text-[#087f32] sm:inline"
            >
              Entrar
            </Link>
            <PrimaryButton className="hidden px-6 py-3.5 text-[14px] sm:inline-flex">
              Começar agora
            </PrimaryButton>
          </div>
        </div>
      </header>

      <section className="filtto-hero-field relative overflow-hidden border-b border-[#e8e3da]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_24%,rgba(8,127,50,0.08),transparent_30%),linear-gradient(115deg,rgba(255,255,255,0)_0%,rgba(8,127,50,0.045)_100%)]" />
        <div className="absolute right-[-120px] top-[-180px] h-[780px] w-[780px] rounded-full border border-[#087f32]/10" />
        <div className="absolute right-[150px] top-[160px] h-[620px] w-[620px] rounded-full border border-[#087f32]/8" />

        <div className="relative mx-auto grid max-w-[1620px] gap-8 px-5 pb-12 pt-12 sm:gap-10 sm:px-8 sm:pb-16 sm:pt-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="filtto-hero-copy max-w-[720px]">
            <h1
              className="filtto-hero-step filtto-hero-step-1 text-[46px] font-normal leading-[0.98] tracking-[-0.06em] text-[#111411] sm:text-[56px] md:text-[78px] xl:text-[88px]"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              A plataforma para apostar com{" "}
              <span className="italic text-[#087f32]">
                gestão, clareza e inteligência.
              </span>
            </h1>

            <p className="filtto-hero-step filtto-hero-step-2 mt-7 max-w-[610px] text-[16px] leading-[1.65] text-[#5d655e] sm:mt-9 sm:text-[18px]">
              Controle sua banca, registre entradas, acompanhe resultados e
              acesse recursos premium para evoluir com mais consistência.
            </p>

            <div className="filtto-hero-step filtto-hero-step-3 mt-10 flex flex-col gap-4 sm:flex-row">
              <PrimaryButton>Começar agora</PrimaryButton>
              <SecondaryButton>Ver demonstração</SecondaryButton>
            </div>

            <div className="filtto-hero-step filtto-hero-step-4 mt-10 flex flex-wrap items-center gap-4 text-[14px] font-bold text-[#5f665f]">
              <div className="flex -space-x-2">
                {["M", "C", "L", "R"].map((avatar, index) => (
                  <span
                    key={avatar}
                    className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#fbfaf7] bg-[#d9e3d8] text-[12px] font-black text-[#334035]"
                    style={{ zIndex: 4 - index }}
                  >
                    {avatar}
                  </span>
                ))}
                <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#fbfaf7] bg-[#087f32] text-white">
                  <Check size={17} strokeWidth={3} />
                </span>
              </div>
              <span>Gestão, dados e comunidade em um só lugar.</span>
            </div>
          </div>

          <HeroMockup />
        </div>
      </section>

      <BenefitStrip />

      <section id="produto" className="filtto-reveal bg-[#f5f1e9] py-24">
        <div className="mx-auto grid max-w-[1620px] gap-10 px-5 sm:px-8 lg:grid-cols-[390px_1fr] lg:items-center xl:gap-14">
          <div>
            <SectionLabel>Módulos principais</SectionLabel>
            <SerifTitle className="mt-5 text-[43px] leading-[1.02] md:text-[50px]">
              Tudo o que você precisa, organizado para performar.
            </SerifTitle>
            <div className="mt-9 h-[3px] w-16 bg-[#087f32]" />
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {modules.map((module, index) => (
              <ModuleCard key={module.title} module={module} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section className="filtto-reveal bg-[#fbfaf7] py-24">
        <div className="mx-auto grid max-w-[1620px] gap-10 px-5 sm:px-8 lg:grid-cols-[330px_1fr] lg:items-center xl:gap-14">
          <div>
            <SectionLabel>Transparência</SectionLabel>
            <SerifTitle className="mt-5 text-[43px] leading-[1.02] md:text-[52px]">
              Resultado público, confiança que se vê.
            </SerifTitle>
            <p className="mt-7 max-w-[280px] text-[15px] leading-[1.65] text-[#697069]">
              Compartilhe seu desempenho com o público. Mais credibilidade,
              mais disciplina.
            </p>
            <Link
              href="#"
              className="filtto-arrow-link mt-10 inline-flex items-center gap-3 text-[13px] font-black !text-[#087f32]"
            >
              Ver exemplo completo <ArrowRight size={16} />
            </Link>
          </div>

          <PublicResultCard />
        </div>
      </section>

      <section id="planos" className="filtto-reveal bg-[#fbfaf7] pb-24">
        <div className="mx-auto grid max-w-[1620px] gap-10 px-5 sm:px-8 lg:grid-cols-[330px_1fr] lg:items-center xl:gap-14">
          <div>
            <SectionLabel>Planos</SectionLabel>
            <SerifTitle className="mt-5 text-[43px] leading-[1.02] md:text-[52px]">
              Escolha o plano ideal para você.
            </SerifTitle>
            <div className="mt-12 flex items-start gap-4">
              <ShieldCheck size={35} className="text-[#087f32]" strokeWidth={1.7} />
              <p className="text-[14px] leading-[1.55] text-[#697069]">
                <strong className="text-[#374038]">Cancele quando quiser.</strong>
                <br />
                Sem fidelidade.
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {plans.map((plan, index) => (
              <PricingCard key={plan.title} plan={plan} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section className="filtto-reveal border-y border-[#e8e3da] bg-[#fbfaf7] py-16">
        <div className="mx-auto grid max-w-[1620px] gap-10 px-5 sm:px-8 lg:grid-cols-[330px_1fr] xl:gap-12">
          <div>
            <SectionLabel>Dúvidas frequentes</SectionLabel>
            <SerifTitle className="mt-5 text-[43px] leading-[1.02] md:text-[52px]">
              Perguntas frequentes.
            </SerifTitle>
          </div>

          <div className="divide-y divide-[#ded9cf]">
            {faqs.map((item, index) => (
              <details
                key={item.question}
                className="filtto-faq-item group"
                style={{ transitionDelay: `${index * 75}ms` }}
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-left text-[16px] font-bold text-[#202620] marker:hidden">
                  <span>{item.question}</span>
                  <ChevronDown
                    size={18}
                    className="shrink-0 text-[#2d342d] transition group-open:rotate-180"
                  />
                </summary>
                <p className="max-w-[760px] pb-6 text-[15px] leading-[1.7] text-[#687068]">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-[#fbfaf7] py-10">
        <div className="mx-auto max-w-[1620px] px-5 sm:px-8">
          <div className="grid gap-10 lg:grid-cols-[1.3fr_0.8fr_0.8fr_0.8fr_1.5fr]">
            <div>
              <Logo compact />
              <p className="mt-5 max-w-[230px] text-[13px] leading-[1.65] text-[#626a63]">
                Gestão, inteligência e comunidade para apostadores.
              </p>
            </div>

            {[
              ["Produto", ["Recursos", "Planos"]],
              ["Comunidade", ["Blog", "Conteúdos", "Grupo Premium"]],
              ["Suporte", ["FAQ", "Contato"]],
            ].map(([title, links]) => (
              <div key={title}>
                <h3 className="text-[12px] font-black text-[#171a17]">{title}</h3>
                <div className="mt-4 space-y-3 text-[12px] font-bold text-[#626a63]">
                  {links.map((link) => (
                    <a key={link} href="#" className="block hover:text-[#087f32]">
                      {link}
                    </a>
                  ))}
                </div>
              </div>
            ))}

            <div>
              <h3 className="text-[12px] font-black text-[#171a17]">
                Receba novidades do Filtto
              </h3>
              <div className="mt-5 flex rounded-[8px] border border-[#ded9cf] bg-[#ffffff] p-1.5">
                <div className="flex flex-1 items-center gap-3 px-4 text-[#7a817a]">
                  <Mail size={16} />
                  <span className="text-[13px]">Seu melhor e-mail</span>
                </div>
                <button className="flex h-11 w-12 items-center justify-center rounded-[6px] bg-[#087f32] text-white">
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col justify-between gap-4 border-t border-[#e8e3da] pt-6 text-[12px] font-medium text-[#747b74] md:flex-row">
            <p>© 2024 Filtto. Todos os direitos reservados.</p>
            <div className="flex gap-8">
              <a href="#" className="hover:text-[#087f32]">
                Termos de uso
              </a>
              <a href="#" className="hover:text-[#087f32]">
                Política de privacidade
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
