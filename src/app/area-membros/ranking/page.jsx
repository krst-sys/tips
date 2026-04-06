const popularLeagues = [
  { name: "Premier League", value: 2542, percent: 100 },
  { name: "La Liga", value: 2187, percent: 86 },
  { name: "Serie A", value: 1834, percent: 72 },
  { name: "Bundesliga", value: 1491, percent: 58 },
  { name: "Brasileirão", value: 1280, percent: 50 },
];

const bestGreenLeagues = [
  { name: "Serie A", value: 68.4, percent: 100 },
  { name: "Premier League", value: 64.9, percent: 95 },
  { name: "La Liga", value: 62.7, percent: 92 },
  { name: "Bundesliga", value: 60.8, percent: 89 },
  { name: "Brasileirão", value: 58.2, percent: 85 },
];

const worstLeagues = [
  { name: "MLS", value: 44.2, percent: 100 },
  { name: "Ligue 1", value: 42.8, percent: 96 },
  { name: "Brasileirão", value: 41.3, percent: 93 },
  { name: "Premier League", value: 39.9, percent: 90 },
  { name: "La Liga", value: 38.6, percent: 87 },
];

const topUsers = [
  { rank: 1, name: "Rei dos Palpites", accuracy: 71.4, picks: 1258, streak: 12, initials: "RP" },
  { rank: 2, name: "Craque do Green", accuracy: 69.2, picks: 982, streak: 7, initials: "CG" },
  { rank: 3, name: "Olho Certeiro", accuracy: 66.8, picks: 1105, streak: 5, initials: "OC" },
  { rank: 4, name: "Palpiteira VIP", accuracy: 64.3, picks: 875, streak: 4, initials: "PV" },
  { rank: 5, name: "Green Machine", accuracy: 63.7, picks: 745, streak: 6, initials: "GM" },
];

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function RankingCard({ title, description, accent, items, formatValue }) {
  const accents = {
    lime: {
      dot: "bg-lime-500 dark:bg-lime-400",
      soft: "bg-lime-500/10 text-lime-700 ring-lime-500/20 dark:text-lime-300 dark:ring-lime-400/20",
      bar: "bg-lime-500 dark:bg-lime-400",
    },
    emerald: {
      dot: "bg-emerald-500 dark:bg-emerald-400",
      soft: "bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 dark:text-emerald-300 dark:ring-emerald-400/20",
      bar: "bg-emerald-500 dark:bg-emerald-400",
    },
    red: {
      dot: "bg-rose-500 dark:bg-rose-400",
      soft: "bg-rose-500/10 text-rose-700 ring-rose-500/20 dark:text-rose-300 dark:ring-rose-400/20",
      bar: "bg-rose-500 dark:bg-rose-400",
    },
  };

  const tone = accents[accent] || accents.lime;

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-[#0b1420] dark:shadow-[0_18px_50px_rgba(0,0,0,0.25)]">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className={cn("h-2.5 w-2.5 rounded-full", tone.dot)} />
            <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
              {title}
            </h2>
          </div>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{description}</p>
        </div>
        <div className={cn("rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ring-1", tone.soft)}>
          Ranking
        </div>
      </div>

      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={item.name}
            className="rounded-2xl border border-slate-200/80 bg-slate-50/70 px-4 py-3 dark:border-white/6 dark:bg-white/[0.03]"
          >
            <div className="mb-2 flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-xs font-semibold text-slate-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200">
                  {index + 1}
                </div>
                <span className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                  {item.name}
                </span>
              </div>
              <span className="text-sm font-semibold text-slate-900 dark:text-white">
                {formatValue(item.value)}
              </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/8">
              <div
                className={cn("h-full rounded-full", tone.bar)}
                style={{ width: `${item.percent}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function UserRow({ user }) {
  const rankTone =
    user.rank === 1
      ? "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-300"
      : user.rank === 2
      ? "border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-400/20 dark:bg-slate-400/10 dark:text-slate-200"
      : user.rank === 3
      ? "border-orange-300 bg-orange-50 text-orange-700 dark:border-orange-400/20 dark:bg-orange-400/10 dark:text-orange-300"
      : "border-slate-200 bg-white text-slate-700 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-200";

  return (
    <div className="grid gap-4 px-5 py-4 transition-colors hover:bg-slate-50/80 dark:hover:bg-white/[0.025] lg:grid-cols-[90px_minmax(260px,1.3fr)_170px_140px_150px] lg:items-center lg:px-6">
      <div className="flex items-center gap-3">
        <div className={cn("flex h-11 w-11 items-center justify-center rounded-2xl border text-sm font-bold", rankTone)}>
          #{user.rank}
        </div>
        <div className="lg:hidden">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
            posição
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-sm font-bold text-white dark:bg-white dark:text-slate-900">
          {user.initials}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{user.name}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Elegível no ranking com mínimo de palpites</p>
        </div>
      </div>

      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500 lg:hidden">
          taxa de acerto
        </p>
        <p className="mt-1 text-lg font-semibold text-emerald-600 dark:text-emerald-400 lg:mt-0">
          {user.accuracy.toFixed(1).replace(".", ",")}%
        </p>
      </div>

      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500 lg:hidden">
          palpites
        </p>
        <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100 lg:mt-0">
          {user.picks.toLocaleString("pt-BR")}
        </p>
      </div>

      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500 lg:hidden">
          sequência
        </p>
        <div className="mt-1 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300 lg:mt-0">
          <span className="h-2 w-2 rounded-full bg-emerald-500 dark:bg-emerald-400" />
          {user.streak} greens
        </div>
      </div>
    </div>
  );
}

export default function RankingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#08111b] dark:text-white">
      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <section className="rounded-[32px] border border-slate-200 bg-white px-5 py-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-[#0b1420] dark:shadow-[0_18px_50px_rgba(0,0,0,0.25)] sm:px-6 sm:py-6">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 dark:bg-emerald-400" />
                  Ranking da comunidade
                </div>

                <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                  <div>
                    <h1 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
                      Ranking
                    </h1>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400 sm:text-[15px]">
                      Visão geral das ligas com mais atividade, melhor desempenho e menor taxa de acerto nos palpites.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 xl:min-w-[360px]">
                <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 dark:border-white/10 dark:bg-white/[0.03]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                    ligas
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">24</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 dark:border-white/10 dark:bg-white/[0.03]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                    palpites
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">18.4k</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 dark:border-white/10 dark:bg-white/[0.03]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                    usuários
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">1.2k</p>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-5 xl:grid-cols-3">
            <RankingCard
              title="Ligas mais populares"
              description="Baseado no volume total de palpites."
              accent="lime"
              items={popularLeagues}
              formatValue={(value) => value.toLocaleString("pt-BR")}
            />

            <RankingCard
              title="Ligas com maior % de green"
              description="Melhor desempenho entre os palpites registrados."
              accent="emerald"
              items={bestGreenLeagues}
              formatValue={(value) => `${value.toFixed(1).replace(".", ",")}%`}
            />

            <RankingCard
              title="Ligas com menor taxa de acerto"
              description="Competições com maior dificuldade para os usuários."
              accent="red"
              items={worstLeagues}
              formatValue={(value) => `${value.toFixed(1).replace(".", ",")}%`}
            />
          </section>

          <section className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-[#0b1420] dark:shadow-[0_18px_50px_rgba(0,0,0,0.25)]">
            <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-5 dark:border-white/8 sm:px-6 sm:py-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
                  <span className="h-2 w-2 rounded-full bg-slate-700 dark:bg-slate-200" />
                  Usuários em destaque
                </div>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-[30px]">
                  Top 5 usuários
                </h2>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Ordenado por taxa de acerto na aba de palpites.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300">
                Considerar mínimo de 50 palpites para elegibilidade.
              </div>
            </div>

            <div className="hidden grid-cols-[90px_minmax(260px,1.3fr)_170px_140px_150px] gap-4 border-b border-slate-200 px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:border-white/8 dark:text-slate-500 lg:grid">
              <div>Posição</div>
              <div>Usuário</div>
              <div>Taxa de acerto</div>
              <div>Palpites</div>
              <div>Sequência</div>
            </div>

            <div className="divide-y divide-slate-200 dark:divide-white/8">
              {topUsers.map((user) => (
                <UserRow key={user.rank} user={user} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
