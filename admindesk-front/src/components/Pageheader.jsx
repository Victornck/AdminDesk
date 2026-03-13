/**
 * PageHeader — header compartilhado entre todas as páginas.
 * Usa CSS vars do tema — zero lógica de darkMode aqui.
 */

import { Bell, RefreshCw, Circle } from "lucide-react";
import { MenuButton } from "./Sidebar";
import { useTheme } from "../hooks/useTheme";

/**
 * @param {string}   title       — título principal (ex: "Clientes")
 * @param {string}   [subtitle]  — linha menor abaixo do título
 * @param {string}   [initials]  — iniciais do usuário (ex: "JS")
 * @param {function} onMenuClick — abre o drawer mobile
 * @param {object}   [live]      — { status: "ok"|"syncing"|"error", lastUpdate: Date }
 * @param {node}     [children]  — elementos extras no lado direito (ex: botão de busca)
 */
export function PageHeader({ title, subtitle, initials, onMenuClick, live, children }) {
  const { darkMode, toggleDark } = useTheme();

  return (
    <header
      className="sticky top-0 z-10 backdrop-blur-xl px-4 md:px-8 h-14 flex items-center justify-between"
      style={{ background: "var(--bg-header)", borderBottom: "1px solid var(--bd-div)" }}
    >
      {/* Esquerda: menu + título */}
      <div className="flex items-center gap-4">
        <MenuButton onClick={onMenuClick} />
        <div>
          <p className="text-sm font-semibold" style={{ color: "var(--tx-primary)", letterSpacing: "-0.01em" }}>
            {title}
          </p>
          {subtitle && (
            <p className="text-[11px] hidden md:block" style={{ color: "var(--tx-muted)" }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Direita */}
      <div className="flex items-center gap-2">

        {/* Slot extra (busca, botões, etc.) */}
        {children}

        {/* Live status — só renderiza se a prop live for passada */}
        {live && (
          <div
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
            style={{ background: "var(--bg-subtle)", border: "1px solid var(--bd-div)" }}
          >
            {live.status === "syncing" ? (
              <RefreshCw size={11} className="animate-spin" style={{ color: "var(--tx-muted)" }} />
            ) : live.status === "error" ? (
              <Circle size={11} style={{ color: "var(--color-danger)", fill: "var(--color-danger)" }} />
            ) : (
              <LiveDot />
            )}
            <span className="text-[11px]" style={{ color: "var(--tx-muted)" }}>
              {live.status === "syncing" ? "Atualizando…"
                : live.status === "error" ? "Sem conexão"
                : "Ao vivo"}
            </span>
            {live.lastUpdate && live.status === "ok" && (
              <span className="text-[10px]" style={{ color: "var(--tx-muted)", opacity: 0.5 }}>
                · {live.lastUpdate.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
          </div>
        )}

        {/* Bell */}
        <button
          className="relative w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: "var(--bg-subtle)", border: "1px solid var(--bd-div)" }}
        >
          <Bell size={15} style={{ color: "var(--tx-muted)" }} />
          <span
            className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
            style={{ background: "var(--accent)" }}
          />
        </button>

        {/* Avatar */}
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white select-none"
          style={{ background: "var(--accent)", boxShadow: "var(--accent-shadow-css)" }}
        >
          {initials ?? "?"}
        </div>
      </div>
    </header>
  );
}

function LiveDot() {
  return (
    <span className="relative flex items-center justify-center w-4 h-4">
      <span
        className="absolute inline-flex w-3 h-3 rounded-full opacity-60 animate-ping"
        style={{ background: "var(--accent)" }}
      />
      <span
        className="relative inline-flex w-2 h-2 rounded-full"
        style={{ background: "var(--accent)" }}
      />
    </span>
  );
}