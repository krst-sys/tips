"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  ChevronRight,
  Clock3,
  Eye,
  EyeOff,
  Plus,
  Target,
  TrendingDown,
  Wallet,
} from "lucide-react";
import { fetchUpcomingGames } from "@/lib/fetchUpcomingGames";
import {
  buildOpportunitiesFromAnalysis,
  formatOdd as formatOpportunityOdd,
  getScoreMeta,
} from "@/lib/filttoScore";
import { sortGames } from "@/lib/gamePopularity";

const PROGRESSION_STORAGE_KEY = "progressao-execucao-v2";
const APP_TIME_ZONE = "America/Sao_Paulo";
const MAX_DASHBOARD_OPPORTUNITIES = 6;
const MAX_ANALYSIS_REQUESTS = 24;
const OPPORTUNITY_ROTATION_MS = 3600;
const OPPORTUNITY_ROW_HEIGHT = 56;
const MAX_ATTENTION_SHOWCASE = 5;
const MAX_RISK_SHOWCASE = 5;

const baseMetricCards = [
  {
    label: "Banca atual",
    value: "R$ 16,00",
    hiddenValue: "R$ ••••",
    detail: "Disponível para operações",
    sensitive: true,
    tone: "positive",
    icon: Wallet,
  },
  {
    label: "Lucro/Prejuízo",
    value: "-R$ 25,00",
    hiddenValue: "-R$ ••••",
    detail: "Resultado das apostas",
    sensitive: true,
    tone: "negative",
    valueTone: "negative",
    icon: TrendingDown,
  },
  {
    label: "Apostas abertas",
    value: "1",
    detail: "Total em aberto",
    tone: "info",
    icon: Clock3,
  },
  {
    label: "Oportunidades de hoje",
    value: "6",
    detail: "Analisadas por Filtto",
    tone: "muted",
    icon: Target,
  },
  {
    label: "Progressão ativa",
    value: "1",
    detail: "Sequencia em andamento",
    tone: "positive",
    icon: ArrowUpRight,
  },
];

function toNumber(value, fallback = 0) {
  const parsed = Number(String(value ?? "").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function getTodayDateValue() {
  const parts = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "2-digit",
    timeZone: APP_TIME_ZONE,
    year: "numeric",
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function normalizeMarketLabel(value) {
  const text = String(value || "Mercado").replace("Over", "Mais de").replace("Under", "Menos de");
  if (text === "Ambas marcam nao") return "Ambas marcam: Não";
  return text;
}

async function fetchFullAnalysis(eventId) {
  const response = await fetch(`/api/football/events/${encodeURIComponent(eventId)}/full`, {
    cache: "no-store",
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) return null;
  return payload?.analysis || null;
}

function TeamMark({ src, label }) {
  const fallback = String(label || "T").slice(0, 3).toUpperCase();
  return (
    <span className="team-mark">
      {src ? <img src={src} alt="" /> : fallback}
    </span>
  );
}

function formatMoney(value) {
  return new Intl.NumberFormat("pt-BR", {
    currency: "BRL",
    style: "currency",
  }).format(Number.isFinite(Number(value)) ? Number(value) : 0);
}

function formatOdd(value) {
  return Number(value || 0).toFixed(2);
}

function getProgressStats(progression) {
  if (!progression) return { completed: 0, percent: 0 };
  const completed = progression.entries?.filter((entry) => entry.status === "green" || entry.status === "red").length || 0;
  const totalDays = toNumber(progression.totalDays, 0);
  return {
    completed,
    percent: totalDays ? Math.round((completed / totalDays) * 100) : 0,
  };
}

function buildShowcaseOpportunityList(items) {
  const strong = [];
  const attention = [];
  const risk = [];

  items.forEach((item) => {
    const tone = getScoreMeta(item.score?.score).tone;
    if (tone === "attention") {
      attention.push(item);
      return;
    }
    if (tone === "risk") {
      risk.push(item);
      return;
    }
    strong.push(item);
  });

  const curated = [
    ...strong,
    ...attention.slice(0, MAX_ATTENTION_SHOWCASE),
    ...risk.slice(0, MAX_RISK_SHOWCASE),
  ];

  return curated
    .map((item, index) => {
      const score = item.score?.score ?? 0;
      const seed = `${item.id || index}:${item.homeTeam || ""}:${item.awayTeam || ""}`;
      const hash = Array.from(seed).reduce((sum, char) => sum + char.charCodeAt(0), 0);
      const qualityBias = score >= 60 ? 0 : score >= 40 ? 0.45 : 0.75;
      return {
        item,
        order: ((hash * 9301 + 49297) % 233280) / 233280 + qualityBias,
      };
    })
    .sort((a, b) => a.order - b.order)
    .map(({ item }) => item);
}

function MetricCard({ card, valuesHidden }) {
  const Icon = card.icon;
  const valueTone = card.valueTone || "default";
  const value = valuesHidden && card.sensitive ? card.hiddenValue : card.value;

  return (
    <article className={`bankroll-summary-card ${card.tone}`}>
      <div className="bankroll-summary-content">
        <span className="bankroll-summary-icon">
          <Icon className="h-7 w-7" strokeWidth={1.9} />
        </span>
        <div className="min-w-0">
          <p className="bankroll-summary-label">{card.label}</p>
          <p className={`bankroll-summary-value bankroll-summary-value-${valueTone}`}>{value}</p>
          <p className="bankroll-summary-detail">{card.detail}</p>
        </div>
      </div>
    </article>
  );
}

function BankChart({ valuesHidden, onToggleValues }) {
  return (
    <div className="chart-wrap">
      <div className="chart-chip">
        <div>
          <span>Banca atual</span>
          <strong>{valuesHidden ? "R$ ••••" : "R$ 16,00"}</strong>
        </div>
        <button
          type="button"
          onClick={onToggleValues}
          className="chart-visibility-btn"
          aria-label={valuesHidden ? "Mostrar valor da banca" : "Ocultar valor da banca"}
          title={valuesHidden ? "Mostrar valor" : "Ocultar valor"}
        >
          {valuesHidden ? <EyeOff size={15} strokeWidth={2} /> : <Eye size={15} strokeWidth={2} />}
        </button>
      </div>
      <svg viewBox="0 0 720 306" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="bankArea" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#21d766" stopOpacity="0.45" />
            <stop offset="82%" stopColor="#21d766" stopOpacity="0.04" />
          </linearGradient>
        </defs>
        {[55, 105, 155, 205, 255].map((y) => (
          <line key={y} x1="0" x2="660" y1={y} y2={y} className="chart-grid" />
        ))}
        <line x1="660" x2="660" y1="40" y2="292" className="chart-axis" />
        <path
          d="M0 224 L16 214 L35 188 L50 172 L66 190 L84 204 L104 207 L126 211 L146 196 L160 165 L178 150 L194 112 L210 92 L226 120 L244 130 L262 118 L278 96 L296 88 L314 55 L332 48 L350 16 L362 10 L374 68 L392 104 L412 116 L430 103 L450 105 L468 116 L484 121 L502 138 L522 148 L540 168 L562 173 L582 176 L600 185 L618 184 L636 166 L654 158 L672 178 L690 163 L710 158 L720 150 L720 292 L0 292 Z"
          className="chart-area"
        />
        <path
          d="M0 224 L16 214 L35 188 L50 172 L66 190 L84 204 L104 207 L126 211 L146 196 L160 165 L178 150 L194 112 L210 92 L226 120 L244 130 L262 118 L278 96 L296 88 L314 55 L332 48 L350 16 L362 10 L374 68 L392 104 L412 116 L430 103 L450 105 L468 116 L484 121 L502 138 L522 148 L540 168 L562 173 L582 176 L600 185 L618 184 L636 166 L654 158 L672 178 L690 163 L710 158 L720 150"
          className="chart-line"
        />
        <circle cx="720" cy="150" r="5.8" className="chart-dot" />
      </svg>
      <div className="chart-y">
        <span>R$ 60</span>
        <span>R$ 40</span>
        <span>R$ 20</span>
        <span>R$ 0</span>
        <span>-R$ 20</span>
        <span>-R$ 40</span>
      </div>
      <div className="chart-x">
        <span>22/04</span>
        <span>27/04</span>
        <span>02/05</span>
        <span>07/05</span>
        <span>12/05</span>
        <span>17/05</span>
        <span>22/05</span>
      </div>
    </div>
  );
}

function ProgressionPanel({ progression }) {
  const currentEntry = progression?.entries?.find((entry) => entry.status === "pending") || null;
  const stats = getProgressStats(progression);
  const totalDays = toNumber(progression?.totalDays, 30);
  const stakeMode = progression?.stakeMode === "fixed" ? "Stake fixa" : "Stake variável";
  const stakeValue = progression?.stakeMode === "fixed"
    ? formatMoney(progression?.fixedStake)
    : `${formatOdd(progression?.percentStake || 100)}%`;
  const progressWidth = Math.max(4, Math.min(100, stats.percent));

  if (!progression || !currentEntry) {
    return (
      <article className="dash-panel progress-panel progress-empty-panel">
        <div className="panel-head compact">
          <h2>Progressão ativa</h2>
        </div>
        <div className="progress-empty">
          <span className="progress-icon">
            <Plus size={30} strokeWidth={2.3} />
          </span>
          <div>
            <h3>Iniciar progressão</h3>
            <p>Crie uma sequência com banca, odd média e stake para acompanhar sua evolução.</p>
          </div>
          <Link href="/area-membros/progressao" className="progress-start-btn">
            Iniciar progressão
            <ChevronRight size={16} />
          </Link>
        </div>
      </article>
    );
  }

  return (
    <article className="dash-panel progress-panel">
      <div className="panel-head compact">
        <h2>Progressão ativa</h2>
        <Link href="/area-membros/progressao">Ver detalhes</Link>
      </div>
      <div className="progress-main">
        <span className="progress-icon">▦</span>
        <div>
          <h3>{currentEntry.day}ª entrada de {totalDays}</h3>
          <p>Apostar {formatMoney(currentEntry.stake)} na odd {formatOdd(currentEntry.odd)}.</p>
        </div>
        <span className="stake-box">{stakeMode}<br /><strong>{stakeValue}</strong></span>
      </div>
      <div className="progress-bar">
        <span style={{ "--progress-width": `${progressWidth}%` }} />
        <strong>{stats.completed} / {totalDays}</strong>
      </div>
      <div className="progress-stats">
        <span>Stake atual<strong>{formatMoney(currentEntry.stake)}</strong></span>
        <span>Odd média<strong>{formatOdd(progression.averageOdd)}</strong></span>
        <span>Retorno previsto<strong className="green">{formatMoney(currentEntry.projectedReturn)}</strong></span>
        <span>Banca após Green<strong className="green">{formatMoney(currentEntry.bankrollIfGreen)}</strong></span>
      </div>
    </article>
  );
}

function OpportunityRow({ opportunity, loading = false }) {
  if (loading) {
    return (
      <div className="opportunity-row opportunity-loading-row">
        <td><span /></td>
        <td><span /></td>
        <td><span /></td>
        <td><span /></td>
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="opportunity-row opportunity-empty-row">
        <td>Aguardando oportunidades reais da API.</td>
      </div>
    );
  }

  const score = opportunity.score?.score ?? 0;
  const scoreMeta = getScoreMeta(score);
  const scoreLabel = opportunity.score?.status || scoreMeta.label;
  const scoreValue = Math.round(score);

  return (
    <div className="opportunity-row">
      <td>
        <Link href={`/area-membros/proximos-jogos/${opportunity.eventId || opportunity.id}`} className="game-cell">
          <span className="team-stack">
            <TeamMark src={opportunity.homeLogo} label={opportunity.homeTeam} />
            <TeamMark src={opportunity.awayLogo} label={opportunity.awayTeam} />
          </span>
          <strong>{opportunity.homeTeam}<br />{opportunity.awayTeam}</strong>
        </Link>
      </td>
      <td>{normalizeMarketLabel(opportunity.market)}</td>
      <td>{formatOpportunityOdd(opportunity.odd)}</td>
      <td>
        <span className={`filtto-score-cell filtto-score-${scoreMeta.tone}`}>
          <span className="filtto-score-main">
            <strong>{scoreValue}</strong>
            <span>{scoreLabel}</span>
          </span>
          <span className="filtto-score-track" aria-hidden="true">
            <span style={{ "--score-width": `${Math.max(6, Math.min(100, scoreValue))}%` }} />
          </span>
        </span>
      </td>
    </div>
  );
}

export default function DashboardPage() {
  const [activeProgression, setActiveProgression] = useState(null);
  const [dashboardOpportunities, setDashboardOpportunities] = useState([]);
  const [opportunitiesLoading, setOpportunitiesLoading] = useState(true);
  const [opportunityOffset, setOpportunityOffset] = useState(0);
  const [bankrollHidden, setBankrollHidden] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const raw = window.localStorage.getItem(PROGRESSION_STORAGE_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw);
        setActiveProgression(parsed?.activeProjection || null);
      } catch {
        setActiveProgression(null);
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    let active = true;

    async function loadDashboardOpportunities() {
      setOpportunitiesLoading(true);
      try {
        const result = await fetchUpcomingGames(getTodayDateValue(), { limit: 80 });
        const games = sortGames(result.games || [], "popular").slice(0, MAX_ANALYSIS_REQUESTS);
        const analyses = await Promise.all(games.map((game) => fetchFullAnalysis(game.id)));
        const built = analyses
          .flatMap((analysis) => buildOpportunitiesFromAnalysis(analysis))
          .sort((a, b) => (b.score?.score ?? -1) - (a.score?.score ?? -1));

        if (active) {
          setDashboardOpportunities(buildShowcaseOpportunityList(built));
          setOpportunityOffset(0);
        }
      } catch {
        if (active) setDashboardOpportunities([]);
      } finally {
        if (active) setOpportunitiesLoading(false);
      }
    }

    loadDashboardOpportunities();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (opportunitiesLoading || dashboardOpportunities.length <= MAX_DASHBOARD_OPPORTUNITIES) return undefined;

    const timer = window.setInterval(() => {
      setOpportunityOffset((current) => (current + 1) % dashboardOpportunities.length);
    }, OPPORTUNITY_ROTATION_MS);

    return () => window.clearInterval(timer);
  }, [dashboardOpportunities.length, opportunitiesLoading]);

  const metricCards = useMemo(() => {
    return baseMetricCards.map((card) => {
      if (card.label !== "Progressão ativa") return card;
      return {
        ...card,
        value: activeProgression ? "1" : "0",
        detail: activeProgression ? "Sequência em andamento" : "Nenhuma em andamento",
        tone: activeProgression ? "positive" : "muted",
      };
    });
  }, [activeProgression]);

  const visibleOpportunityRows = useMemo(() => {
    if (opportunitiesLoading) {
      return Array.from({ length: MAX_DASHBOARD_OPPORTUNITIES }, (_, index) => ({
        id: `loading-${index}`,
        loading: true,
      }));
    }

    if (!dashboardOpportunities.length) {
      return [{ id: "empty", opportunity: null }];
    }

    return Array.from({ length: Math.min(MAX_DASHBOARD_OPPORTUNITIES, dashboardOpportunities.length) }, (_, index) => {
      const opportunity = dashboardOpportunities[(opportunityOffset + index) % dashboardOpportunities.length];
      return {
        id: opportunity.id,
        opportunity,
      };
    });
  }, [dashboardOpportunities, opportunitiesLoading, opportunityOffset]);

  const showcaseRows = useMemo(() => {
    if (opportunitiesLoading || dashboardOpportunities.length <= MAX_DASHBOARD_OPPORTUNITIES) {
      return visibleOpportunityRows;
    }

    return Array.from({ length: dashboardOpportunities.length + MAX_DASHBOARD_OPPORTUNITIES }, (_, index) => {
      const opportunity = dashboardOpportunities[index % dashboardOpportunities.length];
      return {
        id: `${opportunity.id}-${index}`,
        opportunity,
      };
    });
  }, [dashboardOpportunities, opportunitiesLoading, visibleOpportunityRows]);

  const showcaseTranslate = opportunitiesLoading || dashboardOpportunities.length <= MAX_DASHBOARD_OPPORTUNITIES
    ? 0
    : opportunityOffset * OPPORTUNITY_ROW_HEIGHT;

  return (
    <div className="dashboard-page">
      <section className="metric-grid">
        {metricCards.map((card) => (
          <MetricCard key={card.label} card={card} valuesHidden={bankrollHidden} />
        ))}
      </section>

      <section className="dashboard-grid">
        <div className="dashboard-left">
          <article className="dash-panel chart-panel">
            <div className="panel-head">
              <h2>Visão geral da banca</h2>
              <div className="range-tabs">
                <button>Hoje</button>
                <button>7 dias</button>
                <button className="active">30 dias</button>
                <button>Este mês</button>
              </div>
            </div>
            <BankChart
              valuesHidden={bankrollHidden}
              onToggleValues={() => setBankrollHidden((current) => !current)}
            />
          </article>
        </div>

        <div className="dashboard-right">
          <article className="dash-panel opportunities-panel">
            <div className="panel-head compact">
              <h2>Oportunidades de hoje</h2>
              <Link href="/area-membros/oportunidades">Ver todas</Link>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Jogo</th>
                  <th>Mercado</th>
                  <th>Odd</th>
                  <th>Filtto Score</th>
                </tr>
              </thead>
            </table>
            <div className="opportunity-showcase" style={{ "--row-height": `${OPPORTUNITY_ROW_HEIGHT}px` }}>
              <div className="opportunity-showcase-track" style={{ transform: `translateY(-${showcaseTranslate}px)` }}>
                {showcaseRows.map((row) => (
                  <OpportunityRow
                    key={row.id}
                    opportunity={row.opportunity}
                    loading={row.loading}
                  />
                ))}
              </div>
            </div>
          </article>
        </div>
      </section>

      <ProgressionPanel progression={activeProgression} />

      <style>{`
        .dashboard-page {
          min-height: 100%;
          width: 100%;
          max-width: 1488px;
          margin: 0 auto;
          padding: 10px 32px 20px;
          color: #f7fafc;
        }

        .dashboard-page :where(h2, h3, p) {
          margin: 0;
        }

        .dashboard-page :where(table) {
          width: 100%;
          border-collapse: collapse;
        }

        .dashboard-page :where(th) {
          color: #98a6ba;
          font-size: 12px;
          font-weight: 700;
          text-align: left;
        }

        .dashboard-page :where(td) {
          color: #dbe5f1;
          font-size: 13px;
          font-weight: 500;
        }

        .metric-grid {
          display: grid;
          grid-template-columns: repeat(5, minmax(165px, 1fr));
          gap: 20px;
          margin-bottom: 16px;
        }

        .metric-grid .bankroll-summary-card {
          min-height: 122px;
          height: 122px;
          padding: 0 18px;
        }

        .metric-grid .bankroll-summary-content {
          gap: 16px;
        }

        .metric-grid .bankroll-summary-icon {
          width: 52px;
          height: 52px;
        }

        .metric-grid .bankroll-summary-label {
          font-size: 10.5px;
          letter-spacing: 0.065em;
          line-height: 1.25;
          white-space: normal;
        }

        .metric-grid .bankroll-summary-value {
          margin-top: 9px;
          font-size: clamp(24px, 1.55vw, 27px);
          line-height: 1;
        }

        .metric-grid .bankroll-summary-detail {
          margin-top: 10px;
          font-size: 11.5px;
          line-height: 1.35;
          white-space: normal;
        }

        .dash-metric {
          box-sizing: border-box;
          height: 108px;
          display: grid;
          grid-template-columns: 48px minmax(0, 1fr);
          align-items: center;
          gap: 15px;
          padding: 18px;
          border: 1px solid rgba(44, 55, 70, 0.95);
          border-radius: 10px;
          background:
            radial-gradient(circle at 12% 0%, rgba(255,255,255,0.05), transparent 13rem),
            linear-gradient(135deg, rgba(22, 31, 43, 0.96), rgba(10, 17, 25, 0.96));
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.04);
        }

        .dash-metric p {
          color: #a6b0c0;
          font-size: clamp(9px, 0.58vw, 12px);
          font-weight: 800;
          letter-spacing: 0.1em;
          line-height: 1.35;
        }

        .dash-metric strong {
          display: block;
          margin-top: 6px;
          color: #f9fbff;
          font-size: clamp(20px, 1.35vw, 26px);
          line-height: 1;
          font-weight: 800;
        }

        .dash-metric span:not(.dash-icon) {
          display: block;
          margin-top: 9px;
          color: #9aa6b6;
          font-size: clamp(10px, 0.68vw, 12px);
          font-weight: 600;
          line-height: 1.45;
        }

        .dash-icon {
          width: 48px;
          height: 48px;
          display: grid;
          place-items: center;
          border-radius: 9px;
        }

        .dash-green { border-color: rgba(24, 190, 99, 0.42); background: linear-gradient(135deg, rgba(14, 64, 43, 0.78), rgba(10, 18, 25, 0.96)); }
        .dash-green .dash-icon { color: #22d769; background: rgba(34, 197, 94, 0.15); }
        .dash-red { border-color: rgba(239, 68, 85, 0.38); background: linear-gradient(135deg, rgba(58, 25, 34, 0.78), rgba(10, 18, 25, 0.96)); }
        .dash-red .dash-icon, .dash-red strong { color: #ff6575; background: rgba(239, 68, 85, 0.16); }
        .dash-blue { border-color: rgba(56, 189, 248, 0.45); background: linear-gradient(135deg, rgba(12, 48, 75, 0.8), rgba(10, 18, 25, 0.96)); }
        .dash-blue .dash-icon { color: #8dd8ff; background: rgba(56, 189, 248, 0.16); }
        .dash-yellow { border-color: rgba(245, 158, 11, 0.45); background: linear-gradient(135deg, rgba(58, 43, 12, 0.8), rgba(10, 18, 25, 0.96)); }
        .dash-yellow .dash-icon { color: #f8c316; background: rgba(245, 158, 11, 0.16); }

        .dashboard-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(390px, 0.96fr);
          gap: 16px;
        }

        .dashboard-left,
        .dashboard-right {
          display: grid;
          align-content: start;
          gap: 16px;
          min-width: 0;
        }

        .dashboard-page > .progress-panel {
          margin-top: 16px;
        }

        .dashboard-bottom {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          align-items: start;
          gap: 16px;
        }

        .dash-panel {
          overflow: hidden;
          border: 1px solid #263140;
          border-radius: 10px;
          background:
            radial-gradient(circle at 4% 0%, rgba(148, 163, 184, 0.055), transparent 20rem),
            linear-gradient(180deg, rgba(18, 27, 38, 0.96), rgba(10, 17, 25, 0.94));
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.04);
        }

        .panel-head {
          min-height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 16px 20px 10px;
        }

        .panel-head.compact {
          min-height: 56px;
          padding-bottom: 8px;
        }

        .panel-head h2,
        .distribution-panel h2 {
          color: #edf4fb;
          font-size: 20px;
          font-weight: 720;
          letter-spacing: -0.02em;
        }

        .panel-head a {
          height: 34px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0 14px;
          border: 1px solid #273342;
          border-radius: 8px;
          color: #ffffff;
          background: rgba(9, 16, 24, 0.45);
          font-size: 12px;
          font-weight: 800;
          text-decoration: none;
        }

        .range-tabs {
          display: flex;
          gap: 8px;
        }

        .range-tabs button {
          height: 32px;
          padding: 0 14px;
          border: 1px solid #273342;
          border-radius: 9px;
          color: #aab4c3;
          background: rgba(14, 22, 32, 0.88);
          font-size: 13px;
          font-weight: 700;
        }

        .range-tabs .active {
          color: #19dd6b;
          border-color: rgba(34,197,94,0.35);
          background: rgba(34,197,94,0.11);
        }

        .chart-panel {
          height: 423px;
        }

        .chart-wrap {
          position: relative;
          height: 319px;
          margin: 0 20px 16px;
          padding: 22px 58px 40px 0;
        }

        .chart-chip {
          position: absolute;
          z-index: 2;
          top: 10px;
          left: 0;
          width: 132px;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 8px;
          padding: 12px 10px 11px 13px;
          border: 1px solid #263140;
          border-radius: 8px;
          background: rgba(13, 23, 33, 0.78);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.035);
        }

        .chart-chip span {
          color: #93a2b5;
          font-size: 12px;
          font-weight: 560;
        }

        .chart-chip strong {
          display: block;
          margin-top: 6px;
          color: #8ee7b3;
          font-size: 17px;
          line-height: 1;
          font-weight: 720;
          letter-spacing: 0;
        }

        .chart-visibility-btn {
          width: 28px;
          height: 28px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex: 0 0 auto;
          border: 1px solid rgba(148, 163, 184, 0.18);
          border-radius: 7px;
          color: #93a2b5;
          background: rgba(8, 14, 21, 0.45);
          transition: border-color 160ms ease, color 160ms ease, background 160ms ease;
        }

        .chart-visibility-btn:hover {
          border-color: rgba(34, 197, 94, 0.28);
          color: #b7f3cd;
          background: rgba(34, 197, 94, 0.08);
        }

        .chart-wrap svg {
          width: 100%;
          height: 100%;
          overflow: visible;
        }

        .chart-grid {
          stroke: rgba(148, 163, 184, 0.16);
          stroke-width: 1;
          stroke-dasharray: 4 4;
        }

        .chart-axis {
          stroke: rgba(148, 163, 184, 0.17);
          stroke-width: 1;
        }

        .chart-area {
          fill: url(#bankArea);
        }

        .chart-line {
          fill: none;
          stroke: #21d766;
          stroke-width: 2.6;
          stroke-linecap: round;
          stroke-linejoin: round;
          vector-effect: non-scaling-stroke;
        }

        .chart-dot {
          fill: #21d766;
          stroke: rgba(34, 197, 94, 0.28);
          stroke-width: 7;
        }

        .chart-y {
          position: absolute;
          top: 16px;
          right: 4px;
          bottom: 52px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          color: #a5afbf;
          font-size: 13px;
          font-weight: 600;
        }

        .chart-x {
          position: absolute;
          left: 0;
          right: 58px;
          bottom: 6px;
          display: flex;
          justify-content: space-between;
          color: #9faabb;
          font-size: 13px;
          font-weight: 600;
        }

        .opportunities-panel table th,
        .opportunities-panel table td,
        .activity-panel table th,
        .activity-panel table td,
        .markets-panel table th,
        .markets-panel table td {
          border-top: 1px solid rgba(38, 49, 64, 0.82);
          padding: 12px 20px;
          vertical-align: middle;
        }

        .opportunities-panel {
          height: 423px;
        }

        .opportunities-panel table th {
          color: #8fa0b4;
          font-size: 11px;
          font-weight: 620;
        }

        .opportunities-panel table td {
          color: #d9e3ef;
          font-size: 12px;
          font-weight: 520;
        }

        .opportunities-panel thead th,
        .activity-panel thead th,
        .markets-panel thead th {
          background: rgba(23, 34, 46, 0.72);
        }

        .game-cell {
          display: flex;
          align-items: center;
          gap: 12px;
          white-space: pre-line;
          line-height: 1.1;
          text-decoration: none;
        }

        .game-cell strong {
          color: #e2ebf5;
          font-size: 12px;
          font-weight: 620;
          letter-spacing: 0;
        }

        .team-stack {
          display: flex;
          width: 66px;
          flex-shrink: 0;
        }

        .team-mark {
          width: 34px;
          height: 34px;
          display: grid;
          place-items: center;
          overflow: hidden;
          margin-right: -4px;
          border: 1px solid rgba(148, 163, 184, 0.26);
          border-radius: 50%;
          color: #aebbd0;
          background: rgba(10, 17, 25, 0.34);
          font-size: 8px;
          font-weight: 680;
        }

        .team-mark img {
          width: 30px;
          height: 30px;
          object-fit: contain;
        }

        .filtto-score-cell {
          width: 138px;
          display: grid;
          gap: 6px;
        }

        .filtto-score-main {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 0;
        }

        .filtto-score-main strong {
          min-width: 34px;
          height: 28px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(148, 163, 184, 0.18);
          border-radius: 7px;
          color: #dce7f3;
          background: rgba(10, 17, 25, 0.44);
          font-size: 12px;
          font-weight: 720;
        }

        .filtto-score-main span {
          min-width: 0;
          overflow: hidden;
          color: #aebdd0;
          font-size: 10.5px;
          font-weight: 570;
          line-height: 1.15;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .filtto-score-track {
          height: 4px;
          overflow: hidden;
          border-radius: 999px;
          background: rgba(148, 163, 184, 0.12);
        }

        .filtto-score-track span {
          display: block;
          height: 100%;
          width: var(--score-width, 0%);
          border-radius: inherit;
          background: #8aa0b8;
        }

        .filtto-score-strong .filtto-score-main strong,
        .filtto-score-good .filtto-score-main strong {
          border-color: rgba(34, 197, 94, 0.32);
          color: #86efac;
          background: rgba(34, 197, 94, 0.1);
        }

        .filtto-score-strong .filtto-score-main span,
        .filtto-score-good .filtto-score-main span {
          color: #b7e8c9;
        }

        .filtto-score-strong .filtto-score-track span,
        .filtto-score-good .filtto-score-track span {
          background: linear-gradient(90deg, #22c55e, #86efac);
        }

        .filtto-score-attention .filtto-score-main strong {
          border-color: rgba(245, 158, 11, 0.32);
          color: #f7cd78;
          background: rgba(245, 158, 11, 0.1);
        }

        .filtto-score-attention .filtto-score-main span {
          color: #e7c98d;
        }

        .filtto-score-attention .filtto-score-track span {
          background: linear-gradient(90deg, #f59e0b, #facc15);
        }

        .filtto-score-risk .filtto-score-main strong {
          border-color: rgba(244, 63, 94, 0.3);
          color: #fda4af;
          background: rgba(244, 63, 94, 0.09);
        }

        .filtto-score-risk .filtto-score-main span {
          color: #f0a5b2;
        }

        .filtto-score-risk .filtto-score-track span {
          background: linear-gradient(90deg, #f43f5e, #fb7185);
        }

        .opportunity-loading-row span {
          display: block;
          height: 14px;
          width: min(100%, 92px);
          border-radius: 999px;
          background: linear-gradient(90deg, rgba(148, 163, 184, 0.09), rgba(148, 163, 184, 0.2), rgba(148, 163, 184, 0.09));
          background-size: 180% 100%;
          animation: dash-loading 1.4s ease-in-out infinite;
        }

        .opportunity-empty-row {
          height: 286px !important;
          grid-template-columns: 1fr !important;
        }

        .opportunity-empty-row td {
          color: #9eaabc;
          text-align: center;
        }

        @keyframes dash-loading {
          0% { background-position: 100% 0; }
          100% { background-position: 0 0; }
        }

        .activity-panel {
          min-height: 238px;
        }

        .opportunities-panel {
          min-height: 423px;
        }

        .opportunity-showcase {
          height: calc(var(--row-height) * 6);
          overflow: hidden;
        }

        .opportunity-showcase-track {
          transition: transform 700ms cubic-bezier(0.22, 1, 0.36, 1);
          will-change: transform;
        }

        .opportunity-row {
          height: var(--row-height);
          display: grid;
          grid-template-columns: minmax(148px, 1.1fr) minmax(104px, 0.86fr) 58px minmax(126px, 0.9fr);
          align-items: center;
          border-top: 1px solid rgba(38, 49, 64, 0.82);
        }

        .opportunity-row td {
          padding: 6px 20px;
          color: #d9e3ef;
          font-size: 12px;
          font-weight: 520;
          vertical-align: middle;
        }

        .opportunity-row td:nth-child(3) {
          white-space: nowrap;
        }

        .opportunity-row td:last-child {
          padding-left: 8px;
        }

        .opportunities-panel table th,
        .opportunities-panel table td {
          padding-top: 6px;
          padding-bottom: 6px;
        }

        .activity-panel td:nth-child(2) {
          white-space: nowrap;
        }

        .event-dot {
          width: 18px;
          height: 18px;
          display: inline-grid;
          place-items: center;
          margin-right: 9px;
          border-radius: 50%;
          color: #fff;
          background: linear-gradient(135deg, #60a5fa, #2563eb);
          font-size: 9px;
          font-weight: 900;
        }

        .result {
          min-width: 58px;
          height: 30px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 7px;
          font-size: 12px;
          font-weight: 850;
        }

        .result-red { color: #ff5266; border: 1px solid rgba(239,68,85,0.42); background: rgba(239,68,85,0.12); }
        .result-green { color: #23e66e; border: 1px solid rgba(34,197,94,0.42); background: rgba(34,197,94,0.12); }
        .result-cashout { color: #f4bf18; border: 1px solid rgba(245,158,11,0.42); background: rgba(245,158,11,0.12); }

        .profit {
          color: #21e673 !important;
          font-weight: 900 !important;
        }

        .loss {
          color: #ff5367 !important;
          font-weight: 900 !important;
        }

        .progress-panel {
          height: 238px;
          padding-bottom: 14px;
        }

        .progress-main {
          display: grid;
          grid-template-columns: 58px minmax(0, 1fr) auto;
          align-items: center;
          gap: 14px;
          padding: 0 20px 12px;
        }

        .progress-icon {
          width: 58px;
          height: 58px;
          display: grid;
          place-items: center;
          border-radius: 9px;
          color: #21e673;
          background: rgba(34,197,94,0.13);
          font-size: 38px;
          line-height: 1;
        }

        .progress-main h3 {
          color: #fff;
          font-size: 21px;
          line-height: 1.2;
          font-weight: 850;
        }

        .progress-main p {
          margin-top: 5px;
          color: #9eaabc;
          font-size: 13px;
          font-weight: 600;
        }

        .stake-box {
          padding: 9px 12px;
          border: 1px solid #293545;
          border-radius: 8px;
          color: #9eaabc;
          background: rgba(10, 17, 25, 0.55);
          font-size: 12px;
          line-height: 1.3;
          text-align: center;
        }

        .stake-box strong {
          color: #dbe4f0;
        }

        .progress-bar {
          display: grid;
          grid-template-columns: 1fr auto;
          align-items: center;
          gap: 12px;
          padding: 0 20px 12px;
        }

        .progress-bar span {
          height: 8px;
          border-radius: 999px;
          background: linear-gradient(90deg, #21e673 0 var(--progress-width, 10%), #202a36 var(--progress-width, 10%));
        }

        .progress-bar strong {
          color: #dfe6ef;
          font-size: 15px;
        }

        .progress-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          border-top: 1px solid #263140;
          padding: 14px 20px 0;
        }

        .progress-stats span {
          padding: 0 22px;
          border-left: 1px solid #263140;
          color: #98a6ba;
          font-size: 12px;
          font-weight: 600;
          text-align: center;
        }

        .progress-stats span:first-child {
          border-left: 0;
        }

        .progress-stats strong {
          display: block;
          margin-top: 5px;
          color: #fff;
          font-size: 14px;
          font-weight: 850;
        }

        .progress-stats .green {
          color: #20e771;
        }

        .progress-empty-panel {
          height: 142px;
        }

        .progress-empty {
          display: grid;
          grid-template-columns: 58px minmax(0, 1fr) auto;
          align-items: center;
          gap: 16px;
          padding: 0 20px 16px;
        }

        .progress-empty h3 {
          color: #fff;
          font-size: 21px;
          line-height: 1.2;
          font-weight: 850;
        }

        .progress-empty p {
          margin-top: 5px;
          max-width: 620px;
          color: #9eaabc;
          font-size: 13px;
          font-weight: 600;
          line-height: 1.45;
        }

        .progress-start-btn {
          height: 38px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 0 14px;
          border: 1px solid rgba(34, 197, 94, 0.38);
          border-radius: 8px;
          color: #062213;
          background: #21e673;
          font-size: 13px;
          font-weight: 850;
          text-decoration: none;
          white-space: nowrap;
        }

        .distribution-panel {
          min-height: 185px;
          padding: 18px 20px 12px;
        }

        .distribution-body {
          display: grid;
          grid-template-columns: 88px 1fr;
          align-items: center;
          gap: 12px;
          margin-top: 12px;
        }

        .donut {
          width: 84px;
          height: 84px;
          border-radius: 50%;
          background: conic-gradient(#22e36d 0 60%, #ff475d 60% 90%, #f4c518 90% 100%);
          position: relative;
        }

        .donut:after {
          content: "";
          position: absolute;
          inset: 23px;
          border-radius: 50%;
          background: #0f1923;
        }

        .legend {
          display: grid;
          gap: 9px;
        }

        .legend span {
          display: grid;
          grid-template-columns: 12px minmax(0, 1fr) auto;
          gap: 8px;
          align-items: center;
          color: #a9b3c3;
          font-size: 11px;
          font-weight: 700;
        }

        .legend i {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }

        .green-dot { background: #22e36d; }
        .red-dot { background: #ff475d; }
        .yellow-dot { background: #f4c518; }

        .legend strong {
          color: #dce5ee;
          font-weight: 800;
        }

        .distribution-panel p {
          margin-top: 5px;
          color: #98a6ba;
          font-size: 14px;
          font-weight: 600;
        }

        .markets-panel table th,
        .markets-panel table td {
          padding: 9px 10px;
          font-size: 10.5px;
          white-space: nowrap;
        }

        .markets-panel table {
          table-layout: fixed;
        }

        .markets-panel th:first-child,
        .markets-panel td:first-child {
          width: 54%;
        }

        .markets-panel th:nth-child(2),
        .markets-panel td:nth-child(2) {
          width: 22%;
          text-align: center;
        }

        .markets-panel th:nth-child(3),
        .markets-panel td:nth-child(3) {
          width: 24%;
          text-align: right;
        }

        .markets-panel td:first-child {
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .rank {
          width: 20px;
          height: 20px;
          display: inline-grid;
          place-items: center;
          margin-right: 8px;
          border-radius: 50%;
          color: #072313;
          background: #21e673;
          font-size: 11px;
          font-weight: 900;
        }

        @media (max-width: 1500px) {
          .dashboard-page { padding: 10px 22px 20px; }
          .metric-grid { gap: 14px; grid-template-columns: repeat(5, minmax(155px, 1fr)); }
          .metric-grid .bankroll-summary-card { height: 118px; min-height: 118px; padding: 0 16px; }
          .metric-grid .bankroll-summary-content { gap: 14px; }
          .metric-grid .bankroll-summary-icon { width: 50px; height: 50px; }
          .metric-grid .bankroll-summary-label { font-size: 10px; }
          .metric-grid .bankroll-summary-value { font-size: 24px; }
          .metric-grid .bankroll-summary-detail { font-size: 11px; }
          .dash-metric { height: 104px; padding: 15px; grid-template-columns: 44px minmax(0,1fr); gap: 12px; }
          .dash-icon { width: 44px; height: 44px; }
          .dash-metric p { font-size: 9px; letter-spacing: 0.08em; }
          .dash-metric strong { font-size: 21px; }
          .dash-metric span:not(.dash-icon) { font-size: 10px; }
        }

        @media (max-width: 1180px) {
          .metric-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
          .dashboard-grid { grid-template-columns: minmax(0, 1fr); }
          .dashboard-bottom { grid-template-columns: minmax(0, 1fr); }
        }

        @media (max-width: 900px) {
          .metric-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }

        @media (max-width: 980px) {
          .progress-stats { grid-template-columns: repeat(2, 1fr); gap: 14px 0; }
          .activity-panel, .opportunities-panel, .markets-panel { overflow-x: auto; }
          .activity-panel table { min-width: 820px; }
          .opportunities-panel table { min-width: 690px; }
        }

        @media (max-width: 640px) {
          .dashboard-page { padding: 14px; }
          .metric-grid { grid-template-columns: 1fr; }
          .panel-head { align-items: flex-start; flex-direction: column; }
          .range-tabs { flex-wrap: wrap; }
          .progress-main { grid-template-columns: 48px minmax(0,1fr); }
          .stake-box { grid-column: 1 / -1; }
          .distribution-body { grid-template-columns: 1fr; }
        }

        @media (prefers-reduced-motion: reduce) {
          .opportunity-showcase-track {
            transition: none;
          }
        }
      `}</style>
    </div>
  );
}
