
import { createContext, useContext, useState, useEffect } from "react";

const AppContext = createContext(null);

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

function getToken() { return localStorage.getItem("token") ?? ""; }

function parseJwt(token) {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch { return null; }
}

function toInitials(nome = "") {
  return nome.trim().split(/\s+/).map(w => w[0]).join("").toUpperCase().slice(0, 2) || "?";
}

export function AppProvider({ children }) {
  // darkMode lido do localStorage para compatibilidade com páginas que ainda
  // consomem useAppContext().darkMode
  const [darkMode, setDarkMode] = useState(() => {
    try { return JSON.parse(localStorage.getItem("theme-dark")) ?? false; } catch { return false; }
  });

  // Iniciais do usuário logado — carregadas uma vez ao montar
  const [userInitials, setUserInitials] = useState("?");

  // Mantém darkMode sincronizado quando ThemeContext altera o localStorage
  useEffect(() => {
    const sync = () => {
      try { setDarkMode(JSON.parse(localStorage.getItem("theme-dark")) ?? false); } catch { /* noop */ }
    };
    window.addEventListener("storage", sync);
    // Polling leve para mudanças na mesma aba (ThemeContext não dispara "storage")
    const id = setInterval(sync, 300);
    return () => { window.removeEventListener("storage", sync); clearInterval(id); };
  }, []);

  // Carrega iniciais do usuário via JWT + /auth/users
  useEffect(() => {
    (async () => {
      try {
        const token = getToken();
        if (!token) return;
        const email   = parseJwt(token)?.sub ?? parseJwt(token)?.email ?? "";
        const users   = await fetch(`${API_URL}/auth/users`, {
          headers: { Authorization: `Bearer ${token}` },
        }).then(r => r.ok ? r.json() : []);
        const me = users.find(u => u.email?.toLowerCase() === email.toLowerCase()) ?? users[0];
        if (me?.nome || me?.name) setUserInitials(toInitials(me.nome ?? me.name));
      } catch { /* mantém "?" */ }
    })();
  }, []);

  return (
    <AppContext.Provider value={{ darkMode, userInitials }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext deve ser usado dentro de <AppProvider>");
  return ctx;
}