"use client";

import { Bell, Moon, ShieldCheck, UserRound } from "lucide-react";

function SettingRow({ icon: Icon, title, description, children }) {
  return (
    <div className="flex flex-col gap-3 border-b border-[var(--gp-border)] py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[var(--gp-surface-elevated)] text-[var(--gp-primary)] ring-1 ring-[var(--gp-border)]">
          <Icon className="h-4 w-4" />
        </span>
        <span className="min-w-0">
          <span className="block text-[14px] font-semibold text-[var(--gp-text)]">{title}</span>
          <span className="mt-1 block text-[13px] leading-5 text-[var(--gp-text-secondary)]">{description}</span>
        </span>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export default function ConfiguracoesPage() {
  return (
    <main className="min-h-full bg-[var(--gp-bg)] text-[var(--gp-text)]">
      <div className="mx-auto flex max-w-[980px] flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
        <header className="rounded-[18px] border border-[var(--gp-border)] bg-[var(--gp-surface)] px-5 py-5 shadow-[var(--gp-shadow-soft)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--gp-primary)]">
            Conta
          </p>
          <h1 className="mt-1.5 text-[30px] font-semibold tracking-[-0.04em]">Configuracoes</h1>
          <p className="mt-2 max-w-[680px] text-[14px] leading-6 text-[var(--gp-text-secondary)]">
            Preferencias locais do painel. Esta area fica simples para nao criar mais uma tela pesada no produto.
          </p>
        </header>

        <section className="rounded-[18px] border border-[var(--gp-border)] bg-[var(--gp-surface)] px-5 shadow-[var(--gp-shadow-soft)]">
          <SettingRow
            icon={UserRound}
            title="Perfil"
            description="Nome e dados de conta serao conectados quando houver autenticacao real."
          >
            <span className="rounded-full bg-[var(--gp-surface-elevated)] px-3 py-1.5 text-[12px] font-semibold text-[var(--gp-text-secondary)] ring-1 ring-[var(--gp-border)]">
              Preparado
            </span>
          </SettingRow>
          <SettingRow
            icon={Moon}
            title="Tema"
            description="Use o alternador no topo para tema claro ou escuro. Os componentes usam os tokens visuais do Filtto."
          >
            <span className="rounded-full bg-[var(--gp-primary-soft)] px-3 py-1.5 text-[12px] font-semibold text-[var(--gp-primary)] ring-1 ring-[var(--gp-border)]">
              Ativo
            </span>
          </SettingRow>
          <SettingRow
            icon={Bell}
            title="Notificacoes"
            description="Alertas de oportunidades e jogos ao vivo ficam preparados para integracao futura."
          >
            <button
              type="button"
              className="gp-button-secondary inline-flex h-9 items-center rounded-[10px] border px-3 text-[13px] font-semibold"
            >
              Configurar depois
            </button>
          </SettingRow>
          <SettingRow
            icon={ShieldCheck}
            title="Seguranca dos dados"
            description="As consultas esportivas continuam passando por rotas internas. Nenhuma chave da API deve ir para o client."
          >
            <span className="rounded-full bg-[var(--gp-primary-soft)] px-3 py-1.5 text-[12px] font-semibold text-[var(--gp-primary)] ring-1 ring-[var(--gp-border)]">
              Protegido
            </span>
          </SettingRow>
        </section>
      </div>
    </main>
  );
}
