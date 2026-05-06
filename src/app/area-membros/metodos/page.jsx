"use client";

import { useState } from "react";
import {
  ArrowUpRight,
  BadgeCheck,
  BookOpenCheck,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  CircleDotDashed,
  Clock3,
  Gift,
  Goal,
  MonitorSmartphone,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Trophy,
} from "lucide-react";

const tabs = [
  {
    value: "metodos",
    label: "Métodos grátis",
    description: "Biblioteca prática",
    summary: "4 métodos ativos",
    icon: BookOpenCheck,
  },
  {
    value: "rodadas",
    label: "Rodadas grátis",
    description: "Casas selecionadas",
    summary: "4 ofertas curadas",
    icon: Gift,
  },
  {
    value: "bolao",
    label: "Bolão",
    description: "Leitura estratégica",
    summary: "R$ 500 mil",
    icon: Trophy,
  },
];

const headerStats = [
  {
    value: "3",
    label: "categorias",
    detail: "navegação interna",
  },
  {
    value: "4",
    label: "métodos",
    detail: "biblioteca grátis",
  },
  {
    value: "R$ 500 mil",
    label: "bolão ativo",
    detail: "estratégia publicada",
  },
];

const freeMethods = [
  {
    title: "Checklist pré-entrada",
    description:
      "Uma rotina curta para validar mercado, odd, liquidez e risco antes de confirmar uma aposta.",
    status: "Atualizado",
    statusTone: "safe",
    difficulty: "Fácil",
    category: "Gestão",
    meta: "5 min",
    outcome: "Evitar entradas sem validação",
    icon: ShieldCheck,
  },
  {
    title: "Filtro de jogos travados",
    description:
      "Critérios simples para identificar partidas com menor tendência de gols e evitar entradas impulsivas.",
    status: "Popular",
    statusTone: "warning",
    difficulty: "Intermediário",
    category: "Futebol",
    meta: "8 min",
    outcome: "Encontrar jogos de menor ritmo",
    icon: Target,
  },
  {
    title: "Proteção de banca diária",
    description:
      "Um modelo de limite por sessão para manter disciplina quando o dia começa fora do planejado.",
    status: "Novo",
    statusTone: "positive",
    difficulty: "Fácil",
    category: "Banca",
    meta: "4 min",
    outcome: "Definir limite antes da sessão",
    icon: CalendarClock,
  },
  {
    title: "Leitura de mercado ao vivo",
    description:
      "Como acompanhar ritmo, pressão e preço sem depender de um único indicador durante o jogo.",
    status: "Atualizado",
    statusTone: "safe",
    difficulty: "Avançado",
    category: "Live",
    meta: "12 min",
    outcome: "Ler pressão sem entrar no impulso",
    icon: CircleDotDashed,
  },
];

const bettingHouses = [
  {
    rank: "01",
    initials: "BT",
    name: "Betano",
    offer: "Conferir rodadas grátis ativas",
    detail: "Boa opção para checar campanhas de cassino e missões promocionais.",
    badge: "Destaque",
    fit: "Melhor oportunidade",
    rating: "4,8",
    devices: "Android, iOS e Web",
    href: "https://www.betano.bet.br/",
  },
  {
    rank: "02",
    initials: "SP",
    name: "Superbet",
    offer: "Promoções e giros por tempo limitado",
    detail: "Curadoria indicada para usuários que preferem ofertas simples de resgatar.",
    badge: "Oferta ativa",
    fit: "Resgate simples",
    rating: "4,7",
    devices: "Android, iOS e Web",
    href: "https://www.superbet.bet.br/",
  },
  {
    rank: "03",
    initials: "KT",
    name: "KTO",
    offer: "Ver campanhas disponíveis na conta",
    detail: "Costuma concentrar oportunidades em missões e benefícios do aplicativo.",
    badge: "Curada",
    fit: "Missões e app",
    rating: "4,6",
    devices: "Android, iOS e Web",
    href: "https://www.kto.com/br/",
  },
  {
    rank: "04",
    initials: "ES",
    name: "EstrelaBet",
    offer: "Consultar rodadas e bônus elegíveis",
    detail: "Entrada alternativa para comparar condições antes de ativar qualquer oferta.",
    badge: "Comparar",
    fit: "Boa para comparar",
    rating: "4,5",
    devices: "Android, iOS e Web",
    href: "https://estrelabet.com/",
  },
];

const poolQuestions = [
  {
    label: "Pergunta 1",
    title: "Placar final exato da partida",
    answer: "0 x 0",
  },
  {
    label: "Pergunta 2",
    title: "Quem marcará o primeiro gol",
    answer: "Ninguém / sem gol",
  },
  {
    label: "Pergunta 3",
    title: "Momento do primeiro gol",
    answer: "Sem gol",
  },
];

function getTone(tone) {
  if (tone === "positive") {
    return {
      text: "text-emerald-700 dark:text-emerald-300",
      badge:
        "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300",
      icon:
        "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/20",
    };
  }

  if (tone === "warning") {
    return {
      text: "text-amber-800 dark:text-amber-300",
      badge:
        "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-300",
      icon:
        "bg-amber-50 text-amber-800 ring-amber-200 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/20",
    };
  }

  if (tone === "accent") {
    return {
      text: "text-slate-700 dark:text-slate-300",
      badge:
        "border-slate-200 bg-slate-100 text-slate-700 dark:border-white/[0.08] dark:bg-white/[0.06] dark:text-slate-300",
      icon:
        "bg-slate-100 text-slate-700 ring-slate-200 dark:bg-white/[0.06] dark:text-slate-300 dark:ring-white/[0.08]",
    };
  }

  return {
    text: "text-slate-700 dark:text-slate-300",
    badge:
      "border-slate-200 bg-slate-100 text-slate-700 dark:border-white/[0.08] dark:bg-white/[0.06] dark:text-slate-300",
    icon:
      "bg-slate-100 text-slate-700 ring-slate-200 dark:bg-white/[0.06] dark:text-slate-300 dark:ring-white/[0.08]",
  };
}

function Panel({ children, className = "" }) {
  return (
    <section
      className={`rounded-[20px] border border-slate-200 bg-white shadow-[0_10px_24px_rgba(15,23,42,0.045)] dark:border-white/[0.08] dark:bg-slate-900 ${className}`}
    >
      {children}
    </section>
  );
}

function SectionHeader({ eyebrow, title, description, action }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
          {eyebrow}
        </p>
        <h2 className="mt-1 text-[18px] font-semibold tracking-[-0.02em] text-slate-950 dark:text-white">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 max-w-[720px] text-[13px] leading-5 text-slate-600 dark:text-slate-400">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

function Badge({ children, tone = "neutral" }) {
  return (
    <span
      className={`inline-flex h-7 items-center rounded-full border px-2.5 text-[11px] font-semibold tracking-[-0.005em] ${getTone(tone).badge}`}
    >
      {children}
    </span>
  );
}

function PrimaryAction({ as: Component = "button", children, className = "", ...props }) {
  return (
    <Component
      {...props}
      className={`inline-flex h-11 items-center justify-center gap-2 rounded-[14px] bg-slate-950 px-4 text-[13px] font-semibold text-white shadow-[0_8px_18px_rgba(15,23,42,0.08)] transition hover:bg-slate-800 active:translate-y-px dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200 ${className}`}
    >
      {children}
    </Component>
  );
}

function SegmentedNavigation({ activeTab, onChange }) {
  return (
    <div className="overflow-x-auto pb-1">
      <div className="flex w-max min-w-full gap-1 rounded-[13px] border border-slate-200 bg-slate-100 p-1 dark:border-white/[0.08] dark:bg-white/[0.04] md:w-full">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.value;

          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => onChange(tab.value)}
              className={`group flex min-w-[216px] flex-1 items-center gap-3 rounded-[12px] px-3.5 py-2.5 text-left ring-1 transition ${
                active
                  ? "bg-slate-950 text-white ring-slate-950 dark:bg-white dark:text-slate-950 dark:ring-white"
                  : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50 dark:bg-white/[0.04] dark:text-slate-300 dark:ring-white/[0.08] dark:hover:bg-white/[0.07]"
              }`}
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] ring-1 transition ${
                  active
                    ? "bg-white text-slate-950 ring-white/10 dark:bg-slate-950 dark:text-white dark:ring-slate-950/10"
                    : "bg-slate-100 text-slate-500 ring-slate-200 group-hover:text-slate-800 dark:bg-white/[0.06] dark:text-slate-400 dark:ring-white/[0.08]"
                }`}
              >
                <Icon className="h-4 w-4" strokeWidth={2} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-3">
                  <span className="block text-[13px] font-semibold">{tab.label}</span>
                  <span className={`hidden text-[11px] font-semibold lg:block ${active ? "text-white/60 dark:text-slate-500" : "text-slate-400 dark:text-slate-500"}`}>
                    {tab.summary}
                  </span>
                </span>
                <span className={`mt-0.5 block text-[11px] font-medium ${active ? "text-white/70 dark:text-slate-600" : "text-slate-500 dark:text-slate-400"}`}>
                  {tab.description}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MethodCard({ method }) {
  const Icon = method.icon;

  return (
    <article className="flex h-full flex-col rounded-[18px] border border-slate-200 bg-white p-[18px] shadow-[0_8px_18px_rgba(15,23,42,0.035)] transition hover:bg-slate-50/40 dark:border-white/[0.08] dark:bg-slate-900 dark:hover:bg-white/[0.025]">
      <div className="flex items-start justify-between gap-4">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] ring-1 ${getTone(method.statusTone).icon}`}>
          <Icon className="h-4 w-4" strokeWidth={2} />
        </span>
        <Badge tone={method.statusTone}>{method.status}</Badge>
      </div>

      <div className="mt-5 min-w-0">
        <h3 className="text-[17px] font-semibold tracking-[-0.02em] text-slate-950 dark:text-white">
          {method.title}
        </h3>
        <p className="mt-2 text-[13px] leading-6 text-slate-600 dark:text-slate-400">
          {method.description}
        </p>
      </div>

      <div className="mt-5 rounded-[14px] border border-slate-200 bg-slate-50 px-3.5 py-3 dark:border-white/[0.08] dark:bg-slate-950/40">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
          Entrega
        </p>
        <p className="mt-1 text-[13px] font-medium text-slate-800 dark:text-slate-200">{method.outcome}</p>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-[12px]">
        {[
          ["Dificuldade", method.difficulty],
          ["Tipo", method.category],
          ["Leitura", method.meta],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-[13px] border border-slate-200 bg-slate-50 px-3 py-2.5 dark:border-white/[0.08] dark:bg-slate-950/40"
          >
            <p className="text-slate-500 dark:text-slate-400">{label}</p>
            <p className="mt-1 truncate font-semibold text-slate-950 dark:text-white">{value}</p>
          </div>
        ))}
      </div>

      <button
        type="button"
        className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-[13px] bg-slate-950 px-4 text-[13px] font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
      >
        Ver método
        <ChevronRight className="h-4 w-4" strokeWidth={2} />
      </button>
    </article>
  );
}

function MethodsSection() {
  return (
    <div className="grid gap-5 xl:grid-cols-[0.72fr_1.28fr]">
      <Panel className="p-5">
        <SectionHeader
          eyebrow="Métodos grátis"
          title="Biblioteca interna"
          description="Conteúdos rápidos para consultar antes de operar, com foco em disciplina, leitura e controle de risco."
        />

        <div className="mt-5 rounded-[16px] border border-slate-200 bg-slate-50 p-4 dark:border-white/[0.08] dark:bg-slate-950/40">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-slate-950 text-white ring-1 ring-slate-950 dark:bg-white dark:text-slate-950 dark:ring-white">
              <Sparkles className="h-4 w-4" strokeWidth={2} />
            </span>
            <div>
              <h3 className="text-[14px] font-semibold text-slate-950 dark:text-white">
                Como usar esta seção
              </h3>
              <p className="mt-1 text-[13px] leading-5 text-slate-600 dark:text-slate-400">
                Abra o método, valide os critérios e só aplique quando o cenário fizer sentido para sua banca.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-[16px] border border-slate-200 bg-white p-4 dark:border-white/[0.08] dark:bg-slate-900">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
            Fluxo recomendado
          </p>
          <div className="mt-3 space-y-3">
            {[
              ["Escolher", "Use o card pelo tipo de decisão que você precisa tomar."],
              ["Validar", "Compare os critérios do método com o cenário real."],
              ["Executar", "Aplique somente se encaixar na gestão da sua banca."],
            ].map(([title, text], index) => (
              <div key={title} className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[11px] font-bold text-slate-700 ring-1 ring-slate-200 dark:bg-white/[0.06] dark:text-slate-300 dark:ring-white/[0.08]">
                  {index + 1}
                </span>
                <div>
                  <p className="text-[13px] font-semibold text-slate-950 dark:text-white">{title}</p>
                  <p className="mt-0.5 text-[12px] leading-5 text-slate-600 dark:text-slate-400">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
          {[
            ["4", "métodos ativos"],
            ["2", "atualizados"],
            ["0", "custo adicional"],
          ].map(([value, label]) => (
            <div
              key={label}
              className="rounded-[14px] border border-slate-200 bg-white px-4 py-3 dark:border-white/[0.08] dark:bg-white/[0.03]"
            >
              <p className="text-[21px] font-semibold tracking-[-0.04em] text-slate-950 dark:text-white">
                {value}
              </p>
              <p className="mt-1 text-[12px] text-slate-500 dark:text-slate-400">{label}</p>
            </div>
          ))}
        </div>
      </Panel>

      <div className="grid gap-4 md:grid-cols-2">
        {freeMethods.map((method) => (
          <MethodCard key={method.title} method={method} />
        ))}
      </div>
    </div>
  );
}

function OfferCard({ house }) {
  return (
    <article className="rounded-[18px] border border-slate-200 bg-white p-3.5 shadow-[0_8px_18px_rgba(15,23,42,0.035)] transition hover:bg-slate-50/40 dark:border-white/[0.08] dark:bg-slate-900 dark:hover:bg-white/[0.025]">
      <div className="grid gap-3 lg:grid-cols-[minmax(240px,0.95fr)_minmax(320px,1.35fr)_160px] lg:items-center">
        <div className="flex min-w-0 items-center gap-3">
          <span className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-[11px] bg-slate-100 text-[12px] font-bold text-slate-500 ring-1 ring-slate-200 dark:bg-white/[0.05] dark:text-slate-400 dark:ring-white/[0.08] sm:inline-flex">
            {house.rank}
          </span>
          <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-[15px] border border-slate-200 bg-slate-950 text-[14px] font-black tracking-[-0.03em] text-white shadow-[0_8px_18px_rgba(15,23,42,0.08)] dark:border-white/[0.08] dark:bg-white dark:text-slate-950">
            {house.initials}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-[17px] font-semibold tracking-[-0.02em] text-slate-950 dark:text-white">
                {house.name}
              </h3>
              <Badge tone={house.badge === "Destaque" ? "accent" : "safe"}>{house.badge}</Badge>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" strokeWidth={2} />
                {house.rating}
              </span>
              <span className="inline-flex items-center gap-1">
                <MonitorSmartphone className="h-3.5 w-3.5" strokeWidth={2} />
                {house.devices}
              </span>
            </div>
          </div>
        </div>

        <div className="min-w-0 rounded-[15px] border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/[0.08] dark:bg-slate-950/40">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                Oferta principal
              </p>
              <p className="mt-1 text-[14px] font-semibold text-slate-950 dark:text-white">{house.offer}</p>
            </div>
            <span className="inline-flex h-7 w-fit shrink-0 items-center rounded-full bg-slate-100 px-2.5 text-[11px] font-semibold text-slate-700 ring-1 ring-slate-200 dark:bg-white/[0.06] dark:text-slate-300 dark:ring-white/[0.08]">
              {house.fit}
            </span>
          </div>
          <p className="mt-2 text-[12px] leading-5 text-slate-600 dark:text-slate-400">{house.detail}</p>
        </div>

        <a
          href={house.href}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-11 w-full min-w-[150px] items-center justify-center gap-2 rounded-[14px] border border-slate-950 bg-slate-950 px-4 text-[13px] font-semibold text-white shadow-[0_8px_18px_rgba(15,23,42,0.08)] transition hover:bg-slate-800 dark:border-white/[0.12] dark:bg-slate-950 dark:text-white dark:hover:bg-slate-800"
          style={{ backgroundColor: "#020617", color: "#ffffff" }}
        >
          <span style={{ color: "#ffffff" }}>Acessar casa</span>
          <ArrowUpRight className="h-4 w-4" strokeWidth={2} style={{ color: "#ffffff" }} />
        </a>
      </div>
    </article>
  );
}

function OffersSection() {
  return (
    <Panel className="p-4 sm:p-5">
      <SectionHeader
        eyebrow="Rodadas grátis"
        title="Curadoria de casas e oportunidades"
        description="Lista enxuta para conferir rodadas, missões e promoções sem perder clareza entre oferta, plataforma e ação."
        action={
          <span className="inline-flex h-9 items-center gap-2 rounded-[12px] bg-white px-3 text-[13px] font-semibold text-slate-700 ring-1 ring-slate-200 dark:bg-white/[0.04] dark:text-slate-300 dark:ring-white/[0.08]">
            <BadgeCheck className="h-4 w-4" strokeWidth={2} />
            Curadoria interna
          </span>
        }
      />

      <div className="mt-4 grid gap-2.5 md:grid-cols-3">
        {[
          ["Mais acessado", "Betano", "boa frequência de campanhas"],
          ["Melhor leitura", "Superbet", "ofertas fáceis de comparar"],
          ["Checagem", "Regras da casa", "confira elegibilidade antes de ativar"],
        ].map(([label, value, detail]) => (
          <div
            key={label}
            className="rounded-[14px] border border-slate-200 bg-slate-50 px-3.5 py-2.5 dark:border-white/[0.08] dark:bg-slate-950/40"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
              {label}
            </p>
            <p className="mt-1 text-[15px] font-semibold text-slate-950 dark:text-white">{value}</p>
            <p className="mt-1 text-[12px] text-slate-600 dark:text-slate-400">{detail}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-3">
        {bettingHouses.map((house) => (
          <OfferCard key={house.name} house={house} />
        ))}
      </div>

      <div className="mt-4 rounded-[15px] border border-slate-200 bg-slate-50 px-4 py-3 text-[12px] leading-5 text-slate-600 dark:border-white/[0.08] dark:bg-slate-950/40 dark:text-slate-400">
        As campanhas podem variar por conta, região e período. Confira as regras da casa antes de ativar qualquer oferta.
      </div>
    </Panel>
  );
}

function QuestionCard({ question }) {
  return (
    <div className="rounded-[16px] border border-slate-200 bg-white p-4 shadow-[0_8px_18px_rgba(15,23,42,0.035)] dark:border-white/[0.08] dark:bg-slate-900">
      <div className="flex items-start gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-slate-100 text-[12px] font-bold text-slate-700 ring-1 ring-slate-200 dark:bg-white/[0.06] dark:text-slate-300 dark:ring-white/[0.08]">
          {question.label.replace("Pergunta ", "")}
        </span>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
            {question.label}
          </p>
          <h3 className="mt-1 text-[14px] font-semibold text-slate-950 dark:text-white">{question.title}</h3>
        </div>
      </div>
      <p className="mt-4 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[13px] font-bold text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300">
        {question.answer}
      </p>
    </div>
  );
}

function PoolSection() {
  return (
    <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
      <Panel className="overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50 px-5 py-4 dark:border-white/[0.08] dark:bg-slate-950/40">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                Bolão atual
              </p>
              <h2 className="mt-1 text-[24px] font-semibold tracking-[-0.04em] text-slate-950 dark:text-white">
                Bolão Flamengo
              </h2>
              <p className="mt-2 max-w-[620px] text-[13px] leading-5 text-slate-600 dark:text-slate-400">
                Três perguntas, uma linha de raciocínio e uma recomendação simples para preencher com mais coerência.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge tone="accent">Insight da plataforma</Badge>
                <Badge tone="safe">Cenário único</Badge>
              </div>
            </div>

            <div className="rounded-[16px] border border-slate-200 bg-white px-4 py-3 text-left dark:border-white/[0.08] dark:bg-slate-900">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                Prêmio
              </p>
              <p className="mt-1 text-[22px] font-semibold tracking-[-0.04em] text-slate-950 dark:text-white">
                R$ 500 mil
              </p>
              <p className="text-[12px] text-slate-600 dark:text-slate-400">para quem acertar as 3</p>
            </div>
          </div>
        </div>

        <div className="p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-[12px] font-medium text-slate-500 dark:text-slate-400">Perguntas do bolão</p>
              <p className="mt-1 text-[14px] font-semibold text-slate-950 dark:text-white">
                Respostas alinhadas ao cenário sem gols
              </p>
            </div>
            <span className="hidden rounded-full bg-slate-100 px-3 py-1.5 text-[12px] font-semibold text-slate-700 ring-1 ring-slate-200 dark:bg-white/[0.06] dark:text-slate-300 dark:ring-white/[0.08] sm:inline-flex">
              3 de 3 coerentes
            </span>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {poolQuestions.map((question) => (
              <QuestionCard key={question.label} question={question} />
            ))}
          </div>

          <div className="mt-5 rounded-[18px] border border-slate-200 bg-white p-5 shadow-[0_8px_18px_rgba(15,23,42,0.035)] dark:border-white/[0.08] dark:bg-slate-900">
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-slate-950 text-white ring-1 ring-slate-950 dark:bg-white dark:text-slate-950 dark:ring-white">
                <Goal className="h-5 w-5" strokeWidth={2} />
              </span>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                  Método sugerido
                </p>
                <h3 className="mt-1 text-[18px] font-semibold tracking-[-0.02em] text-slate-950 dark:text-white">
                  Explorar o cenário sem gols
                </h3>
                <p className="mt-2 max-w-[720px] text-[13px] leading-6 text-slate-600 dark:text-slate-400">
                  Tentar acertar todas as perguntas prevendo gols aumenta muito a dificuldade. Uma abordagem mais simples é marcar 0x0 e alinhar as outras respostas ao mesmo cenário: ninguém marca e não existe momento do primeiro gol.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Panel>

      <div className="grid gap-5">
        <Panel className="p-5">
          <SectionHeader
            eyebrow="Recomendação"
            title="Preenchimento do método"
            description="Use as três respostas como um conjunto único, sem misturar cenários."
          />

          <div className="mt-5 space-y-3">
            {[
              ["Placar", "0 x 0"],
              ["Primeiro gol", "Sem gol"],
              ["Momento do primeiro gol", "Sem gol"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex items-center justify-between gap-4 rounded-[14px] border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/[0.08] dark:bg-slate-950/40"
              >
                <span className="text-[13px] font-medium text-slate-600 dark:text-slate-400">{label}</span>
                <span className="text-[15px] font-semibold text-slate-950 dark:text-white">{value}</span>
              </div>
            ))}
          </div>

          <PrimaryAction
            type="button"
            className="mt-5 w-full"
          >
            Aplicar método
            <CheckCircle2 className="h-4 w-4" strokeWidth={2} />
          </PrimaryAction>
        </Panel>

        <Panel className="p-5">
          <SectionHeader
            eyebrow="Leitura rápida"
            title="Por que faz sentido"
            description="A dica não tenta prever o jogo inteiro. Ela reduz o número de eventos necessários para o mesmo cenário acontecer."
          />

          <div className="mt-5 grid gap-3">
            {[
              ["Menos dependências", "O 0x0 já responde as três perguntas de forma consistente."],
              ["Cenário único", "Placar, autor do gol e minuto seguem a mesma hipótese."],
              ["Execução simples", "O usuário entende a lógica antes de entrar no bolão."],
            ].map(([title, text]) => (
              <div key={title} className="flex gap-3 rounded-[14px] bg-slate-50 p-3 dark:bg-slate-950/40">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                  <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2.2} />
                </span>
                <div>
                  <p className="text-[13px] font-semibold text-slate-950 dark:text-white">{title}</p>
                  <p className="mt-1 text-[12px] leading-5 text-slate-600 dark:text-slate-400">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

export default function MetodosPage() {
  const [activeTab, setActiveTab] = useState("metodos");

  return (
    <main className="min-h-full bg-[#f5f7f9] text-slate-950 dark:bg-slate-950 dark:text-white">
      <div className="mx-auto flex max-w-[1480px] flex-col gap-4 px-5 py-4 md:px-8">
        <header className="rounded-[20px] border border-slate-200 bg-white px-4 py-4 shadow-[0_10px_24px_rgba(15,23,42,0.045)] dark:border-white/[0.08] dark:bg-slate-900 sm:px-5">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <h1 className="text-[29px] font-semibold tracking-[-0.04em] text-slate-950 dark:text-white">
                  Métodos
                </h1>
                <span className="inline-flex h-8 w-fit items-center gap-2 rounded-[11px] bg-slate-100 px-3 text-[12px] font-semibold text-slate-700 ring-1 ring-slate-200 dark:bg-white/[0.06] dark:text-slate-300 dark:ring-white/[0.08]">
                  <Clock3 className="h-3.5 w-3.5" strokeWidth={2} />
                  Curadoria ativa
                </span>
              </div>
              <p className="mt-1 max-w-[760px] text-[14px] leading-6 text-slate-600 dark:text-slate-400">
                Acesse métodos, oportunidades e estratégias organizadas em um só lugar.
              </p>
              <p className="mt-0.5 max-w-[820px] text-[13px] leading-5 text-slate-500 dark:text-slate-500">
                Conteúdos gratuitos, ofertas selecionadas e bolões com leitura prática para usar dentro da rotina do painel.
              </p>
            </div>

            <div className="grid w-full overflow-hidden rounded-[16px] border border-slate-200 bg-slate-50 dark:border-white/[0.08] dark:bg-slate-950/40 sm:grid-cols-3 xl:w-[460px]">
              {headerStats.map((item, index) => (
                <div
                  key={item.label}
                  className={`px-4 py-3 ${index > 0 ? "border-t border-slate-200 dark:border-white/[0.08] sm:border-l sm:border-t-0" : ""}`}
                >
                  <p className="truncate text-[18px] font-semibold tracking-[-0.04em] text-slate-950 dark:text-white">
                    {item.value}
                  </p>
                  <p className="mt-0.5 text-[12px] font-medium text-slate-600 dark:text-slate-300">{item.label}</p>
                  <p className="mt-0.5 truncate text-[11px] text-slate-500 dark:text-slate-500">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <SegmentedNavigation activeTab={activeTab} onChange={setActiveTab} />
          </div>
        </header>

        {activeTab === "metodos" ? <MethodsSection /> : null}
        {activeTab === "rodadas" ? <OffersSection /> : null}
        {activeTab === "bolao" ? <PoolSection /> : null}
      </div>
    </main>
  );
}
