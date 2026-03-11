import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { Sidebar, BottomNav, MobileDrawer, MenuButton } from "../components/Sidebar";
import {
  Bell, Sun, Moon, Plus, X, Trash2, Pencil,
  TrendingUp, TrendingDown, Wallet, Search, Calendar, FileText
} from "lucide-react";

const API_URL = "http://localhost:8080";

function getToken() {
  return localStorage.getItem("token");
}

const fmt = (value) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value || 0);

const fmtDate = (dateStr) => {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
};

const EMPTY_FORM = { descriptor: "", price: "", data: "", type: "expense" };

const blockEnter = (e) => { if (e.key === "Enter") e.preventDefault(); };

// ── Modal ─────────────────────────────────────────────────────────────────────
function SpentModal({ open, onClose, onSave, inicial }) {
  const [form, setForm] = useState(inicial || EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(inicial || EMPTY_FORM);
    setSaving(false);
  }, [inicial, open]);

  if (!open) return null;

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    if (!form.descriptor.trim() || !form.price || !form.data || saving) return;
    setSaving(true);
    await onSave({ ...form, price: parseFloat(form.price) });
    setSaving(false);
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative bg-white dark:bg-[#1a1025] border border-gray-200 dark:border-purple-900/30 rounded-2xl w-full max-w-md p-6 shadow-2xl"
        onKeyDown={blockEnter}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            {inicial?.id ? "Editar Lançamento" : "Novo Lançamento"}
          </h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition">
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col gap-4">

          {/* Tipo */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setForm({ ...form, type: "expense" })}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition flex items-center justify-center gap-2 ${
                form.type === "expense"
                  ? "bg-red-500/10 border-red-500/40 text-red-400"
                  : "border-gray-200 dark:border-purple-900/30 text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5"
              }`}
            >
              <TrendingDown size={15} /> Despesa
            </button>
            <button
              type="button"
              onClick={() => setForm({ ...form, type: "income" })}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition flex items-center justify-center gap-2 ${
                form.type === "income"
                  ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                  : "border-gray-200 dark:border-purple-900/30 text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5"
              }`}
            >
              <TrendingUp size={15} /> Receita
            </button>
          </div>

          {/* Descrição */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Descrição *</label>
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-purple-900/30 rounded-xl px-3 py-2.5 focus-within:border-purple-500 transition">
              <FileText size={15} className="text-gray-400 shrink-0" />
              <input
                type="text"
                name="descriptor"
                value={form.descriptor}
                onChange={handle}
                placeholder="Ex: Salário, Aluguel, Freelance..."
                autoComplete="off"
                className="bg-transparent text-sm text-gray-800 dark:text-white outline-none w-full placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Valor */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Valor *</label>
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-purple-900/30 rounded-xl px-3 py-2.5 focus-within:border-purple-500 transition">
              <span className="text-sm text-gray-400 shrink-0">R$</span>
              <input
                type="number"
                name="price"
                min="0"
                step="0.01"
                value={form.price}
                onChange={handle}
                placeholder="0,00"
                className="bg-transparent text-sm text-gray-800 dark:text-white outline-none w-full placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Data */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Data *</label>
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-purple-900/30 rounded-xl px-3 py-2.5 focus-within:border-purple-500 transition">
              <Calendar size={15} className="text-gray-400 shrink-0" />
              <input
                type="date"
                name="data"
                value={form.data}
                onChange={handle}
                className="bg-transparent text-sm text-gray-800 dark:text-white outline-none w-full placeholder:text-gray-400"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-purple-900/30 text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 transition"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={saving || !form.descriptor.trim() || !form.price || !form.data}
            className="flex-1 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition shadow-lg shadow-purple-900/30"
          >
            {saving ? "Salvando..." : inicial?.id ? "Salvar alterações" : "Cadastrar"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ── Modal Delete ──────────────────────────────────────────────────────────────
function DeleteModal({ open, item, onConfirm, onClose }) {
  if (!open || !item) return null;
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-[#1a1025] border border-gray-200 dark:border-red-900/30 rounded-2xl w-full max-w-sm p-6 shadow-2xl">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center">
            <Trash2 size={22} className="text-red-400" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Deletar lançamento?</h3>
            <p className="text-sm text-gray-400 mt-1">
              Tem certeza que deseja remover <strong className="text-gray-700 dark:text-gray-200">{item.descriptor}</strong>? Esta ação não pode ser desfeita.
            </p>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-purple-900/30 text-sm text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5 transition">
            Cancelar
          </button>
          <button type="button" onClick={onConfirm} className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition">
            Deletar
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ── Página ────────────────────────────────────────────────────────────────────
export default function Despesas() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [spents, setSpents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [deletando, setDeletando] = useState(null);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const fetchSpents = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/spents`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.status === 401) { handleLogout(); return; }
      const data = await res.json();
      setSpents(data);
    } catch (e) {
      console.error("Erro ao buscar lançamentos:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSpents(); }, []);

  const handleCriar = async (form) => {
    try {
      const res = await fetch(`${API_URL}/spents`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(form),
      });
      if (res.ok) { await fetchSpents(); setModalOpen(false); }
    } catch (e) { console.error("Erro ao criar:", e); }
  };

  const handleEditar = async (form) => {
    try {
      const res = await fetch(`${API_URL}/spents/${editando.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(form),
      });
      if (res.ok) { await fetchSpents(); setModalOpen(false); setEditando(null); }
    } catch (e) { console.error("Erro ao editar:", e); }
  };

  const handleDeletar = async () => {
    try {
      const res = await fetch(`${API_URL}/spents/${deletando.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) { await fetchSpents(); setDeletando(null); }
    } catch (e) { console.error("Erro ao deletar:", e); }
  };

  const totalReceitas = spents.filter(s => s.type === "income").reduce((acc, s) => acc + s.price, 0);
  const totalDespesas = spents.filter(s => s.type === "expense").reduce((acc, s) => acc + s.price, 0);

  const filtrados = spents.filter((s) => {
    const matchSearch = s.descriptor?.toLowerCase().includes(search.toLowerCase());
    const matchTipo = filtroTipo === "all" || s.type === filtroTipo;
    return matchSearch && matchTipo;
  });

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen bg-gray-50 dark:bg-[#0d0816] text-gray-900 dark:text-white font-sans flex transition-colors duration-300">

        <Sidebar onLogout={handleLogout} />
        <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} onLogout={handleLogout} />

        <main className="flex-1 md:ml-64 flex flex-col min-h-screen pb-20 md:pb-0">

          <header className="sticky top-0 z-10 bg-white/80 dark:bg-[#0d0816]/80 backdrop-blur-md border-b border-gray-200 dark:border-purple-900/20 px-4 md:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <MenuButton onClick={() => setMobileOpen(true)} />
              <div>
                <h1 className="text-base md:text-lg font-semibold">Despesas & Receitas</h1>
                <p className="text-xs text-gray-400 hidden md:block">{spents.length} lançamentos registrados</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button type="button" onClick={toggleTheme} className="p-2 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-purple-900/30 text-gray-400 hover:text-gray-700 dark:hover:text-white transition">
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button type="button" className="relative p-2 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-purple-900/30 text-gray-400">
                <Bell size={18} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-purple-500 rounded-full" />
              </button>
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-violet-700 flex items-center justify-center text-xs font-bold text-white">JS</div>
            </div>
          </header>

          <div className="p-4 md:p-8 flex flex-col gap-6">

            {/* Resumo */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-[#130d1f] border border-gray-200 dark:border-purple-900/20 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <TrendingUp size={18} className="text-emerald-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Total Receitas</p>
                  <p className="text-base font-bold text-emerald-500">{fmt(totalReceitas)}</p>
                </div>
              </div>
              <div className="bg-white dark:bg-[#130d1f] border border-gray-200 dark:border-purple-900/20 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
                  <TrendingDown size={18} className="text-red-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Total Despesas</p>
                  <p className="text-base font-bold text-red-400">{fmt(totalDespesas)}</p>
                </div>
              </div>
              <div className="bg-white dark:bg-[#130d1f] border border-gray-200 dark:border-purple-900/20 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
                  <Wallet size={18} className="text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Saldo</p>
                  <p className={`text-base font-bold ${totalReceitas - totalDespesas >= 0 ? "text-purple-400" : "text-red-400"}`}>
                    {fmt(totalReceitas - totalDespesas)}
                  </p>
                </div>
              </div>
            </div>

            {/* Filtros + Botão */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <div className="flex gap-2 flex-wrap">
                <div className="flex items-center gap-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-purple-900/30 rounded-xl px-3 py-2.5 w-full sm:w-64 focus-within:border-purple-500 transition">
                  <Search size={15} className="text-gray-400 shrink-0" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar descrição..."
                    className="bg-transparent text-sm text-gray-700 dark:text-gray-300 outline-none w-full placeholder:text-gray-400"
                  />
                </div>
                {["all", "income", "expense"].map((tipo) => (
                  <button
                    key={tipo}
                    type="button"
                    onClick={() => setFiltroTipo(tipo)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium border transition ${
                      filtroTipo === tipo
                        ? "bg-purple-600 border-purple-600 text-white"
                        : "border-gray-200 dark:border-purple-900/30 text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5"
                    }`}
                  >
                    {tipo === "all" ? "Todos" : tipo === "income" ? "Receitas" : "Despesas"}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => { setEditando(null); setModalOpen(true); }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition shadow-lg shadow-purple-900/30 shrink-0"
              >
                <Plus size={16} /> Novo Lançamento
              </button>
            </div>

            {/* Lista */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filtrados.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center">
                  <Wallet size={28} className="text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Nenhum lançamento encontrado</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {search ? "Tente outro termo de busca" : "Comece registrando sua primeira receita ou despesa"}
                  </p>
                </div>
                {!search && (
                  <button
                    type="button"
                    onClick={() => { setEditando(null); setModalOpen(true); }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition"
                  >
                    <Plus size={15} /> Novo lançamento
                  </button>
                )}
              </div>
            ) : (
              <div className="bg-white dark:bg-[#130d1f] border border-gray-200 dark:border-purple-900/20 rounded-2xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-purple-900/20">
                      <th className="text-left text-xs text-gray-400 font-medium p-4">Descrição</th>
                      <th className="text-left text-xs text-gray-400 font-medium p-4 hidden sm:table-cell">Data</th>
                      <th className="text-left text-xs text-gray-400 font-medium p-4">Tipo</th>
                      <th className="text-right text-xs text-gray-400 font-medium p-4">Valor</th>
                      <th className="p-4" />
                    </tr>
                  </thead>
                  <tbody>
                    {filtrados.map((s) => (
                      <tr key={s.id} className="border-b border-gray-50 dark:border-purple-900/10 hover:bg-gray-50 dark:hover:bg-white/5 transition group">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                              s.type === "income" ? "bg-emerald-500/10" : "bg-red-500/10"
                            }`}>
                              {s.type === "income"
                                ? <TrendingUp size={14} className="text-emerald-500" />
                                : <TrendingDown size={14} className="text-red-400" />
                              }
                            </div>
                            <span className="text-sm font-medium text-gray-800 dark:text-white">{s.descriptor}</span>
                          </div>
                        </td>
                        <td className="p-4 text-xs text-gray-400 hidden sm:table-cell">{fmtDate(s.data)}</td>
                        <td className="p-4">
                          <span className={`text-xs px-2 py-1 rounded-lg font-medium ${
                            s.type === "income"
                              ? "bg-emerald-500/10 text-emerald-500"
                              : "bg-red-500/10 text-red-400"
                          }`}>
                            {s.type === "income" ? "Receita" : "Despesa"}
                          </span>
                        </td>
                        <td className={`p-4 text-right text-sm font-bold ${
                          s.type === "income" ? "text-emerald-500" : "text-red-400"
                        }`}>
                          {s.type === "income" ? "+" : "-"}{fmt(s.price)}
                        </td>
                        <td className="p-4">
                          <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                            <button type="button" onClick={() => { setEditando(s); setModalOpen(true); }} className="p-1.5 rounded-lg text-gray-400 hover:text-purple-500 hover:bg-purple-500/10 transition">
                              <Pencil size={14} />
                            </button>
                            <button type="button" onClick={() => setDeletando(s)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>

        <BottomNav />

        <SpentModal
          open={modalOpen}
          onClose={() => { setModalOpen(false); setEditando(null); }}
          onSave={editando ? handleEditar : handleCriar}
          inicial={editando}
        />
        <DeleteModal
          open={!!deletando}
          item={deletando}
          onConfirm={handleDeletar}
          onClose={() => setDeletando(null)}
        />
      </div>
    </div>
  );
}