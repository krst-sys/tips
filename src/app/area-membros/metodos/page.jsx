import Link from "next/link";

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
      <path
        d="M7.5 10V7.75A4.5 4.5 0 0 1 12 3.25A4.5 4.5 0 0 1 16.5 7.75V10"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <rect
        x="5"
        y="10"
        width="14"
        height="10"
        rx="3"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function PreviewCard({ title, items }) {
  return (
    <div className="rounded-[26px] border border-slate-200 bg-white/92 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)] dark:border-white/[0.06] dark:bg-[rgba(11,17,27,0.92)] dark:shadow-[0_18px_45px_rgba(0,0,0,0.22)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400 dark:text-white/28">
        Método
      </p>

      <h3 className="mt-3 text-[22px] font-bold tracking-[-0.035em] text-slate-900 dark:text-white">
        {title}
      </h3>

      <div className="mt-5 space-y-3">
        {items.map((item, index) => (
          <div
            key={index}
            className="rounded-[16px] border border-slate-200 bg-slate-50/90 px-4 py-3 dark:border-white/[0.05] dark:bg-white/[0.03]"
          >
            <p className="text-sm text-slate-700 dark:text-white/70">{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniPill({ children }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-3 py-2 text-sm text-slate-600 shadow-[0_8px_20px_rgba(15,23,42,0.05)] dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-white/62 dark:shadow-none">
      <span className="h-2 w-2 rounded-full bg-[#8df126]" />
      <span>{children}</span>
    </div>
  );
}

export default function MetodosPage() {
  return (
    <div className="min-h-screen bg-[#f4f7fb] text-slate-900 dark:bg-[#08111b] dark:text-white">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-5 px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400 dark:text-white/28">
              Área de membros
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-[-0.05em] text-slate-900 dark:text-white">
              Métodos
            </h1>
          </div>

          <div className="inline-flex items-center gap-2 self-start rounded-full border border-[#8df126]/25 bg-[#8df126]/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#628f1d] dark:text-[#d4ffaa]">
            Acesso restrito
          </div>
        </div>

        <section className="relative overflow-hidden rounded-[34px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-4 shadow-[0_24px_80px_rgba(15,23,42,0.08)] dark:border-white/[0.06] dark:bg-[linear-gradient(180deg,#09111b_0%,#0b1420_100%)] dark:shadow-[0_24px_80px_rgba(0,0,0,0.28)] sm:p-6">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-12 -top-12 h-56 w-56 rounded-full bg-sky-400/8 blur-3xl dark:bg-sky-400/7" />
            <div className="absolute -bottom-16 right-0 h-64 w-64 rounded-full bg-[#8df126]/10 blur-3xl dark:bg-[#8df126]/8" />
          </div>

          <div className="relative z-20 mx-auto mb-8 w-full max-w-[1120px]">
            <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_28px_80px_rgba(15,23,42,0.12)] dark:border-white/[0.08] dark:bg-[linear-gradient(135deg,rgba(7,12,20,0.98)_0%,rgba(8,14,23,0.98)_100%)] dark:shadow-[0_34px_100px_rgba(0,0,0,0.44)]">
              <div className="h-px w-full bg-[linear-gradient(90deg,rgba(141,241,38,0.0)_0%,rgba(141,241,38,0.85)_22%,rgba(141,241,38,0.18)_100%)]" />

              <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
                <div className="px-6 py-6 sm:px-8 sm:py-8">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] border border-[#8df126]/20 bg-[#8df126]/10 text-[#6ea91a] dark:text-[#8df126]">
                      <LockIcon />
                    </div>

                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-400 dark:text-white/28">
                        Conteúdo protegido
                      </p>

                      <h2 className="mt-3 max-w-[560px] text-[30px] font-black leading-[1.04] tracking-[-0.055em] text-slate-900 dark:text-white sm:text-[40px]">
                        Área exclusiva para assinantes
                      </h2>
                    </div>
                  </div>

                  <p className="mt-5 max-w-[620px] text-[15px] leading-7 text-slate-600 dark:text-white/60">
                    Desbloqueie os métodos completos e visualize o conteúdo premium da plataforma.
                  </p>

                  <div className="mt-7 flex flex-wrap gap-3">
                    <MiniPill>Estratégias completas</MiniPill>
                    <MiniPill>Conteúdo privado</MiniPill>
                    <MiniPill>Atualizações exclusivas</MiniPill>
                  </div>
                </div>

                <div className="border-t border-slate-200 p-5 dark:border-white/[0.06] lg:border-l lg:border-t-0 lg:p-6">
                  <div className="rounded-[26px] border border-slate-200 bg-[linear-gradient(180deg,#f9fbff_0%,#ffffff_100%)] p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)] dark:border-white/[0.08] dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.04)_0%,rgba(255,255,255,0.02)_100%)] dark:shadow-[0_18px_40px_rgba(0,0,0,0.22)]">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400 dark:text-white/28">
                      Assinatura
                    </p>

                    <p className="mt-3 text-[28px] font-bold leading-[1.05] tracking-[-0.05em] text-slate-900 dark:text-white">
                      Liberar acesso
                    </p>

                    <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-white/56">
                      Ative sua assinatura para visualizar esta área sem bloqueio.
                    </p>

                    <div className="mt-6 flex flex-col gap-3">
                      <Link
                        href="/assinar"
                        className="inline-flex h-12 items-center justify-center rounded-[16px] bg-[#8df126] px-6 text-sm font-extrabold shadow-[0_14px_30px_rgba(141,241,38,0.22)] transition hover:brightness-95"
                        style={{ color: "#07111c" }}
                      >
                        Assinar agora
                      </Link>

                     <Link
  href="/area-membros"
  className="inline-flex h-12 items-center justify-center rounded-[16px] border border-slate-300 bg-white px-6 text-sm font-bold text-slate-900 transition hover:bg-slate-100 dark:border-white/[0.12] dark:bg-[#121c2a] dark:text-white dark:hover:bg-[#182536]"
>
  Voltar para o resumo
</Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10">
            <div className="pointer-events-none select-none blur-[8px] opacity-65">
              <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
                <div className="space-y-5">
                  <PreviewCard
                    title="Entrada controlada"
                    items={[
                      "Checklist de entrada",
                      "Leitura de risco",
                      "Execução com mais controle",
                    ]}
                  />

                  <PreviewCard
                    title="Múltiplas estratégicas"
                    items={[
                      "Seleção mais limpa",
                      "Combinações mais inteligentes",
                      "Menos exposição desnecessária",
                    ]}
                  />
                </div>

                <div className="space-y-5">
                  <PreviewCard
                    title="Progressão inteligente"
                    items={[
                      "Projeção por etapas",
                      "Controle de cenário",
                      "Planejamento mais claro",
                    ]}
                  />

                  <PreviewCard
                    title="Biblioteca premium"
                    items={[
                      "Materiais privados",
                      "Atualizações internas",
                      "Conteúdo exclusivo",
                    ]}
                  />
                </div>
              </div>
            </div>

            <div className="pointer-events-none absolute inset-0 rounded-[28px] bg-[linear-gradient(180deg,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0.4)_100%)] dark:bg-[linear-gradient(180deg,rgba(5,9,15,0.08)_0%,rgba(5,9,15,0.32)_100%)]" />
          </div>
        </section>
      </div>
    </div>
  );
}