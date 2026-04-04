"use client";

export default function DashboardPage() {
  const periods = ["7 dias", "30 dias", "Mês"];
  const activePeriod = "30 dias";

  const stats = [
    {
      label: "Banca atual",
      value: "R$ 1.842,00",
      meta: "+8,4% no período",
      positive: true,
      icon: "wallet",
    },
    {
      label: "Lucro líquido",
      value: "+R$ 428,00",
      meta: "Resultado consolidado",
      positive: true,
      icon: "profit",
    },
    {
      label: "ROI",
      value: "12,4%",
      meta: "Rentabilidade atual",
      positive: true,
      icon: "chart",
    },
    {
      label: "Entradas",
      value: "38",
      meta: "No período selecionado",
      positive: true,
      icon: "ticket",
    },
  ];

  const bankrollSeries = [
    1180, 1215, 1198, 1260, 1312, 1288, 1365, 1420, 1390, 1510, 1588, 1670,
    1765, 1842,
  ];

  const monthlySummary = [
    { label: "Greens", value: "24", color: "green" },
    { label: "Reds", value: "11", color: "red" },
    { label: "Taxa de acerto", value: "68,5%", color: "neutral" },
    { label: "Stake média", value: "R$ 45,00", color: "neutral" },
    { label: "Melhor sequência", value: "7 greens", color: "green" },
    { label: "Pior sequência", value: "3 reds", color: "red" },
  ];

  function Icon({ type, className = "h-5 w-5" }) {
    if (type === "wallet") {
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <path
            d="M4 8.5C4 7.12 5.12 6 6.5 6H17.5C18.88 6 20 7.12 20 8.5V15.5C20 16.88 18.88 18 17.5 18H6.5C5.12 18 4 16.88 4 15.5V8.5Z"
            stroke="currentColor"
            strokeWidth="1.7"
          />
          <path
            d="M15.5 12H20"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
          <circle cx="15.5" cy="12" r="1" fill="currentColor" />
          <path
            d="M7 6V5.7C7 4.76 7.76 4 8.7 4H17"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
      );
    }

    if (type === "profit") {
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <path
            d="M5 16L10 11L13.2 14.2L19 8.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M15.5 8.5H19V12"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    }

    if (type === "chart") {
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <path d="M5 18V11" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          <path d="M10 18V7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          <path d="M15 18V13" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          <path d="M20 18V9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      );
    }

    if (type === "ticket") {
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <path
            d="M7 7H17C18.1 7 19 7.9 19 9V10C17.9 10 17 10.9 17 12C17 13.1 17.9 14 19 14V15C19 16.1 18.1 17 17 17H7C5.9 17 5 16.1 5 15V14C6.1 14 7 13.1 7 12C7 10.9 6.1 10 5 10V9C5 7.9 5.9 7 7 7Z"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
          <path
            d="M12 8.5V15.5"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeDasharray="1.8 1.8"
          />
        </svg>
      );
    }

    return null;
  }

  function StatCard({ item }) {
    return (
      <div className="rounded-[24px] border border-white/[0.06] bg-[linear-gradient(180deg,#101925_0%,#0d1520_100%)] p-5 shadow-[0_14px_30px_rgba(0,0,0,0.22)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.09em] text-white/32">
              {item.label}
            </p>

            <h3 className="mt-3 text-[30px] font-black tracking-[-0.05em] text-white">
              {item.value}
            </h3>

            <p
              className={`mt-3 text-[13px] font-medium ${
                item.positive ? "text-[#8df126]" : "text-[#e58f8f]"
              }`}
            >
              {item.meta}
            </p>
          </div>

          <div className="flex h-11 w-11 items-center justify-center rounded-[14px] border border-white/[0.06] bg-[linear-gradient(180deg,#152131_0%,#111b29_100%)] text-[#86a5cf]">
            <Icon type={item.icon} className="h-5 w-5" />
          </div>
        </div>
      </div>
    );
  }

  function SummaryPill({ item }) {
    const colorClass =
      item.color === "green"
        ? "border-[#2c4720] bg-[linear-gradient(180deg,#132012_0%,#111a12_100%)] text-[#8df126]"
        : item.color === "red"
        ? "border-[#4a2729] bg-[linear-gradient(180deg,#1b1214_0%,#171012_100%)] text-[#db8f8f]"
        : "border-white/[0.06] bg-[linear-gradient(180deg,#101925_0%,#0d1520_100%)] text-white/78";

    return (
      <div className={`rounded-[16px] border px-4 py-4 ${colorClass}`}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] opacity-60">
          {item.label}
        </p>
        <div className="mt-2 text-[20px] font-black tracking-[-0.04em]">
          {item.value}
        </div>
      </div>
    );
  }

  function BankrollChart() {
    const max = Math.max(...bankrollSeries);
    const min = Math.min(...bankrollSeries);
    const range = max - min || 1;

    const points = bankrollSeries
      .map((value, index) => {
        const x = (index / (bankrollSeries.length - 1)) * 100;
        const y = 100 - ((value - min) / range) * 76 - 12;
        return `${x},${y}`;
      })
      .join(" ");

    const areaPoints = `0,100 ${points} 100,100`;

    return (
      <div className="rounded-[22px] border border-white/[0.06] bg-[linear-gradient(180deg,#0d1520_0%,#0b121b_100%)] p-4">
        <div className="h-[280px] w-full">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
            <defs>
              <linearGradient id="bankrollLine" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#6e8fbe" />
                <stop offset="55%" stopColor="#86a5cf" />
                <stop offset="100%" stopColor="#8df126" />
              </linearGradient>
              <linearGradient id="bankrollArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(110,143,190,0.22)" />
                <stop offset="100%" stopColor="rgba(110,143,190,0.02)" />
              </linearGradient>
            </defs>

            {[20, 40, 60, 80].map((line) => (
              <line
                key={line}
                x1="0"
                y1={line}
                x2="100"
                y2={line}
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="0.6"
                strokeDasharray="2 3"
              />
            ))}

            <polygon points={areaPoints} fill="url(#bankrollArea)" />
            <polyline
              points={points}
              fill="none"
              stroke="url(#bankrollLine)"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {bankrollSeries.map((value, index) => {
              const x = (index / (bankrollSeries.length - 1)) * 100;
              const y = 100 - ((value - min) / range) * 76 - 12;
              return (
                <g key={`${value}-${index}`}>
                  <circle cx={x} cy={y} r="1.9" fill="#86a5cf" />
                  <circle cx={x} cy={y} r="3.2" fill="rgba(134,165,207,0.10)" />
                </g>
              );
            })}
          </svg>
        </div>

        <div className="mt-4 flex items-center justify-between gap-2 text-[12px] font-medium text-white/36">
          <span>Início</span>
          <span>Evolução da banca</span>
          <span>Atual</span>
        </div>
      </div>
    );
  }

  return (
    <main className="relative flex h-full min-h-0 flex-col overflow-hidden bg-[#08111b] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_8%,rgba(92,126,176,0.15),transparent_20%),radial-gradient(circle_at_92%_10%,rgba(141,241,38,0.06),transparent_16%),linear-gradient(180deg,#08111b_0%,#0a1320_100%)]" />
      </div>

      <div className="relative z-10 min-h-0 flex-1 overflow-y-auto">
        <header className="relative z-30 shrink-0 border-b border-white/[0.06] bg-[rgba(9,15,24,0.92)] backdrop-blur-xl">
          <div className="mx-auto flex max-w-[1550px] flex-col gap-4 px-5 py-5 md:px-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.11em] text-[#8df126]">
                Gestão de banca
              </p>

              <h1 className="mt-1 text-[30px] font-black tracking-[-0.06em] text-white">
                Resumo da banca
              </h1>

              <p className="mt-2 text-[14px] text-white/48">
                Acompanhe a evolução, resultados e controle da sua banca.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-[15px] border border-white/[0.06] bg-white/[0.02] p-1">
              {periods.map((period) => {
                const isActive = period === activePeriod;
                return (
                  <button
                    key={period}
                    className={`rounded-[11px] px-4 py-2 text-[13px] font-semibold transition ${
                      isActive
                        ? "bg-[#8df126] text-[#081200] shadow-[0_6px_16px_rgba(141,241,38,0.20)]"
                        : "text-white/48 hover:text-white/82"
                    }`}
                  >
                    {period}
                  </button>
                );
              })}
            </div>
          </div>
        </header>

        <section className="mx-auto max-w-[1550px] px-5 py-6 md:px-8">
          <div className="relative overflow-hidden rounded-[30px] border border-white/[0.06] bg-[linear-gradient(180deg,#101925_0%,#0d1520_100%)] p-7 shadow-[0_20px_44px_rgba(0,0,0,0.22)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_20%,rgba(92,126,176,0.14),transparent_24%)]" />

            <div className="relative z-10">
              <div className="inline-flex rounded-full border border-white/[0.07] bg-white/[0.03] px-4 py-2 text-[11px] font-black uppercase tracking-[0.10em] text-[#8df126]">
                Resumo principal
              </div>

              <h2 className="mt-5 text-[36px] font-black leading-[0.95] tracking-[-0.06em] text-white md:text-[44px]">
                Controle total da
                <br />
                <span className="text-[#8df126]">sua gestão de banca</span>
              </h2>

              <p className="mt-4 max-w-[620px] text-[15px] leading-[1.6] text-white/58">
                Veja com clareza onde sua banca está, quanto evoluiu no período e
                como seu desempenho está se comportando.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {stats.map((item) => (
              <StatCard key={item.label} item={item} />
            ))}
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[28px] border border-white/[0.06] bg-[linear-gradient(180deg,#101925_0%,#0d1520_100%)] p-6 shadow-[0_16px_34px_rgba(0,0,0,0.22)]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.10em] text-[#8df126]">
                    Evolução
                  </p>
                  <h2 className="mt-2 text-[24px] font-black tracking-[-0.05em] text-white">
                    Evolução da banca
                  </h2>
                </div>

                <div className="rounded-full border border-white/[0.06] bg-[linear-gradient(180deg,#152131_0%,#111a26_100%)] px-3 py-1.5 text-[12px] font-semibold text-[#8df126]">
                  R$ 1.842,00 atual
                </div>
              </div>

              <div className="mt-6">
                <BankrollChart />
              </div>
            </div>

            <div className="rounded-[28px] border border-white/[0.06] bg-[linear-gradient(180deg,#101925_0%,#0d1520_100%)] p-6 shadow-[0_16px_34px_rgba(0,0,0,0.22)]">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.10em] text-[#8df126]">
                  Resumo do período
                </p>
                <h2 className="mt-2 text-[24px] font-black tracking-[-0.05em] text-white">
                  Indicadores
                </h2>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-2">
                {monthlySummary.map((item) => (
                  <SummaryPill key={item.label} item={item} />
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}