import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, BarChart2, User, CreditCard, ArrowRight, Check } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

function maskCPF(value) {
  return value
    .replace(/\D/g, "")
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function Field({ label, icon: Icon, error, children }) {
  const [focused, setFocused] = useState(false);

  const borderColor = focused
    ? "rgba(163,230,53,0.35)"
    : error
    ? "rgba(248,113,113,0.35)"
    : "rgba(255,255,255,0.07)";

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.3)" }}>
        {label}
      </label>
      <div
        className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: `1px solid ${borderColor}`,
          transition: "border-color 0.15s",
        }}
        onFocusCapture={() => setFocused(true)}
        onBlurCapture={(e) => {
          // Só remove o foco se o próximo elemento focado estiver fora deste wrapper
          if (!e.currentTarget.contains(e.relatedTarget)) {
            setFocused(false);
          }
        }}
      >
        {Icon && <Icon size={14} style={{ color: "rgba(255,255,255,0.2)" }} className="shrink-0" />}
        {children}
      </div>
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
  const [form, setForm] = useState({ nome: "", cpf: "", email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const handle = (e) => {
    setErro("");
    const { name, value } = e.target;
    setForm({ ...form, [name]: name === "cpf" ? maskCPF(value) : value });
  };

  const submit = async () => {
    if (!form.nome || !form.email || !form.password) {
      setErro("Preencha todos os campos obrigatórios.");
      return;
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
        setLoading(false);
        return;
      }
      navigate("/login");
    } catch {
      setErro("Erro ao conectar com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "#080d14" }}>

      {/* ── Painel esquerdo ── */}
      <div
        className="hidden lg:flex flex-col justify-between w-[52%] relative overflow-hidden p-12"
        style={{ background: "#0a1019" }}
      >
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div
          className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(163,230,53,0.06) 0%, transparent 70%)",
            transform: "translate(20%, -20%)",
          }}
        />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #a3e635, #65a30d)" }}
          >
            <BarChart2 size={18} className="text-black" />
          </div>
          <span className="text-white font-semibold text-sm tracking-tight">AdminDesk</span>
        </div>

        {/* Central */}
        <div className="relative">
          <p
            className="text-[11px] font-semibold tracking-[0.2em] uppercase mb-4"
            style={{ color: "rgba(163,230,53,0.6)" }}
          >
            Comece agora
          </p>
          <h2
            className="text-4xl font-bold leading-tight text-white mb-8"
            style={{ letterSpacing: "-0.02em" }}
          >
            Tudo que você<br />precisa para<br />
            <span style={{ color: "#a3e635" }}>crescer.</span>
          </h2>

          {/* Perks */}
          <div className="flex flex-col gap-3.5">
            {PERKS.map((perk) => (
              <div key={perk} className="flex items-center gap-3">
                <div
                  className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                  style={{ background: "rgba(163,230,53,0.12)", border: "1px solid rgba(163,230,53,0.2)" }}
                >
                  <Check size={11} style={{ color: "#a3e635" }} />
                </div>
                <span className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>{perk}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Testemunho decorativo */}
        <div
          className="relative rounded-2xl p-5"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <p className="text-sm leading-relaxed mb-4" style={{ color: "rgba(255,255,255,0.45)" }}>
            "Finalmente uma ferramenta que mostra tudo que preciso sem complicar. Em 5 minutos já tinha o dashboard rodando."
          </p>
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-black"
              style={{ background: "linear-gradient(135deg, #a3e635, #65a30d)" }}
            >
              M
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Marcos A.</p>
              <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.3)" }}>Consultor autônomo</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Painel direito ── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative">
        <div
          className="absolute pointer-events-none"
          style={{
            width: "500px", height: "500px",
            background: "radial-gradient(circle, rgba(163,230,53,0.04) 0%, transparent 65%)",
            left: "50%", top: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />

        <div className="relative w-full max-w-[360px]">

          {/* Logo mobile */}
          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #a3e635, #65a30d)" }}
            >
              <BarChart2 size={15} className="text-black" />
            </div>
            <span className="text-white font-semibold text-sm">AdminDesk</span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white mb-1.5" style={{ letterSpacing: "-0.02em" }}>
              Criar conta
            </h1>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
              Preencha os dados abaixo para começar
            </p>
          </div>

          <div className="flex flex-col gap-3.5">

            <Field label="Nome *" icon={User}>
              <input
                name="nome" value={form.nome} onChange={handle}
                placeholder="Seu nome completo"
                autoComplete="name"
                className="bg-transparent text-sm text-white outline-none w-full placeholder:text-white/20"
                style={{ caretColor: "#a3e635" }}
              />
            </Field>

            <Field label="CPF" icon={CreditCard}>
              <input
                name="cpf" value={form.cpf} onChange={handle}
                placeholder="000.000.000-00"
                inputMode="numeric"
                maxLength={14}
                autoComplete="off"
                className="bg-transparent text-sm text-white outline-none w-full placeholder:text-white/20"
                style={{ caretColor: "#a3e635" }}
              />
            </Field>

            <Field label="Email *" icon={Mail}>
              <input
                name="email" type="email" value={form.email} onChange={handle}
                placeholder="seu@email.com"
                autoComplete="email"
                className="bg-transparent text-sm text-white outline-none w-full placeholder:text-white/20"
                style={{ caretColor: "#a3e635" }}
              />
            </Field>

            <Field label="Senha *" icon={Lock}>
              <input
                name="password" type={showPass ? "text" : "password"}
                value={form.password} onChange={handle}
                placeholder="Mínimo 6 caracteres"
                autoComplete="new-password"
                className="bg-transparent text-sm text-white outline-none w-full placeholder:text-white/20"
                style={{ caretColor: "#a3e635" }}
              />
              <button
                onClick={() => setShowPass(!showPass)}
                className="shrink-0 transition-opacity hover:opacity-70"
                style={{ color: "rgba(255,255,255,0.2)" }}
              >
                {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </Field>

            {/* Erro */}
            {erro && (
              <div
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs"
                style={{
                  background: "rgba(248,113,113,0.06)",
                  border: "1px solid rgba(248,113,113,0.15)",
                  color: "#f87171",
                }}
              >
                <span className="w-1 h-1 rounded-full bg-red-400 shrink-0" />
                {erro}
              </div>
            )}

            {/* Botão */}
            <button
              onClick={submit} disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-bold text-black flex items-center justify-center gap-2 mt-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, #a3e635, #65a30d)",
                boxShadow: "0 0 24px rgba(163,230,53,0.15)",
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = "0 0 32px rgba(163,230,53,0.25)"}
              onMouseLeave={e => e.currentTarget.style.boxShadow = "0 0 24px rgba(163,230,53,0.15)"}
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  Criando conta…
                </>
              ) : (
                <>Criar conta <ArrowRight size={14} /></>
              )}
            </button>
          </div>

          <p className="text-center text-xs mt-7" style={{ color: "rgba(255,255,255,0.25)" }}>
            Já tem conta?{" "}
            <button
              onClick={() => navigate("/login")}
              className="font-semibold transition-opacity hover:opacity-80"
              style={{ color: "#a3e635" }}
            >
              Fazer login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}