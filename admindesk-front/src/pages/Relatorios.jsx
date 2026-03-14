import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar, BottomNav, MobileDrawer } from "../components/Sidebar";
import { PageHeader } from "../components/PageHeader";
import { useTheme } from "../hooks/useTheme";
import {
  Download, TrendingUp, TrendingDown,
  Wallet, ChevronLeft, ChevronRight, Users, Loader2,
} from "lucide-react";

const API_URL     = import.meta.env.VITE_API_URL ?? "http://localhost:8080";
const MESES       = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const MESES_ABREV = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

function getToken() { return localStorage.getItem("token") ?? ""; }
const fmt = (v) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);

function resolveAccentRGB() {
  const raw = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim();
  try {
    const hsl = raw.match(/hsl\(\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%\s*\)/);
    if (hsl) {
      const h = parseFloat(hsl[1]) / 360, s = parseFloat(hsl[2]) / 100, l = parseFloat(hsl[3]) / 100;
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
      const hue = (t) => {
        if (t < 0) t += 1; if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      return [Math.round(hue(h + 1/3) * 255), Math.round(hue(h) * 255), Math.round(hue(h - 1/3) * 255)];
    }
    const hex = raw.match(/^#([0-9a-f]{6})$/i);
    if (hex) { const n = parseInt(hex[1], 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
  } catch {}
  return [59, 130, 246];
}

export default function Relatorios() {
  const navigate = useNavigate();
  useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const now = new Date();
  const [mes, setMes] = useState(now.getMonth());
  const [ano, setAno] = useState(now.getFullYear());

  const [loading,    setLoading]    = useState(true);
  const [generating, setGenerating] = useState(false);
  const [clientes,   setClientes]   = useState([]);
  const [despesas,   setDespesas]   = useState([]);

  function handleLogout() { localStorage.removeItem("token"); navigate("/login"); }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const headers = { Authorization: `Bearer ${getToken()}` };
      try {
        const [dashRes, clientRes, spentRes] = await Promise.all([
          fetch(`${API_URL}/dashboard`, { headers }),
          fetch(`${API_URL}/clients`,   { headers }),
          fetch(`${API_URL}/spents`,    { headers }),
        ]);
        if (dashRes.status === 401) { handleLogout(); return; }
        const clients = clientRes.ok ? await clientRes.json() : [];
        const spents  = spentRes.ok  ? await spentRes.json()  : [];
        if (!cancelled) { setClientes(clients); setDespesas(spents); }
      } catch (e) { console.error(e); }
      finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, []);

  const despesasMes = despesas.filter(d => {
    if (!d.data) return false;
    const dt = new Date(d.data);
    return dt.getMonth() === mes && dt.getFullYear() === ano && d.type === "expense";
  });
  const receitasMes = despesas.filter(d => {
    if (!d.data) return false;
    const dt = new Date(d.data);
    return dt.getMonth() === mes && dt.getFullYear() === ano && d.type === "income";
  });

  const isMesAtual      = mes === now.getMonth() && ano === now.getFullYear();
  const mrr             = clientes.reduce((a, c) => a + (c.valueMonthly || 0), 0);
  const mrrMes          = isMesAtual ? mrr : 0;
  const totalReceitaMes = receitasMes.reduce((a, d) => a + (d.price || 0), 0) + mrrMes;
  const totalDespesaMes = despesasMes.reduce((a, d) => a + (d.price || 0), 0);
  const lucroMes        = totalReceitaMes - totalDespesaMes;
  const lucroPositivo   = lucroMes >= 0;

  const isFuturo = ano > now.getFullYear() || (ano === now.getFullYear() && mes > now.getMonth());
  const prevMes  = () => { if (mes === 0) { setMes(11); setAno(a => a - 1); } else setMes(m => m - 1); };
  const nextMes  = () => { if (mes === 11) { setMes(0); setAno(a => a + 1); } else setMes(m => m + 1); };

  const catMap = {};
  despesasMes.forEach(d => { catMap[d.categoria || "Outros"] = (catMap[d.categoria || "Outros"] || 0) + (d.price || 0); });
  const categorias = Object.entries(catMap).sort((a, b) => b[1] - a[1]);

  async function downloadPDF() {
    setGenerating(true);
    try {
      const accentRGB = resolveAccentRGB();
      if (!window.jspdf) await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
      if (!window.jspdfAutoTable) {
        await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js");
        window.jspdfAutoTable = true;
      }
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const W = 210; let y = 0;

      doc.setFillColor(...accentRGB);
      doc.rect(0, 0, W, 42, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20); doc.setFont("helvetica", "bold");
      doc.text("AdminDesk", 14, 16);
      doc.setFontSize(11); doc.setFont("helvetica", "normal");
      doc.setTextColor(220, 230, 255);
      doc.text("Relatório Financeiro", 14, 24);
      doc.setFontSize(10);
      doc.text(`${MESES[mes]} de ${ano}`, 14, 32);
      doc.setFontSize(9);
      doc.text(`Gerado em ${new Date().toLocaleDateString("pt-BR")}`, W - 14, 32, { align: "right" });
      y = 52;

      const cards = [
        { label: "Receitas",   value: fmt(totalReceitaMes), color: accentRGB },
        { label: "Despesas",   value: fmt(totalDespesaMes), color: [239, 68, 68] },
        { label: "Lucro Líq.", value: fmt(lucroMes),        color: lucroPositivo ? [34, 197, 94] : [239, 68, 68] },
        { label: "Clientes",   value: clientes.length,      color: [168, 85, 247] },
      ];
      const cW = (W - 28 - 9) / 4;
      cards.forEach((c, i) => {
        const cx = 14 + i * (cW + 3);
        doc.setFillColor(241, 245, 249);
        doc.roundedRect(cx, y, cW, 22, 3, 3, "F");
        doc.setFontSize(8); doc.setFont("helvetica", "normal"); doc.setTextColor(100, 116, 139);
        doc.text(c.label, cx + cW / 2, y + 7, { align: "center" });
        doc.setFontSize(10); doc.setFont("helvetica", "bold"); doc.setTextColor(...c.color);
        doc.text(String(c.value), cx + cW / 2, y + 16, { align: "center" });
      });
      y += 30;

      const td = { styles: { fontSize: 9, cellPadding: 3 }, alternateRowStyles: { fillColor: [248, 250, 252] }, margin: { left: 14, right: 14 } };

      if (receitasMes.length > 0) {
        addSection(doc, "Receitas", y); y += 4;
        doc.autoTable({ startY: y, head: [["Descrição","Categoria","Data","Valor"]], body: receitasMes.map(d => [d.descriptor||"-",d.categoria||"-",fmtDate(d.data),fmt(d.price)]), foot:[["","","Total",fmt(receitasMes.reduce((a,d)=>a+(d.price||0),0))]], headStyles:{fillColor:accentRGB,textColor:255,fontStyle:"bold"}, footStyles:{fillColor:[239,246,255],textColor:[15,23,42],fontStyle:"bold"}, columnStyles:{3:{halign:"right"}}, ...td });
        y = doc.lastAutoTable.finalY + 10;
      }
      if (despesasMes.length > 0) {
        if (y > 240) { doc.addPage(); y = 20; }
        addSection(doc, "Despesas", y); y += 4;
        doc.autoTable({ startY: y, head: [["Descrição","Categoria","Data","Valor"]], body: despesasMes.map(d => [d.descriptor||"-",d.categoria||"-",fmtDate(d.data),fmt(d.price)]), foot:[["","","Total",fmt(totalDespesaMes)]], headStyles:{fillColor:[239,68,68],textColor:255,fontStyle:"bold"}, footStyles:{fillColor:[255,241,242],textColor:[15,23,42],fontStyle:"bold"}, columnStyles:{3:{halign:"right"}}, ...td });
        y = doc.lastAutoTable.finalY + 10;
      }
      if (categorias.length > 0) {
        if (y > 220) { doc.addPage(); y = 20; }
        addSection(doc, "Despesas por Categoria", y); y += 4;
        doc.autoTable({ startY: y, head: [["Categoria","Total","% do total"]], body: categorias.map(([cat,val]) => [cat,fmt(val),totalDespesaMes>0?`${((val/totalDespesaMes)*100).toFixed(1)}%`:"0%"]), headStyles:{fillColor:[100,116,139],textColor:255,fontStyle:"bold"}, columnStyles:{1:{halign:"right"},2:{halign:"right"}}, ...td });
        y = doc.lastAutoTable.finalY + 10;
      }
      if (clientes.length > 0) {
        if (y > 200) { doc.addPage(); y = 20; }
        addSection(doc, "Clientes Ativos", y); y += 4;
        doc.autoTable({ startY: y, head: [["Nome","E-mail","Telefone","Mensalidade"]], body: clientes.map(c => [c.name||"-",c.email||"-",c.phone||"-",fmt(c.valueMonthly)]), foot:[["","","MRR Total",fmt(mrrMes)]], headStyles:{fillColor:[168,85,247],textColor:255,fontStyle:"bold"}, footStyles:{fillColor:[250,245,255],textColor:[15,23,42],fontStyle:"bold"}, columnStyles:{3:{halign:"right"}}, ...td });
      }

      const total = doc.internal.getNumberOfPages();
      for (let i = 1; i <= total; i++) {
        doc.setPage(i);
        doc.setFontSize(8); doc.setFont("helvetica","normal"); doc.setTextColor(148,163,184);
        doc.text(`AdminDesk · Relatório ${MESES[mes]}/${ano}`, 14, 292);
        doc.text(`Página ${i} de ${total}`, W - 14, 292, { align: "right" });
      }
      doc.save(`relatorio-${MESES_ABREV[mes].toLowerCase()}-${ano}.pdf`);
    } catch (e) { console.error("Erro ao gerar PDF:", e); }
    setGenerating(false);
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "var(--bg-page)",
      color: "var(--tx-primary)", fontFamily: "inherit" }}>
      <Sidebar onLogout={handleLogout} />
      <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} onLogout={handleLogout} />

      <main className="flex-1 md:ml-64 flex flex-col min-h-screen pb-20 md:pb-0">
        <PageHeader title="Relatórios" onMenuClick={() => setMobileOpen(true)} />

        <div className="p-4 md:p-8 flex flex-col gap-4 md:gap-5">

          {/* Título + controles — empilha no mobile */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-widest mb-0.5"
                style={{ color: "var(--tx-muted)" }}>Financeiro</p>
              <h1 className="text-lg md:text-xl font-bold tracking-tight"
                style={{ color: "var(--tx-primary)" }}>Relatórios</h1>
            </div>

            <div className="flex items-center gap-2">
              {/* Navegador de mês */}
              <div className="flex items-center flex-1 sm:flex-none gap-1 px-1 py-1 rounded-xl"
                style={{ background: "var(--bg-card)", border: "1px solid var(--bd-card)" }}>
                <button onClick={prevMes} className="p-2 rounded-lg"
                  style={{ color: "var(--tx-muted)" }}
                  onMouseEnter={e => e.currentTarget.style.background = "var(--bg-subtle)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <ChevronLeft size={14} />
                </button>
                <span className="text-sm font-semibold flex-1 text-center tabular-nums px-1"
                  style={{ color: "var(--tx-primary)", minWidth: 120 }}>
                  {MESES[mes]} {ano}
                </span>
                <button onClick={nextMes} disabled={isFuturo}
                  className="p-2 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{ color: "var(--tx-muted)" }}
                  onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.background = "var(--bg-subtle)"; }}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <ChevronRight size={14} />
                </button>
              </div>

              {/* Botão PDF */}
              <button onClick={downloadPDF} disabled={generating || loading}
                className="flex items-center gap-2 px-4 py-2.5 text-white text-sm font-semibold rounded-xl disabled:opacity-50"
                style={{ background: "var(--accent)", boxShadow: "var(--accent-shadow-css)" }}>
                {generating ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                <span className="hidden sm:inline">{generating ? "Gerando..." : "Baixar PDF"}</span>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="w-5 h-5 border-2 rounded-full animate-spin"
                style={{ borderColor: "var(--bd-div)", borderTopColor: "var(--accent)" }} />
            </div>
          ) : (
            <>
              {/* KPI Cards — 2 col mobile, 4 col desktop */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "Receitas",   value: fmt(totalReceitaMes), Icon: TrendingUp,   useAccent: true },
                  { label: "Despesas",   value: fmt(totalDespesaMes), Icon: TrendingDown, danger: true },
                  { label: "Lucro Líq.", value: fmt(lucroMes),        Icon: Wallet,       ...(lucroPositivo ? { useAccent: true } : { danger: true }) },
                  { label: "Clientes",   value: clientes.length,      Icon: Users,        purple: true },
                ].map(({ label, value, Icon, useAccent, danger }) => (
                  <div key={label} className="rounded-2xl p-4 flex flex-col gap-2"
                    style={{ background: "var(--bg-card)", border: "1px solid var(--bd-card)" }}>
                    <div className="flex items-center justify-between">
                      <span style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase",
                        letterSpacing: "0.08em", color: "var(--tx-muted)" }}>{label}</span>
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{
                        background: useAccent ? "var(--accent-muted)" : danger ? "var(--color-danger-muted)" : "rgba(168,85,247,0.12)",
                      }}>
                        <Icon size={13} style={{
                          color: useAccent ? "var(--accent)" : danger ? "var(--color-danger)" : "#a855f7",
                        }} />
                      </div>
                    </div>
                    <p className="text-lg md:text-xl font-bold tracking-tight"
                      style={{ color: "var(--tx-primary)" }}>{value}</p>
                  </div>
                ))}
              </div>

              {mrrMes > 0 && (
                <div className="rounded-2xl p-4 flex flex-wrap gap-3"
                  style={{ background: "var(--bg-card)", border: "1px solid var(--bd-card)" }}>
                  {[{ label: "MRR Clientes", value: fmt(mrrMes), opacity: 1 },
                    { label: "Lançamentos income", value: fmt(totalReceitaMes - mrrMes), opacity: 0.5 }]
                    .map(({ label, value, opacity }) => (
                      <div key={label} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ background: "var(--accent)", opacity }} />
                        <span className="text-xs" style={{ color: "var(--tx-muted)" }}>{label}</span>
                        <span className="text-xs font-semibold" style={{ color: "var(--tx-sub)" }}>{value}</span>
                      </div>
                    ))}
                </div>
              )}

              <Section title="Receitas" count={receitasMes.length} dotAccent>
                {receitasMes.length === 0 ? <Empty msg="Nenhuma receita registrada neste mês" />
                  : <>
                      {/* Tabela — só desktop */}
                      <div className="hidden sm:block">
                        <Table rows={receitasMes} footerLabel="Total receitas"
                          footerValue={fmt(receitasMes.reduce((a,d) => a+(d.price||0),0))}
                          valueStyle={{ color: "var(--accent)" }} />
                      </div>
                      {/* Cards — só mobile */}
                      <div className="sm:hidden flex flex-col">
                        {receitasMes.map((d, i) => (
                          <TransactionCard key={i} item={d}
                            valueColor="var(--accent)" prefix="+" />
                        ))}
                        <div className="flex items-center justify-between px-4 py-3"
                          style={{ background: "var(--bg-card-2)", borderTop: "1px solid var(--bd-div)" }}>
                          <span className="text-xs font-semibold uppercase tracking-widest"
                            style={{ color: "var(--tx-muted)" }}>Total</span>
                          <span className="text-sm font-bold" style={{ color: "var(--accent)" }}>
                            {fmt(receitasMes.reduce((a,d) => a+(d.price||0),0))}
                          </span>
                        </div>
                      </div>
                    </>}
              </Section>

              <Section title="Despesas" count={despesasMes.length} dotColor="var(--color-danger)">
                {despesasMes.length === 0 ? <Empty msg="Nenhuma despesa registrada neste mês" />
                  : <>
                      <div className="hidden sm:block">
                        <Table rows={despesasMes} footerLabel="Total despesas"
                          footerValue={fmt(totalDespesaMes)}
                          valueStyle={{ color: "var(--color-danger)" }} />
                      </div>
                      <div className="sm:hidden flex flex-col">
                        {despesasMes.map((d, i) => (
                          <TransactionCard key={i} item={d}
                            valueColor="var(--color-danger)" prefix="−" />
                        ))}
                        <div className="flex items-center justify-between px-4 py-3"
                          style={{ background: "var(--bg-card-2)", borderTop: "1px solid var(--bd-div)" }}>
                          <span className="text-xs font-semibold uppercase tracking-widest"
                            style={{ color: "var(--tx-muted)" }}>Total</span>
                          <span className="text-sm font-bold" style={{ color: "var(--color-danger)" }}>
                            {fmt(totalDespesaMes)}
                          </span>
                        </div>
                      </div>
                    </>}
              </Section>

              {categorias.length > 0 && (
                <Section title="Despesas por Categoria" dotColor="var(--tx-muted)">
                  <div>
                    {categorias.map(([cat, val]) => (
                      <div key={cat} className="flex items-center gap-3 py-3 px-4 md:px-5"
                        style={{ borderBottom: "1px solid var(--bd-div)" }}>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium" style={{ color: "var(--tx-primary)" }}>{cat}</p>
                          <div className="mt-1.5 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--bd-div)" }}>
                            <div className="h-full rounded-full bg-rose-400"
                              style={{ width: `${Math.min(100, (val / totalDespesaMes) * 100)}%` }} />
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-semibold" style={{ color: "var(--tx-primary)" }}>{fmt(val)}</p>
                          <p className="text-[11px]" style={{ color: "var(--tx-muted)" }}>
                            {totalDespesaMes > 0 ? ((val / totalDespesaMes) * 100).toFixed(1) : 0}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              <Section title="Clientes Ativos" count={clientes.length} dotColor="#a855f7">
                {clientes.length === 0 ? <Empty msg="Nenhum cliente cadastrado" /> : (
                  <div>
                    {clientes.map((c, i) => (
                      <div key={i} className="flex items-center gap-3 px-4 md:px-5 py-3"
                        style={{ borderBottom: i < clientes.length - 1 ? "1px solid var(--bd-div)" : "none" }}>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                          style={{ background: "rgba(168,85,247,0.12)", color: "#a855f7" }}>
                          {c.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate" style={{ color: "var(--tx-primary)" }}>{c.name}</p>
                          <p className="text-[11px] truncate" style={{ color: "var(--tx-muted)" }}>{c.email}</p>
                        </div>
                        <span className="text-sm font-semibold tabular-nums shrink-0" style={{ color: "#a855f7" }}>
                          {fmt(c.valueMonthly)}
                        </span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between px-4 md:px-5 py-3"
                      style={{ background: "var(--bg-card-2)", borderTop: "1px solid var(--bd-div)" }}>
                      <span className="text-xs font-semibold uppercase tracking-widest"
                        style={{ color: "var(--tx-muted)" }}>MRR Total</span>
                      <span className="text-sm font-bold" style={{ color: "#a855f7" }}>{fmt(mrrMes)}</span>
                    </div>
                  </div>
                )}
              </Section>
            </>
          )}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function loadScript(src) {
  return new Promise((res, rej) => {
    const s = document.createElement("script");
    s.src = src; s.onload = res; s.onerror = rej;
    document.head.appendChild(s);
  });
}

function addSection(doc, title, y) {
  doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.setTextColor(15, 23, 42);
  doc.text(title, 14, y);
}

function fmtDate(s) {
  if (!s) return "-";
  const [y, m, d] = s.split("-");
  return `${d}/${m}/${y}`;
}

// Card de transação para mobile (substitui linhas de tabela)
function TransactionCard({ item, valueColor, prefix }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3"
      style={{ borderBottom: "1px solid var(--bd-div)" }}>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate" style={{ color: "var(--tx-primary)" }}>
          {item.descriptor || "-"}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[11px]" style={{ color: "var(--tx-muted)" }}>{fmtDate(item.data)}</span>
          {item.categoria && (
            <>
              <span style={{ color: "var(--bd-div)" }}>·</span>
              <span className="text-[11px]" style={{ color: "var(--tx-muted)" }}>{item.categoria}</span>
            </>
          )}
        </div>
      </div>
      <span className="text-sm font-bold tabular-nums shrink-0" style={{ color: valueColor }}>
        {prefix}{fmt(item.price)}
      </span>
    </div>
  );
}

function Section({ title, count, dotAccent, dotColor, children }) {
  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background: "var(--bg-card)", border: "1px solid var(--bd-card)" }}>
      <div className="flex items-center justify-between px-4 md:px-5 py-4"
        style={{ borderBottom: "1px solid var(--bd-div)" }}>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full"
            style={{ background: dotAccent ? "var(--accent)" : dotColor }} />
          <h3 className="text-sm font-semibold" style={{ color: "var(--tx-primary)" }}>{title}</h3>
        </div>
        {count !== undefined && (
          <span className="text-[11px]" style={{ color: "var(--tx-muted)" }}>
            {count} {count === 1 ? "item" : "itens"}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function Table({ rows, footerLabel, footerValue, valueStyle }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr style={{ borderBottom: "1px solid var(--bd-div)" }}>
            {["Descrição", "Categoria", "Data", "Valor"].map((h, i) => (
              <th key={h}
                className={`py-2.5 text-[11px] font-semibold uppercase tracking-wider ${i === 3 ? "text-right" : "text-left"} ${i === 1 || i === 2 ? "hidden md:table-cell" : ""}`}
                style={{ padding: i === 0 || i === 3 ? "10px 20px" : "10px 12px", color: "var(--tx-muted)" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((d, i) => (
            <tr key={i} style={{ borderBottom: "1px solid var(--bd-div)" }}
              onMouseEnter={e => e.currentTarget.style.background = "var(--bg-hover)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <td className="px-5 py-3 font-medium" style={{ color: "var(--tx-primary)" }}>{d.descriptor || "-"}</td>
              <td className="px-3 py-3 hidden md:table-cell" style={{ color: "var(--tx-muted)" }}>{d.categoria || "-"}</td>
              <td className="px-3 py-3 hidden md:table-cell" style={{ color: "var(--tx-muted)" }}>{fmtDate(d.data)}</td>
              <td className="px-5 py-3 text-right font-semibold tabular-nums" style={valueStyle}>{fmt(d.price)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr style={{ borderTop: "1px solid var(--bd-card)", background: "var(--bg-card-2)" }}>
            <td colSpan={3} className="px-5 py-3 text-xs font-semibold uppercase tracking-widest"
              style={{ color: "var(--tx-muted)" }}>{footerLabel}</td>
            <td className="px-5 py-3 text-right font-bold tabular-nums" style={valueStyle}>{footerValue}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

function Empty({ msg }) {
  return (
    <div className="flex items-center justify-center py-10">
      <p className="text-xs" style={{ color: "var(--tx-muted)" }}>{msg}</p>
    </div>
  );
}