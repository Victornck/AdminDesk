import { useState } from "react";
import { Sidebar, BottomNav, MobileDrawer, MenuButton } from "../components/Sidebar";
import { Bell, Sun, Moon, BarChart2 } from "lucide-react";

export default function Relatorios() {
  const [darkMode, setDarkMode] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const toggleTheme = () => { setDarkMode(!darkMode); document.documentElement.classList.toggle("dark"); };

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen bg-gray-50 dark:bg-[#0d0816] text-gray-900 dark:text-white font-sans flex transition-colors duration-300">
        <Sidebar />
        <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} />
        <main className="flex-1 md:ml-64 flex flex-col pb-20 md:pb-0">
          <header className="sticky top-0 z-10 bg-white/80 dark:bg-[#0d0816]/80 backdrop-blur-md border-b border-gray-200 dark:border-purple-900/20 px-4 md:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <MenuButton onClick={() => setMobileOpen(true)} />
              <h1 className="text-base md:text-lg font-semibold">Relatórios</h1>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={toggleTheme} className="p-2 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-purple-900/30 text-gray-400 hover:text-gray-700 dark:hover:text-white transition">
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button className="relative p-2 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-purple-900/30 text-gray-400">
                <Bell size={18} /><span className="absolute top-1.5 right-1.5 w-2 h-2 bg-purple-500 rounded-full" />
              </button>
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-violet-700 flex items-center justify-center text-xs font-bold text-white">JS</div>
            </div>
          </header>
          <div className="flex flex-col items-center justify-center flex-1 gap-4 text-center p-8">
            <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center">
              <BarChart2 size={28} className="text-purple-400" />
            </div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Em breve</p>
            <p className="text-xs text-gray-400">A página de Relatórios está sendo desenvolvida.</p>
          </div>
        </main>
        <BottomNav />
      </div>
    </div>
  );
}