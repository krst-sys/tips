const STATIC_MOMENTUM_BARS = [
  { valueTop: 4, valueBottom: 2 },
  { valueTop: 7, valueBottom: 3 },
  { valueTop: 11, valueBottom: 5 },
  { valueTop: 16, valueBottom: 8 },
  { valueTop: 24, valueBottom: 12 },
  { valueTop: 34, valueBottom: 18 },
  { valueTop: 28, valueBottom: 11 },
  { valueTop: 22, valueBottom: 7 },
  { valueTop: 15, valueBottom: 6 },
  { valueTop: 8, valueBottom: 4 },
  { valueTop: 4, valueBottom: 8 },
  { valueTop: 7, valueBottom: 14 },
  { valueTop: 10, valueBottom: 26 },
  { valueTop: 6, valueBottom: 40 },
  { valueTop: 4, valueBottom: 24 },
  { valueTop: 8, valueBottom: 10 },
  { valueTop: 14, valueBottom: 5 },
  { valueTop: 18, valueBottom: 4 },
  { valueTop: 26, valueBottom: 6 },
  { valueTop: 32, valueBottom: 7 },
  { valueTop: 24, valueBottom: 9 },
  { valueTop: 18, valueBottom: 12 },
  { valueTop: 11, valueBottom: 16 },
  { valueTop: 8, valueBottom: 20 },
  { valueTop: 7, valueBottom: 28 },
  { valueTop: 10, valueBottom: 18 },
  { valueTop: 16, valueBottom: 9 },
  { valueTop: 22, valueBottom: 5 },
  { valueTop: 30, valueBottom: 4 },
  { valueTop: 26, valueBottom: 6 },
  { valueTop: 20, valueBottom: 10 },
  { valueTop: 16, valueBottom: 14 },
  { valueTop: 12, valueBottom: 22 },
  { valueTop: 9, valueBottom: 30 },
  { valueTop: 15, valueBottom: 18 },
  { valueTop: 24, valueBottom: 10 },
  { valueTop: 34, valueBottom: 6 },
  { valueTop: 28, valueBottom: 8 },
];

const STATIC_GOAL_EVENTS = [
  { position: 22, side: "top" },
  { position: 41, side: "bottom" },
  { position: 72, side: "bottom" },
  { position: 91, side: "top" },
];

const CARD_THEMES = {
  dark: {
    card: "bg-[#27305e]",
    divider: "bg-white/12",
    competition: "text-blue-100/80",
    muted: "text-white/70",
    score: "text-white",
    barTop: "#b8d4ff",
    barBottom: "#b8d4ff",
    event: "border-white/80 bg-[#27305e] text-white",
  },
};

function compactName(name) {
  if (!name) return "Time";
  return name.length > 18 ? `${name.slice(0, 16)}...` : name;
}

function getDisplayStatus(event) {
  if (event?.status === "finished" || event?.status === "penalties") return "FT";
  if (event?.status === "live") return event?.currentMinute ? `${event.currentMinute}'` : "AO VIVO";
  return "PRÉ";
}

function getScore(value, fallback) {
  return value === null || value === undefined ? fallback : value;
}

function GoalIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 18 18" aria-hidden="true">
      <circle cx="9" cy="9" r="7.1" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M9 5.2 11.8 7.1 10.8 10.3H7.2L6.2 7.1 9 5.2Z"
        fill="currentColor"
      />
      <path
        d="m4.8 10.8 2.4-.5M13.2 10.8l-2.4-.5M6.2 7.1 5 4.9M11.8 7.1 13 4.9M9 12.2v2.2"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.2"
      />
    </svg>
  );
}

function MomentumEvent({ event, theme }) {
  const verticalClass = event.side === "top" ? "top-[8px]" : "bottom-[8px]";

  return (
    <span
      className={`absolute z-20 flex h-[17px] w-[17px] -translate-x-1/2 items-center justify-center rounded-full border ${theme.event} ${verticalClass}`}
      style={{ left: `${event.position}%` }}
    >
      <GoalIcon className="h-[12px] w-[12px]" />
    </span>
  );
}

function MomentumChart({ bars, events, theme }) {
  return (
    <div className="relative h-[86px] min-w-0 overflow-hidden">
      <div className="absolute inset-y-0 left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-white/45" />
      <div className="absolute inset-y-2 left-1/2 w-px -translate-x-1/2 bg-white/18" />

      <div className="relative z-10 flex h-full items-center justify-between px-3">
        {bars.map((bar, index) => {
          const topHeight = Math.max(3, Math.min(40, bar.valueTop));
          const bottomHeight = Math.max(3, Math.min(40, bar.valueBottom));

          return (
            <div
              key={`${bar.valueTop}-${bar.valueBottom}-${index}`}
              className="flex w-[5px] flex-col items-center justify-center"
            >
              <span
                className="block w-[5px] rounded-t-full"
                style={{ height: `${topHeight}px`, backgroundColor: theme.barTop }}
              />
              <span className="block h-px w-[5px]" />
              <span
                className="block w-[5px] rounded-b-full"
                style={{ height: `${bottomHeight}px`, backgroundColor: theme.barBottom }}
              />
            </div>
          );
        })}
      </div>

      {events.map((event) => (
        <MomentumEvent key={`${event.position}-${event.side}`} event={event} theme={theme} />
      ))}
    </div>
  );
}

export function MatchMomentumResultCard({
  status = "FT",
  competition = "Ligue 1",
  homeTeam = "Red Star",
  awayTeam = "Rodez",
  homeScore = 2,
  awayScore = 3,
  bars = STATIC_MOMENTUM_BARS,
  events = STATIC_GOAL_EVENTS,
  theme = "dark",
}) {
  const activeTheme = CARD_THEMES[theme] || CARD_THEMES.dark;

  return (
    <section
      className={`flex min-h-[124px] w-full overflow-hidden rounded-[14px] px-4 py-4 text-white ${activeTheme.card}`}
    >
      <div className="flex w-[220px] shrink-0 flex-col justify-between pr-4 sm:w-[250px]">
        <div className="flex items-center gap-7">
          <span className={`text-[12px] font-black uppercase tracking-wide ${activeTheme.muted}`}>
            {status}
          </span>
          <span className={`truncate text-[12px] font-black uppercase tracking-wide ${activeTheme.competition}`}>
            {competition}
          </span>
        </div>

        <div className="space-y-2.5">
          <div className="grid grid-cols-[minmax(0,1fr)_32px] items-center gap-3">
            <span className="truncate text-[16px] font-black leading-none text-white">
              {compactName(homeTeam)}
            </span>
            <span className={`text-right text-[18px] font-black leading-none ${activeTheme.score}`}>
              {homeScore}
            </span>
          </div>
          <div className="grid grid-cols-[minmax(0,1fr)_32px] items-center gap-3">
            <span className="truncate text-[16px] font-black leading-none text-white">
              {compactName(awayTeam)}
            </span>
            <span className={`text-right text-[18px] font-black leading-none ${activeTheme.score}`}>
              {awayScore}
            </span>
          </div>
        </div>
      </div>

      <div className={`mx-0 w-px shrink-0 ${activeTheme.divider}`} />

      <div className="min-w-0 flex-1 pl-4">
        <MomentumChart bars={bars} events={events} theme={activeTheme} />
      </div>
    </section>
  );
}

export default function MatchLiveReading({ analysis }) {
  const event = analysis?.event || {};

  return (
    <MatchMomentumResultCard
      status={getDisplayStatus(event)}
      competition={event.leagueName || "Competição"}
      homeTeam={event.homeShortName || event.homeTeam}
      awayTeam={event.awayShortName || event.awayTeam}
      homeScore={getScore(event.score?.home, 2)}
      awayScore={getScore(event.score?.away, 3)}
      theme="dark"
    />
  );
}
