import {
  BarChart3,
  CalendarClock,
  Check,
  ChevronRight,
  CreditCard,
  HelpCircle,
  LineChart,
  Moon,
  ShieldCheck,
  Sparkles,
  Trophy,
  UsersRound,
  Wallet,
} from "lucide-react";

// Valores sugeridos. Ajuste aqui quando os precos finais vierem do backend/checkout.
const SUBSCRIPTION_PRICES = {
  monthly: 9.99,
  quarterly: 24.99,
  annual: 89.99,
};

const includedFeatures = [
  { label: "Gestão de banca", icon: Wallet },
  { label: "Registro de apostas", icon: CreditCard },
  { label: "Estatísticas completas", icon: BarChart3 },
  { label: "Progressões", icon: LineChart },
  { label: "Palpites da comunidade", icon: UsersRound },
  { label: "Ranking de palpites", icon: Trophy },
  { label: "Modo claro e escuro", icon: Moon },
  { label: "Atualizações do painel", icon: CalendarClock },
];

const plans = [
  {
    id: "monthly",
    name: "Mensal",
    periodLabel: "/mês",
    price: SUBSCRIPTION_PRICES.monthly,
    months: 1,
    billing: "Cobrança mensal",
    description: "Ideal para começar",
    cta: "Assinar mensal",
    badge: "Flexível",
  },
  {
    id: "annual",
    name: "Anual",
    periodLabel: "/ano",
    price: SUBSCRIPTION_PRICES.annual,
    months: 12,
    billing: "Cobrança anual",
    description: "Melhor custo-benefício",
    cta: "Assinar anual",
    badge: "Melhor oferta",
    secondaryBadge: "Economize mais",
    featured: true,
  },
  {
    id: "quarterly",
    name: "Trimestral",
    periodLabel: "/trimestre",
    price: SUBSCRIPTION_PRICES.quarterly,
    months: 3,
    billing: "Cobrança a cada 3 meses",
    description: "Para usar com consistência",
    cta: "Assinar trimestral",
    badge: "Economize",
  },
];

const currentSubscription = {
  plan: "Gratuito",
  status: "Sem assinatura",
  nextBilling: "Sem próxima cobrança",
};

const faqs = [
  {
    question: "Posso cancelar quando quiser?",
    answer: "Sim. O painel está preparado para cancelamento sem fidelidade quando o checkout for integrado.",
  },
  {
    question: "Os planos têm os mesmos recursos?",
    answer: "Sim. Todos liberam os mesmos recursos. A diferença é apenas o período de cobrança.",
  },
  {
    question: "O acesso é liberado automaticamente?",
    answer: "A estrutura visual já está pronta para liberação automática após a confirmação do pagamento.",
  },
  {
    question: "O plano anual tem desconto?",
    answer: "Sim. Ele tem o menor custo mensal equivalente e foi destacado como melhor oferta.",
  },
];

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function getMonthlyEquivalent(plan) {
  return plan.price / plan.months;
}

function getSavingsPercent(plan) {
  const monthlyTotal = SUBSCRIPTION_PRICES.monthly * plan.months;
  if (plan.months === 1 || monthlyTotal <= plan.price) return null;
  return Math.round(((monthlyTotal - plan.price) / monthlyTotal) * 100);
}

function Badge({ children, tone = "neutral", className = "" }) {
  const toneClass =
    tone === "featured"
      ? "border-lime-300/40 bg-lime-300/12 text-lime-100"
      : tone === "positive"
        ? "border-emerald-300/35 bg-emerald-400/10 text-emerald-100"
        : "border-white/12 bg-white/[0.06] text-slate-200";

  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold",
        toneClass,
        className
      )}
    >
      {children}
    </span>
  );
}

function LightBadge({ children, tone = "neutral" }) {
  const toneClass =
    tone === "positive"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300"
      : "border-slate-200 bg-slate-100 text-slate-700 dark:border-white/[0.08] dark:bg-white/[0.06] dark:text-slate-300";

  return (
    <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-[12px] font-semibold", toneClass)}>
      {children}
    </span>
  );
}

function PlanCard({ plan }) {
  const monthlyEquivalent = getMonthlyEquivalent(plan);
  const savings = getSavingsPercent(plan);

  return (
    <article
      className={cn(
        "relative flex min-h-[620px] flex-col overflow-hidden rounded-[24px] border p-5 shadow-[0_26px_70px_rgba(0,0,0,0.22)]",
        plan.featured
          ? "border-lime-300/45 bg-[linear-gradient(180deg,rgba(28,43,31,0.98),rgba(11,18,29,0.98))] ring-1 ring-lime-300/25 lg:-mt-5 lg:min-h-[660px]"
          : "border-white/[0.11] bg-[rgba(15,23,42,0.86)]"
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-px",
          plan.featured
            ? "bg-gradient-to-r from-transparent via-lime-200/80 to-transparent"
            : "bg-gradient-to-r from-transparent via-white/22 to-transparent"
        )}
      />

      <div className="relative z-[1] flex min-h-[62px] items-start justify-between gap-3">
        <div>
          <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            Plano
          </p>
          <h2 className="mt-2 text-[26px] font-semibold tracking-[-0.035em] text-white">
            {plan.name}
          </h2>
        </div>

        <div className="flex flex-col items-end gap-2">
          {plan.badge ? <Badge tone={plan.featured ? "featured" : "neutral"}>{plan.badge}</Badge> : null}
          {plan.secondaryBadge ? <Badge tone="positive">{plan.secondaryBadge}</Badge> : null}
        </div>
      </div>

      <div className="relative z-[1] mt-8">
        <p className="text-[13px] font-medium text-slate-300">{plan.description}</p>
        <div className="mt-4 flex flex-wrap items-end gap-x-2 gap-y-1">
          <span className="text-[42px] font-semibold leading-none tracking-[-0.055em] text-white">
            {formatCurrency(plan.price)}
          </span>
          <span className="pb-1.5 text-[14px] font-semibold text-slate-300">{plan.periodLabel}</span>
        </div>
        <p className="mt-3 text-[13px] text-slate-400">{plan.billing}</p>
      </div>

      <div
        className={cn(
          "relative z-[1] mt-6 rounded-[18px] border px-4 py-3",
          plan.featured
            ? "border-lime-300/25 bg-lime-300/10"
            : "border-white/[0.09] bg-white/[0.045]"
        )}
      >
        <div className="flex items-center justify-between gap-3">
          <span className="text-[12px] font-medium text-slate-300">Equivalente mensal</span>
          <span className="text-[15px] font-semibold text-white">
            {formatCurrency(monthlyEquivalent)}/mês
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between gap-3">
          <span className="text-[12px] font-medium text-slate-400">Comparado ao mensal</span>
          <span className={cn("text-[13px] font-semibold", savings ? "text-lime-200" : "text-slate-300")}>
            {savings ? `${savings}% de desconto` : "Flexível"}
          </span>
        </div>
      </div>

      <button
        type="button"
        className={cn(
          "relative z-[1] mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-[15px] px-4 text-[14px] font-semibold transition",
          plan.featured
            ? "bg-lime-300 text-slate-950 shadow-[0_16px_34px_rgba(190,242,100,0.2)] hover:bg-lime-200"
            : "bg-white text-slate-950 hover:bg-slate-100"
        )}
      >
        {plan.cta}
        <ChevronRight className="h-4 w-4" />
      </button>

      <div className="relative z-[1] mt-7 border-t border-white/[0.09] pt-5">
        <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-slate-400">
          Inclui
        </p>
        <div className="mt-4 grid gap-3">
          {includedFeatures.map((feature) => {
            const Icon = feature.icon;

            return (
              <div key={feature.label} className="flex items-center gap-3 text-[13px] font-medium text-slate-200">
                <span
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full ring-1",
                    plan.featured
                      ? "bg-lime-300/12 text-lime-200 ring-lime-300/25"
                      : "bg-white/[0.06] text-slate-200 ring-white/[0.12]"
                  )}
                >
                  <Check className="h-3.5 w-3.5" strokeWidth={2.4} />
                </span>
                <Icon className="h-4 w-4 shrink-0 text-slate-400" />
                <span className="min-w-0">{feature.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </article>
  );
}

function SubscriptionStatus() {
  return (
    <section className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.045)] dark:border-white/[0.08] dark:bg-slate-900">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-slate-100 text-slate-700 ring-1 ring-slate-200 dark:bg-white/[0.06] dark:text-slate-300 dark:ring-white/[0.08]">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
              Plano atual
            </p>
            <h2 className="mt-1 text-[18px] font-semibold tracking-[-0.02em] text-slate-950 dark:text-white">
              {currentSubscription.plan}
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              <LightBadge>{currentSubscription.status}</LightBadge>
              <LightBadge>{currentSubscription.nextBilling}</LightBadge>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-[12px] bg-white px-3.5 text-[13px] font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50 dark:bg-white/[0.04] dark:text-slate-300 dark:ring-white/[0.08] dark:hover:bg-white/[0.07] sm:w-auto"
        >
          <CreditCard className="h-4 w-4" />
          Gerenciar assinatura
        </button>
      </div>
    </section>
  );
}

function FaqSection() {
  return (
    <section className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.045)] dark:border-white/[0.08] dark:bg-slate-900">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] bg-slate-100 text-slate-700 ring-1 ring-slate-200 dark:bg-white/[0.06] dark:text-slate-300 dark:ring-white/[0.08]">
          <HelpCircle className="h-4 w-4" />
        </span>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
            FAQ
          </p>
          <h2 className="mt-1 text-[18px] font-semibold tracking-[-0.02em] text-slate-950 dark:text-white">
            Dúvidas rápidas
          </h2>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {faqs.map((item) => (
          <div
            key={item.question}
            className="rounded-[16px] border border-slate-200 bg-slate-50 p-4 dark:border-white/[0.08] dark:bg-white/[0.035]"
          >
            <h3 className="text-[14px] font-semibold text-slate-950 dark:text-white">{item.question}</h3>
            <p className="mt-2 text-[13px] leading-5 text-slate-600 dark:text-slate-300">{item.answer}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function AssinaturaPage() {
  return (
    <main className="min-h-full bg-[#f5f7f9] text-slate-950 dark:bg-slate-950 dark:text-white">
      <div className="mx-auto flex max-w-[1480px] flex-col gap-6 px-5 py-6 md:px-8">
        <section className="relative overflow-hidden rounded-[28px] border border-slate-800 bg-[#0b111d] px-5 py-6 shadow-[0_24px_70px_rgba(15,23,42,0.18)] dark:border-white/[0.08] md:px-7 md:py-8">
          <div className="pointer-events-none absolute inset-0 opacity-[0.22] [background-image:linear-gradient(rgba(255,255,255,0.075)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.075)_1px,transparent_1px)] [background-size:38px_38px]" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_50%_0%,rgba(190,242,100,0.16),transparent_58%)]" />

          <header className="relative z-[1] mx-auto max-w-[860px] text-center">
            <div className="flex justify-center">
              <Badge tone="positive">Cancele quando quiser</Badge>
            </div>
            <h1 className="mt-5 text-[34px] font-semibold tracking-[-0.05em] text-white sm:text-[42px]">
              Escolha seu plano
            </h1>
            <p className="mx-auto mt-3 max-w-[640px] text-[15px] leading-6 text-slate-300">
              Acesse todos os recursos do painel e acompanhe sua banca com mais controle.
            </p>
            <p className="mt-3 text-[13px] font-medium text-slate-400">
              Todos os planos incluem os mesmos recursos.
            </p>
          </header>

          <div className="relative z-[1] mt-8 grid items-end gap-4 md:grid-cols-2 xl:grid-cols-3 xl:gap-5">
            {plans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </div>
        </section>

        <SubscriptionStatus />
        <FaqSection />
      </div>
    </main>
  );
}
