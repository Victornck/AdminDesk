import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, BarChart2, User, CreditCard, ArrowRight, Check } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

// ── Tema fixo blue ──────────────────────────────────────────────────────────
const C = {
  accent:       "#3b82f6",
  accentMuted:  "#eff6ff",
  accentRing:   "#bfdbfe",
  accentShadow: "0 4px 14px #3b82f640",
  bgPage:       "#080d14",
  bgCard:       "#0a1019",
  bdCard:       "rgba(255,255,255,0.07)",
  bdDiv:        "rgba(255,255,255,0.05)",
  txPrimary:    "#ffffff",
  txSub:        "rgba(255,255,255,0.55)",
  txMuted:      "rgba(255,255,255,0.35)",
};

// ── Máscara ─────────────────────────────────────────────────────────────────
function maskCPF(value) {
  return value
    .replace(/\D/g, "")
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

// ── Validador ────────────────────────────────────────────────────────────────
function isValidCPF(cpf) {
  const digits = cpf.replace(/\D/g, "");
  if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(digits[i]) * (10 - i);
  let check = (sum * 10) % 11;
  if (check === 10 || check === 11) check = 0;
  if (check !== parseInt(digits[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(digits[i]) * (11 - i);
  check = (sum * 10) % 11;
  if (check === 10 || check === 11) check = 0;
  if (check !== parseInt(digits[10])) return false;

  return true;
}

// ── Field ────────────────────────────────────────────────────────────────────
function Field({ label, icon: Icon, error, children }) {
  const [focused, setFocused] = useState(false);
  const borderColor = focused
    ? C.accentRing
    : error
    ? "rgba(248,113,113,0.35)"
    : C.bdCard;

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold tracking-widest uppercase"
        style={{ color: C.txMuted }}>{label}</label>
      <div
        className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: `1px solid ${borderColor}`,
          transition: "border-color 0.15s",
        }}
        onFocusCapture={() => setFocused(true)}
        onBlurCapture={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false); }}
      >
        {Icon && <Icon size={14} style={{ color: C.txMuted }} className="shrink-0" />}
        {children}
      </div>
      {error && (
        <p className="text-[11px]" style={{ color: "#f87171" }}>{error}</p>
      )}
    </div>
  );
}

const PERKS = [
  "Dashboard financeiro em tempo real",
  "Gestão completa de clientes",
  "Relatórios de receita e despesa",
];

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm]         = useState({ nome: "", cpf: "", email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [erro, setErro]         = useState("");
  const [cpfErro, setCpfErro]   = useState("");

  const handle = (e) => {
    setErro("");
    const { name, value } = e.target;

    if (name === "cpf") {
      const masked = maskCPF(value);
      setForm({ ...form, cpf: masked });
      if (masked.length === 14) {
        setCpfErro(isValidCPF(masked) ? "" : "CPF inválido.");
      } else {
        setCpfErro("");
      }
      return;
    }

    setForm({ ...form, [name]: value });
  };

  const handleCpfBlur = () => {
    if (form.cpf.length > 0 && form.cpf.length < 14) {
      setCpfErro("CPF incompleto.");
    } else if (form.cpf.length === 14 && !isValidCPF(form.cpf)) {
      setCpfErro("CPF inválido.");
    }
  };

  const submit = async () => {
    if (!form.nome || !form.email || !form.password) {
      setErro("Preencha todos os campos obrigatórios."); return;
    }
    if (form.cpf && !isValidCPF(form.cpf)) {
      setCpfErro("CPF inválido."); return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const msg = await res.text();
        setErro(msg || "Erro ao criar conta.");
        setLoading(false); return;
      }
      navigate("/login");
    } catch {
      setErro("Erro ao conectar com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex"
      style={{ minHeight: "100dvh", background: C.bgPage, color: C.txPrimary }}
    >

      {/* ── Painel esquerdo ── */}
      <div
        className="hidden lg:flex flex-col justify-between w-[52%] relative overflow-hidden p-12"
        style={{ background: C.bgCard, borderRight: `1px solid ${C.bdCard}` }}
      >
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }} />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none" style={{
          background: `radial-gradient(circle, ${C.accentMuted} 0%, transparent 70%)`,
          transform: "translate(20%, -20%)",
          opacity: 0.12,
        }} />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: C.accent }}>
            <BarChart2 size={18} style={{ color: C.bgPage }} />
          </div>
          <span className="text-sm font-semibold tracking-tight" style={{ color: C.txPrimary }}>AdminDesk</span>
        </div>

        {/* Central */}
        <div className="relative">
          <p className="text-[11px] font-semibold tracking-[0.2em] uppercase mb-4"
            style={{ color: C.accent }}>Comece agora</p>
          <h2 className="text-4xl font-bold leading-tight mb-8"
            style={{ letterSpacing: "-0.02em", color: C.txPrimary }}>
            Tudo que você<br />precisa para<br />
            <span style={{ color: C.accent }}>crescer.</span>
          </h2>
          <div className="flex flex-col gap-3.5">
            {PERKS.map((perk) => (
              <div key={perk} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                  style={{ background: `${C.accent}1a`, border: `1px solid ${C.accentRing}` }}>
                  <Check size={11} style={{ color: C.accent }} />
                </div>
                <span className="text-sm" style={{ color: C.txSub }}>{perk}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Testemunho */}
        <div className="relative rounded-2xl p-5"
          style={{ background: C.bgPage, border: `1px solid ${C.bdDiv}` }}>
          <p className="text-sm leading-relaxed mb-4" style={{ color: C.txMuted }}>
            "Finalmente uma ferramenta que mostra tudo que preciso sem complicar. Em 5 minutos já tinha o dashboard rodando."
          </p>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
              style={{ background: C.accent, color: "#fff" }}>M</div>
            <div>
              <p className="text-xs font-semibold" style={{ color: C.txPrimary }}>Marcos A.</p>
              <p className="text-[11px]" style={{ color: C.txMuted }}>Consultor autônomo</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Painel direito ── */}
      <div
        className="flex-1 flex items-start justify-center overflow-y-auto relative"
        style={{ background: C.bgPage }}
      >
        <div className="absolute pointer-events-none" style={{
          width: "500px", height: "500px",
          background: `radial-gradient(circle, ${C.accentMuted} 0%, transparent 65%)`,
          left: "50%", top: "50%",
          transform: "translate(-50%, -50%)",
          opacity: 0.08,
        }} />

        <div className="relative w-full max-w-[360px] py-12 px-6 lg:px-0">

          {/* Logo mobile */}
          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: C.accent }}>
              <BarChart2 size={15} style={{ color: C.bgPage }} />
            </div>
            <span className="text-sm font-semibold" style={{ color: C.txPrimary }}>AdminDesk</span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-1.5"
              style={{ letterSpacing: "-0.02em", color: C.txPrimary }}>Criar conta</h1>
            <p className="text-sm" style={{ color: C.txMuted }}>
              Preencha os dados abaixo para começar
            </p>
          </div>

          <div className="flex flex-col gap-3.5">

            <Field label="Nome *" icon={User}>
              <input name="nome" value={form.nome} onChange={handle}
                placeholder="Seu nome completo" autoComplete="name"
                className="bg-transparent text-sm outline-none w-full placeholder:text-white/20"
                style={{ color: C.txPrimary, caretColor: C.accent }} />
            </Field>

            <Field label="CPF" icon={CreditCard} error={cpfErro}>
              <input name="cpf" value={form.cpf} onChange={handle} onBlur={handleCpfBlur}
                placeholder="000.000.000-00" inputMode="numeric" maxLength={14} autoComplete="off"
                className="bg-transparent text-sm outline-none w-full placeholder:text-white/20"
                style={{ color: C.txPrimary, caretColor: C.accent }} />
            </Field>

            <Field label="Email *" icon={Mail}>
              <input name="email" type="email" value={form.email} onChange={handle}
                placeholder="seu@email.com" autoComplete="email"
                className="bg-transparent text-sm outline-none w-full placeholder:text-white/20"
                style={{ color: C.txPrimary, caretColor: C.accent }} />
            </Field>

            <Field label="Senha *" icon={Lock}>
              <input name="password" type={showPass ? "text" : "password"}
                value={form.password} onChange={handle}
                placeholder="Mínimo 6 caracteres" autoComplete="new-password"
                className="bg-transparent text-sm outline-none w-full placeholder:text-white/20"
                style={{ color: C.txPrimary, caretColor: C.accent }} />
              <button onClick={() => setShowPass(!showPass)}
                className="shrink-0 transition-opacity hover:opacity-70"
                style={{ color: C.txMuted }}>
                {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </Field>

            {/* Erro geral */}
            {erro && (
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs" style={{
                background: "rgba(248,113,113,0.06)",
                border: "1px solid rgba(248,113,113,0.15)",
                color: "#f87171",
              }}>
                <span className="w-1 h-1 rounded-full bg-red-400 shrink-0" />
                {erro}
              </div>
            )}

            {/* Botão */}
            <button
              onClick={submit} disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 mt-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
              style={{ background: C.accent, color: "#fff", boxShadow: C.accentShadow }}
              onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
              onMouseLeave={e => e.currentTarget.style.opacity = "1"}
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 rounded-full animate-spin"
                    style={{ borderColor: "rgba(255,255,255,0.2)", borderTopColor: "#fff" }} />
                  Criando conta…
                </>
              ) : (
                <>Criar conta <ArrowRight size={14} /></>
              )}
            </button>
          </div>

          <p className="text-center text-xs mt-7" style={{ color: C.txMuted }}>
            Já tem conta?{" "}
            <button onClick={() => navigate("/login")}
              className="font-semibold transition-opacity hover:opacity-80"
              style={{ color: C.accent }}>
              Fazer login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}