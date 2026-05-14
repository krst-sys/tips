import {
  Check,
  ChevronRight,
  CreditCard,
  Headset,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
  Zap,
} from "lucide-react";

// Valores sugeridos. Ajuste aqui quando os precos finais vierem do backend/checkout.
const SUBSCRIPTION_PRICES = {
  monthly: 9.99,
  quarterly: 24.99,
  annual: 89.99,
};

const coreBenefits = [
  "Gestão de banca",
  "Registro de apostas",
  "Estatísticas",
  "Progressões",
  "Comunidade",
];

const plans = [
  {
    id: "monthly",
    name: "Mensal",
    description: "Para começar sem compromisso.",
    price: SUBSCRIPTION_PRICES.monthly,
    unit: "/mês",
    months: 1,
    detail: "Sem fidelidade",
    cta: "Começar mensal",
  },
  {
    id: "quarterly",
    name: "Trimestral",
    description: "Para manter consistência.",
    price: SUBSCRIPTION_PRICES.quarterly,
    unit: "/trimestre",
    months: 3,
    detail: "Equivale a R$ 8,33/mês",
    cta: "Assinar trimestral",
  },
  {
    id: "annual",
    name: "Anual",
    description: "Melhor custo-benefício.",
    price: SUBSCRIPTION_PRICES.annual,
    unit: "/ano",
    months: 12,
    detail: "Equivale a R$ 7,50/mês",
    cta: "Assinar anual",
    badge: "Melhor custo-benefício",
    featured: true,
  },
];

const trustItems = [
  { label: "Pagamento seguro", icon: LockKeyhole },
  { label: "Acesso imediato", icon: Zap },
  { label: "Cancele quando quiser", icon: RefreshCw },
  { label: "Suporte humano", icon: Headset },
];

const faqItems = [
  {
    question: "Todos os planos têm os mesmos recursos?",
    answer: "Sim. Todos liberam os recursos do Filtto. O que muda é o período de cobrança.",
  },
  {
    question: "Posso cancelar quando quiser?",
    answer: "Sim. A assinatura fica preparada para cancelamento pela área de cobrança.",
  },
  {
    question: "Quando meu acesso é liberado?",
    answer: "Após a integração do checkout, o acesso será liberado automaticamente depois da confirmação do pagamento.",
  },
  {
    question: "Posso mudar de plano depois?",
    answer: "Sim. A estrutura visual já está preparada para gerenciamento e troca de plano.",
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

function HeaderPoint({ children }) {
  return (
    <span className="inline-flex items-center gap-2 text-[13px] font-medium text-[var(--gp-text-secondary)]">
      <span className="h-1.5 w-1.5 rounded-full bg-[var(--gp-primary)]" />
      {children}
    </span>
  );
}

function PlanCard({ plan }) {
  return (
    <article
      className={cn(
        "relative flex h-full flex-col rounded-[20px] border p-5 shadow-[var(--gp-shadow-soft)]",
        plan.featured
          ? "border-[rgba(34,197,94,0.42)] bg-[linear-gradient(180deg,rgba(34,197,94,0.11),var(--gp-surface)_44%)]"
          : "border-[var(--gp-border)] bg-[var(--gp-surface)]"
      )}
    >
      <div className="flex min-h-[30px] items-start justify-between gap-3">
        <h2 className="text-[22px] font-semibold tracking-[-0.035em] text-[var(--gp-text)]">
          {plan.name}
        </h2>
        {plan.badge ? (
          <span className="rounded-full border border-[rgba(34,197,94,0.3)] bg-[rgba(34,197,94,0.11)] px-2.5 py-1 text-[11px] font-semibold text-[var(--gp-primary)]">
            {plan.badge}
          </span>
        ) : null}
      </div>

      <p className="mt-3 min-h-[20px] text-[13px] text-[var(--gp-text-secondary)]">{plan.description}</p>

      <div className="mt-6">
        <div className="flex flex-wrap items-end gap-x-2 gap-y-1">
          <span className="text-[38px] font-semibold leading-none tracking-[-0.055em] text-[var(--gp-text)]">
            {formatCurrency(plan.price)}
          </span>
          <span className="pb-1.5 text-[14px] font-semibold text-[var(--gp-text-secondary)]">{plan.unit}</span>
        </div>
        <p
          className={cn(
            "mt-2 text-[13px] font-medium",
            plan.featured ? "text-[var(--gp-primary)]" : "text-[var(--gp-text-secondary)]"
          )}
        >
          {plan.detail}
        </p>
      </div>

      <div className="mt-6 border-t border-[var(--gp-border)] pt-5">
        <div className="grid gap-2.5">
          {coreBenefits.map((benefit) => (
            <div key={benefit} className="flex items-center gap-2.5 text-[13px] font-medium text-[var(--gp-text-secondary)]">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[rgba(34,197,94,0.1)] text-[var(--gp-primary)] ring-1 ring-[rgba(34,197,94,0.2)]">
                <Check className="h-3.5 w-3.5" strokeWidth={2.4} />
              </span>
              {benefit}
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        className={cn(
          "mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-[13px] px-4 text-[14px] font-semibold transition",
          plan.featured
            ? "gp-button-primary hover:translate-y-[-1px]"
            : "gp-button-secondary border"
        )}
      >
        {plan.cta}
        <ChevronRight className="h-4 w-4" />
      </button>
    </article>
  );
}

function TrustLine() {
  return (
    <section className="rounded-[16px] border border-[var(--gp-border)] bg-[var(--gp-surface)] px-4 py-3 shadow-[var(--gp-shadow-soft)]">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {trustItems.map((item) => {
          const Icon = item.icon;

          return (
            <div key={item.label} className="flex items-center gap-2.5 text-[13px] font-medium text-[var(--gp-text-secondary)]">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-[var(--gp-surface-elevated)] text-[var(--gp-text-secondary)] ring-1 ring-[var(--gp-border)]">
                <Icon className="h-4 w-4" />
              </span>
              {item.label}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function FaqSection() {
  return (
    <section className="rounded-[18px] border border-[var(--gp-border)] bg-[var(--gp-surface)] p-5 shadow-[var(--gp-shadow-soft)]">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[var(--gp-surface-elevated)] text-[var(--gp-text-secondary)] ring-1 ring-[var(--gp-border)]">
          <ShieldCheck className="h-4 w-4" />
        </span>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--gp-text-muted)]">
            FAQ
          </p>
          <h2 className="mt-1 text-[18px] font-semibold tracking-[-0.03em] text-[var(--gp-text)]">
            Antes de assinar
          </h2>
        </div>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        {faqItems.map((item) => (
          <div
            key={item.question}
            className="rounded-[14px] border border-[var(--gp-border)] bg-[var(--gp-surface-elevated)] p-4"
          >
            <h3 className="text-[14px] font-semibold text-[var(--gp-text)]">{item.question}</h3>
            <p className="mt-2 text-[13px] leading-5 text-[var(--gp-text-secondary)]">{item.answer}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function AssinaturaPage() {
  return (
    <main className="gp-main min-h-full text-[var(--gp-text)]">
      <div className="mx-auto flex max-w-[1480px] flex-col gap-6 px-5 py-6 md:px-8">
        <header className="max-w-[880px]">
          <h1 className="text-[32px] font-semibold tracking-[-0.05em] text-[var(--gp-text)]">
            Escolha seu plano
          </h1>
          <p className="mt-2 max-w-[760px] text-[15px] leading-6 text-[var(--gp-text-secondary)]">
            Todos os planos liberam os recursos do Filtto. O que muda é o período de cobrança e a economia.
          </p>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
            <HeaderPoint>Todos os recursos inclusos</HeaderPoint>
            <HeaderPoint>Cancele quando quiser</HeaderPoint>
            <HeaderPoint>Sem fidelidade</HeaderPoint>
          </div>
        </header>

        <section className="grid items-stretch gap-5 lg:grid-cols-3">
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </section>

        <TrustLine />
        <FaqSection />
      </div>
    </main>
  );
}
